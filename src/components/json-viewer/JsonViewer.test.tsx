import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JsonViewer from "./JsonViewer";
import { JsonParseTaskResult } from "./utils/jsonParseWorkerMessages";
import { createLargeArrayJsonAtLeast } from "./assets/xlFixtures";
import { XL_JSON_TEXT_LENGTH } from "./utils/jsonPerformanceUtils";

const mockCreateJsonParseTask = jest.fn();

jest.mock("./utils/jsonParseWorkerClient", () => ({
  createJsonParseTask: (...args: unknown[]) => mockCreateJsonParseTask(...args),
}));

function createDeferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

function mockFileReader() {
  const originalFileReader = window.FileReader;

  class MockFileReader {
    static instances: MockFileReader[] = [];

    error: DOMException | null = null;
    result: string | ArrayBuffer | null = null;
    private loadListeners: Array<() => void> = [];

    constructor() {
      MockFileReader.instances.push(this);
    }

    addEventListener(type: string, listener: () => void) {
      if (type === "load") {
        this.loadListeners.push(listener);
      }
    }

    readAsText = jest.fn();

    resolveWithText(text: string) {
      this.result = text;
      this.loadListeners.forEach((listener) => listener());
    }
  }

  Object.defineProperty(window, "FileReader", {
    configurable: true,
    value: MockFileReader,
  });

  return {
    MockFileReader,
    restore: () => {
      Object.defineProperty(window, "FileReader", {
        configurable: true,
        value: originalFileReader,
      });
    },
  };
}

describe("JsonViewer", () => {
  beforeEach(() => {
    mockCreateJsonParseTask.mockReset();
  });

  test("shows a loading state while worker parsing is pending", async () => {
    const user = userEvent.setup();
    const parseResult = createDeferred<JsonParseTaskResult>();
    mockCreateJsonParseTask.mockReturnValue({
      requestId: 1,
      promise: parseResult.promise,
      cancel: jest.fn(),
    });

    render(<JsonViewer createNotification={jest.fn()} />);

    await user.click(screen.getByRole("tab", { name: /^view$/i }));

    expect(
      screen.getByRole("status", { name: "Parsing JSON" })
    ).toBeInTheDocument();

    parseResult.resolve({
      status: "success",
      parsed: { a: 1 },
    });

    expect(
      await screen.findByLabelText(/json viewer tree/i)
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  test("opens XL array JSON in lazy chunked view mode", async () => {
    const user = userEvent.setup();
    const createNotification = jest.fn();
    const xlText = createLargeArrayJsonAtLeast(XL_JSON_TEXT_LENGTH);
    const parsed = JSON.parse(xlText);

    mockCreateJsonParseTask.mockImplementation((text: string) => ({
      requestId: 1,
      promise: Promise.resolve({
        status: "success",
        parsed,
      }),
      cancel: jest.fn(),
    }));

    render(<JsonViewer createNotification={createNotification} />);

    fireEvent.change(screen.getByLabelText("JSON editor"), {
      target: { value: xlText },
    });
    await user.click(screen.getByRole("tab", { name: /^view$/i }));

    expect(mockCreateJsonParseTask).toHaveBeenCalledWith(xlText);

    const tree = await screen.findByLabelText(/json viewer tree/i);
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Large JSON",
      })
    );
    expect(
      within(tree).getByText(`(${parsed.length.toLocaleString()})`)
    ).toBeInTheDocument();
    expect(within(tree).queryByText("[0...99]")).not.toBeInTheDocument();

    fireEvent.click(getTreeItemContent("JSON"));
    expect(await within(tree).findByText("[0...99]")).toBeInTheDocument();
    expect(within(tree).queryByText("0")).not.toBeInTheDocument();

    fireEvent.click(getTreeItemContent("[0...99]"));
    expect(await within(tree).findByText("0")).toBeInTheDocument();
  });

  test("uploads a JSON file into the editor before opening the tree view", async () => {
    const user = userEvent.setup();
    const uploadedText = '{\n  "uploaded": true\n}';
    mockCreateJsonParseTask.mockImplementation((text: string) => ({
      requestId: 1,
      promise: Promise.resolve({
        status: "success",
        parsed: JSON.parse(text),
      }),
      cancel: jest.fn(),
    }));

    render(<JsonViewer createNotification={jest.fn()} />);

    expect(
      screen.getByRole("button", { name: /^upload$/i })
    ).toBeInTheDocument();

    await user.upload(
      screen.getByLabelText("Upload JSON file"),
      new File([uploadedText], "uploaded.json", { type: "application/json" })
    );

    await waitFor(() => {
      expect(screen.getByLabelText("JSON editor")).toHaveValue(uploadedText);
    });

    await user.click(screen.getByRole("tab", { name: /^view$/i }));

    expect(mockCreateJsonParseTask).toHaveBeenCalledWith(uploadedText);
    expect(
      await screen.findByLabelText(/json viewer tree/i)
    ).toBeInTheDocument();
  });

  test("shows a loading state while a JSON file upload is pending", async () => {
    const { MockFileReader, restore } = mockFileReader();

    try {
      const user = userEvent.setup();
      const uploadedText = '{\n  "uploaded": true\n}';

      render(<JsonViewer createNotification={jest.fn()} />);

      await user.upload(
        screen.getByLabelText("Upload JSON file"),
        new File([uploadedText], "uploaded.json", { type: "application/json" })
      );

      expect(
        screen.getByRole("status", { name: "Loading JSON file" })
      ).toBeInTheDocument();

      MockFileReader.instances[0].resolveWithText(uploadedText);

      await waitFor(() => {
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
      });
      expect(screen.getByLabelText("JSON editor")).toHaveValue(uploadedText);
    } finally {
      restore();
    }
  });

  test("ignores stale JSON file reads when a newer upload finishes first", async () => {
    const { MockFileReader, restore } = mockFileReader();

    try {
      const user = userEvent.setup();
      const firstText = '{\n  "upload": "first"\n}';
      const secondText = '{\n  "upload": "second"\n}';

      render(<JsonViewer createNotification={jest.fn()} />);

      const uploadInput = screen.getByLabelText("Upload JSON file");
      await user.upload(
        uploadInput,
        new File([firstText], "first.json", { type: "application/json" })
      );
      await user.upload(
        uploadInput,
        new File([secondText], "second.json", { type: "application/json" })
      );

      expect(MockFileReader.instances).toHaveLength(2);

      MockFileReader.instances[1].resolveWithText(secondText);

      await waitFor(() => {
        expect(screen.getByLabelText("JSON editor")).toHaveValue(secondText);
      });

      MockFileReader.instances[0].resolveWithText(firstText);

      await waitFor(() => {
        expect(screen.getByLabelText("JSON editor")).toHaveValue(secondText);
      });
    } finally {
      restore();
    }
  });

  test("ignores stale JSON file reads after the editor content changes", async () => {
    const { MockFileReader, restore } = mockFileReader();

    try {
      const user = userEvent.setup();
      const uploadedText = '{\n  "upload": "pending"\n}';
      const editedText = '{\n  "edited": true\n}';

      render(<JsonViewer createNotification={jest.fn()} />);

      await user.upload(
        screen.getByLabelText("Upload JSON file"),
        new File([uploadedText], "pending.json", { type: "application/json" })
      );
      expect(MockFileReader.instances).toHaveLength(1);

      fireEvent.change(screen.getByLabelText("JSON editor"), {
        target: { value: editedText },
      });

      await waitFor(() => {
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
      });

      MockFileReader.instances[0].resolveWithText(uploadedText);

      await waitFor(() => {
        expect(screen.getByLabelText("JSON editor")).toHaveValue(editedText);
      });
    } finally {
      restore();
    }
  });
});

function getTreeItemContent(label: string): HTMLElement {
  const labelElement = screen.getByText(label);
  const contentElement = labelElement.closest(".MuiTreeItem-content");

  if (!(contentElement instanceof HTMLElement)) {
    throw new Error(`Could not find tree item content for ${label}`);
  }

  return contentElement;
}

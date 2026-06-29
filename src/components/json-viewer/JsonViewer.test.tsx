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
});

function getTreeItemContent(label: string): HTMLElement {
  const labelElement = screen.getByText(label);
  const contentElement = labelElement.closest(".MuiTreeItem-content");

  if (!(contentElement instanceof HTMLElement)) {
    throw new Error(`Could not find tree item content for ${label}`);
  }

  return contentElement;
}

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JsonViewer from "./JsonViewer";
import { JsonParseTaskResult } from "./utils/jsonParseWorkerMessages";

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

    expect(screen.getByRole("status", { name: "Parsing JSON" })).toBeInTheDocument();

    parseResult.resolve({
      status: "success",
      parsed: { a: 1 },
    });

    expect(await screen.findByLabelText(/json viewer tree/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });
});

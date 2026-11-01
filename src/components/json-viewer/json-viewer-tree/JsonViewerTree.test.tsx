import { fireEvent, render, screen, within } from "@testing-library/react";
import JsonViewerTree from "./JsonViewerTree";
import { ARRAY_CHILD_CHUNK_SIZE, MAX_TREE_DEPTH } from "../utils/jsonPerformanceUtils";

describe("JsonViewerTree", () => {
  test.each(["object", "array", "escaped"])(
    "truncates 10,000-deep %s JSON safely even after Expand",
    (kind) => {
      const text = kind === "array"
        ? "[".repeat(10_000) + "0" + "]".repeat(10_000)
        : '{"child":'.repeat(10_000) + "0" + "}".repeat(10_000);
      const json = kind === "escaped" ? text : JSON.parse(text);
      render(<JsonViewerTree json={json} handleCopy={jest.fn()} />);
      if (kind === "escaped") {
        fireEvent.click(screen.getByRole("button", { name: /^unescape$/i }));
      }

      fireEvent.click(screen.getByRole("button", { name: /^expand$/i }));
      const marker = screen.getByText(/nested content truncated at/);
      expect(marker).toHaveTextContent(`${MAX_TREE_DEPTH} levels`);
      expect(marker.closest('[role="treeitem"]')).not.toHaveAttribute("aria-expanded");
      expect(screen.getAllByRole("treeitem")).toHaveLength(MAX_TREE_DEPTH + 1);
      fireEvent.click(marker);
      expect(screen.getAllByRole("treeitem")).toHaveLength(MAX_TREE_DEPTH + 1);
    }
  );

  test("renders child branches lazily as nodes expand", async () => {
    render(
      <JsonViewerTree
        json={{
          parent: {
            child: {
              value: 1,
            },
          },
        }}
        handleCopy={jest.fn()}
      />
    );

    const tree = screen.getByLabelText(/json viewer tree/i);

    expect(within(tree).getByText("JSON")).toBeInTheDocument();
    expect(within(tree).queryByText("parent")).not.toBeInTheDocument();

    fireEvent.click(getTreeItemContent("JSON"));
    expect(await within(tree).findByText("parent")).toBeInTheDocument();
    expect(within(tree).queryByText("child")).not.toBeInTheDocument();

    fireEvent.click(getTreeItemContent("parent"));
    expect(await within(tree).findByText("child")).toBeInTheDocument();
    expect(within(tree).queryByText("value")).not.toBeInTheDocument();

    fireEvent.click(getTreeItemContent("child"));
    expect(await within(tree).findByText("value")).toBeInTheDocument();
  });

  test("chunks large arrays before rendering array items", async () => {
    const records = Array.from(
      { length: ARRAY_CHILD_CHUNK_SIZE + 1 },
      (_, index) => ({
        id: index,
      })
    );

    render(<JsonViewerTree json={{ records }} handleCopy={jest.fn()} />);

    const tree = screen.getByLabelText(/json viewer tree/i);

    fireEvent.click(getTreeItemContent("JSON"));
    expect(await within(tree).findByText("records")).toBeInTheDocument();
    expect(await within(tree).findByText("(101)")).toBeInTheDocument();

    fireEvent.click(getTreeItemContent("records"));
    const firstChunkLabel = await within(tree).findByText("[0...99]");
    expect(firstChunkLabel).toBeInTheDocument();
    expect(firstChunkLabel).toHaveClass("text-slate-500");
    expect(within(tree).getByText("records")).toHaveClass("text-slate-800");
    expect(getTreeItemContent("records").querySelector(".label-icon")).toBeInTheDocument();
    expect(getTreeItemContent("[0...99]").querySelector(".label-icon")).not.toBeInTheDocument();
    expect(await within(tree).findByText("[100...100]")).toBeInTheDocument();
    expect(within(tree).getByText("(101)")).toBeInTheDocument();
    expect(
      within(getTreeItemContent("[0...99]")).queryByText("(100)")
    ).not.toBeInTheDocument();
    expect(
      within(getTreeItemContent("[100...100]")).queryByText("(1)")
    ).not.toBeInTheDocument();
    expect(within(tree).queryByText("0")).not.toBeInTheDocument();

    fireEvent.click(getTreeItemContent("[0...99]"));
    expect(await within(tree).findByText("0")).toBeInTheDocument();
    expect(within(tree).queryByText("id")).not.toBeInTheDocument();

    fireEvent.click(getTreeItemContent("0"));
    expect(await within(tree).findByText("id")).toBeInTheDocument();
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

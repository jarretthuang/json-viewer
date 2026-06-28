import { fireEvent, render, screen, within } from "@testing-library/react";
import JsonViewerTree from "./JsonViewerTree";

describe("JsonViewerTree", () => {
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
});

function getTreeItemContent(label: string): HTMLElement {
  const labelElement = screen.getByText(label);
  const contentElement = labelElement.closest(".MuiTreeItem-content");

  if (!(contentElement instanceof HTMLElement)) {
    throw new Error(`Could not find tree item content for ${label}`);
  }

  return contentElement;
}

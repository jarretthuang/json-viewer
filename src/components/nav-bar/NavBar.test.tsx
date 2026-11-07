import { fireEvent, render, screen, within } from "@testing-library/react";
import NavBar from "./NavBar";
import { usePro } from "../../../pro/licensing/usePro";

jest.mock("../../../pro/licensing/usePro", () => ({ usePro: jest.fn() }));

const mockUsePro = jest.mocked(usePro);

describe("Pro navigation", () => {
  test.each([false, true])("renders the correct links when isPro is %s", (isPro) => {
    mockUsePro.mockReturnValue({
      isPro,
      validateKey: jest.fn(),
      clearKey: jest.fn(),
    });
    render(<NavBar />);

    const nav = screen.getByRole("navigation");
    const badge = within(nav).queryByRole("link", { name: "Pro" });
    if (isPro) {
      expect(badge).toHaveAttribute("href", "/pro");
      expect(badge?.parentElement?.closest("a")).toBeNull();
    } else {
      expect(badge).not.toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole("button", { name: "More options" }));
    const dialog = screen.getByRole("dialog");
    const link = within(dialog).getByRole("link", {
      name: isPro ? "Pro" : "Upgrade to Pro",
    });
    expect(link).toHaveAttribute("href", "/pro");
    // Prevent jsdom navigation while exercising the overlay's click handler.
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

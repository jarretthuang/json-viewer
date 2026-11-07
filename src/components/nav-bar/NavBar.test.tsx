import { fireEvent, render, screen, within } from "@testing-library/react";
import NavBar from "./NavBar";
import { usePro } from "../../../pro/licensing/usePro";

jest.mock("../../../pro/licensing/usePro", () => ({ usePro: jest.fn() }));

const originalEnv = { ...process.env };
afterEach(() => {
  process.env = { ...originalEnv };
});

const mockUsePro = jest.mocked(usePro);

describe("Pro navigation", () => {
  test.each([false, true])(
    "hides Pro links while disabled even when isPro is %s",
    (isPro) => {
      delete process.env.NEXT_PUBLIC_PRO_ENABLED;
      mockUsePro.mockReturnValue({
        isPro,
        validateKey: jest.fn(),
        clearKey: jest.fn(),
      });
      render(<NavBar />);
      expect(
        within(screen.getByRole("navigation")).queryByRole("link", {
          name: /Pro/,
        })
      ).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "More options" }));
      expect(
        within(screen.getByRole("dialog")).queryByRole("link", { name: /Pro/ })
      ).not.toBeInTheDocument();
    }
  );

  test.each([false, true])(
    "renders the correct links when isPro is %s",
    (isPro) => {
      process.env.NEXT_PUBLIC_PRO_ENABLED = "true";
      mockUsePro.mockReturnValue({
        isPro,
        validateKey: jest.fn(),
        clearKey: jest.fn(),
      });
      render(<NavBar />);

      const nav = screen.getByRole("navigation");
      const badge = within(nav).queryByRole("link", { name: /Pro/ });
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
      const title = within(dialog).getByText("JSON Viewer", { exact: true });
      const titleRow = title.parentElement!;
      const byline = within(dialog).getByRole("link", {
        name: "Open JH Labs homepage",
      }).parentElement!;
      expect(within(dialog).getAllByRole("link", { name: /Pro/ })).toHaveLength(1);
      if (isPro) {
        expect(link.parentElement).toBe(titleRow);
        expect(byline.nextElementSibling).toHaveClass("inner-content");
      } else {
        expect(within(titleRow).queryByRole("link")).not.toBeInTheDocument();
        const upgradeRow = link.parentElement!;
        expect(byline.nextElementSibling).toBe(upgradeRow);
        expect(upgradeRow.children).toHaveLength(1);
        expect(upgradeRow).toHaveClass(
          "my-3", "flex", "justify-center",
          "[&>a]:mb-0", "[&>a]:ml-0", "[&>a]:self-auto"
        );
      }
      expect(link).toHaveClass(
        "ml-1", "self-end", "rounded-full", "px-1.5", "py-px", "text-xs", "font-semibold"
      );
      expect(link).not.toHaveClass("mb-1.5");
      expect(link).not.toHaveClass("underline");
      if (badge) {
        expect(link.className).toBe(badge.className);
      }
      // Prevent jsdom navigation while exercising the overlay's click handler.
      link.addEventListener("click", (event) => event.preventDefault());
      fireEvent.click(link);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    }
  );
});

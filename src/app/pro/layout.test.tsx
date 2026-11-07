import { render, screen, within } from "@testing-library/react";
import { usePro } from "../../../pro/licensing/usePro";
import ProLayout from "./layout";
import LegalPage from "@/components/legal/LegalPage";
import ProPage from "./page";

jest.mock("../../../pro/licensing/usePro", () => ({ usePro: jest.fn() }));

const mockUsePro = jest.mocked(usePro);
const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe.each(["PRO", "Legal"])("%s page navigation", (page) => {
  test.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])(
    "renders shared navigation with enabled=%s and isPro=%s",
    (enabled, isPro) => {
      process.env.NEXT_PUBLIC_PRO_ENABLED = String(enabled);
      mockUsePro.mockReturnValue({
        isPro,
        validateKey: jest.fn(),
        clearKey: jest.fn(),
      });
      render(
        page === "PRO" ? (
          <ProLayout>
            <main>Route content</main>
          </ProLayout>
        ) : (
          <LegalPage title="Legal title">Route content</LegalPage>
        )
      );

      const nav = screen.getByRole("navigation");
      expect(within(nav).getByText("jsonviewer.io")).toBeInTheDocument();
      expect(
        within(nav).getByRole("link", { name: "Go to JSON Viewer home" })
      ).toHaveAttribute("href", "/");
      expect(nav.compareDocumentPosition(screen.getByRole("main"))).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
      for (const name of [
        "Go back",
        "Go forward",
        "Share URL",
        "More options",
      ]) {
        expect(
          within(nav).queryByRole("button", { name })
        ).not.toBeInTheDocument();
      }
      expect(
        within(nav).getByRole("button", { name: /theme/i })
      ).toBeInTheDocument();
      const badge = within(nav).queryByRole("link", { name: "PRO" });
      if (enabled && isPro) {
        expect(badge).toHaveAttribute("href", "/pro");
        expect(badge).toHaveAttribute("target", "_blank");
        expect(badge).toHaveAttribute("rel", "noopener noreferrer");
      } else {
        expect(badge).not.toBeInTheDocument();
      }
    }
  );
});

test("keeps navigation above the unavailable page while PRO is off", () => {
  delete process.env.NEXT_PUBLIC_PRO_ENABLED;
  mockUsePro.mockReturnValue({
    isPro: false,
    validateKey: jest.fn(),
    clearKey: jest.fn(),
  });
  render(
    <ProLayout>
      <ProPage />
    </ProLayout>
  );
  expect(screen.getByRole("navigation")).toBeInTheDocument();
  expect(screen.getByText("PRO isn't available yet.")).toBeInTheDocument();
});

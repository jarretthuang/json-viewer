import { render, screen, within } from "@testing-library/react";
import { usePro } from "../../../pro/licensing/usePro";
import ProLayout from "./layout";
import LegalPage from "@/components/legal/LegalPage";
import ProPage from "./page";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));

jest.mock("../../../pro/licensing/usePro", () => ({ usePro: jest.fn() }));

const mockUsePro = jest.mocked(usePro);
const mockUsePathname = jest.mocked(usePathname);
const originalEnv = { ...process.env };

beforeEach(() => {
  mockUsePathname.mockReturnValue("/pro");
});

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
      mockUsePathname.mockReturnValue(page === "PRO" ? "/pro" : "/privacy");
      render(
        page === "PRO" ? (
          <ProLayout>
            <main>Route content</main>
          </ProLayout>
        ) : (
          <LegalPage title="Legal title">Route content</LegalPage>
        )
      );

      const nav = screen
        .getByRole("link", { name: "Go to JSON Viewer home" })
        .closest("nav")!;
      expect(within(nav).getByText("jsonviewer.io")).toBeInTheDocument();
      expect(
        within(nav).getByRole("link", { name: "Go to JSON Viewer home" })
      ).toHaveAttribute("href", "/");
      expect(nav.compareDocumentPosition(screen.getByRole("main"))).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
      expect(
        screen.getByRole("navigation", { name: "Breadcrumb" })
      ).toBeInTheDocument();
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
  expect(
    screen.getByRole("link", { name: "Go to JSON Viewer home" })
  ).toBeInTheDocument();
  expect(screen.getByText("PRO isn't available yet.")).toBeInTheDocument();
});

test.each([
  ["/pro", "Pro"],
  ["/pro/lost-key", "Lost key"],
  ["/pro/thank-you", "Thank you"],
])("renders the breadcrumb for %s", (pathname, label) => {
  mockUsePathname.mockReturnValue(pathname);
  mockUsePro.mockReturnValue({
    isPro: false,
    validateKey: jest.fn(),
    clearKey: jest.fn(),
  });
  render(
    <ProLayout>
      <main>Route content</main>
    </ProLayout>
  );

  const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
  expect(breadcrumb).toHaveClass("max-w-[576px]");
  const items = within(breadcrumb).getAllByRole("listitem");
  expect(
    items.map((item) => item.textContent?.replace("/", "").trim())
  ).toEqual(pathname === "/pro" ? ["Home", "Pro"] : ["Home", "Pro", label]);
  expect(
    within(breadcrumb).getByRole("link", { name: "Home" })
  ).toHaveAttribute("href", "/");
  if (pathname !== "/pro") {
    expect(
      within(breadcrumb).getByRole("link", { name: "Pro" })
    ).toHaveAttribute("href", "/pro");
  }
  expect(
    within(breadcrumb).queryByRole("link", { name: label })
  ).not.toBeInTheDocument();
  expect(within(breadcrumb).getByText(label)).toHaveAttribute(
    "aria-current",
    "page"
  );
  expect(breadcrumb.previousElementSibling).toBe(
    screen.getByRole("link", { name: "Go to JSON Viewer home" }).closest("nav")
  );
  expect(breadcrumb.nextElementSibling).toBe(screen.getByRole("main"));
});


test.each([
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms of Service"],
])("renders the legal breadcrumb for %s", (pathname, title) => {
  mockUsePathname.mockReturnValue(pathname);
  mockUsePro.mockReturnValue({
    isPro: false,
    validateKey: jest.fn(),
    clearKey: jest.fn(),
  });
  render(<LegalPage title={title}>Route content</LegalPage>);

  const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
  expect(breadcrumb).toHaveClass("max-w-[800px]");
  expect(breadcrumb).not.toHaveClass("max-w-[576px]");
  expect(
    within(breadcrumb).getAllByRole("listitem").map((item) =>
      item.textContent?.replace("/", "").trim()
    )
  ).toEqual(["Home", title]);
  const links = within(breadcrumb).getAllByRole("link");
  expect(links).toHaveLength(1);
  expect(links[0]).toHaveTextContent("Home");
  expect(links[0]).toHaveAttribute("href", "/");
  expect(links[0]).not.toHaveAttribute("aria-current");
  expect(within(breadcrumb).getByText(title)).toHaveAttribute("aria-current", "page");
  expect(breadcrumb.previousElementSibling).toBe(
    screen.getByRole("link", { name: "Go to JSON Viewer home" }).closest("nav")
  );
  expect(breadcrumb.nextElementSibling).toBe(screen.getByRole("main"));
  expect(screen.getByRole("main")).toHaveClass("max-w-[800px]");
});

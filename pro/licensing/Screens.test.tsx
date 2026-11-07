import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LicenseScreen, LostKeyScreen, ThankYouScreen } from "./Screens";
import { PRO_PRICE_DISPLAY } from "@/lib/pro-config";
import { ProGate } from "./ProGate";
import { STORAGE_KEY } from "./usePro";

const originalFetch = global.fetch;
const fetchMock = jest.fn();
beforeEach(() => {
  localStorage.clear();
  fetchMock.mockReset();
  global.fetch = fetchMock;
});
afterEach(() => {
  global.fetch = originalFetch;
});
it("shows an actionable not-configured state on license entry", async () => {
  fetchMock.mockResolvedValue({
    ok: false,
    json: async () => ({ error: "not_configured" }),
  });
  render(<LicenseScreen />);
  fireEvent.change(screen.getByLabelText("License key"), {
    target: { value: "example" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Validate key" }));
  await waitFor(() =>
    expect(
      screen.getByRole("status", { name: "License status" })
    ).toHaveTextContent("Licensing is not configured yet")
  );
  expect(screen.getByRole("link", { name: "Lost my key?" })).toHaveAttribute(
    "href",
    "/pro/lost-key"
  );
});
it("explains that key recovery is unavailable", () => {
  render(<LostKeyScreen />);
  expect(
    screen.getByText(/Automatic key recovery is unavailable/)
  ).toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
});
it("keeps completion unconfirmed until a verified adapter supplies it", () => {
  const view = render(<ThankYouScreen />);
  expect(
    screen.getByText(/Purchase confirmation is not connected/)
  ).toBeInTheDocument();
  view.rerender(
    <ThankYouScreen completion={{ key: "verified-key", emailSent: true }} />
  );
  expect(screen.getByText("verified-key")).toBeInTheDocument();
  expect(
    screen.getByText("Your license key email has been sent.")
  ).toBeInTheDocument();
});
it("handles checkout not being configured without crashing", async () => {
  fetchMock.mockResolvedValue({
    ok: false,
    json: async () => ({ error: "not_configured" }),
  });
  render(<ProGate>Future feature</ProGate>);
  expect(
    screen.getByText(`Pro is a ${PRO_PRICE_DISPLAY} one-time`, { exact: false })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Upgrade to Pro" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Upgrade to Pro" })
    ).toBeDisabled()
  );
  expect(fetchMock).toHaveBeenCalledWith("/api/checkout/create", {
    method: "POST",
  });
  expect(
    screen.getByRole("status", { name: "Checkout status" })
  ).toHaveTextContent("Checkout is not configured yet");
});
it("renders new feature content for a cached valid license", () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ key: "example", valid: true, checkedAt: Date.now() })
  );
  render(<ProGate>Future feature</ProGate>);
  expect(screen.getByText("Future feature")).toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
});

it("presents the quiet upgrade with honest rollout copy and activation controls", () => {
  render(<LicenseScreen />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "JSON Viewer Pro"
  );
  expect(screen.getByRole("button", { name: "Upgrade to Pro" })).toBeVisible();
  expect(
    screen.queryByRole("link", { name: "Upgrade to Pro" })
  ).not.toBeInTheDocument();
  expect(screen.getByText(PRO_PRICE_DISPLAY)).toBeInTheDocument();
  expect(screen.getByText(/USD · one-time purchase/)).toBeInTheDocument();
  expect(
    screen.getByText(
      /Existing JSON tools stay free. License key delivered by email./
    )
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /Coming soon. Your license unlocks these tools as they roll out/
    )
  ).toBeInTheDocument();
  expect(
    screen.getAllByRole("listitem").map((item) => item.textContent)
  ).toEqual([
    "JSON diff & compare",
    "JWT inspector",
    "Schema tools",
    "Format conversion",
    "Regex search",
  ]);
  expect(
    screen.getByRole("region", { name: "Already have a license?" })
  ).toContainElement(screen.getByLabelText("License key"));
  expect(screen.getByRole("button", { name: "Clear key" })).toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "Back to JSON Viewer" })
  ).not.toBeInTheDocument();
});

it("prioritizes management and collapses purchasing for an activated browser", () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ key: "example", valid: true, checkedAt: Date.now() })
  );
  render(<LicenseScreen />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "Your Pro license"
  );
  expect(screen.getByText("Pro is enabled on this browser.")).toBeVisible();
  expect(
    screen.getByRole("region", { name: "Manage your license" })
  ).toBeVisible();
  expect(
    screen.getByText("Purchase another license").closest("details")
  ).not.toHaveAttribute("open");
  fireEvent.click(screen.getByRole("button", { name: "Clear key" }));
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  expect(
    screen.getByRole("status", { name: "License status" })
  ).toHaveTextContent("Saved license cleared.");
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "JSON Viewer Pro"
  );
});

it("validates a key, clears the input, and switches to management", async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ valid: true }),
  });
  render(<LicenseScreen />);
  fireEvent.change(screen.getByLabelText("License key"), {
    target: { value: "valid-key" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Validate key" }));
  expect(screen.getByRole("button", { name: "Validating…" })).toBeDisabled();
  await waitFor(() =>
    expect(
      screen.getByRole("status", { name: "License status" })
    ).toHaveTextContent("License validated and saved on this browser.")
  );
  expect(screen.getByLabelText("License key")).toHaveValue("");
  expect(screen.getByText("Pro is enabled on this browser.")).toBeVisible();
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/license/validate",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ key: "valid-key" }),
    })
  );
});

it("retains checkout unavailable handling on the redesigned page", async () => {
  fetchMock.mockResolvedValue({
    ok: false,
    json: async () => ({ error: "not_configured" }),
  });
  render(<LicenseScreen />);
  fireEvent.click(screen.getByRole("button", { name: "Upgrade to Pro" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Upgrade to Pro" })
    ).toBeDisabled()
  );
  expect(
    screen.getByRole("status", { name: "Checkout status" })
  ).toHaveTextContent(
    "Checkout is not configured yet. Your free JSON tools remain available."
  );
  expect(fetchMock).toHaveBeenCalledWith("/api/checkout/create", {
    method: "POST",
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LicenseScreen, LostKeyScreen, ThankYouScreen } from "./Screens";
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
  delete process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL;
});
it("shows an actionable not-configured state on license entry", async () => {
  fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "not_configured" }) });
  render(<LicenseScreen />);
  fireEvent.change(screen.getByLabelText("License key"), { target: { value: "example" } });
  fireEvent.click(screen.getByRole("button", { name: "Validate key" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Licensing is not configured yet"));
  expect(screen.getByRole("link", { name: "Lost my key?" })).toHaveAttribute("href", "/pro/lost-key");
});
it("displays a recovered key without claiming email delivery", async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ key: "recovered-key", delivery: "display" }) });
  render(<LostKeyScreen />);
  fireEvent.change(screen.getByLabelText("Purchase email"), { target: { value: "buyer@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Find my key" }));
  expect(await screen.findByText("recovered-key")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("No new email was sent");
});
it("keeps completion unconfirmed until a verified adapter supplies it", () => {
  const view = render(<ThankYouScreen />);
  expect(screen.getByText(/Purchase confirmation is not connected/)).toBeInTheDocument();
  view.rerender(<ThankYouScreen completion={{ key: "verified-key", emailSent: true }} />);
  expect(screen.getByText("verified-key")).toBeInTheDocument();
  expect(screen.getByText("Your license key email has been sent.")).toBeInTheDocument();
});
it("offers hosted checkout to unlicensed users", () => {
  process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL = "https://example.lemonsqueezy.com/checkout/buy/product";
  render(<ProGate>Future feature</ProGate>);
  expect(screen.queryByText("Future feature")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Upgrade to Pro" })).toHaveAttribute("href", process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL);
});
it("renders new feature content for a cached valid license", () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ key: "example", valid: true, checkedAt: Date.now() }));
  render(<ProGate>Future feature</ProGate>);
  expect(screen.getByText("Future feature")).toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
});

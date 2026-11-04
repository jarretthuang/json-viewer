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
  expect(screen.getByText(/Pro is a \$19.99 one-time/)).toBeInTheDocument();
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

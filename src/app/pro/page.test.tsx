import { render, screen } from "@testing-library/react";
import ProPage from "./page";

jest.mock("../../../pro/licensing/Screens", () => ({
  LicenseScreen: () => <div data-testid="license-screen" />,
}));

const originalEnv = { ...process.env };
afterEach(() => {
  process.env = { ...originalEnv };
});

test("shows only an unavailable message while Pro is off", () => {
  delete process.env.NEXT_PUBLIC_PRO_ENABLED;
  render(<ProPage />);
  expect(screen.getByText("Pro isn't available yet.")).toBeInTheDocument();
  expect(screen.queryByTestId("license-screen")).not.toBeInTheDocument();
});

test("renders the existing license screen while Pro is on", () => {
  process.env.NEXT_PUBLIC_PRO_ENABLED = "true";
  render(<ProPage />);
  expect(screen.getByTestId("license-screen")).toBeInTheDocument();
});

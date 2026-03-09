import { render, screen } from "@testing-library/react";

import NotFound from "./not-found";

describe("NotFound page", () => {
  test("renders navbar branding plus 404 content with home action", () => {
    render(<NotFound />);

    expect(screen.getByText("jsonviewer.io")).toBeInTheDocument();
    expect(screen.getByAltText("JH")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /more options/i }),
    ).not.toBeInTheDocument();

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /page not found/i }),
    ).toBeInTheDocument();

    const homeLink = screen.getByRole("link", { name: /back to home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });
});

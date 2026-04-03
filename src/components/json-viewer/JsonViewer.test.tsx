import { render, screen } from "@testing-library/react";

import JsonViewer from "./JsonViewer";
import { encodeJsonQueryParam, MAX_QUERY_PARAM_LENGTH } from "./utils/jsonUrlUtils";

const mockUseSearchParams = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

describe("JsonViewer", () => {
  beforeEach(() => {
    mockUseSearchParams.mockReturnValue({
      get: () => null,
    });
  });

  test("uses the server-provided initial text when there is no query payload", async () => {
    render(
      <JsonViewer
        createNotification={jest.fn()}
        initialTextOverride='{"from":"server"}'
      />,
    );

    expect(await screen.findByLabelText(/json editor/i)).toHaveValue('{"from":"server"}');
  });

  test("prefers the query payload over the server-provided initial text", async () => {
    const queryText = '{"from":"query"}';
    const encodedQueryText = encodeJsonQueryParam(queryText, MAX_QUERY_PARAM_LENGTH);

    mockUseSearchParams.mockReturnValue({
      get: (key: string) => (key === "json" ? encodedQueryText : null),
    });

    render(
      <JsonViewer
        createNotification={jest.fn()}
        initialTextOverride='{"from":"server"}'
      />,
    );

    expect(await screen.findByLabelText(/json editor/i)).toHaveValue(queryText);
  });
});

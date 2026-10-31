"use client";

import { Component, type ReactNode } from "react";

export default class JsonViewerTreeErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-4">
          The tree could not be displayed. Your JSON is still available in Edit.
          Return to Edit to change or copy it, then select View to try again.
        </div>
      );
    }

    return this.props.children;
  }
}

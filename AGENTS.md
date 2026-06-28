# Agent Instructions

## Project Overview

JSON Viewer is a Next.js app for editing, validating, formatting, minifying, and exploring JSON. The main user experience is split between a Monaco-powered editor and an interactive tree viewer.

## Important Commands

Use these commands when validating changes:

```bash
npm run lint
npm run test:ci
npm run build
```

For focused UI/CUJ coverage:

```bash
npm run test:cuj
```

For browser coverage:

```bash
npm run test:e2e
```

Playwright may require installed browser binaries. If Firefox/WebKit are missing locally, Chromium-only checks can still be useful, but mention the limitation.

For manual performance benchmarking against a running app:

```bash
npm run benchmark -- --base-url=http://127.0.0.1:3000 --runs=10 --payloads=1,5,10
```

CI runs `npm run benchmark:ci` as a production smoke benchmark after `npm run build`. Keep that CI benchmark small and avoid strict timing budgets unless the user explicitly asks for performance gates; browser timings are hardware- and load-dependent.

## Repo Structure

```text
src/app/                         Next.js app routes, layout, API routes, and tests
src/components/json-viewer/      Main JSON editor, tree viewer, toolbar, workers, and utilities
src/components/nav-bar/          Navigation bar and app information overlay
src/components/theme/            Theme provider and light/dark/system mode toggle
src/components/notification/     User notification wrapper and styles
src/models/                      Shared app copy and descriptions
src/utils/                       Shared utility helpers
e2e/                             Playwright end-to-end coverage
```

## Implementation Notes

- Monaco editor setup lives in `src/components/json-viewer/json-viewer-editor/JsonViewerEditor.tsx`.
- Tree rendering lives in `src/components/json-viewer/json-viewer-tree/JsonViewerTree.tsx`.
- Large JSON performance thresholds live in `src/components/json-viewer/utils/jsonPerformanceUtils.ts`.
- JSON parsing is delegated to `src/components/json-viewer/workers/jsonParse.worker.ts` when workers are available.
- URL sharing is intentionally skipped for large payloads. Do not remove that guardrail casually.
- Large arrays are chunked into 100-item groups to keep tree expansion responsive.
- Expand-all is intentionally disabled for very large trees.

## Testing Guidance

- Use Jest for utility, component, and CUJ regression tests.
- Use Playwright for browser-only behavior such as Monaco rendering, stacking order, keyboard focus, and real layout.
- If a change touches performance logic, add or update tests around `jsonPerformanceUtils` and lazy tree rendering.
- If a change touches the navbar overlay, verify it still appears above Monaco widgets such as the find widget.
- README-only changes do not need app tests unless they modify scripts, release instructions, or benchmark claims.

## Documentation Guidance

- Keep the README concise and user-facing.
- Put maintainer or agent process details in this `AGENTS.md` file instead of the README.
- Keep performance claims grounded in measured behavior or explicit implementation details.
- Update `CHANGELOG.md` when preparing a release, not for every ordinary commit.

## Release Management

This app is versioned with SemVer through `package.json`. The current baseline version is `2.0.0`.

Normal commits and pushes must not change the release version. A standard workflow like this does not create a release:

```bash
git add .
git commit -m "Some change"
git push
```

Only run a release script when the user explicitly wants to cut a release.

Before cutting a release:

1. Make the code changes.
2. Run checks:

```bash
npm run lint
npm run test:ci
npm run build
```

3. Update `CHANGELOG.md` with a new version section.
4. Commit the code changes and changelog entry.
5. Choose the correct version bump:

```bash
npm run release:patch   # bug fixes
npm run release:minor   # new features
npm run release:major   # breaking changes
```

Each release script expects a clean working tree, updates `package.json` and `package-lock.json`, creates a version commit, and tags it as `vX.Y.Z`.

Push the release commit and tag with:

```bash
git push --follow-tags
```

Pushing a `vX.Y.Z` tag triggers `.github/workflows/release.yml`, which validates the tag against `package.json`, runs lint/tests/build, and creates a GitHub Release.

<h1 align="center">JSON Viewer
    <a href="https://jsonviewer.io" target="_blank">
        <img src="https://raw.githubusercontent.com/jarretthuang/json-viewer/main/public/logo.png" alt="JH Labs" style="width: 60px; height: 60px; padding-left: 10px;" />
    </a>
</h1>

<div align="center">
    <a href="https://github.com/jarretthuang/json-viewer/stargazers"><img src="https://img.shields.io/github/stars/jarretthuang/json-viewer" alt="Stars Badge"/></a>
    <a href="https://github.com/jarretthuang/json-viewer/network/members"><img src="https://img.shields.io/github/forks/jarretthuang/json-viewer" alt="Forks Badge"/></a>
    <a href="https://github.com/jarretthuang/json-viewer/pulls"><img src="https://img.shields.io/github/issues-pr/jarretthuang/json-viewer" alt="Pull Requests Badge"/></a>
    <a href="https://github.com/jarretthuang/json-viewer/issues"><img src="https://img.shields.io/github/issues/jarretthuang/json-viewer" alt="Issues Badge"/></a>
    <a href="https://github.com/jarretthuang/json-viewer/graphs/contributors"><img alt="GitHub contributors" src="https://img.shields.io/github/contributors/jarretthuang/json-viewer?color=2b9348"></a>
    <a href="https://github.com/jarretthuang/json-viewer/blob/main/LICENSE"><img src="https://img.shields.io/github/license/jarretthuang/json-viewer?color=2b9348" alt="License Badge"/></a>
</div>

**Live app:** https://jsonviewer.io

## Summary

Ultra-fast web app for validating, formatting, minifying, and exploring JSON.

## Features

- Monaco-powered JSON editing with format, minify, copy, paste, and clear actions.
- JSON validation with user-friendly parse errors.
- Interactive tree view with lazy expansion, inline editing, copying, and removal.
- Nested JSON string unescaping for structured inspection.
- Compact shareable URLs for smaller payloads.
- Light, dark, and system themes.

## Performance

### Optimization

- Background worker parsing.
- Lazy tree rendering.
- 100-item array chunking.
- Expand-all guardrails for large trees.
- URL sync limits for large payloads.

### Benchmark

Benchmarks below were run against a production build in Chromium 145 on an Apple M4 Max. Results are medians from 10 runs using generated array-heavy JSON payloads.

| Payload  | Characters | Load into editor | Parse + view ready | Expand root | Render array chunks |
| -------- | ---------: | --------------: | -----------------: | ----------: | ------------------: |
| 1.02 MB  |  1,071,313 |          139 ms |             140 ms |       23 ms |              937 ms |
| 5.02 MB  |  5,266,028 |          178 ms |             122 ms |       27 ms |              1.39 s |
| 10.08 MB | 10,570,028 |          182 ms |             249 ms |       26 ms |              2.28 s |

Performance depends on browser, hardware, and JSON shape. Large arrays are rendered lazily in chunks to keep the tree responsive.

## Development

```bash
npm install
npm run dev
```

## Stack

- [Next.js](https://nextjs.org/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MUI](https://mui.com/)

## File Structure

```text
├── src/
│   ├── app/                         Next.js app routes, layout, API routes, and tests
│   ├── components/
│   │   ├── json-viewer/             Main JSON editor, tree viewer, toolbar, workers, and utilities
│   │   ├── nav-bar/                 Navigation bar and app information overlay
│   │   ├── theme/                   Theme provider and light/dark/system mode toggle
│   │   └── notification/            User notification wrapper and styles
│   ├── models/                      Shared app copy and descriptions
│   └── utils/                       Shared utility helpers
├── public/                          App icons, manifest, and static assets
├── e2e/                             Playwright end-to-end coverage
└── scripts/                         Local project scripts
```

## API

- Docs summary: `/api/docs`
- OpenAPI spec: `/openapi.json`
- URL creation endpoint: `POST /api/json`

## License

Copyright @[Jarrett Huang](https://github.com/jarretthuang), under the [MIT License](https://github.com/jarretthuang/json-viewer/blob/main/LICENSE).

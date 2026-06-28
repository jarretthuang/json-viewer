import JsonViewerApp from "./JsonViewerApp";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "JSON Viewer",
  url: "https://jsonviewer.io",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "Ultra-fast online JSON viewer for validating, formatting, minifying, and exploring JSON payloads up to 10 MB.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "JSON validation",
    "JSON formatting",
    "JSON minification",
    "Interactive JSON tree view",
    "Large JSON payload support",
    "Light and dark themes",
  ],
};

export default function App() {
  return (
    <main className="flex h-full flex-col justify-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="sr-only">
        <h1>JSON Viewer Online</h1>
        <p>
          JSON Viewer is an ultra-fast online tool for validating, formatting,
          minifying, and exploring JSON payloads up to 10 MB.
        </p>
        <ul>
          <li>Format, minify, copy, paste, and clear JSON text.</li>
          <li>Validate JSON and review parse errors.</li>
          <li>Explore JSON in an interactive lazy-rendered tree.</li>
          <li>Inspect nested JSON strings as structured data.</li>
        </ul>
      </section>
      <JsonViewerApp />
    </main>
  );
}

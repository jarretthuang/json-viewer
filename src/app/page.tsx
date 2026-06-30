import JsonViewerApp from "./JsonViewerApp";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "JSON Viewer",
  url: "https://jsonviewer.io",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "Ultra-fast, ad-free online JSON viewer with the best UX for validating, formatting, minifying, and exploring large JSON strings.",
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
    "Large JSON string support",
    "Light and dark themes",
    "Ad-free experience",
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
          JSON Viewer is an ultra-fast, ad-free online tool with the best UX
          for validating, formatting, minifying, and exploring large JSON
          strings.
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

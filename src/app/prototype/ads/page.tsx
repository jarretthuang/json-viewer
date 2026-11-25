import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { encodeJsonQueryParam } from "@/components/json-viewer/utils/jsonUrlUtils";
import AdsPreview from "./AdsPreview";

export const metadata: Metadata = {
  title: "Ad placement prototype",
  robots: { index: false, follow: false },
  alternates: { canonical: "/prototype/ads" },
};

export default async function AdsPrototypePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Use the real viewer's URL input so editing, formatting, and tree mode work
  // unchanged. Seed before rendering; a client history update can race Next's
  // initial search-parameter snapshot.
  const params = await searchParams;
  if (params.json === undefined) {
    const sample = JSON.stringify(
      {
        project: "JSON Viewer",
        version: "2.0.0",
        tools: ["Format", "Validate", "Minify", "Explore"],
        workspace: { theme: "powder blue", private: true, ready: true },
        releases: [
          { name: "Orchid", stable: true },
          { name: "Juniper", stable: false },
        ],
      },
      null,
      2
    );
    const query = new URLSearchParams({ json: encodeJsonQueryParam(sample)! });
    redirect(`/prototype/ads?${query}`);
  }
  return <AdsPreview />;
}

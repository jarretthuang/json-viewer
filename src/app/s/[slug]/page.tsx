import { notFound } from "next/navigation";

import { readJsonFromDrive } from "@/lib/share/driveShare";
import { parseShareSlug } from "@/lib/share/shareSlug";
import SharedJsonViewerPageClient from "./SharedJsonViewerPageClient";

export default async function ShareSlugPage({ params }: { params: { slug: string } }) {
  const parsed = parseShareSlug(params.slug);
  if (parsed.provider !== "gdrive") {
    notFound();
  }

  const jsonText = await readJsonFromDrive(parsed.fileId);
  if (!jsonText) {
    notFound();
  }

  return <SharedJsonViewerPageClient jsonText={jsonText} />;
}

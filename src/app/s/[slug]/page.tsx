import { notFound } from "next/navigation";

import AppShell from "@/components/app/AppShell";
import { parseShareSlug } from "@/lib/share/shareSlug";
import { readJsonFromDriveById } from "@/lib/share/googleDriveShare";

type ShareSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ShareSlugPage({ params }: ShareSlugPageProps) {
  const { slug } = await params;
  const parsed = parseShareSlug(slug);

  if (!parsed || parsed.provider !== "gdrive") {
    notFound();
  }

  try {
    const jsonText = await readJsonFromDriveById(parsed.fileId);
    return <AppShell initialText={jsonText} />;
  } catch {
    notFound();
  }
}

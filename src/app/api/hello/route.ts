// Preserve the static GET response default used before Next.js 15.
export const dynamic = "force-static";

export async function GET(request: Request) {
  return new Response("Hello, world!");
}

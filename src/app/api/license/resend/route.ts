import { licenseRequest } from "../../../../../pro/licensing/server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return licenseRequest(request, "resend");
}

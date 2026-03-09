import { NextResponse } from "next/server";

import { buildOpenApiSpec } from "@/app/api/docs/openapi";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;

  return NextResponse.json(buildOpenApiSpec(origin));
}

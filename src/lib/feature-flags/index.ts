export function isProEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PRO_ENABLED === "true";
}

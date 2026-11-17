export function pathSetelahMasuk(state: unknown): string {
  if (!state || typeof state !== "object") return "/akun/pesanan"
  if (!("from" in state)) return "/akun/pesanan"
  const from = state.from
  if (typeof from !== "string") return "/akun/pesanan"
  if (!from.startsWith("/") || from.startsWith("//")) return "/akun/pesanan"
  return from
}

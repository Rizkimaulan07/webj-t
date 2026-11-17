const STORAGE_PREFIX = "jnt."

export class ApiError extends Error {
  readonly code: "NOT_FOUND" | "VALIDATION" | "UNAUTHORIZED"

  constructor(message: string, code: ApiError["code"]) {
    super(message)
    this.name = "ApiError"
    this.code = code
  }
}

export function bacaLokal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function tulisLokal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
  } catch {
    // Penyimpanan lokal bisa penuh atau diblokir; abaikan pada demo ini.
  }
}

export function jedaApi(minMs = 400, maxMs = 800): Promise<void> {
  const duration = Math.round(minMs + Math.random() * (maxMs - minMs))
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration)
  })
}

export function buatId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

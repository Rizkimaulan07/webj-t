const STORAGE_PREFIX = "jnt."

export type ApiErrorCode =
  | "NOT_FOUND"
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "CONFLICT"
  | "SERVER_ERROR"
  | "UNAVAILABLE"

export class ApiError extends Error {
  readonly code: ApiErrorCode

  constructor(message: string, code: ApiErrorCode) {
    super(message)
    this.name = "ApiError"
    this.code = code
  }
}

interface ApiFailure {
  error?: {
    code?: string
    message?: string
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  let response: Response
  try {
    response = await fetch(path, {
      ...options,
      headers,
      credentials: "same-origin",
    })
  } catch {
    throw new ApiError(
      "Server tidak dapat dijangkau. Pastikan API dan PostgreSQL berjalan.",
      "UNAVAILABLE",
    )
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new ApiError(
      "Server mengirim respons yang tidak dapat dibaca.",
      "SERVER_ERROR",
    )
  }

  if (!response.ok) {
    const failure = body as ApiFailure
    const code = failure.error?.code
    const allowedCodes: ApiErrorCode[] = [
      "NOT_FOUND",
      "VALIDATION",
      "UNAUTHORIZED",
      "CONFLICT",
      "SERVER_ERROR",
      "UNAVAILABLE",
    ]
    const safeCode =
      code && allowedCodes.includes(code as ApiErrorCode)
        ? (code as ApiErrorCode)
        : response.status === 401
          ? "UNAUTHORIZED"
          : response.status === 404
            ? "NOT_FOUND"
            : response.status === 400
              ? "VALIDATION"
              : "SERVER_ERROR"
    throw new ApiError(
      failure.error?.message ?? "Permintaan gagal. Coba lagi.",
      safeCode,
    )
  }

  return body as T
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

import { create } from "zustand"

import type { AuthUser } from "@/types/user"
import { apiRequest, ApiError, bacaLokal, tulisLokal } from "@/lib/api/client"

interface RegisterInput {
  name: string
  identifier: string
  password: string
}

interface AuthState {
  user: AuthUser | null
  ready: boolean
  authError: string | null
  initialize: () => Promise<void>
  login: (identifier: string, password: string) => Promise<AuthUser>
  register: (input: RegisterInput) => Promise<AuthUser>
  logout: () => Promise<void>
}

export const DEMO_CREDENTIALS = {
  identifier: "demo@jnt.id",
  password: "demo123",
} as const

export const DEMO_USER_ID = "demo-user"
const DEMO_STORAGE_KEY = "demo-user"

const DEMO_USER: AuthUser = {
  id: DEMO_USER_ID,
  name: "Demo J&T",
  identifier: DEMO_CREDENTIALS.identifier,
}

function normalisasiIdentifier(identifier: string): string {
  const trimmed = identifier.trim().toLowerCase()
  if (/^[+\d][\d\s-]+$/.test(trimmed)) {
    return trimmed.replace(/[^\d+]/g, "")
  }
  return trimmed
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  ready: false,
  authError: null,

  initialize: async () => {
    set({ ready: false, authError: null })
    const demo = bacaLokal<AuthUser | null>(DEMO_STORAGE_KEY, null)
    if (demo?.id === DEMO_USER_ID) {
      set({ user: demo, ready: true, authError: null })
      return
    }

    try {
      const user = await apiRequest<AuthUser | null>("/api/auth/me")
      if (get().ready) return
      set({ user, ready: true, authError: null })
    } catch (error) {
      if (get().ready) return
      if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
        set({ user: null, ready: true, authError: null })
        return
      }
      set({
        user: null,
        ready: true,
        authError:
          error instanceof Error
            ? error.message
            : "Sesi akun gagal diperiksa.",
      })
    }
  },

  login: async (identifier, password) => {
    set({ authError: null })
    const normalized = normalisasiIdentifier(identifier)
    if (
      normalized === DEMO_CREDENTIALS.identifier &&
      password === DEMO_CREDENTIALS.password
    ) {
      tulisLokal(DEMO_STORAGE_KEY, DEMO_USER)
      set({ user: DEMO_USER, ready: true })
      return DEMO_USER
    }

    const user = await apiRequest<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    })
    tulisLokal(DEMO_STORAGE_KEY, null)
    set({ user, ready: true, authError: null })
    return user
  },

  register: async (input) => {
    set({ authError: null })
    const user = await apiRequest<AuthUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    })
    tulisLokal(DEMO_STORAGE_KEY, null)
    set({ user, ready: true, authError: null })
    return user
  },

  logout: async () => {
    const user = get().user
    tulisLokal(DEMO_STORAGE_KEY, null)
    set({ user: null, ready: true, authError: null })
    if (!user || user.id === DEMO_USER_ID) return

    try {
      await apiRequest<{ success: true }>("/api/auth/logout", {
        method: "POST",
      })
    } catch {
      // State lokal sudah bersih; sesi server akan kedaluwarsa sendiri.
    }
  },
}))

import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { AuthUser } from "@/types/user"

interface AccountRecord extends AuthUser {
  password: string
}

interface RegisterInput {
  name: string
  identifier: string
  password: string
}

interface AuthState {
  user: AuthUser | null
  accounts: AccountRecord[]
  login: (identifier: string, password: string) => AuthUser
  register: (input: RegisterInput) => AuthUser
  logout: () => void
}

export const DEMO_CREDENTIALS = {
  identifier: "demo@jnt.id",
  password: "demo123",
} as const

const AKUN_DEMO: AccountRecord = {
  id: "demo-user",
  name: "Demo J&T",
  identifier: DEMO_CREDENTIALS.identifier,
  password: DEMO_CREDENTIALS.password,
}

function normalisasiIdentifier(identifier: string): string {
  const trimmed = identifier.trim().toLowerCase()
  if (/^[+\d][\d\s-]+$/.test(trimmed)) {
    return trimmed.replace(/[^\d+]/g, "")
  }
  return trimmed
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      // Catatan: penyimpanan akun ini hanya simulasi untuk demo.
      accounts: [AKUN_DEMO],

      login: (identifier, password) => {
        const normalized = normalisasiIdentifier(identifier)
        const account = get().accounts.find(
          (item) => item.identifier === normalized,
        )
        if (!account) {
          throw new Error(
            "Akun tidak ditemukan. Periksa email/HP atau daftar terlebih dahulu.",
          )
        }
        if (account.password !== password) {
          throw new Error("Kata sandi belum tepat. Coba lagi.")
        }
        const user: AuthUser = {
          id: account.id,
          name: account.name,
          identifier: account.identifier,
        }
        set({ user })
        return user
      },

      register: ({ name, identifier, password }) => {
        const normalized = normalisasiIdentifier(identifier)
        if (get().accounts.some((item) => item.identifier === normalized)) {
          throw new Error("Email atau nomor HP sudah terdaftar. Silakan masuk.")
        }
        const account: AccountRecord = {
          id: `user-${crypto.randomUUID()}`,
          name: name.trim(),
          identifier: normalized,
          password,
        }
        const user: AuthUser = {
          id: account.id,
          name: account.name,
          identifier: account.identifier,
        }
        set((state) => ({
          user,
          accounts: [...state.accounts, account],
        }))
        return user
      },

      logout: () => set({ user: null }),
    }),
    {
      name: "jnt-auth",
      partialize: (state) => ({
        user: state.user,
        accounts: state.accounts,
      }),
    },
  ),
)

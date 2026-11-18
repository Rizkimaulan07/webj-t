import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormField } from "@/components/shared/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { pathSetelahMasuk } from "@/lib/navigation"
import { useAuthStore } from "./useAuthStore"

const identifierSchema = z
  .string()
  .trim()
  .min(5, "Masukkan email atau nomor HP.")
  .refine(
    (value) => {
      const compact = value.replace(/[\s-]/g, "")
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      const isPhone = /^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(compact)
      return isEmail || isPhone
    },
    { message: "Format email atau nomor HP belum valid." },
  )

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter.")
      .max(80, "Nama terlalu panjang."),
    identifier: identifierSchema,
    password: z
      .string()
      .min(6, "Kata sandi minimal 6 karakter.")
      .max(72, "Kata sandi terlalu panjang."),
    confirmPassword: z.string().min(1, "Ulangi kata sandi."),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Konfirmasi kata sandi belum sama.",
      })
    }
  })

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const registerAccount = useAuthStore((state) => state.register)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      identifier: "",
      password: "",
      confirmPassword: "",
    },
  })

  const submit = async (values: RegisterValues) => {
    setErrorMessage(null)
    try {
      const user = await registerAccount({
        name: values.name,
        identifier: values.identifier,
        password: values.password,
      })
      toast.success(`Akun ${user.name} berhasil dibuat.`)
      const target = location.state
        ? pathSetelahMasuk(location.state)
        : "/kirim"
      navigate(target, { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mendaftar. Coba lagi.",
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4" noValidate>
      {errorMessage && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      )}

      <FormField
        id="daftar-nama"
        label="Nama lengkap"
        error={errors.name?.message}
      >
        <Input
          id="daftar-nama"
          autoComplete="name"
          placeholder="Nama sesuai identitas"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "daftar-nama-error" : undefined}
          {...register("name")}
        />
      </FormField>

      <FormField
        id="daftar-identifier"
        label="Email atau nomor HP"
        error={errors.identifier?.message}
        hint="Dipakai untuk masuk ke akunmu."
      >
        <Input
          id="daftar-identifier"
          autoComplete="username"
          placeholder="nama@email.com atau 08xxxxxxxxxx"
          aria-invalid={Boolean(errors.identifier)}
          aria-describedby={
            errors.identifier ? "daftar-identifier-error" : "daftar-identifier-hint"
          }
          {...register("identifier")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="daftar-password"
          label="Kata sandi"
          error={errors.password?.message}
          hint="Minimal 6 karakter."
        >
          <Input
            id="daftar-password"
            type="password"
            autoComplete="new-password"
            placeholder="Buat kata sandi"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "daftar-password-error" : "daftar-password-hint"
            }
            {...register("password")}
          />
        </FormField>

        <FormField
          id="daftar-konfirmasi"
          label="Ulangi kata sandi"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="daftar-konfirmasi"
            type="password"
            autoComplete="new-password"
            placeholder="Ketik ulang kata sandi"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? "daftar-konfirmasi-error" : undefined
            }
            {...register("confirmPassword")}
          />
        </FormField>
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        Buat Akun
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link
          to="/masuk"
          state={location.state}
          className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
        >
          Masuk
        </Link>
      </p>
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Dengan mendaftar, kamu menyetujui syarat layanan dan kebijakan privasi
        demo ini. Data akun disimpan pada database layanan.
      </p>
    </form>
  )
}

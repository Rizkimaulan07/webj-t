import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowRight, Sparkles } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormField } from "@/components/shared/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { pathSetelahMasuk } from "@/lib/navigation"
import { DEMO_CREDENTIALS, useAuthStore } from "./useAuthStore"

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Masukkan email atau nomor HP.")
    .max(80, "Email atau nomor HP terlalu panjang."),
  password: z.string().min(1, "Masukkan kata sandi."),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  })

  const punyaTujuanAwal = Boolean(location.state)

  const submit = async (values: LoginValues) => {
    setErrorMessage(null)
    try {
      const user = await login(values.identifier, values.password)
      toast.success(`Selamat datang kembali, ${user.name}.`)
      navigate(pathSetelahMasuk(location.state), { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal masuk. Coba lagi.",
      )
    }
  }

  const isiDemo = () => {
    setValue("identifier", DEMO_CREDENTIALS.identifier)
    setValue("password", DEMO_CREDENTIALS.password)
    setErrorMessage(null)
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
        id="login-identifier"
        label="Email atau nomor HP"
        error={errors.identifier?.message}
      >
        <Input
          id="login-identifier"
          autoComplete="username"
          placeholder="nama@email.com atau 08xxxxxxxxxx"
          aria-invalid={Boolean(errors.identifier)}
          aria-describedby={
            errors.identifier ? "login-identifier-error" : undefined
          }
          {...register("identifier")}
        />
      </FormField>

      <FormField
        id="login-password"
        label="Kata sandi"
        error={errors.password?.message}
      >
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Masukkan kata sandi"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
          {...register("password")}
        />
      </FormField>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        Masuk
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>

      <div className="rounded-lg border border-dashed bg-muted/50 p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-accent-foreground" aria-hidden="true" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold">Coba tanpa mendaftar</p>
            <p className="mt-0.5 text-muted-foreground">
              Email: {DEMO_CREDENTIALS.identifier} · Sandi:{" "}
              {DEMO_CREDENTIALS.password}
            </p>
            <button
              type="button"
              onClick={isiDemo}
              className="mt-1 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
            >
              Isi kredensial demo
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          to="/daftar"
          state={punyaTujuanAwal ? location.state : undefined}
          className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
        >
          Daftar gratis
        </Link>
      </p>
    </form>
  )
}

import { AuthLayout } from "@/features/auth/AuthLayout"
import { RegisterForm } from "@/features/auth/RegisterForm"

export function RegisterPage() {
  return (
    <AuthLayout
      title="Buat akun J&T Express"
      description="Gratis dan kurang dari satu menit. Langsung bisa membuat pengiriman pertama."
      footer={
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          Data akun pada demo ini disimpan di localStorage perangkat, bukan di
          server. Hindari memakai kata sandi yang sama dengan akun pentingmu.
        </p>
      }
    >
      <RegisterForm />
    </AuthLayout>
  )
}

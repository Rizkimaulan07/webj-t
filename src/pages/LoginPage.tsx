import { AuthLayout } from "@/features/auth/AuthLayout"
import { LoginForm } from "@/features/auth/LoginForm"

export function LoginPage() {
  return (
    <AuthLayout
      title="Masuk ke akunmu"
      description="Lanjutkan pengiriman, cek riwayat pesanan, dan kelola alamat tersimpan."
      footer={
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          Dengan masuk, kamu menyetujui ketentuan layanan demo J&T Express.
          Jangan gunakan kata sandi asli untuk akun contoh ini.
        </p>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}

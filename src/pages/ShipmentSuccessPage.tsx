import { Link, useParams } from "react-router-dom"
import {
  ArrowRight,
  Check,
  CircleCheckBig,
  Copy,
  MapPin,
  PackageCheck,
  Printer,
  Search,
  Sparkles,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { QrSimulasi } from "@/components/shared/QrSimulasi"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/features/auth/useAuthStore"
import { useOrderByAwb } from "@/features/orders/useOrders"
import { angka, rupiah } from "@/lib/format"
import { DELIVERY_LABEL, PAYMENT_LABEL, nomorVirtualAccount } from "@/lib/payments"
import { SERVICE_LABEL } from "@/lib/services"

export function ShipmentSuccessPage() {
  const { awb } = useParams<{ awb: string }>()
  const user = useAuthStore((state) => state.user)
  const { data: order, isPending, isError } = useOrderByAwb(awb, user?.id)

  const bukanMilik = order && order.ownerId !== user?.id

  const salinResi = async () => {
    if (!order) return
    try {
      await navigator.clipboard.writeText(order.awb)
      toast.success("Nomor resi disalin.")
    } catch {
      toast.error("Gagal menyalin. Salin nomor resi secara manual.")
    }
  }

  if (isPending) {
    return (
      <div className="page-container py-10">
        <div className="mx-auto max-w-2xl space-y-4" aria-busy="true">
          <span className="sr-only">Memuat detail pesanan…</span>
          <Skeleton className="mx-auto size-16 rounded-full" />
          <Skeleton className="mx-auto h-8 w-2/3" />
          <Skeleton className="mx-auto h-4 w-1/2" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !order || bukanMilik) {
    return (
      <div className="page-container py-10">
        <EmptyState
          icon={PackageCheck}
          title="Pesanan tidak ditemukan"
          description="Kami tidak menemukan pesanan dengan nomor resi tersebut pada akunmu."
          className="mx-auto max-w-xl bg-card"
          action={
            <Button asChild>
              <Link to="/akun/pesanan">Lihat daftar pesanan</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="page-container py-8 sm:py-12">
      <div className="mx-auto grid max-w-3xl gap-6">
        <header className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50">
            <CircleCheckBig className="size-8" aria-hidden="true" />
          </span>
          <p className="mt-4 text-xs font-bold tracking-[0.2em] text-accent-foreground uppercase">
            Pengiriman berhasil dibuat
          </p>
          <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">
            Paketmu siap berangkat
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Simpan nomor resi berikut. Gunakan nomor ini untuk melacak paket
            atau membuka label kapan saja dari halaman pesanan.
          </p>
        </header>

        <Card className="border-primary/15 bg-primary text-primary-foreground">
          <CardContent className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-bold tracking-[0.18em] text-primary-foreground/60 uppercase">
                  Nomor resi
                </p>
                <p className="mt-1 font-mono text-2xl font-extrabold tracking-[0.14em] break-all sm:text-3xl">
                  {order.awb}
                </p>
              </div>
              <StatusBadge
                status={order.status}
                className="border-transparent bg-white/15 text-white"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-sm text-primary-foreground/75">
                <MapPin className="size-4" aria-hidden="true" />
                {order.from} → {order.to}
              </p>
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={() => void salinResi()}
              >
                <Copy className="size-4" aria-hidden="true" />
                Salin resi
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan pengiriman</CardTitle>
            <CardDescription>
              Detail ini juga tersimpan di halaman pesanan akunmu.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <dl className="grid gap-2.5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Layanan</dt>
                <dd className="font-bold">{SERVICE_LABEL[order.service]}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Estimasi tiba</dt>
                <dd className="font-bold">{order.estimated}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Berat tertagih</dt>
                <dd className="font-bold">{angka(order.weightKg)} kg</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Pengantaran</dt>
                <dd className="font-bold">
                  {DELIVERY_LABEL[order.deliveryMethod]}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Penerima</dt>
                <dd className="font-bold break-words">
                  {order.receiver.name}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Pembayaran</dt>
                <dd className="font-bold">{PAYMENT_LABEL[order.paymentMethod]}</dd>
              </div>
            </dl>

            {order.dropBranchName && (
              <p className="rounded-md bg-secondary px-3 py-2 text-xs leading-relaxed text-secondary-foreground">
                Antar paket ke <strong>{order.dropBranchName}</strong> sebelum
                jam operasional berakhir.
              </p>
            )}

            <Separator />
            <div className="flex items-end justify-between gap-3">
              <span className="text-sm font-bold">Total dibayar</span>
              <span className="text-2xl font-extrabold tracking-tight">
                {rupiah(order.total)}
              </span>
            </div>

            <div className="rounded-lg border border-dashed bg-muted/40 p-4">
              {order.paymentMethod === "VA" && (
                <div>
                  <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    Virtual account simulasi
                  </p>
                  <p className="mt-1 font-mono text-lg font-extrabold tracking-wider">
                    {nomorVirtualAccount(order.sender.phone)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="size-3.5" aria-hidden="true" />
                    Pembayaran berhasil disimulasikan.
                  </p>
                </div>
              )}
              {order.paymentMethod === "EWALLET" && (
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-soft">
                    <Wallet className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                      E-wallet simulasi
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      Pembayaran berhasil terhubung
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      GoPay / OVO / DANA · tidak ada transaksi nyata.
                    </p>
                  </div>
                </div>
              )}
              {order.paymentMethod === "QRIS" && (
                <div className="flex items-center gap-4">
                  <QrSimulasi
                    value={`QRIS-${order.awb}-${order.total}`}
                    className="size-24 shrink-0 text-primary"
                  />
                  <div>
                    <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                      QRIS simulasi
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      Pembayaran QRIS diterima
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Kode ilustrasi, bukan QR pembayaran asli.
                    </p>
                  </div>
                </div>
              )}
              {order.paymentMethod === "COD" && (
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-soft">
                    <Sparkles className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                      Bayar di tempat
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      Siapkan {rupiah(order.total)} saat paket tiba
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Kurir akan menagih tunai. Resi sudah diterbitkan.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild size="lg">
            <Link to={`/label/${order.awb}`}>
              <Printer className="size-4" aria-hidden="true" />
              Lihat & cetak label
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to={`/lacak/${encodeURIComponent(order.awb)}`}>
              <Search className="size-4" aria-hidden="true" />
              Lacak paket
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
          <Link
            to="/akun/pesanan"
            className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary underline underline-offset-4"
          >
            Semua pesanan
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
          <Link
            to="/kirim"
            className="inline-flex min-h-11 items-center gap-1 font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Buat pengiriman lain
          </Link>
        </div>
      </div>
    </div>
  )
}

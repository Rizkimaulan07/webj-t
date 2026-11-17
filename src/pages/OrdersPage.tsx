import { useDeferredValue, useState } from "react"
import { Link } from "react-router-dom"
import { AlertCircle, PackageSearch, Search, X } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore } from "@/features/auth/useAuthStore"
import { OrderCard } from "@/features/orders/OrderCard"
import { OrderDetailDialog } from "@/features/orders/OrderDetailDialog"
import { useOrders } from "@/features/orders/useOrders"
import { SHIPMENT_STATUSES, STATUS_META } from "@/lib/shipment-status"
import type { ShipmentOrder, ShipmentStatus } from "@/types/shipment"

type StatusFilter = "SEMUA" | ShipmentStatus

const STATUS_FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: "SEMUA", label: "Semua" },
  ...SHIPMENT_STATUSES.map((status) => ({
    id: status,
    label: STATUS_META[status].label,
  })),
]

export function OrdersPage() {
  const user = useAuthStore((state) => state.user)
  const { data, isPending, isError, refetch } = useOrders(user?.id)
  const [status, setStatus] = useState<StatusFilter>("SEMUA")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<ShipmentOrder | null>(null)
  const deferredQuery = useDeferredValue(query)

  const semua = data ?? []
  const kueri = deferredQuery.trim().toLowerCase()
  const hasil = semua.filter((order) => {
    const cocokStatus = status === "SEMUA" || order.status === status
    const cocokKueri =
      !kueri ||
      [order.awb, order.from, order.to, order.receiverMasked].some((value) =>
        value.toLowerCase().includes(kueri),
      )
    return cocokStatus && cocokKueri
  })

  const jumlahUntuk = (filter: StatusFilter) =>
    filter === "SEMUA"
      ? semua.length
      : semua.filter((order) => order.status === filter).length

  const resetFilter = () => {
    setStatus("SEMUA")
    setQuery("")
  }

  return (
    <section aria-labelledby="judul-pesanan">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="judul-pesanan" className="text-2xl font-extrabold">
            Riwayat pesanan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cari resi, saring status, lalu buka detail atau label pengiriman.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border bg-card p-4 shadow-soft sm:p-5">
        <div className="grid gap-1.5">
          <Label htmlFor="cari-pesanan" className="sr-only">
            Cari pesanan
          </Label>
          <div className="relative max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="cari-pesanan"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nomor resi, kota, atau penerima…"
              className="pl-9 pr-10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Hapus pencarian"
                className="absolute top-1/2 right-0 flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <Tabs
          value={status}
          onValueChange={(value) => {
            const filter = STATUS_FILTERS.find((item) => item.id === value)
            if (filter) setStatus(filter.id)
          }}
        >
          <TabsList
            className="h-auto w-full flex-wrap justify-start gap-1 rounded-lg p-1"
            aria-label="Saring pesanan berdasarkan status"
          >
            {STATUS_FILTERS.map((filter) => (
              <TabsTrigger
                key={filter.id}
                value={filter.id}
                className="h-11 flex-none px-3 text-xs sm:text-sm"
              >
                {filter.label}
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] font-bold text-muted-foreground">
                  {jumlahUntuk(filter.id)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {isPending
          ? "Memuat pesanan…"
          : `${hasil.length} pesanan ditampilkan`}
      </p>

      {isPending && (
        <div className="mt-3 grid gap-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={AlertCircle}
          title="Gagal memuat pesanan"
          description="Terjadi kendala saat mengambil data pesanan. Coba muat ulang."
          className="mt-3 bg-card"
          action={
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Coba lagi
            </Button>
          }
        />
      )}

      {!isPending && !isError && semua.length === 0 && (
        <EmptyState
          icon={PackageSearch}
          title="Belum ada pengiriman"
          description="Pesanan yang kamu buat akan muncul di sini, lengkap dengan label dan status perjalanannya."
          className="mt-3 bg-card"
          action={
            <Button asChild>
              <Link to="/kirim">Buat pengiriman pertama</Link>
            </Button>
          }
        />
      )}

      {!isPending && !isError && semua.length > 0 && hasil.length === 0 && (
        <EmptyState
          icon={PackageSearch}
          title="Pesanan tidak ditemukan"
          description="Tidak ada pesanan yang cocok dengan pencarian atau status yang dipilih."
          className="mt-3 bg-card"
          action={
            <Button type="button" variant="outline" onClick={resetFilter}>
              Atur ulang filter
            </Button>
          }
        />
      )}

      {!isPending && !isError && hasil.length > 0 && (
        <div className="mt-3 grid gap-3">
          {hasil.map((order) => (
            <OrderCard key={order.awb} order={order} onDetail={setSelected} />
          ))}
        </div>
      )}

      <OrderDetailDialog
        order={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </section>
  )
}

import { useState } from "react"
import {
  AlertCircle,
  BookUser,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { AddressFormDialog } from "@/features/address/AddressFormDialog"
import {
  useAddresses,
  useDeleteAddress,
} from "@/features/address/useAddressBook"
import { useAuthStore } from "@/features/auth/useAuthStore"
import { getCityName } from "@/mocks/cities"
import type { SavedAddress } from "@/types/user"

export function AddressBookPage() {
  const user = useAuthStore((state) => state.user)
  const { data, isPending, isError, refetch } = useAddresses(user?.id)
  const hapusAlamat = useDeleteAddress(user?.id)
  const [deleting, setDeleting] = useState<SavedAddress | null>(null)

  const alamatList = data ?? []

  const konfirmasiHapus = async () => {
    if (!deleting) return
    try {
      await hapusAlamat.mutateAsync(deleting.id)
      toast.success("Alamat berhasil dihapus.")
      setDeleting(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus alamat.",
      )
    }
  }

  return (
    <section aria-labelledby="judul-alamat">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="judul-alamat" className="text-2xl font-extrabold">
            Buku alamat
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Simpan alamat pengirim dan penerima agar pembuatan pengiriman
            berikutnya lebih cepat.
          </p>
        </div>
        {user && (
          <AddressFormDialog
            userId={user.id}
            trigger={
              <Button type="button">
                <Plus className="size-4" aria-hidden="true" />
                Tambah alamat
              </Button>
            }
          />
        )}
      </div>

      {isPending && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2" aria-busy="true">
          <span className="sr-only">Memuat buku alamat…</span>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={AlertCircle}
          title="Gagal memuat alamat"
          description="Terjadi kendala saat mengambil buku alamat. Coba lagi."
          className="mt-5 bg-card"
          action={
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Coba lagi
            </Button>
          }
        />
      )}

      {!isPending && !isError && alamatList.length === 0 && (
        <EmptyState
          icon={BookUser}
          title="Buku alamat masih kosong"
          description="Tambahkan alamat rumah atau kantor supaya tidak perlu mengetik ulang saat mengirim paket."
          className="mt-5 bg-card"
          action={
            user ? (
              <AddressFormDialog
                userId={user.id}
                trigger={
                  <Button type="button">
                    <Plus className="size-4" aria-hidden="true" />
                    Tambah alamat pertama
                  </Button>
                }
              />
            ) : undefined
          }
        />
      )}

      {!isPending && !isError && alamatList.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {alamatList.map((address) => (
            <article
              key={address.id}
              className="flex flex-col rounded-xl border bg-card p-4 shadow-soft"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Badge variant="accent">{address.label}</Badge>
                  <h3 className="mt-1.5 truncate text-base font-extrabold">
                    {address.name}
                  </h3>
                </div>
                {user && (
                  <div className="flex shrink-0">
                    <AddressFormDialog
                      userId={user.id}
                      address={address}
                      trigger={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Ubah alamat ${address.label}`}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleting(address)}
                      aria-label={`Hapus alamat ${address.label}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {address.address}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
                <MapPin
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                {getCityName(address.cityId)} {address.postalCode}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="size-4 shrink-0" aria-hidden="true" />
                {address.phone}
              </p>
            </article>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      >
        {deleting && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Hapus alamat?</DialogTitle>
              <DialogDescription>
                Alamat “{deleting.label}” milik {deleting.name} akan dihapus
                dari buku alamat. Tindakan ini tidak bisa dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleting(null)}
                disabled={hapusAlamat.isPending}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void konfirmasiHapus()}
                disabled={hapusAlamat.isPending}
              >
                {hapusAlamat.isPending ? (
                  <Loader2
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2 className="size-4" aria-hidden="true" />
                )}
                {hapusAlamat.isPending ? "Menghapus…" : "Hapus alamat"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </section>
  )
}

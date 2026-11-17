import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { AddressInput, SavedAddress } from "@/types/user"
import { AddressForm } from "./AddressForm"
import { useCreateAddress, useUpdateAddress } from "./useAddressBook"

interface AddressFormDialogProps {
  userId: string
  address?: SavedAddress
  trigger: ReactNode
  onSaved?: (address: SavedAddress) => void
}

export function AddressFormDialog({
  userId,
  address,
  trigger,
  onSaved,
}: AddressFormDialogProps) {
  const [open, setOpen] = useState(false)
  const createAddress = useCreateAddress(userId)
  const updateAddress = useUpdateAddress(userId)
  const pending = createAddress.isPending || updateAddress.isPending

  const simpan = async (values: AddressInput) => {
    try {
      const saved = address
        ? await updateAddress.mutateAsync({ id: address.id, input: values })
        : await createAddress.mutateAsync(values)
      toast.success(
        address ? "Alamat berhasil diperbarui." : "Alamat baru berhasil disimpan.",
      )
      setOpen(false)
      onSaved?.(saved)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan alamat.",
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {address ? "Ubah alamat" : "Tambah alamat baru"}
          </DialogTitle>
          <DialogDescription>
            Alamat tersimpan bisa dipakai lagi saat membuat pengiriman.
          </DialogDescription>
        </DialogHeader>
        <AddressForm
          initial={address}
          pending={pending}
          submitLabel={address ? "Simpan perubahan" : "Simpan alamat"}
          onSubmit={(values) => void simpan(values)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

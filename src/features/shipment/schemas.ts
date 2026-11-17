import { z } from "zod"

export const partySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter.")
    .max(80, "Nama terlalu panjang."),
  phone: z
    .string()
    .trim()
    .min(1, "Masukkan nomor HP.")
    .refine(
      (value) =>
        /^(\+62|62|0)8[1-9]\d{6,11}$/.test(value.replace(/[\s().-]/g, "")),
      "Gunakan nomor HP Indonesia yang valid, mis. 08123456789.",
    ),
  address: z
    .string()
    .trim()
    .min(10, "Alamat minimal 10 karakter.")
    .max(300, "Alamat terlalu panjang."),
  cityId: z.string().min(1, "Pilih kota."),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Kode pos harus 5 digit angka."),
})

export type PartyValues = z.infer<typeof partySchema>

export const goodsSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(3, "Jelaskan isi paket minimal 3 karakter.")
      .max(120, "Deskripsi terlalu panjang."),
    weightKg: z
      .number()
      .positive("Berat harus lebih dari 0 kg.")
      .max(1_000, "Maksimal 1.000 kg per pengiriman."),
    lengthCm: z
      .number()
      .min(0, "Dimensi tidak boleh negatif.")
      .max(500, "Maksimal 500 cm."),
    widthCm: z
      .number()
      .min(0, "Dimensi tidak boleh negatif.")
      .max(500, "Maksimal 500 cm."),
    heightCm: z
      .number()
      .min(0, "Dimensi tidak boleh negatif.")
      .max(500, "Maksimal 500 cm."),
    value: z
      .number()
      .min(0, "Nilai barang tidak boleh negatif.")
      .max(1_000_000_000, "Nilai barang terlalu besar."),
    insurance: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.insurance && data.value <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "Isi nilai barang jika memilih asuransi.",
      })
    }
  })

export type GoodsValues = z.infer<typeof goodsSchema>

export const addressSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Beri nama alamat, mis. Rumah atau Kantor.")
    .max(30, "Label maksimal 30 karakter."),
  name: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter.")
    .max(80, "Nama terlalu panjang."),
  phone: z
    .string()
    .trim()
    .min(1, "Masukkan nomor HP.")
    .refine(
      (value) =>
        /^(\+62|62|0)8[1-9]\d{6,11}$/.test(value.replace(/[\s().-]/g, "")),
      "Gunakan nomor HP Indonesia yang valid, mis. 08123456789.",
    ),
  address: z
    .string()
    .trim()
    .min(10, "Alamat minimal 10 karakter.")
    .max(300, "Alamat terlalu panjang."),
  cityId: z.string().min(1, "Pilih kota."),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Kode pos harus 5 digit angka."),
})

export type AddressValues = z.infer<typeof addressSchema>

export function normalisasiTelepon(value: string): string {
  return value.replace(/[^\d+]/g, "")
}

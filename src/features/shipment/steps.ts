export interface ShipmentStepInfo {
  id: number
  title: string
  description: string
}

export const SHIPMENT_STEPS: ShipmentStepInfo[] = [
  {
    id: 1,
    title: "Pengirim",
    description: "Alamat asal paket",
  },
  {
    id: 2,
    title: "Penerima",
    description: "Alamat tujuan paket",
  },
  {
    id: 3,
    title: "Paket & Layanan",
    description: "Berat dan layanan kirim",
  },
  {
    id: 4,
    title: "Pembayaran",
    description: "Metode bayar dan konfirmasi",
  },
]

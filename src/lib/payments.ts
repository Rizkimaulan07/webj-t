import type { DeliveryMethod, PaymentMethod } from "@/types/shipment"

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  VA: "Virtual Account",
  EWALLET: "E-Wallet",
  QRIS: "QRIS",
  COD: "Bayar di Tempat (COD)",
}

export const DELIVERY_LABEL: Record<DeliveryMethod, string> = {
  PICKUP: "Dijemput kurir",
  DROP_OFF: "Antar ke cabang",
}

export const PAYMENT_DESCRIPTION: Record<PaymentMethod, string> = {
  VA: "Transfer melalui virtual account bank. Nomor VA dibuat otomatis.",
  EWALLET: "Bayar melalui GoPay, OVO, atau DANA pada simulasi ini.",
  QRIS: "Pindai kode QRIS simulasi dengan aplikasi pembayaranmu.",
  COD: "Bayar tunai kepada kurir ketika paket tiba di tujuan.",
}

export function nomorVirtualAccount(phone: string): string {
  const digit = phone.replace(/\D/g, "").padStart(8, "0").slice(-8)
  return `8808 ${digit.slice(0, 4)} ${digit.slice(4)}`
}

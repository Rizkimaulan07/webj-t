import type { Shipment, ShipmentOrder } from "@/types/shipment"

export const DEMO_TRACKING_CODES = {
  inTransit: "LJX1234567890",
  delivered: "LJX0000000001",
} as const

const BANDUNG_TO_SURABAYA_EVENTS = [
  {
    time: "2026-11-15T14:05:00+07:00",
    title: "Paket diterima di drop point",
    location: "Bandung",
    done: true,
  },
  {
    time: "2026-11-15T19:30:00+07:00",
    title: "Paket berangkat dari hub Bandung",
    location: "Bandung",
    done: true,
  },
  {
    time: "2026-11-16T00:50:00+07:00",
    title: "Paket tiba di hub transit Semarang",
    location: "Semarang",
    done: true,
  },
  {
    time: "2026-11-16T01:20:00+07:00",
    title: "Paket berangkat dari hub transit Semarang",
    location: "Semarang",
    done: true,
  },
  {
    time: "2026-11-16T07:45:00+07:00",
    title: "Paket tiba di hub Surabaya",
    location: "Surabaya",
    done: true,
  },
  {
    time: "2026-11-16T09:10:00+07:00",
    title: "Paket diproses di hub Surabaya",
    location: "Surabaya",
    done: true,
  },
  {
    time: "2026-11-17T14:00:00+07:00",
    title: "Paket diantar ke alamat penerima",
    location: "Surabaya",
    done: false,
  },
]

const JAKARTA_TO_BANDUNG_EVENTS = [
  {
    time: "2026-11-10T09:15:00+07:00",
    title: "Paket diterima di drop point",
    location: "Jakarta",
    done: true,
  },
  {
    time: "2026-11-10T18:40:00+07:00",
    title: "Paket berangkat dari hub Jakarta",
    location: "Jakarta",
    done: true,
  },
  {
    time: "2026-11-11T04:30:00+07:00",
    title: "Paket tiba di hub Bandung",
    location: "Bandung",
    done: true,
  },
  {
    time: "2026-11-11T08:10:00+07:00",
    title: "Paket diantar oleh kurir",
    location: "Bandung",
    done: true,
  },
  {
    time: "2026-11-11T11:42:00+07:00",
    title: "Paket diterima oleh S*** W******",
    location: "Bandung",
    done: true,
  },
]

export const DEMO_ORDERS: ShipmentOrder[] = [
  {
    awb: "LJX1234567890",
    status: "DALAM_PERJALANAN",
    service: "EXPRESS",
    from: "Bandung",
    to: "Surabaya",
    receiverMasked: "B*** S*****",
    weightKg: 2,
    events: BANDUNG_TO_SURABAYA_EVENTS,
    createdAt: "2026-11-15T13:45:00+07:00",
    total: 40_900,
    estimated: "1–2 hari",
    paymentMethod: "VA",
    deliveryMethod: "DROP_OFF",
    sender: {
      name: "Ayu Lestari",
      phone: "0812-3456-7890",
      address: "Jl. Cihampelas No. 42, Coblong",
      cityId: "bandung",
      postalCode: "40131",
    },
    receiver: {
      name: "Budi Santoso",
      phone: "0813-9876-5432",
      address: "Jl. Rungkut Asri No. 8, Rungkut",
      cityId: "surabaya",
      postalCode: "60293",
    },
    goods: {
      description: "Pakaian dan sepatu",
      weightKg: 2,
      lengthCm: 30,
      widthCm: 20,
      heightCm: 15,
      value: 450_000,
      insurance: true,
    },
    ownerId: "demo-user",
    zone: 1,
    dropBranchName: "J&T Drop Point Bandung Dago",
  },
  {
    awb: "LJX0000000001",
    status: "TERKIRIM",
    service: "REGULER",
    from: "Jakarta",
    to: "Bandung",
    receiverMasked: "S*** W******",
    weightKg: 1,
    events: JAKARTA_TO_BANDUNG_EVENTS,
    createdAt: "2026-11-10T08:30:00+07:00",
    total: 11_500,
    estimated: "2–4 hari",
    paymentMethod: "QRIS",
    deliveryMethod: "DROP_OFF",
    sender: {
      name: "Ayu Lestari",
      phone: "0812-3456-7890",
      address: "Jl. Kemang Selatan No. 17, Mampang Prapatan",
      cityId: "jakarta",
      postalCode: "12730",
    },
    receiver: {
      name: "Siti Wulandari",
      phone: "0857-1122-3344",
      address: "Jl. Sukajadi No. 90, Sukajadi",
      cityId: "bandung",
      postalCode: "40162",
    },
    goods: {
      description: "Dokumen dan buku",
      weightKg: 1,
      lengthCm: 20,
      widthCm: 15,
      heightCm: 5,
      value: 250_000,
      insurance: false,
    },
    ownerId: "demo-user",
    zone: 1,
    dropBranchName: "J&T Hub Jakarta Selatan",
  },
]

export const DEMO_SHIPMENTS: Shipment[] = DEMO_ORDERS.map((order) => ({
  awb: order.awb,
  status: order.status,
  service: order.service,
  from: order.from,
  to: order.to,
  receiverMasked: order.receiverMasked,
  weightKg: order.weightKg,
  events: order.events,
}))

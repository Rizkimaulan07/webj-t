import { create } from "zustand"
import { persist } from "zustand/middleware"

import type {
  DeliveryMethod,
  PaymentMethod,
  ServiceId,
  ShipmentGoods,
  ShipmentParty,
} from "@/types/shipment"
import type { TariffOption } from "@/types/tariff"

export type ShipmentRole = "sender" | "receiver"

interface DraftData {
  step: number
  sender: ShipmentParty
  receiver: ShipmentParty
  goods: ShipmentGoods
  quotes: TariffOption[]
  service: ServiceId | null
  deliveryMethod: DeliveryMethod
  dropBranchId: string
  paymentMethod: PaymentMethod
}

interface ShipmentDraftState extends DraftData {
  setStep: (step: number) => void
  saveParty: (role: ShipmentRole, party: ShipmentParty) => void
  saveGoodsAndQuotes: (goods: ShipmentGoods, quotes: TariffOption[]) => void
  selectService: (service: ServiceId) => void
  setDeliveryMethod: (method: DeliveryMethod) => void
  setDropBranchId: (branchId: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  resetDraft: () => void
}

const PARTY_KOSONG: ShipmentParty = {
  name: "",
  phone: "",
  address: "",
  cityId: "",
  postalCode: "",
}

const GOODS_KOSONG: ShipmentGoods = {
  description: "",
  weightKg: 1,
  lengthCm: 0,
  widthCm: 0,
  heightCm: 0,
  value: 0,
  insurance: false,
}

const DRAFT_AWAL: DraftData = {
  step: 1,
  sender: { ...PARTY_KOSONG },
  receiver: { ...PARTY_KOSONG },
  goods: { ...GOODS_KOSONG },
  quotes: [],
  service: null,
  deliveryMethod: "PICKUP",
  dropBranchId: "",
  paymentMethod: "VA",
}

export const useShipmentDraft = create<ShipmentDraftState>()(
  persist(
    (set) => ({
      ...DRAFT_AWAL,

      setStep: (step) =>
        set({ step: Math.min(4, Math.max(1, step)) }),

      saveParty: (role, party) =>
        set((state) => {
          const kotaBerubah = state[role].cityId !== party.cityId
          return {
            sender: role === "sender" ? party : state.sender,
            receiver: role === "receiver" ? party : state.receiver,
            ...(kotaBerubah ? { quotes: [], service: null } : {}),
          }
        }),

      saveGoodsAndQuotes: (goods, quotes) =>
        set((state) => ({
          goods,
          quotes,
          service:
            state.service &&
            quotes.some((quote) => quote.service === state.service)
              ? state.service
              : (quotes[0]?.service ?? null),
        })),

      selectService: (service) => set({ service }),

      setDeliveryMethod: (deliveryMethod) =>
        set((state) => ({
          deliveryMethod,
          dropBranchId:
            deliveryMethod === "PICKUP" ? "" : state.dropBranchId,
        })),

      setDropBranchId: (dropBranchId) => set({ dropBranchId }),

      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

      resetDraft: () => set({ ...DRAFT_AWAL }),
    }),
    {
      name: "jnt-shipment-draft",
      version: 1,
    },
  ),
)

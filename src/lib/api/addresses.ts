import type { AddressInput, SavedAddress } from "@/types/user"
import { ApiError, buatId, bacaLokal, jedaApi, tulisLokal } from "./client"

const ADDRESSES_KEY = "addresses"

function bacaSemuaAlamat(): SavedAddress[] {
  return bacaLokal<SavedAddress[]>(ADDRESSES_KEY, [])
}

export async function getAddresses(userId: string): Promise<SavedAddress[]> {
  await jedaApi()
  return bacaSemuaAlamat()
    .filter((address) => address.userId === userId)
    .sort((a, b) => a.label.localeCompare(b.label, "id"))
}

export async function createAddress(
  userId: string,
  input: AddressInput,
): Promise<SavedAddress> {
  await jedaApi()
  const address: SavedAddress = {
    ...input,
    id: buatId("alamat"),
    userId,
  }
  tulisLokal(ADDRESSES_KEY, [address, ...bacaSemuaAlamat()])
  return address
}

export async function updateAddress(
  userId: string,
  id: string,
  input: AddressInput,
): Promise<SavedAddress> {
  await jedaApi()
  const semua = bacaSemuaAlamat()
  const existing = semua.find(
    (address) => address.id === id && address.userId === userId,
  )
  if (!existing) {
    throw new ApiError("Alamat tidak ditemukan.", "NOT_FOUND")
  }
  const updated: SavedAddress = { ...existing, ...input }
  tulisLokal(
    ADDRESSES_KEY,
    semua.map((address) => (address.id === id ? updated : address)),
  )
  return updated
}

export async function deleteAddress(
  userId: string,
  id: string,
): Promise<void> {
  await jedaApi()
  const semua = bacaSemuaAlamat()
  const exists = semua.some(
    (address) => address.id === id && address.userId === userId,
  )
  if (!exists) {
    throw new ApiError("Alamat tidak ditemukan.", "NOT_FOUND")
  }
  tulisLokal(
    ADDRESSES_KEY,
    semua.filter((address) => address.id !== id),
  )
}

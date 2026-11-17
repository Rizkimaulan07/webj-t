export interface AuthUser {
  id: string
  name: string
  identifier: string
}

export interface AddressInput {
  label: string
  name: string
  phone: string
  address: string
  cityId: string
  postalCode: string
}

export interface SavedAddress extends AddressInput {
  id: string
  userId: string
}

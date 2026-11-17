import { Navigate, Route, Routes } from "react-router-dom"

import { ProtectedRoute } from "@/app/ProtectedRoute"
import { RootLayout } from "@/components/layout/RootLayout"
import { AccountLayout } from "@/features/account/AccountLayout"
import { AddressBookPage } from "@/pages/AddressBookPage"
import { BranchesPage } from "@/pages/BranchesPage"
import { HomePage } from "@/pages/HomePage"
import { LabelPage } from "@/pages/LabelPage"
import { LoginPage } from "@/pages/LoginPage"
import { HelpPage } from "@/pages/HelpPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { OrdersPage } from "@/pages/OrdersPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { ShipmentPage } from "@/pages/ShipmentPage"
import { ShipmentSuccessPage } from "@/pages/ShipmentSuccessPage"
import { TariffPage } from "@/pages/TariffPage"
import { TrackingPage } from "@/pages/TrackingPage"

export function AppRouter() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="lacak" element={<TrackingPage />} />
        <Route path="lacak/:resi" element={<TrackingPage />} />
        <Route path="tarif" element={<TariffPage />} />
        <Route path="cabang" element={<BranchesPage />} />
        <Route path="bantuan" element={<HelpPage />} />
        <Route path="masuk" element={<LoginPage />} />
        <Route path="daftar" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="kirim" element={<ShipmentPage />} />
          <Route path="kirim/sukses/:awb" element={<ShipmentSuccessPage />} />
          <Route path="label/:awb" element={<LabelPage />} />
          <Route path="akun" element={<AccountLayout />}>
            <Route index element={<Navigate to="pesanan" replace />} />
            <Route path="pesanan" element={<OrdersPage />} />
            <Route path="alamat" element={<AddressBookPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

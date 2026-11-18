# React + TypeScript + Vite

## PostgreSQL lokal

1. Pastikan layanan PostgreSQL berjalan.
2. Salin `.env.example` menjadi `.env`, lalu isi `DATABASE_URL` dengan kata sandi PostgreSQL lokal yang kuat dan buat `SESSION_SECRET` acak minimal 32 karakter. Jangan kirim atau commit `.env`.
3. Pasang dependensi dengan `npm install`.
4. Buat database `jnt_express` (jika belum ada) dan tabel aplikasi dengan `npm run db:setup`.
5. Jalankan aplikasi dan API dengan `npm run dev`.

`npm run db:migrate` menerapkan ulang skema secara aman tanpa menghapus data. Akun, buku alamat, pesanan, dan riwayat pelacakan pengguna disimpan di PostgreSQL. Tarif, daftar kota/cabang, dan data resi demo tetap merupakan data contoh di aplikasi.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

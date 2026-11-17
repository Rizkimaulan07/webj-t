export type FaqCategory = "Pengiriman" | "Pembayaran" | "Akun & Alamat"

export interface FaqItem {
  question: string
  answer: string
  category: FaqCategory
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  "Pengiriman",
  "Pembayaran",
  "Akun & Alamat",
]

export const FAQS: FaqItem[] = [
  {
    category: "Pengiriman",
    question: "Bagaimana cara membuat pengiriman?",
    answer:
      "Masuk ke akunmu, lalu pilih Buat Pengiriman. Isi data pengirim dan penerima, tentukan berat serta layanan, kemudian selesaikan pembayaran simulasi. Nomor resi dan label akan langsung dibuat.",
  },
  {
    category: "Pengiriman",
    question: "Bagaimana berat tertagih dihitung?",
    answer:
      "Berat tertagih memakai nilai terbesar antara berat aktual dan berat volumetrik (panjang × lebar × tinggi ÷ 6.000). Berat dibulatkan ke atas dengan minimal 1 kg. Kargo memiliki berat tertagih minimal 10 kg.",
  },
  {
    category: "Pengiriman",
    question: "Kapan layanan Same Day tersedia?",
    answer:
      "Same Day hanya muncul untuk rute dalam satu kota atau zona 0. Untuk rute antarkota, pilih Reguler, Express, atau Kargo sesuai kebutuhanmu.",
  },
  {
    category: "Pengiriman",
    question: "Bagaimana cara melacak paket?",
    answer:
      "Buka halaman Lacak, masukkan nomor resi, lalu tekan Lacak Paket. Kamu juga bisa membuka detail pesanan dari menu Akun & Pesanan untuk melihat status dan riwayat perjalanan.",
  },
  {
    category: "Pengiriman",
    question: "Apakah paket bisa dijemput kurir?",
    answer:
      "Bisa. Pada langkah pembayaran, pilih metode pengantaran Jemput kurir. Kamu juga dapat memilih Antar ke cabang untuk mengantar sendiri paket ke hub, drop point, atau agen terdekat.",
  },
  {
    category: "Pembayaran",
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Tersedia Virtual Account, E-Wallet (GoPay, OVO, DANA), QRIS, dan COD. Semua pembayaran pada situs demo ini adalah simulasi dan tidak memproses uang sungguhan.",
  },
  {
    category: "Pembayaran",
    question: "Apakah asuransi wajib?",
    answer:
      "Tidak. Asuransi bersifat opsional dan dihitung 0,2% dari nilai barang ditambah Rp 5.000. Aktifkan asuransi saat mengisi detail paket jika barangmu bernilai tinggi.",
  },
  {
    category: "Pembayaran",
    question: "Bagaimana cara mencetak label?",
    answer:
      "Setelah pembayaran berhasil, buka halaman label dari halaman sukses atau riwayat pesanan. Tekan Cetak label. Label dirancang untuk kertas A6 dengan barcode Code128 yang tetap tajam.",
  },
  {
    category: "Akun & Alamat",
    question: "Apakah alamat bisa disimpan?",
    answer:
      "Bisa. Buka Akun & Pesanan lalu pilih Buku alamat untuk menambah, mengubah, atau menghapus alamat. Alamat tersimpan bisa langsung dipakai saat membuat pengiriman berikutnya.",
  },
  {
    category: "Akun & Alamat",
    question: "Apakah data saya tersimpan di server?",
    answer:
      "Situs ini adalah demo. Akun, alamat, draft pengiriman, dan pesanan disimpan di localStorage browser perangkatmu, sehingga tidak dikirim ke server mana pun.",
  },
]

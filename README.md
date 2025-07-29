# Bank Sampah RW - Sistem Tabungan Sampah

## Deskripsi Proyek

Aplikasi mobile-first untuk pengelolaan bank sampah di RW 10 Desa Cidatar yang dapat berfungsi secara offline dengan fitur Progressive Web App (PWA).

## Teknologi yang Digunakan

- **Frontend**: React.js 18+
- **Build Tool**: Vite
- **PWA**: Service Worker + Web App Manifest
- **Database Lokal**: IndexedDB/Local Storage
- **UI Framework**: Tailwind CSS
- **State Management**: React Context
- **Offline Storage**: Local Storage/IndexedDB

## Cara Menjalankan Aplikasi

Pastikan Node.js & npm sudah terinstall - [install dengan nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Ikuti langkah berikut:

```sh
# Step 1: Clone repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate ke direktori project
cd rw-tabungan-hijau

# Step 3: Install dependencies
npm i

# Step 4: Jalankan development server
npm run dev
```

## Fitur Utama

- **Manajemen RT**: Input dan kelola data RT (Rukun Tetangga)
- **Setoran Sampah**: Catat setoran sampah dengan auto kalkulasi nilai
- **Tabungan**: Kelola saldo tabungan masing-masing RT
- **Penarikan**: Validasi dan proses penarikan tabungan
- **Laporan**: Generate laporan harian dan bulanan
- **PWA**: Dapat diinstall dan bekerja offline

## Cara Edit File

**Edit langsung di GitHub**

- Navigate ke file yang diinginkan
- Click tombol "Edit" (icon pensil) di kanan atas
- Buat perubahan dan commit

**Menggunakan GitHub Codespaces**

- Navigate ke halaman utama repository
- Click tombol "Code" (tombol hijau) di kanan atas
- Pilih tab "Codespaces"
- Click "New codespace" untuk launch environment baru
- Edit file langsung dalam Codespaces

## Teknologi yang Digunakan

Project ini dibangun dengan:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

Untuk deployment, Anda dapat menggunakan:

- **Vercel**: Connect repository dan auto-deploy
- **Netlify**: Drag & drop atau connect Git
- **GitHub Pages**: Untuk static hosting
- **VPS/Server**: Build dan deploy manual

## Setup Custom Domain

Jika menggunakan hosting seperti Vercel/Netlify, Anda dapat:

1. Beli domain dari provider domain
2. Configure DNS settings
3. Connect domain di dashboard hosting

# � Kebutuhan Sistem Aplikasi Bank Sampah RW 10 Desa Cidatar

## 🎯 Deskripsi Proyek

Aplikasi mobile-first untuk pengelolaan bank sampah di RW 10 Desa Cidatar yang dapat berfungsi secara offline dengan fitur Progressive Web App (PWA).

## 🛠️ Teknologi Stack

- **Frontend**: React.js 18+
- **Build Tool**: Vite
- **PWA**: Service Worker + Web App Manifest
- **Database Lokal**: IndexedDB/Local Storage
- **UI Framework**: Material-UI / Tailwind CSS
- **State Management**: React Context / Zustand
- **Offline Storage**: Dexie.js (IndexedDB wrapper)

## � Aktor Sistem

- **Admin/Pengelola**: Pengelola Bank Sampah RW 10
- **RT**: Perwakilan RT yang melakukan setoran

## 🔁 Alur Kerja Aplikasi

---

### 1️⃣ Manajemen RT

**Fitur:**

- Input data RT baru (RT 01, RT 02, dst.)
- Edit/hapus data RT
- Validasi duplikasi RT

**Data yang disimpan:**

- Nomor RT
- Nama Ketua RT
- Jumlah KK
- Alamat
- Kontak (opsional)

**Storage**: IndexedDB lokal

---

### 2️⃣ Setoran Sampah

**Proses:**

1. RT datang membawa sampah plastik
2. Pengelola memilih RT dari dropdown
3. Input data setoran:
   - Tanggal (default: hari ini)
   - Jenis sampah (plastik, kertas, logam, dll.)
   - Berat sampah (kg)
   - Harga per kg (dapat disesuaikan)
4. Aplikasi otomatis menghitung total nilai
5. Saldo tabungan RT bertambah otomatis

**Validasi:**

- Berat harus > 0
- Harga per kg harus valid
- RT harus terdaftar

**Storage**: IndexedDB dengan sinkronisasi offline

---

### 3️⃣ Manajemen Tabungan & Riwayat

**Dashboard Tabungan:**

- Daftar semua RT dengan saldo masing-masing
- Total tabungan keseluruhan RW
- Statistik bulanan

**Riwayat Transaksi:**

- Filter berdasarkan:
  - RT tertentu
  - Rentang tanggal
  - Jenis transaksi (setoran/penarikan)
- Export data ke CSV/Excel
- Pencarian berdasarkan kata kunci

**Fitur Tambahan:**

- Grafik trend setoran
- Ranking RT terbanyak
- Target tabungan bulanan

---

### 4️⃣ Penarikan Tabungan

**Proses:**

1. Pilih RT yang ingin melakukan penarikan
2. Cek saldo tersedia
3. Input jumlah penarikan
4. Validasi (tidak boleh melebihi saldo)
5. Konfirmasi penarikan
6. Cetak bukti penarikan (opsional)

**Validasi:**

- Saldo mencukupi
- Jumlah penarikan > 0
- RT memiliki tabungan

**Fitur Keamanan:**

- Konfirmasi PIN/password untuk penarikan besar
- Log audit semua penarikan

---

### 5️⃣ Laporan & Analitik

**Laporan Harian:**

- Total setoran hari ini
- Jumlah RT yang menyetor
- Rekapitulasi per jenis sampah

**Laporan Bulanan:**

- Grafik trend setoran
- Perbandingan bulan sebelumnya
- Target vs realisasi
- Ranking RT

**Export Options:**

- PDF untuk laporan formal
- Excel untuk analisis data
- Share via WhatsApp/Email

---

## 🔧 Fitur Teknis PWA

### Offline Capability

- **Service Worker**: Cache aplikasi dan data
- **Background Sync**: Sinkronisasi data saat online kembali
- **IndexedDB**: Penyimpanan data lokal
- **Offline Indicator**: Notifikasi status koneksi

### Mobile-First Design

- **Responsive Layout**: Optimized untuk layar 375px+
- **Touch-Friendly**: Button minimal 44px
- **Fast Loading**: Lazy loading dan code splitting
- **Gesture Support**: Swipe to refresh, pull to update

### PWA Features

- **Install Prompt**: Dapat diinstall seperti aplikasi native
- **Push Notifications**: Notifikasi pengingat
- **App Shortcuts**: Quick actions dari home screen
- **Splash Screen**: Loading screen yang branded

---

## 📱 Antarmuka Pengguna (UI/UX)

### Halaman Utama (Dashboard)

- **Header**: Logo Bank Sampah RW 10, notifikasi
- **Cards**: Total tabungan, setoran hari ini, jumlah RT aktif
- **Quick Actions**: Setoran baru, penarikan, laporan
- **Bottom Navigation**: Dashboard, Transaksi, RT, Laporan, Pengaturan

### Halaman Setoran

- **Form Responsif**: Input touch-friendly
- **Auto-complete**: Nama RT dengan pencarian cepat
- **Calculator**: Kalkulator berat dan harga
- **Camera**: Foto bukti setoran (opsional)
- **Confirmation**: Review sebelum submit

### Halaman Riwayat

- **List View**: Timeline transaksi dengan infinite scroll
- **Filter UI**: Dropdown dan date picker
- **Search Bar**: Pencarian real-time
- **Swipe Actions**: Edit/delete dengan gesture

---

## 🔒 Keamanan & Validasi

### Autentikasi

- **PIN Login**: 4-6 digit PIN untuk akses cepat
- **Session Management**: Auto-logout setelah tidak aktif
- **Device Binding**: Keamanan per device

### Data Validation

- **Input Sanitization**: Validasi semua input user
- **Data Integrity**: Checksum untuk data critical
- **Backup Local**: Auto backup harian ke local storage

### Privacy

- **Data Encryption**: Encrypt data sensitif di IndexedDB
- **Audit Log**: Track semua perubahan data
- **Data Retention**: Policy penghapusan data lama

---

## 📊 Database Schema (IndexedDB)

### Tabel RT

```javascript
{
  id: number,
  nomorRT: string,
  namaKetua: string,
  jumlahKK: number,
  alamat: string,
  kontak: string,
  saldo: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Tabel Transaksi

```javascript
{
  id: number,
  rtId: number,
  jenis: 'setoran' | 'penarikan',
  jenisSeampah: string,
  berat: number,
  hargaPerKg: number,
  totalNilai: number,
  tanggal: Date,
  keterangan: string,
  fotoUrl: string,
  createdBy: string,
  syncStatus: 'pending' | 'synced'
}
```

### Tabel Pengaturan

```javascript
{
  key: string,
  value: any,
  updatedAt: Date
}
```

---

## 🚀 Roadmap Pengembangan

### Phase 1 - MVP (Minggu 1-2)

- [x] Setup React + Vite + PWA
- [x] Basic UI components
- [x] CRUD RT dan Setoran
- [x] IndexedDB integration
- [x] Offline functionality

### Phase 2 - Core Features (Minggu 3-4)

- [ ] Dashboard dengan statistik
- [ ] Laporan dan export
- [ ] Riwayat transaksi dengan filter
- [ ] PWA optimization

### Phase 3 - Enhancement (Minggu 5-6)

- [ ] Push notifications
- [ ] Camera integration
- [ ] Advanced analytics
- [ ] Performance optimization

### Phase 4 - Production (Minggu 7-8)

- [ ] Testing dan debugging
- [ ] User training
- [ ] Deployment
- [ ] Monitoring dan maintenance

---

## 📋 Requirement Testing

### Functional Testing

- [ ] CRUD operations untuk RT
- [ ] Proses setoran sampah
- [ ] Kalkulasi saldo otomatis
- [ ] Penarikan dengan validasi
- [ ] Export laporan

### PWA Testing

- [ ] Install prompt
- [ ] Offline functionality
- [ ] Service worker caching
- [ ] Background sync
- [ ] Performance metrics

### Mobile Testing

- [ ] Responsive design (320px - 768px)
- [ ] Touch interactions
- [ ] Loading performance
- [ ] Memory usage
- [ ] Battery optimization

---

## 🎯 Success Metrics

### User Experience

- **Load Time**: < 3 detik first paint
- **Offline Access**: 100% fitur core tersedia offline
- **User Adoption**: 80% pengelola menggunakan dalam 1 bulan

### Technical Performance

- **Lighthouse Score**: > 90 untuk semua kategori
- **Data Sync**: < 5 detik saat kembali online
- **Storage Usage**: < 50MB untuk 1 tahun data

### Business Impact

- **Efisiensi**: Pengurangan 50% waktu pencatatan manual
- **Akurasi**: 99% akurasi data tanpa human error
- **Transparansi**: Real-time tracking untuk semua RT

# 🏦 Bank Sampah RW 10 - Dokumentasi Lengkap

## 📋 Deskripsi Proyek

Aplikasi web Progressive Web App (PWA) untuk pengelolaan bank sampah di RW 10 Desa Cidatar. Aplikasi ini dirancang mobile-first dengan kemampuan offline dan penyimpanan data lokal menggunakan localStorage.

## 🛠️ Teknologi Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Framework**: Tailwind CSS + Radix UI Components
- **State Management**: React Hooks (useState, useEffect)
- **Data Persistence**: localStorage dengan custom hooks
- **Package Manager**: npm
- **Development**: ESLint + TypeScript configs

## 🏗️ Arsitektur Application

### Struktur Folder

```
src/
├── components/           # Komponen React utama
│   ├── ui/              # UI components dari Radix
│   ├── Dashboard.tsx    # Dashboard utama dengan statistik
│   ├── Layout.tsx       # Layout wrapper aplikasi
│   ├── Navigation.tsx   # Komponen navigasi
│   ├── Reports.tsx      # Laporan dan analytics
│   ├── RTManagement.tsx # Manajemen data RT
│   ├── Savings.tsx      # Manajemen tabungan
│   ├── Settings.tsx     # Pengaturan aplikasi
│   └── WasteDeposit.tsx # Form setoran sampah
├── hooks/               # Custom React hooks
│   ├── useBankSampahData.ts # Hook utama data management
│   ├── useDatabase.mock.ts  # Mock database initialization
│   └── use-mobile.tsx   # Hook untuk mobile detection
├── lib/                 # Utility functions
│   └── utils.ts         # Utility functions (cn classname merger)
└── pages/               # Page components
    ├── Index.tsx        # Halaman utama
    └── NotFound.tsx     # 404 page
```

## 💾 Sistem Data Management

### useBankSampahData Hook

Hook utama yang mengelola semua data aplikasi dengan localStorage:

**Data Structure:**

```typescript
interface RT {
  id: string;
  name: string;
  leader: string;
  households: number;
  address: string;
  balance: number;
}

interface Transaction {
  id: string;
  rtId: string;
  rtName: string;
  type: "deposit" | "withdrawal";
  weight: number;
  amount: number;
  date: string;
  description?: string;
}
```

**Key Functions:**

- `addRT()` - Tambah RT baru
- `updateRT()` - Update data RT
- `deleteRT()` - Hapus RT
- `addTransaction()` - Tambah transaksi setoran
- `addWithdrawal()` - Tambah penarikan
- `getStatistics()` - Hitung statistik real-time

### Data Persistence

- **Storage**: localStorage browser
- **Key**: `bankSampahData`
- **Auto-save**: Setiap perubahan data otomatis tersimpan
- **Data Recovery**: Data bertahan setelah browser restart

## 🔄 Fitur Utama

### 1. Dashboard

- **Real-time Statistics**: Total RT, saldo, transaksi hari ini
- **Recent Transactions**: 5 transaksi terakhir
- **RT Overview**: Daftar RT dengan saldo masing-masing
- **Quick Actions**: Akses cepat ke fitur utama

### 2. Manajemen RT

- **CRUD Operations**: Create, Read, Update, Delete RT
- **Data Validation**: Validasi nama RT unik
- **Auto-numbering**: Otomatis generate ID RT
- **Balance Tracking**: Lacak saldo setiap RT

### 3. Setoran Sampah

- **Weight Input**: Input berat sampah (kg)
- **Auto Calculation**: Hitung nilai otomatis (Rp 2,000/kg)
- **RT Selection**: Pilih RT pengirim
- **Balance Update**: Update saldo RT otomatis
- **Transaction Log**: Simpan riwayat setoran

### 4. Tabungan & Penarikan

- **Balance Display**: Tampil saldo setiap RT
- **Withdrawal Form**: Form penarikan dengan validasi
- **Balance Validation**: Cek saldo mencukupi
- **Transaction History**: Riwayat penarikan

### 5. Laporan

- **Transaction Summary**: Ringkasan transaksi
- **RT Performance**: Performa setoran per RT
- **Date Filtering**: Filter berdasarkan tanggal
- **Export Data**: Export ke format yang bisa dibaca

### 6. Settings

- **App Configuration**: Pengaturan aplikasi
- **Data Management**: Backup/restore data
- **System Information**: Info versi dan status

## 🚀 Cara Menjalankan

### Prerequisites

- Node.js 18+
- npm atau yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd rw-tabungan-hijau

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup

Aplikasi tidak memerlukan environment variables khusus karena menggunakan localStorage.

## 🧪 Development & Testing

### Code Quality

- **TypeScript**: Strict type checking
- **ESLint**: Code linting dengan rules modern
- **Prettier**: Code formatting (opsional)

### Build Process

- **Vite**: Fast development dan optimized production build
- **Hot Reload**: Perubahan code langsung terlihat
- **Tree Shaking**: Bundle size optimization

### Debugging

- **React DevTools**: Debug component state
- **Browser DevTools**: Inspect localStorage data
- **Console Logging**: Debug data flow

## 📱 PWA Features

### Responsive Design

- **Mobile First**: Optimized untuk mobile
- **Tablet Support**: Layout responsif tablet
- **Desktop Compatible**: Berfungsi di desktop

### Offline Capability

- **localStorage**: Data tersimpan lokal
- **No Server Dependency**: Tidak perlu koneksi internet
- **Instant Loading**: Data load langsung dari browser

## 🔧 Maintenance & Troubleshooting

### Common Issues

1. **Data Loss**

   - **Cause**: Browser cache cleared
   - **Solution**: Implementasi backup/restore feature

2. **Performance Issues**

   - **Cause**: Large data di localStorage
   - **Solution**: Data cleanup/pagination

3. **Build Errors**
   - **Cause**: TypeScript errors atau missing dependencies
   - **Solution**: Check konsol dan fix errors

### Data Backup

```javascript
// Export data
const data = localStorage.getItem("bankSampahData");
console.log(data); // Copy dan simpan

// Import data
localStorage.setItem("bankSampahData", "paste-data-here");
```

### Performance Optimization

- Regular data cleanup untuk menghapus transaksi lama
- Implementasi pagination untuk data besar
- Lazy loading untuk komponen berat

## 📈 Statistik & Analytics

### Real-time Metrics

- Total RT aktif
- Total saldo sistem
- Transaksi hari ini (setoran + penarikan)
- Average setoran per RT

### Historical Data

- Trend setoran bulanan
- Top performing RT
- Transaction volume analysis

## 🔐 Data Security

### Client-side Security

- **localStorage Encryption**: Bisa implementasi enkripsi data
- **Input Validation**: Validasi semua input user
- **XSS Protection**: React built-in XSS protection

### Best Practices

- Regular data backup
- Input sanitization
- Error boundary implementation

## 🚀 Future Enhancements

### Planned Features

1. **Export to Excel**: Export laporan ke Excel
2. **Print Reports**: Print-friendly laporan
3. **Data Sync**: Sync data antar device
4. **Push Notifications**: Reminder setoran
5. **Advanced Analytics**: Chart dan graph

### Technical Improvements

1. **Database Migration**: Upgrade ke IndexedDB
2. **PWA Optimization**: Service worker implementation
3. **Performance**: Virtual scrolling untuk data besar
4. **Testing**: Unit dan integration tests

## 📞 Support & Contact

### Development Team

- **Project**: Bank Sampah RW 10 Desa Cidatar
- **Tech Stack**: React + TypeScript + Vite
- **Version**: 1.0.0

### Resources

- **Repository**: GitHub repository link
- **Documentation**: File dokumentasi ini
- **Issue Tracking**: GitHub Issues

---

_Dokumentasi ini mencakup semua aspek teknis dan fungsional aplikasi Bank Sampah RW 10. Update secara berkala sesuai perkembangan fitur._

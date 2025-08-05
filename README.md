# 🏦 Bank Sampah RW 10 - Aplikasi PWA

## 🌟 Overview

Aplikasi Progressive Web App (PWA) untuk pengelolaan Bank Sampah RW 10 Desa Cidatar. Dibangun dengan React TypeScript dan dirancang mobile-first dengan kemampuan offline penuh, mendukung penyimpanan data lokal dan sinkronisasi dengan Supabase.

## ✨ Fitur Utama

- 📱 **Progressive Web App** - Dapat diinstall di mobile dan desktop
- 🔄 **Offline First** - Berfungsi tanpa koneksi internet
- 💾 **Dual Storage** - localStorage untuk offline, Supabase untuk sync
- 📊 **Dashboard Real-time** - Statistik dan laporan lengkap
- 🏠 **Manajemen RT** - CRUD data RT dengan validasi
- ♻️ **Setoran Sampah** - Input setoran dengan kalkulasi otomatis
- 💰 **Tabungan** - Manajemen saldo dan penarikan
- 📈 **Laporan** - Analytics dan export data
- 🔄 **Auto Sync** - Sinkronisasi otomatis saat online

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4.1
- **UI Framework**: Tailwind CSS + Radix UI
- **Database**: Supabase + Dexie (IndexedDB)
- **PWA**: Workbox + Vite PWA Plugin
- **State Management**: TanStack Query + React Hooks
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd KKN-banksampah

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local dengan Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Struktur Proyek

```
src/
├── components/           # React components
│   ├── ui/              # Radix UI components
│   ├── Dashboard.tsx    # Dashboard dengan statistik
│   ├── Navigation.tsx   # Navigasi aplikasi
│   ├── Reports.tsx      # Laporan dan analytics
│   ├── RTManagement.tsx # Manajemen data RT
│   ├── Savings.tsx      # Manajemen tabungan
│   ├── Settings.tsx     # Pengaturan aplikasi
│   ├── SyncStatus.tsx   # Status sinkronisasi
│   └── WasteDepositClean.tsx # Form setoran sampah
├── hooks/               # Custom hooks
│   ├── useOfflineSupabaseData.ts # Data management
│   ├── useOfflineSync.ts # Sinkronisasi offline
│   └── useSettings.ts   # Settings management
├── lib/                 # Utilities
│   ├── localDatabase.ts # Dexie database setup
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Helper functions
├── utils/               # Business logic
│   ├── migrateToSupabase.ts # Migrasi data
│   ├── offlineDataManager.ts # Offline data
│   └── setupSupabase.ts # Setup database
└── pages/               # Page components
    ├── Index.tsx        # Landing page
    └── NotFound.tsx     # 404 page
```

## 💾 Data Management

### Database Schema
```typescript
interface RT {
  id: string;
  name: string;
  leader: string;
  households: number;
  address: string;
  balance: number;
  created_at?: string;
  updated_at?: string;
}

interface Transaction {
  id: string;
  rt_id: string;
  rt_name: string;
  type: 'deposit' | 'withdrawal';
  weight?: number;
  amount: number;
  date: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
```

### Storage Strategy
- **Online**: Data disimpan di Supabase PostgreSQL
- **Offline**: Data disimpan di IndexedDB menggunakan Dexie
- **Sync**: Otomatis sinkronisasi saat kembali online
- **Conflict Resolution**: Last-write-wins dengan timestamp

## 🔄 Offline Functionality

### Features
- ✅ Baca data saat offline
- ✅ Tambah/edit data saat offline
- ✅ Queue untuk sync otomatis
- ✅ Notifikasi status koneksi
- ✅ Backup/restore data

### Sync Strategy
1. Deteksi perubahan koneksi
2. Queue operasi saat offline
3. Bulk sync saat kembali online
4. Handle konflik dengan timestamp
5. Notifikasi hasil sync

## 📱 PWA Features

### Installation
- Prompt install otomatis
- Icon dan splash screen custom
- Standalone mode
- Push notifications ready

### Offline Support
- Service Worker dengan Workbox
- Cache strategy untuk assets
- Background sync
- Offline page fallback

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Tablet dan desktop support
- Touch-friendly interface
- Dark/light mode support

### Accessibility
- Keyboard navigation
- Screen reader support
- High contrast mode
- ARIA labels

## 📊 Analytics & Reports

### Dashboard Metrics
- Total RT aktif
- Saldo keseluruhan
- Transaksi hari ini
- Top performing RT

### Report Features
- Filter berdasarkan tanggal
- Export data ke JSON
- Print-friendly format
- Real-time updates

## 🔧 Scripts Available

```bash
# Development
npm run dev              # Start dev server
npm run type-check       # TypeScript check
npm run lint             # ESLint check

# Build
npm run build            # Production build
npm run build:dev        # Development build
npm run build:pwa        # Build with PWA icons
npm run preview          # Preview build

# PWA
npm run generate-icons   # Generate PWA icons
```

## 🧪 Testing & Quality

### Code Quality
- TypeScript strict mode
- ESLint dengan rules modern
- Prettier code formatting
- Husky pre-commit hooks

### Testing Strategy
- Unit tests dengan Vitest
- Component tests dengan Testing Library
- E2E tests dengan Playwright
- Manual testing checklist

## 🔐 Security

### Client-side Security
- Input validation dengan Zod
- XSS protection built-in React
- CSRF protection via Supabase
- RLS (Row Level Security)

### Data Privacy
- Local data encryption option
- GDPR compliance ready
- Data export/delete features
- Audit trail logging

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Check build size
npm run preview

# Deploy to hosting
# (Vercel, Netlify, etc.)
```

### Environment Setup
- Development: Local dengan mock data
- Staging: Supabase staging
- Production: Supabase production

## 📈 Performance

### Optimization
- Code splitting dengan Vite
- Tree shaking otomatis
- Image optimization
- Bundle analyzer
- Lazy loading components

### Monitoring
- Core Web Vitals tracking
- Error boundary implementation
- Performance metrics
- User analytics

## 🔄 Migration Guide

### Dari localStorage ke Supabase
```bash
# Jalankan migrasi otomatis
# Data localStorage akan dipindah ke Supabase
# Backup otomatis dibuat
```

### Update Dependencies
```bash
npm update
npm audit fix
```

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Standards
- TypeScript strict mode
- Functional components
- Custom hooks untuk logic
- Consistent naming
- Comment untuk complex logic

## 📞 Support

### Common Issues
1. **PWA Install**: Clear browser cache
2. **Sync Errors**: Check network connection
3. **Data Loss**: Use backup/restore feature
4. **Performance**: Clear IndexedDB data

### Resources
- 📚 [User Guide](docs/user-guide.md)
- 🛠️ [Developer Guide](docs/developer-guide.md)
- 🐛 [Issue Tracker](https://github.com/mohyasrul/KKN-banksampah/issues)
- 💬 [Discussions](https://github.com/mohyasrul/KKN-banksampah/discussions)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Team

**KKN Bank Sampah Team**
- Project Management: KKN Team
- Development: React TypeScript Stack
- Design: Mobile-first PWA

---

*Aplikasi Bank Sampah RW 10 - Membantu pengelolaan sampah berkelanjutan di tingkat RT/RW dengan teknologi modern.*

**Version**: 1.0.0  
**Last Updated**: August 2025

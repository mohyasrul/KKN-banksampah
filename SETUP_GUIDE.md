# 🔧 Setup Development Guide

## 🚀 Quick Start (Demo Mode)

Aplikasi akan langsung berjalan dalam demo mode tanpa setup tambahan:

```bash
npm install
npm run dev
```

Buka browser: http://localhost:8080/

## 🌟 Full Setup (dengan Supabase)

### 1. Setup Environment Variables

```bash
# Copy template env file
cp .env.local.template .env.local

# Edit .env.local dengan kredensial Supabase Anda
nano .env.local
```

### 2. Setup Supabase Project

1. **Buat Supabase Project:**
   - Kunjungi https://supabase.com/
   - Login/Register
   - Create New Project

2. **Get Credentials:**
   - Pergi ke Settings > API
   - Copy `URL` dan `anon` key
   - Paste ke `.env.local`

3. **Setup Database Schema:**
   ```sql
   -- Run di Supabase SQL Editor atau gunakan file supabase-schema.sql
   ```

### 3. Restart Development Server

```bash
npm run dev
```

## 🎯 Features Overview

### ✅ Yang Sudah Diimplementasi

- **Offline-First Storage** - IndexedDB dengan Dexie
- **Auto-Sync** - Sinkronisasi otomatis saat online
- **Real-time Status** - Indikator online/offline
- **Demo Mode** - Berjalan tanpa setup Supabase
- **PWA Ready** - Progressive Web App dengan caching

### 🔧 Testing Offline Mode

1. Buka aplikasi di browser
2. Buka DevTools > Network tab
3. Set network ke "Offline"
4. Input data RT/transaksi
5. Set network ke "Online"
6. Lihat auto-sync bekerja!

## 📱 Browser Support

- ✅ Chrome/Chromium (Recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ✅ **Brave** (sudah ditest)

## 🐛 Troubleshooting

### Blank White Screen
```bash
# Check console untuk error JavaScript
# Biasanya karena:
# 1. Environment variables tidak di-set (solved dengan demo mode)
# 2. JavaScript error - cek browser console
# 3. Network blocking - disable ad/script blockers
```

### Brave Browser Issues
```bash
# Brave memblok beberapa scripts secara default
# Solution:
# 1. Disable Brave Shields untuk localhost
# 2. Allow all scripts and connections
# 3. Refresh aplikasi
```

### Data Tidak Tersimpan
```bash
# Demo mode: data hanya di IndexedDB lokal
# Full mode: pastikan Supabase credentials benar
# Cek browser console untuk error messages
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── localDatabase.ts      # IndexedDB management
│   └── supabase.ts          # Supabase client
├── utils/
│   └── offlineDataManager.ts # Offline-first logic
├── hooks/
│   ├── useOfflineSync.ts     # Sync status hooks
│   └── useOfflineSupabaseData.ts # Data operations
├── components/
│   ├── SyncStatus.tsx        # Status UI
│   └── OfflineDemo.tsx       # Demo interface
└── pages/
    └── OfflineDemo.tsx       # Demo page
```

## 🎉 Ready to Use!

Aplikasi sudah ready untuk development dan testing! 

- Demo mode untuk quick testing
- Full offline functionality 
- Auto-sync saat kembali online
- PWA ready untuk mobile testing

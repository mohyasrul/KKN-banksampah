#!/bin/bash

# Script untuk mengganti semua import useBankSampahData ke useSupabaseData

echo "Mengganti imports di komponen..."

# Ganti import di RTManagement.tsx
sed -i 's/useBankSampahData/useSupabaseData/g' src/components/RTManagement.tsx
sed -i 's/\.ketuaRT/\.ketua_rt/g' src/components/RTManagement.tsx  
sed -i 's/\.jumlahKK/\.jumlah_kk/g' src/components/RTManagement.tsx
sed -i 's/\.totalTransaksi/\.total_transaksi/g' src/components/RTManagement.tsx

# Ganti import di WasteDepositClean.tsx
sed -i 's/useBankSampahData/useSupabaseData/g' src/components/WasteDepositClean.tsx

# Ganti import di Savings.tsx
sed -i 's/useBankSampahData/useSupabaseData/g' src/components/Savings.tsx

# Ganti import di Reports.tsx
sed -i 's/useBankSampahData/useSupabaseData/g' src/components/Reports.tsx

echo "Selesai mengganti imports!"

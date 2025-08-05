# 📋 Standard Operating Procedure (SOP) - Bank Sampah RW 10

## 🎯 Tujuan Dokumen
Dokumen ini mengatur prosedur standar penggunaan aplikasi Bank Sampah RW 10 untuk memastikan konsistensi, akurasi, dan akuntabilitas dalam pengelolaan tabungan sampah.

---

## 👥 Stakeholder dan Peran

### 1. Pengelola Admin
**Responsibilities**:
- Setup dan konfigurasi aplikasi
- Manajemen data RT
- Backup dan maintenance data
- Generate laporan untuk RW
- User management dan security

### 2. Pengelola Operator  
**Responsibilities**:
- Input transaksi setoran harian
- Proses penarikan tabungan RT
- Update data RT (dengan approval)
- Monitoring saldo RT
- Basic reporting

### 3. Ketua RT
**Role**: External user (tidak akses aplikasi)
- Menyetor sampah warga ke pengelola
- Request penarikan tabungan
- Menerima laporan saldo

---

## 🔄 Workflow Utama

### A. Proses Setoran Sampah

#### 1. Persiapan
- [x] Timbang sampah dari RT
- [x] Catat berat dalam satuan kg
- [x] Siapkan aplikasi di device

#### 2. Input Setoran
**Steps**:
1. Login ke aplikasi
2. Buka menu "Setoran Sampah"
3. Pilih RT yang menyetor
4. Input berat sampah (kg)
5. Sistem otomatis kalkulasi: berat × Rp 2,000/kg
6. Konfirmasi data sebelum simpan
7. Klik "Simpan Setoran"
8. Cetak/catat bukti untuk RT

**Validation Rules**:
- Berat harus > 0 kg
- RT harus terdaftar di sistem  
- Maksimal setoran 1000 kg per transaksi
- Tanggal tidak boleh future date

#### 3. Konfirmasi
- Sistem update saldo RT otomatis
- Generate transaction ID
- Saldo RT bertambah sesuai kalkulasi
- Notification sukses ditampilkan

### B. Proses Penarikan Tabungan

#### 1. Validasi Request
**Prerequisites**:
- RT mengajukan penarikan ke pengelola
- Saldo RT >= batas minimum (Rp 50,000)
- Amount penarikan <= saldo tersedia

#### 2. Proses Penarikan
**Steps**:
1. Login ke aplikasi
2. Buka menu "Tabungan"
3. Pilih RT yang akan menarik
4. Input jumlah penarikan
5. Sistem kalkulasi otomatis:
   - Jumlah penarikan: Rp X
   - Pajak 10%: Rp X × 0.1
   - Yang diterima RT: Rp X - pajak
6. Konfirmasi calculation
7. Klik "Proses Penarikan"
8. Print bukti penarikan

**Business Rules**:
- Minimum penarikan: Rp 50,000
- Pajak 10% dari jumlah penarikan
- Saldo harus mencukupi (amount + pajak)
- Maksimal penarikan 90% dari saldo

#### 3. Post-Processing
- Update saldo RT (kurangi amount)
- Catat pajak ke akun pajak
- Generate receipt untuk RT
- Update dashboard statistics

---

## 📊 Prosedur Pelaporan

### 1. Laporan Harian
**Frequency**: Setiap hari kerja  
**Content**:
- Summary transaksi hari ini
- Total setoran per RT
- Total penarikan dan pajak
- Saldo akhir semua RT

**Steps**:
1. Buka menu "Reports"
2. Pilih "Laporan Harian"
3. Set tanggal (default: hari ini)
4. Generate report
5. Review accuracy
6. Print/save as PDF
7. Archive di folder reports

### 2. Laporan Bulanan
**Frequency**: Setiap akhir bulan  
**Content**:
- Ringkasan per RT (setoran, penarikan, saldo)
- Total pajak terkumpul
- Performance analysis per RT
- Growth trend

**Steps**:
1. Tutup buku akhir bulan
2. Generate laporan bulanan
3. Review dengan pengelola kedua
4. Submit ke ketua RW
5. Archive laporan
6. Backup data bulan tersebut

### 3. Laporan Ad-hoc
**Trigger**: Request khusus dari RW/RT  
**Process**:
1. Tentukan periode dan filter
2. Generate custom report
3. Review dan validasi
4. Deliver sesuai request

---

## 💾 Prosedur Backup dan Recovery

### 1. Backup Rutin
**Daily Backup**:
- Automatic backup setiap jam 23:00
- Backup ke cloud storage
- Retention: 30 hari
- Notification status backup

**Weekly Backup**:
- Manual backup setiap Jumat
- Export ke Excel format
- Simpan di local storage
- Cross-check dengan automatic backup

**Monthly Backup**:
- Full database export
- Burn to CD/DVD (optional)
- Store di safe location
- Document backup log

### 2. Data Recovery
**Scenario 1: Data Corruption**
1. Stop aplikasi immediately
2. Assess corruption level
3. Restore dari backup terakhir
4. Verify data integrity
5. Resume operations
6. Document incident

**Scenario 2: Hardware Failure**
1. Setup aplikasi di device baru
2. Restore dari cloud backup
3. Test all functionalities
4. Verify recent transactions
5. Inform all users
6. Monitor stability

---

## 🔐 Security Procedures

### 1. Access Control
**Login Security**:
- Password minimal 8 karakter
- Kombinasi huruf, angka, simbol
- Session timeout: 4 jam inaktif
- Lock screen saat tidak digunakan

**Role Management**:
- Admin: Full access semua fitur
- Operator: Restricted access
- Regular password update (monthly)
- Deactivate unused accounts

### 2. Data Protection
**Sensitive Data**:
- Encrypt backup files
- Secure password storage
- Limited USB/external access
- Clean browsing history

**Transaction Security**:
- Double confirmation untuk amount >Rp 500k
- Audit trail semua actions
- IP logging (jika applicable)
- Regular security review

---

## ⚠️ Error Handling dan Troubleshooting

### 1. Common Issues

**Issue: Aplikasi tidak bisa diakses**
- Solution 1: Check internet connection
- Solution 2: Clear browser cache
- Solution 3: Restart browser/device
- Escalation: Contact technical support

**Issue: Data tidak tersimpan**
- Solution 1: Check form validation
- Solution 2: Try submit ulang
- Solution 3: Refresh aplikasi
- Escalation: Manual backup data entry

**Issue: Saldo tidak sesuai**
- Solution 1: Cross-check transaksi terakhir
- Solution 2: Rekalkulasi manual
- Solution 3: Check audit trail
- Escalation: Data investigation

### 2. Escalation Matrix

**Level 1**: Self-troubleshooting (5 menit)
**Level 2**: Konsultasi dengan pengelola lain (15 menit)  
**Level 3**: Contact technical support (1 jam)
**Level 4**: Emergency manual procedures (immediate)

---

## 📞 Emergency Procedures

### 1. System Down
**Immediate Actions**:
1. Switch ke manual recording
2. Catat semua transaksi di paper
3. Inform semua RT tentang kondisi
4. Contact technical support
5. Set estimated recovery time

**Manual Backup Process**:
- Use prepared paper forms
- Record: Tanggal, RT, Jenis, Amount, Pengelola
- Double signature untuk validation
- Input ke sistem setelah recovery

### 2. Data Loss Emergency
**Critical Steps**:
1. Stop all operations immediately
2. Assess data loss scope
3. Identify last valid backup
4. Contact technical support emergency
5. Execute recovery plan
6. Validate restored data
7. Resume operations dengan monitoring extra

---

## 📋 Quality Control Checklist

### Daily Operations Checklist
- [ ] Login berhasil dengan user yang tepat
- [ ] Dashboard menampilkan data terkini
- [ ] Semua transaksi terinput dengan benar
- [ ] Saldo RT konsisten dengan perhitungan manual
- [ ] Backup automatic berjalan
- [ ] Tidak ada error notification

### Weekly Review Checklist  
- [ ] Reconciliation manual vs sistem
- [ ] Review audit trail aktivitas
- [ ] Check backup integrity
- [ ] Validate laporan dengan data mentah
- [ ] Security review (password, access)
- [ ] Performance check aplikasi

### Monthly Audit Checklist
- [ ] Full data validation
- [ ] Cross-check dengan dokumen fisik
- [ ] Review user access dan permissions
- [ ] Archive laporan bulan sebelum
- [ ] Update configuration jika perlu
- [ ] Training refresh untuk user

---

## 📈 Performance Metrics

### Operational Metrics
- **Transaction Accuracy**: Target 99.9%
- **Data Entry Time**: < 2 menit per transaksi
- **Report Generation**: < 30 detik
- **System Uptime**: > 99%
- **Backup Success Rate**: 100%

### Business Metrics  
- **Daily Transaction Volume**: Track trend
- **Average RT Balance**: Monitor growth
- **Tax Collection**: Track compliance
- **RT Participation**: Monitor engagement
- **Error Rate**: < 0.1% transactions

---

## 🔄 Continuous Improvement

### Monthly Review Process
1. Collect user feedback
2. Analyze performance metrics
3. Identify improvement opportunities
4. Plan enhancements
5. Implement changes
6. Monitor results

### Annual Assessment
- Full system audit
- User satisfaction survey
- Process optimization review
- Technology upgrade planning
- Training needs assessment

---

**Document Version**: 1.0  
**Last Updated**: August 2025  
**Next Review**: September 2025  
**Approved By**: Ketua RW 10

# 🚀 Panduan Deploy ke Vercel

Website Anda siap untuk di-deploy ke Vercel agar bisa diakses dari mana saja!

---

## 📋 PERSIAPAN (Sudah Selesai ✅)

File-file berikut sudah saya buat:
- ✅ `vercel.json` - Konfigurasi Vercel
- ✅ `.vercelignore` - File yang diabaikan saat deploy
- ✅ Semua file website sudah siap

---

## 🌐 CARA DEPLOY (Pilih Salah Satu)

### **OPSI 1: Deploy via Website Vercel (PALING MUDAH!)**

#### STEP 1: Buat Akun Vercel
1. Buka: https://vercel.com/signup
2. Klik **"Continue with GitHub"** (atau Email)
3. Login dengan GitHub atau buat akun baru

#### STEP 2: Install Vercel CLI (Opsional untuk deploy via terminal)
Buka PowerShell dan jalankan:
```powershell
npm install -g vercel
```

Jika belum punya npm/Node.js:
1. Download: https://nodejs.org/
2. Install Node.js (pilih LTS version)
3. Restart PowerShell
4. Jalankan lagi: `npm install -g vercel`

#### STEP 3: Deploy via Terminal
1. Buka PowerShell di folder project
2. Jalankan:
```powershell
cd "c:\Users\USER\OneDrive\Documents\Website Pengelola Keuangan Mahasiswa"
vercel
```

3. Ikuti instruksi:
   - Login dengan akun Vercel
   - Confirm project settings (tekan Enter)
   - Deploy!

4. Setelah selesai, Anda akan dapat URL seperti:
   ```
   https://keuangan-mahasiswa.vercel.app
   ```

---

### **OPSI 2: Deploy via Dashboard Vercel (Tanpa Install Apapun)**

#### STEP 1: Upload ke GitHub (Jika belum)
1. Buka: https://github.com/new
2. Buat repository baru: `keuangan-mahasiswa`
3. Di PowerShell:
```powershell
cd "c:\Users\USER\OneDrive\Documents\Website Pengelola Keuangan Mahasiswa"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/keuangan-mahasiswa.git
git push -u origin main
```

#### STEP 2: Import di Vercel
1. Login ke: https://vercel.com/dashboard
2. Klik **"Add New..."** → **"Project"**
3. Pilih **"Import Git Repository"**
4. Pilih repository `keuangan-mahasiswa`
5. Klik **"Deploy"**
6. Tunggu 1-2 menit
7. Selesai! Website online di: `https://keuangan-mahasiswa.vercel.app`

---

### **OPSI 3: Drag & Drop (PALING CEPAT!)**

#### Cara Termudah - Tanpa Git, Tanpa CLI:

1. **Login ke Vercel**: https://vercel.com/login

2. **Klik "Add New..."** → **"Project"**

3. **Klik tab "Deploy"** (atau scroll ke bawah)

4. **Drag & Drop folder project** ke area upload
   - Folder: `Website Pengelola Keuangan Mahasiswa`
   - Atau zip folder terlebih dahulu

5. **Tunggu upload selesai**

6. **Klik "Deploy"**

7. **Selesai!** URL website: `https://[project-name].vercel.app`

---

## 🔧 SETELAH DEPLOY

### Update Website:
- **Via Terminal**: Jalankan `vercel --prod` di folder project
- **Via GitHub**: Push code baru, auto-deploy
- **Via Dashboard**: Upload folder baru

### Custom Domain (Opsional):
1. Di Vercel Dashboard → Project → Settings → Domains
2. Tambahkan domain Anda (misal: keuanganku.com)
3. Ikuti instruksi DNS

---

## 📱 AKSES DARI HP

Setelah deploy, website bisa diakses dari mana saja:
- ✅ Dari HP (tanpa koneksi WiFi yang sama)
- ✅ Dari komputer lain
- ✅ HTTPS secure
- ✅ Custom domain (jika mau)
- ✅ PWA - bisa diinstall di HP

**URL contoh:**
```
https://keuangan-mahasiswa.vercel.app
```

Buka di HP, install sebagai aplikasi:
- Android Chrome: Menu ⋮ → "Install app"
- iPhone Safari: Share → "Add to Home Screen"

---

## ⚡ KEUNTUNGAN DEPLOY KE VERCEL

1. **Gratis selamanya** untuk personal project
2. **HTTPS otomatis** (secure)
3. **Global CDN** (cepat di seluruh dunia)
4. **Auto-deploy** jika pakai GitHub
5. **Unlimited bandwidth** (gratis)
6. **99.99% uptime**
7. **Custom domain gratis**

---

## 🎯 LANGKAH CEPAT (Rekomendasi):

1. **Install Node.js**: https://nodejs.org/ (jika belum)
2. **Install Vercel CLI**:
   ```powershell
   npm install -g vercel
   ```
3. **Deploy**:
   ```powershell
   cd "c:\Users\USER\OneDrive\Documents\Website Pengelola Keuangan Mahasiswa"
   vercel login
   vercel --prod
   ```
4. **Selesai!** Copy URL yang diberikan

---

## 🆘 TROUBLESHOOTING

### "vercel: command not found"
- Install Node.js dulu
- Restart PowerShell setelah install
- Jalankan: `npm install -g vercel`

### Deploy gagal?
- Pastikan semua file ada
- Cek `vercel.json` sudah benar
- Coba deploy via dashboard (drag & drop)

### Firebase tidak berfungsi setelah deploy?
- Firebase config sudah benar (sudah ✅)
- Firestore Rules sudah di-set (sudah ✅)
- Semua akan berfungsi normal!

---

**Mau saya bantu install Node.js dan Vercel CLI, atau Anda mau pakai cara Drag & Drop?** 🚀

Beritahu saya cara mana yang Anda pilih!

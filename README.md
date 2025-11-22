# 💰 Smart Money Manager - Keuangan Mahasiswa

Aplikasi web untuk mengelola keuangan mahasiswa dengan fitur pencatatan pemasukan dan pengeluaran, visualisasi grafik, dan statistik bulanan.

## ✨ Fitur

- 🔐 **Autentikasi** - Register & Login dengan Firebase Authentication
- 💾 **Database Cloud** - Data tersimpan di Firebase Firestore
- 📊 **Dashboard** - Statistik pemasukan, pengeluaran, dan saldo
- 📈 **Grafik Bulanan** - Visualisasi data 6 bulan terakhir
- 📝 **Riwayat Transaksi** - List lengkap dengan icon kategori
- 📱 **Mobile-First Design** - Responsive untuk semua device
- 🚀 **PWA (Progressive Web App)** - Bisa diinstall seperti aplikasi native
- 🎨 **Modern UI/UX** - Gradient design dengan animasi smooth
- 🔔 **Toast Notifications** - Feedback realtime untuk setiap aksi
- 🌐 **Realtime Update** - Data langsung terupdate otomatis

## 🛠️ Teknologi

- **Frontend**: HTML, CSS (Tailwind), JavaScript (ES6 Modules)
- **Backend**: Firebase (Authentication + Firestore)
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)
- **PWA**: Service Worker + Manifest

## 🚀 Cara Menggunakan

### 1. Clone Repository
```bash
git clone https://github.com/USERNAME/keuangan-mahasiswa.git
cd keuangan-mahasiswa
```

### 2. Jalankan Lokal
```bash
python -m http.server 8000
```
Buka browser: `http://localhost:8000`

### 3. Deploy ke Vercel
```bash
npm install -g vercel
vercel --prod
```

## 📱 Install sebagai Aplikasi Mobile

### Android (Chrome):
1. Buka website di Chrome
2. Menu ⋮ → "Install app"
3. Tap "Install"

### iOS (Safari):
1. Buka website di Safari
2. Tap tombol Share
3. "Add to Home Screen"

## 🔧 Konfigurasi Firebase

File `firebase.js` sudah dikonfigurasi dengan Firebase project. Pastikan di Firebase Console:

1. **Firestore Rules** sudah diatur:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

2. **Authentication** → Email/Password sudah enabled

## 📂 Struktur Project

```
keuangan-mahasiswa/
├── index.html              # Halaman utama
├── app.js                  # Logic aplikasi
├── firebase.js             # Konfigurasi Firebase
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker untuk PWA
├── vercel.json            # Konfigurasi Vercel
├── firestore.rules        # Firestore security rules
├── icon-192.png           # Icon aplikasi 192x192
├── icon-512.png           # Icon aplikasi 512x512
└── README.md              # Dokumentasi
```

## 🎨 Fitur UI/UX

- **Gradient Background** - Purple to Indigo
- **Card Hover Effects** - Smooth transitions
- **Input Focus Animations** - Interactive forms
- **Mobile-Optimized** - Touch-friendly buttons
- **Responsive Grid** - Auto-adjust layout
- **Custom Scrollbar** - Smooth scrolling
- **Loading States** - Spinner saat proses
- **Empty States** - Friendly messages

## 🔒 Keamanan

- Firebase Authentication untuk user management
- Firestore Rules untuk data security
- HTTPS via Vercel deployment
- No sensitive data in client-side code

## 📊 Database Structure

```
firestore/
└── users/
    └── {userId}/
        └── transactions/
            └── {transactionId}
                ├── type: "income" | "expense"
                ├── amount: number
                ├── category: string
                ├── note: string
                └── date: timestamp
```

## 🌐 Live Demo

[Link akan tersedia setelah deploy]

## 📄 License

MIT License - Free to use for personal and commercial projects

## 👨‍💻 Developer

Dibuat dengan ❤️ untuk mahasiswa Indonesia

---

**⭐ Jika project ini membantu, jangan lupa kasih star!**

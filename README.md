# TouringApp - Aplikasi Komunikasi Grup Touring

TouringApp adalah aplikasi mini program Alipay yang dirancang untuk memudahkan komunikasi grup touring. Aplikasi ini memungkinkan pengguna untuk membuat grup, mengundang anggota, dan melakukan panggilan suara grup dengan mudah.

## Fitur Utama

- Pembuatan akun dan autentikasi pengguna
- Pembuatan dan manajemen grup
- Sistem undangan grup
- Panggilan suara grup menggunakan Agora SDK
- Antarmuka dalam Bahasa Indonesia

## Struktur Proyek

Proyek ini terdiri dari dua bagian utama:

1. **Backend** - Server API menggunakan Node.js, Express, dan MongoDB
2. **Mini Program** - Aplikasi mini program Alipay

### Struktur Backend

```
backend/
├── config/           # Konfigurasi aplikasi
│   ├── db.js         # Konfigurasi MongoDB
│   └── agora.js      # Konfigurasi Agora SDK
├── controllers/      # Controller untuk menangani logika bisnis
├── middleware/       # Middleware untuk autentikasi dan error handling
├── models/           # Model Mongoose untuk database
├── routes/           # Definisi rute API
├── .env              # File konfigurasi environment variables
├── package.json      # Dependensi dan skrip
└── server.js         # Entry point aplikasi
```

### Struktur Mini Program

```
mini-program/
├── pages/            # Halaman aplikasi
│   ├── index/        # Splash screen
│   ├── login/        # Halaman login
│   ├── register/     # Halaman pendaftaran
│   ├── groups/       # Daftar grup
│   ├── group-detail/ # Detail grup
│   ├── call/         # Halaman panggilan grup
│   └── profile/      # Profil pengguna
├── components/       # Komponen yang dapat digunakan kembali
├── utils/            # Utilitas dan helper
├── services/         # Layanan API
├── assets/           # Aset gambar dan ikon
└── app.js            # Entry point aplikasi
```

## Teknologi yang Digunakan

### Backend
- Node.js dengan Express sebagai framework
- MongoDB sebagai database
- JWT untuk autentikasi
- Socket.io untuk komunikasi real-time
- Agora SDK untuk layanan RTC (Real-Time Communication)

### Mini Program
- Alipay Mini Program Framework
- Agora SDK untuk panggilan suara grup

## Pengaturan dan Pengembangan

### Prasyarat
- Node.js (v14 atau lebih baru)
- MongoDB
- Akun Agora dengan App ID dan App Certificate
- Alipay Mini Program IDE

### Pengaturan Backend

1. Clone repositori:
   ```
   git clone https://github.com/ardhanaryatama21/TouringApp.git
   cd TouringApp/backend
   ```

2. Install dependensi:
   ```
   npm install
   ```

3. Buat file `.env` dengan konten berikut:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://ardhan123:<password>@touringapp.i2cczcn.mongodb.net/?retryWrites=true&w=majority&appName=TouringApp
   JWT_SECRET=touring_app_secret_key
   AGORA_APP_ID=8aaf8e4b769a4859910b338b25658ef1
   AGORA_APP_CERTIFICATE=2bb76799848f4da39fb85329a20f2920
   ```

   Ganti `<password>` dengan password MongoDB Anda.

4. Jalankan server:
   ```
   npm start
   ```

### Pengaturan Mini Program

1. Buka Alipay Mini Program IDE
2. Impor proyek dari direktori `mini-program`
3. Konfigurasi App ID di `mini.config.json`
4. Pastikan URL API di `app.js` sudah benar (sesuai dengan URL deployment backend)
5. Kompilasi dan jalankan aplikasi di simulator

## Deployment

### Backend

Backend dapat di-deploy ke berbagai platform hosting seperti:

1. **Render.com** (Direkomendasikan untuk tier gratis):
   - Buat akun di Render.com
   - Hubungkan dengan repositori GitHub
   - Pilih "Web Service" dan konfigurasikan dengan pengaturan berikut:
     - Build Command: `npm install`
     - Start Command: `node server.js`
     - Environment Variables: Tambahkan semua variabel dari file `.env`

2. **Heroku**:
   - Buat akun Heroku dan verifikasi (memerlukan kartu kredit untuk verifikasi)
   - Install Heroku CLI dan login
   - Tambahkan remote Heroku ke repositori Git
   - Push kode ke Heroku

### Mini Program

1. Selesaikan pengembangan di Alipay Mini Program IDE
2. Lakukan pengujian menyeluruh
3. Submit untuk review dan publikasi di Alipay Mini Program Store

## Kontributor

- Ardhan Aryatama (@ardhanaryatama21)

## Lisensi

Hak Cipta © 2025 Ardhan Aryatama. Semua hak dilindungi.

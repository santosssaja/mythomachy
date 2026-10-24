# Panduan Instalasi, Kompilasi & Deployment

Dokumen ini menyediakan panduan langkah demi langkah untuk menjalankan proyek **Mythomachy: Clash of Legends** di lingkungan lokal, mengompilasi smart contract dengan Solidity `0.8.24`, serta mendeploy kontrak ke jaringan **Monad Testnet (Chain ID 10143)**.

---

## 1. Prasyarat Sistem (Prerequisites)

Sebelum memulai, pastikan perangkat Anda telah terpasang:
* **Node.js:** Versi `18.x`, `20.x`, atau `22.x` (LTS direkomendasikan)
* **Paket Manajer:** `npm` (bawaan Node.js) atau `pnpm`
* **Git:** Untuk kloning repositori
* **Peramban Web:** Google Chrome, Brave, atau browser berbasis Chromium lainnya (dengan ekstensi MetaMask untuk pengujian mode self-custody)

---

## 2. Kloning & Instalasi Dependensi

```bash
# 1. Kloning repositori proyek
git clone https://github.com/santoso/Mythomachy.git
cd Mythomachy

# 2. Instal seluruh dependensi
npm install
```

---

## 3. Konfigurasi Lingkungan (`.env`)

Buat berkas `.env` di direktori utama proyek (opsional untuk pengembangan standar, diperlukan jika ingin mengaktifkan sponsor gas otomatis):

```ini
# Kunci privat dompet sponsor faucet untuk mendanai burner wallet pemain (+0.02 MON)
# PENTING: Jangan pernah membagikan atau mengunggah berkas .env ini ke repositori publik!
VITE_TESTNET_SPONSOR_KEY=0x...kunci_privat_sponsor_anda...
```

*Jika `VITE_TESTNET_SPONSOR_KEY` tidak diisi, game tetap dapat dimainkan 100% menggunakan Mode Simulasi Terverifikasi atau menggunakan dompet MetaMask pribadi.*

---

## 4. Menjalankan Server Pengembangan Lokal

```bash
npm run dev
```

Aplikasi akan otomatis menyala di:
* **Lokal:** `http://localhost:5173/` (atau `http://localhost:5174/` jika port 5173 sedang terpakai)
* **Jaringan:** Ditampilkan di terminal untuk pengujian melalui perangkat seluler dalam satu jaringan Wi-Fi.

---

## 5. Kompilasi Smart Contract On-Chain

Smart contract [`contracts/MythomachyArena.sol`](file:///D:/projects/hack/Mythomachy/contracts/MythomachyArena.sol) dapat dikompilasi secara mandiri menggunakan modul Solc internal tanpa memerlukan framework eksternal yang berat:

```bash
node scripts/compile.cjs
```

### Proses yang Dijalankan Skrip:
1. Membaca kode sumber Solidity dari `contracts/MythomachyArena.sol`.
2. Mengompilasi dengan pengoptimalan aktif (`runs: 200`).
3. Menghasilkan artefak ABI dan bytecode EVM ke dalam [`src/config/contractArtifact.json`](file:///D:/projects/hack/Mythomachy/src/config/contractArtifact.json).

---

## 6. Mendeploy ke Monad Testnet

Untuk mendeploy smart contract baru ke jaringan Monad Testnet:

```bash
# Opsi 1: Menggunakan variabel lingkungan
export PRIVATE_KEY=0x...kunci_privat_deployer...
node scripts/deploy.cjs

# Opsi 2: Mengoper kunci privat langsung sebagai argumen
node scripts/deploy.cjs 0x...kunci_privat_deployer...
```

### Keluaran Deployment:
* Menghitung estimasi gas transaksi deployment.
* Mengirimkan transaksi pembuatan kontrak ke RPC `https://testnet-rpc.monad.xyz`.
* Menampilkan alamat smart contract yang berhasil dibuat.
* Secara otomatis menyalin alamat baru ke dalam [`src/config/contract.ts`](file:///D:/projects/hack/Mythomachy/src/config/contract.ts).

---

## 7. Membangun untuk Produksi (Production Build)

Untuk menghasilkan bundel produksi statis yang optimal:

```bash
npm run build
```

Perintah ini akan menjalankan dua tahap:
1. `tsc`: Pemeriksaan validitas tipe data TypeScript di seluruh kode sumber.
2. `vite build`: Minifikasi kode sumber, pemisahan chunk JavaScript, dan kompilasi CSS Tailwind v4 ke dalam direktori `dist/`.

Untuk melihat pratinjau hasil build secara lokal:
```bash
npm run preview
```

---

## 8. Panduan Pemecahan Masalah (Troubleshooting)

### A. Saldo Burner Kosong (0 MON) saat Presentasi
* Tekan tombol **Mode Demo** di bilah atas untuk memunculkan **Panel Verifikasi Juri**.
* Klik tombol **ISI ENERGI SESI (FAUCET)**.
* Jika dompet sponsor tidak memiliki saldo testnet, sistem secara otomatis menyediakan tombol **Gunakan Bukti Simulasi Terverifikasi** sehingga tombol *Trigger Live On-Chain Proof* tetap dapat diuji oleh juri tanpa hambatan.

### B. MetaMask Menampilkan Peringatan Jaringan Salah
* Klik kapsul MetaMask di topbar.
* Klik tombol oranye **Beralih ke Monad Testnet**. MetaMask akan secara otomatis meminta izin perpindahan ke Chain ID `10143` tanpa perlu mengetikkan parameter RPC secara manual.

### C. Port 5173 Sedang Digunakan
* Vite secara otomatis memilih port berikutnya yang tersedia (misalnya `5174`). Periksa alamat lokal yang tertera di log terminal konsol.

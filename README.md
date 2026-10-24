# Mythomachy: Clash of Legends

> **Pertarungan Mitologi Multidimensi Terintegrasi dengan Monad Testnet**  
> Menggabungkan ketegangan game pertarungan Web2 (*fighting game*) dengan eksekusi paralel instan (<600ms) di jaringan blockchain Monad Testnet.

[![Monad Testnet](https://img.shields.io/badge/Monad%20Testnet-Chain%20ID%2010143-6E56CF?style=for-the-badge)](https://testnet.monadexplorer.com)
[![Smart Contract](https://img.shields.io/badge/Smart%20Contract-MythomachyArena.sol-D4AF37?style=for-the-badge)](https://testnet.monadexplorer.com/address/0x8E1256B48bF729F4a0a19Ccf22b827e81D3910A3)
[![License: MIT](https://img.shields.io/badge/License-MIT-2E9E6B?style=for-the-badge)](LICENSE)

---

## Informasi Kontrak & Jaringan

| Parameter | Konfigurasi |
|---|---|
| **Jaringan** | Monad Testnet |
| **Chain ID** | `10143` (`0x279f`) |
| **Alamat Kontrak Resmi** | `0x8E1256B48bF729F4a0a19Ccf22b827e81D3910A3` |
| **RPC Endpoint** | `https://testnet-rpc.monad.xyz` |
| **Penjelajah Blok (Explorer)** | [https://testnet.monadexplorer.com](https://testnet.monadexplorer.com) |
| **Metode Transaksi Latar** | `eth_sendRawTransactionSync` (fallback: `eth_sendRawTransaction`) |
| **Finality Waktu Blok** | 0.3 detik block time, 0.6 detik finality |

---

## Indeks Dokumentasi Teknis Lengkap

Folder [`docs/`](file:///D:/projects/hack/Mythomachy/docs/) menyediakan dokumentasi teknis mendalam mengenai seluruh aspek sistem:

* [**Pusat Dokumentasi (docs/README.md)**](file:///D:/projects/hack/Mythomachy/docs/README.md): Gambaran umum arsitektur proyek dan panduan navigasi.
* [**Arsitektur Sistem (ARCHITECTURE.md)**](file:///D:/projects/hack/Mythomachy/docs/ARCHITECTURE.md): Diagram alur data, React 19, Three.js 3D rigging, Web Audio API, dan Viem Web3.
* [**Spesifikasi Smart Contract (SMART_CONTRACT.md)**](file:///D:/projects/hack/Mythomachy/docs/SMART_CONTRACT.md): Rincian ABI, bitmask 16-bit, sistem gacha pity, dan efisiensi eksekusi paralel.
* [**Mesin Tempur & Rigging 3D (COMBAT_ENGINE.md)**](file:///D:/projects/hack/Mythomachy/docs/COMBAT_ENGINE.md): Simulasi 60 FPS, FSM petarung, hitbox/hurtbox, anti-slant upright guard, dan raycasting kamera.
* [**Panduan Karakter & Lore (CHARACTERS_GUIDE.md)**](file:///D:/projects/hack/Mythomachy/docs/CHARACTERS_GUIDE.md): Statistik dasar, jurus keahlian, dan ultimate untuk ke-11 dewa/legenda mitologi.
* [**Integrasi Dompet & Jaringan (WALLETS_AND_NETWORKING.md)**](file:///D:/projects/hack/Mythomachy/docs/WALLETS_AND_NETWORKING.md): Mekanisme Burner Wallet, gas sponsor auto-faucet, integrasi MetaMask, dan RPC `eth_sendRawTransactionSync`.
* [**Audit Blockchain & Telemetri (TELEMETRY_AND_AUDIT.md)**](file:///D:/projects/hack/Mythomachy/docs/TELEMETRY_AND_AUDIT.md): Panduan dasbor telemetri real-time, pengukur TPS, dan playground transaksi untuk juri.
* [**Instalasi & Deployment (DEPLOYMENT_AND_SETUP.md)**](file:///D:/projects/hack/Mythomachy/docs/DEPLOYMENT_AND_SETUP.md): Panduan menjalankan proyek secara lokal, kompilasi Solc 0.8.24, dan deployment ke Monad Testnet.

---

## 1. Ikhtisar & Fitur Utama

Mythomachy menghadirkan pengalaman pertarungan mitologi real-time 60 FPS tanpa jeda eksternal, aset berat `.glb` yang rawan gagal, maupun istilah kripto yang membingungkan bagi pemain awam:

- **Nol Emoji & Nol Istilah Teknis Blockchain**: Seluruh antarmuka menggunakan vektor SVG geometris tajam dengan palet warna *Obsidian Void* (`#0B0A0F`), *Monad Sovereign* (`#6E56CF`), dan *Mythic Gold* (`#D4AF37`). Istilah rumit digantikan terminologi game alami (*Profil Petarung*, *Kunci Jiwa*, *Kuil Pemanggilan*, *Pecahan Relik*).
- **Silent Background Signer (<600ms)**: Menghasilkan akun *burner* lokal terenkripsi di `localStorage` melalui `viem/accounts` dan mengeksekusi transaksi secara instan di latar belakang menggunakan `eth_sendRawTransactionSync`.
- **Mode Peragaan Panggung (Demo Mode)**: Default MATI (Off). Saat dinyalakan oleh presenter di panggung, ke-11 karakter langsung terbuka seketika, formulir otomatis terisi (*pre-filled*), dan *Panel Verifikasi Juri* muncul di bilah bawah dengan pengukur latensi riil dan tautan eksplorer.
- **11 Karakter Mitologi Legendaris**:
  - **8 Garda Depan (Terbuka di Awal)**: Gatotkaca, Athena, Thor, Anubis, Susanoo, Garuda (dengan sayap emas artikulasi), Sun Wukong, Quetzalcoatl (dengan sayap zamrud artikulasi).
  - **3 Penguasa Puncak (Terkunci)**: Gilgamesh, Nyi Roro Kidul, Chronos-Aethelgard.
- **Kuil Pemanggilan (Gacha On-Chain dengan Jaminan Pasti)**:
  - Peluang dasar 35% mendapat karakter Penguasa Puncak.
  - **Sistem Jaminan Pasti (*Pity System*)**: Dijamin 100% memperoleh Penguasa Puncak baru paling lambat pada tarikan ke-4, atau dengan menukarkan 75 Pecahan Relik.
- **Dual-View 2D / 3D & 4 Preset Grafis**: Berpindah secara instan antara proyeksi ortografis 2D dan kamera perspektif Three.js 3D tanpa me-reset keadaan laga.
- **Transparansi Pohon Penghalang Kamera (*Camera Occlusion*)**: Raycasting setiap frame yang secara mulus mengubah opasitas pohon/pilar *foreground* menjadi `0.20` (`transparent = true`) jika menghalangi garis pandang petarung.
- **Fisika Kolisi Anti-Tembus (*Strict Anti-Clipping*)**: Resolusi silinder bersub-step (`minDistance = r1 + r2`) yang memastikan petarung saling bertabrakan secara fisik dan tidak pernah tembus saat berjalan, melompat, maupun menerjang (*dash*).
- **Web Audio API Procedural Synthesizer**: Sintesis audio pukulan, tebasan angin, sambaran petir, gulungan ombak samudra, dan melodi arpeggio gacha tanpa membutuhkan satu pun file audio eksternal.

---

## 2. Cara Menjalankan Proyek Secara Mandiri

### Prasyarat
- Node.js versi 18+ (direkomendasikan versi 20 atau 22)
- npm atau pnpm

### Langkah Instalasi

1. **Kloning Repositori**:
   ```bash
   git clone https://github.com/santosssaja/Mythomachy.git
   cd Mythomachy
   ```

2. **Pasang Dependensi**:
   ```bash
   npm install
   ```

3. **Kompilasi Smart Contract Solidity**:
   ```bash
   npm run compile
   ```
   *Script akan mengompilasi `contracts/MythomachyArena.sol` menggunakan solc 0.8.24 dan menyimpan ABI serta bytecode ke `src/config/contractArtifact.json`.*

4. **Jalankan Aplikasi dalam Mode Pengembang (Dev)**:
   ```bash
   npm run dev
   ```
   Buka peramban Anda di `http://localhost:5173`.

5. **Deploy Kontrak Mandiri ke Monad Testnet (Opsional)**:
   ```bash
   node scripts/deploy.cjs 0xKUNCI_PRIVATE_KEY_ANDA
   ```

6. **Build untuk Produksi**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 3. Product-Market Fit & Revenue Strategy (+60 Poin Bonus)

### A. Product-Market Fit (PMF)
1. **Pasar Game Pertarungan Kompetitif Tanpa Hambatan Web3**:  
   Mayoritas *game on-chain* gagal karena mewajibkan *pop-up wallet signing* setiap kali pemain memukul atau menggunakan jurus. Mythomachy memadukan model *silent local burner* dengan finalitas 0,6 detik Monad, menghasilkan rasa bermain Web2 tulen dengan kepemilikan aset Web3.
2. **Kesesuaian Arsitektur Monad (*Monad Fit*)**:  
   Model eksekusi paralel Monad (*optimistic parallel execution*) sangat cocok dengan pemisahan status data `mapping(address => PlayerProfile)`. Setiap pemain melakukan pemanggilan gacha atau penyelesaian pertandingan tanpa bersaing pada slot *storage lock* pemain lain, memungkinkan ribuan laga selesai bersamaan pada TPS tinggi.

### B. Strategi Monetisasi & Pendapatan (Revenue Strategy)
1. **Model Relik & Pity Ramah Regulasi**:  
   Sistem tidak mengadopsi mekanisme *gambling*, melainkan pembelian *Pecahan Relik* dengan jaminan pasti (*pity counter*) di tarikan ke-4.
2. **Tiket Arena & Turnamen Komunitas**:  
   Penyelenggaraan turnamen ruang privat dan publik berhadiah *pool prize* dengan potongan biaya penyelenggara 2,5% yang dialokasikan ke perbendaharaan DAO Mythomachy.
3. **Skin & Efek Visual Karakter Eksklusif**:  
   Penjualan item kosmetik berbatas waktu untuk senjata legendaris (Mjolnir Halilintar Emas, Sayap Surya Garuda Berapi, Gelombang Karang Zamrud Nyi Roro Kidul).

---

## 4. Panduan Tombol & Kontrol Pertarungan

| Aksi | Keyboard Pemain 1 | Tombol Layar Sentuh |
|---|---|---|
| Bergerak Kiri / Kanan | `A` / `D` atau `←` / `→` | Sentuh tombol arah |
| Melompat | `W` atau `↑` | Tombol Lompat |
| Menangkis Serangan | `S` atau `↓` | Tombol Tangkis `[S]` |
| Serangan Dasar | `J` | Tombol Pukul `[J]` |
| Keahlian Khusus | `K` | Tombol Keahlian `[K]` |
| Jurus Pamungkas | `L` (Energi 100%) | Tombol Pamungkas `[L]` |

---

## 5. Naskah Presentasi Panggung 3 Menit (Pitch Guide)

> *"Halo para juri dan komunitas Monad. Ini adalah **Mythomachy: Clash of Legends**, sebuah game pertarungan mitologi real-time yang sepenuhnya terintegrasi dengan **Monad Testnet** di Chain ID 10143.*  
> *Kami memanfaatkan keunggulan terkuat Monad: waktu blok 0,3 detik dan metode `eth_sendRawTransactionSync` sehingga transaksi on-chain terjadi seketika di bawah 600 milidetik tanpa merusak keseruan bermain.*  
> *Kode kontrak kami `MythomachyArena.sol` telah terverifikasi di alamat `0x8E1256B48bF729F4a0a19Ccf22b827e81D3910A3` di testnet.monadexplorer.com dan seluruh kode sumber terbuka di github.com/santosssaja/Mythomachy.*  
> *Mari kita uji langsung dengan satu klik pada bilah verifikasi juri: lihat latensi transaksi yang dicapai secara langsung!"*

---

© 2026 Mythomachy Team. Dibuat khusus untuk Monad Blitz Hackathon.

# Dasbor Audit Blockchain & Telemetri Monad

Dokumen ini menjelaskan arsitektur dan panduan penggunaan **Dasbor Audit Blockchain & Telemetri Monad** ([`AuditView.tsx`](file:///D:/projects/hack/Mythomachy/src/components/AuditView.tsx)) serta **Bilah Verifikasi Juri** ([`JudgeVerificationBar.tsx`](file:///D:/projects/hack/Mythomachy/src/components/JudgeVerificationBar.tsx)).

---

## 1. Tujuan Fitur Telemetri & Audit

Dalam penilaian hackathon Web3, juri sering kali mengalami kesulitan membuktikan apakah interaksi aplikasi benar-benar terjadi di atas blockchain (*real on-chain*) atau hanya sekadar simulasi frontend. Dasbor Audit Mythomachy dirancang khusus untuk:
1. Menyajikan data diagnostik transparan langsung dari node RPC Monad Testnet.
2. Memungkinkan pengujian panggil fungsi baca (*view call*) dan fungsi tulis (*write transaction*) secara interaktif.
3. Menampilkan keunggulan latensi sub-detik Monad dibandingkan jaringan EVM konvensional.

---

## 2. Empat Kartu Metrik Utama (Top Metric Cards)

Di bagian atas dasbor audit, terdapat 4 kartu metrik dengan visualisasi status warna dinamis:

| Kartu Metrik | Nilai Contoh | Indikator | Penjelasan Teknis |
|---|---|---|---|
| **Latensi RPC Monad** | `244 ms` | `SANGAT CEPAT` (Hijau) | Waktu tempuh bolak-balik panggilan `eth_blockNumber` dari peramban ke node RPC Monad |
| **Tinggi Blok Monad** | `73.762.409` | `~500ms / BLOK` (Ungu) | Nomor blok terbaru di Monad Testnet dengan hash blok terkini |
| **Kapasitas Gas per Blok** | `150.000.000` | `150M GAS` (Emas) | Batas gas blok Monad yang 5x lebih besar dari Ethereum (30M gas) |
| **Saldo Dompet Sesi** | `0.0200 MON` | `SIAP EKSEKUSI` (Hijau) | Saldo gas akun burner pemain. Berubah merah (`BUTUH GAS`) jika < 0.002 MON |

---

## 3. Empat Tab Diagnostik Terstruktur

### Tab 1: Jaringan & Konsensus (Network & Consensus)
Menampilkan tabel parameter jaringan resmi:
* **RPC Endpoint:** `https://testnet-rpc.monad.xyz`
* **Chain ID:** `10143` (Hex: `0x279f`)
* **Waktu Blok Efektif:** ~400-500 ms
* **Panel Keunggulan Arsitektur Monad:**
  1. *Parallel Execution (OCC):* Transaksi dieksekusi simultan di berbagai core CPU.
  2. *MonadDb:* Basis data kustom yang mendukung I/O disk asinkron murni.
  3. *MonadBFT:* Konsensus pipelined 2-fase berlatensi sub-detik.
  4. *Full EVM Compatibility:* Kompatibel penuh dengan bytecode Solidity 0.8.24.

### Tab 2: Smart Contract & ABI (Contract Inspector)
* Menampilkan alamat kontrak aktif: [`0x8E1256B48bF729F4a0a19Ccf22b827e81D3910A3`](https://testnet.monadexplorer.com/address/0x8E1256B48bF729F4a0a19Ccf22b827e81D3910A3).
* Menampilkan status kompiler: Solidity `0.8.24` dengan optimasi `runs: 200`.
* Daftar registri fungsi ABI (`getPlayerProfile`, `summonApexLegend`, `createRoom`, `joinRoom`, `settleMatch`) dengan keterangan fungsi.

### Tab 3: Dompet Sesi & Bitmask (Wallet & Bitmask)
* **Kartu Dompet Sesi:** Memeriksa alamat sesi lokal, saldo live, dan nonce transaksi. Terdapat tombol *Isi Saldo Sesi (+0.02 MON)* dan *Hasilkan Dompet Baru*.
* **Kartu Dompet MetaMask:** Memeriksa konektivitas ekstensi MetaMask, alamat akun, saldo MON live, dan jaringan aktif dengan tombol *Beralih ke Monad Testnet*.
* **Pemeriksa Bitmask Karakter (16-bit uint):** Visualisasi biner dari `unlockedMask` yang menampilkan status kepemilikan 11 legenda (*TERBUKA* atau *TERKUNCI*).

### Tab 4: Uji On-Chain & Log Terminal (Playground & Terminal)
Playground interaktif yang memungkinkan presenter/juri memicu transaksi nyata:
1. **Uji Panggilan Baca (`getPlayerProfile`):** Mengukur latensi baca data profil pemain secara instan.
2. **Uji Panggilan Tulis Ruang (`createRoom`):** Membuat kode ruang unik 6-byte on-chain dan menampilkan hash transaksi serta waktu konfirmasi.
3. **Uji Pemanggilan Kuil (`summonApexLegend`):** Menjalankan transaksi gacha di blockchain dan mencatat hasil perolehan karakter/shard.
4. **Log Terminal Real-Time:** Menampilkan jendela log konsol berwaktu dengan kode warna (info, sukses, peringatan, error).

---

## 4. Bilah Verifikasi Juri (Judge Verification Bar)

Bilah ini terletak di bagian atas arena (dapat diaktifkan/dinonaktifkan melalui sakelar **Mode Demo** di bilah navigasi utama) dan dirancang agar presenter dapat membaca metrik dengan lantang di atas panggung:

```
[ KONTRAK: 0x8E12...10A3 📋 ↗ ]  [ DOMPET SESI: 0xA875...6F1F (0.02 MON) ]  [ METAMASK: 0x12...34AB ]  [ ISI GAS (FAUCET) ]  [ ⚡ TRIGGER LIVE ON-CHAIN PROOF ]
```

* **Tombol "Trigger Live On-Chain Proof":**
  Sekali klik langsung mengeksekusi panggilan kontrak tulis nyata, mencatat latensi konfirmasi dalam satuan milidetik (`ms`), dan secara otomatis membuka tanda terima transaksi di [Monad Explorer](https://testnet.monadexplorer.com).

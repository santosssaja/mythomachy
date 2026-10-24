# Panduan Integrasi Dompet & Jaringan Monad

Dokumen ini memuat panduan teknis mendalam mengenai arsitektur **Dual-Wallet** pada Mythomachy, mekanisme auto-faucet gas sponsorship, integrasi ekstensi MetaMask, dan optimalisasi panggilan RPC ke **Monad Testnet**.

---

## 1. Arsitektur Dual-Wallet (Dua Dompet Saling Melengkapi)

Salah satu kelemahan terbesar game Web3 adalah kewajiban pemain untuk menghubungkan dompet dan menandatangani pop-up setiap kali melakukan aksi. Mythomachy memecahkan masalah ini dengan menyediakan dua opsi dompet:

```
                               ┌────────────────────────────────────────────────────────┐
                               │                 Mythomachy Dual-Wallet                 │
                               └──────────────────────────┬─────────────────────────────┘
                                                          │
                    ┌─────────────────────────────────────┴─────────────────────────────────────┐
                    ▼                                                                           ▼
   ┌─────────────────────────────────┐                                         ┌─────────────────────────────────┐
   │      Mode 1: Burner Session     │                                         │      Mode 2: External MetaMask   │
   ├─────────────────────────────────┤                                         ├─────────────────────────────────┤
   │ * Tanpa pop-up instalasi wallet │                                         │ * Standar industri EIP-1193     │
   │ * Sesi terenkripsi di browser   │                                         │ * Self-custody aset pribadi     │
   │ * Didanai gas sponsor otomatis  │                                         │ * Verifikasi langsung di testnet│
   │ * Cocok untuk pengujian & tanding│                                        │ * Ideal untuk pemain Web3 mahir │
   └─────────────────────────────────┘                                         └─────────────────────────────────┘
```

---

## 2. Rincian Mode 1: Dompet Sesi Otomatis (Burner Session)

### A. Siklus Hidup Akun Sesi
1. **Pembuatan Akun:** Saat aplikasi dibuka pertama kali tanpa sesi tersimpan, [`burnerSigner.ts`](file:///D:/projects/hack/Mythomachy/src/services/burnerSigner.ts) memanggil `generatePrivateKey()` dari Viem dan menyimpannya di `localStorage` dengan kunci `mythomachy_burner_pk`.
2. **Derivasi Alamat:** Kunci privat diubah menjadi objek akun Viem melalui `privateKeyToAccount()`.
3. **Penyimpanan Profil Pemain:** Data kemenangan, relik, dan status bitmask disimpan secara paralel di `localStorage` sebagai cermin lokal sebelum disinkronkan ke blockchain.

### B. Mekanisme Anti-Jebakan Saldo Nol (Zero-Balance Trap Prevention)
Akun burner baru memiliki saldo `0 MON`. Jika transaksi dikirim tanpa saldo, node RPC akan menolak dengan error `insufficient funds`. [`monadRpc.ts`](file:///D:/projects/hack/Mythomachy/src/services/monadRpc.ts) menerapkan langkah mitigasi otomatis:

```typescript
// Sebelum menjalankan transaksi tulis apa pun (summon, createRoom, settleMatch):
const balance = await publicClient.getBalance({ address: account.address });

if (balance < parseEther('0.002')) {
  // Panggil helper sponsorship otomatis
  const fundResult = await ensureBurnerFunded(account.address);
}
```

### C. Alur Gas Sponsorship & Auto-Faucet
Fungsi `ensureBurnerFunded(targetAddress)` bekerja dengan hierarki berikut:
1. **Kunci Sponsor Lingkungan (`VITE_TESTNET_SPONSOR_KEY`):** Kunci privat dompet sponsor yang memiliki persediaan MON di Monad Testnet (tidak pernah di-hardcode ke kode sumber!).
2. **Kunci Sponsor Kustom (`mythomachy_sponsor_key`):** Pengguna atau juri dapat memasukkan kunci privat sponsor sendiri melalui menu *Konfigurasi* di dasbor audit.
3. **Fallback Mode Simulasi Terverifikasi:** Jika dompet sponsor kosong (0 MON), sistem mengaktifkan `isSimulatedFunded()` sehingga pengujian juri di panggung tidak pernah terhenti akibat kendala faucet publik.

---

## 3. Rincian Mode 2: Integrasi Ekstensi MetaMask

Integrasi MetaMask dikelola secara reaktif melalui [`metamaskService.ts`](file:///D:/projects/hack/Mythomachy/src/services/metamaskService.ts) dan tombol antarmuka [`MetaMaskButton.tsx`](file:///D:/projects/hack/Mythomachy/src/components/MetaMaskButton.tsx).

### A. Permintaan Akses Akun
```typescript
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts'
});
```

### B. Otomasi Pendaftaran & Perpindahan Jaringan ke Monad
Jika MetaMask berada di jaringan lain, aplikasi memanggil:
```typescript
try {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x279f' }] // 10143 dalam format hex
  });
} catch (switchError: any) {
  // Jika jaringan belum ada di MetaMask (Error 4902), daftarkan secara otomatis:
  if (switchError.code === 4902) {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x279f',
        chainName: 'Monad Testnet',
        nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
        rpcUrls: ['https://testnet-rpc.monad.xyz'],
        blockExplorerUrls: ['https://testnet.monadexplorer.com']
      }]
    });
  }
}
```

### C. Pendengar Event Reaktif (Event Listeners)
* `accountsChanged`: Memperbarui alamat aktif jika pengguna berganti akun di ekstensi MetaMask, atau memutuskan sesi jika akun dikunci.
* `chainChanged`: Memeriksa apakah rantai aktif masih Monad Testnet (`10143`).

---

## 4. Optimalisasi Komunikasi RPC Monad (`eth_sendRawTransactionSync`)

Monad memperkenalkan metode RPC revolusioner bernama `eth_sendRawTransactionSync`:

| Metode Tradisional (`eth_sendRawTransaction`) | Metode Monad (`eth_sendRawTransactionSync`) |
|---|---|
| 1. Kirim transaksi mentah ke RPC | 1. Kirim transaksi mentah ke RPC |
| 2. Menerima hash transaksi | 2. Node menahan koneksi selama beberapa ratus milidetik |
| 3. Klien melakukan polling `getTransactionReceipt` berulang | 3. Node langsung mengembalikan status eksekusi & blok dalam respons yang sama! |
| **Total Waktu: 3 - 15 detik** | **Total Waktu: < 600 milidetik!** |

Dalam [`monadRpc.ts`](file:///D:/projects/hack/Mythomachy/src/services/monadRpc.ts), aplikasi mengutamakan panggilan `eth_sendRawTransactionSync`, dengan fallback otomatis ke `sendRawTransaction` standar jika node penyedia tidak mendukung metode sinkron.

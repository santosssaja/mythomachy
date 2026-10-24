import React from 'react';
import { IconClose, IconFiligreeCorner } from './SvgIcons';

export type HelpSectionId =
  | 'ruang_tunggu'
  | 'kuil_pemanggilan'
  | 'pemilihan_karakter'
  | 'pengaturan_grafis'
  | 'pemilihan_peta'
  | 'mode_peragaan'
  | 'panggung_pratinjau';

interface HelpContent {
  title: string;
  badge: string;
  summary: string;
  steps: string[];
  tips: string;
}

const HELP_DATA: Record<HelpSectionId, HelpContent> = {
  ruang_tunggu: {
    title: 'Panduan Ruang Tunggu & Arena',
    badge: 'Ruang Tunggu',
    summary: 'Di sini Anda dapat memulai pertandingan baik melawan bot cerdas, pemain lain dalam antrean publik, atau mengundang teman menggunakan kode privat.',
    steps: [
      'Pilih Ruang Publik untuk bermain santai atau Ruang Privat untuk membuat kode unik 6 karakter.',
      'Gunakan fitur pemindaian kode QR di layar untuk mengundang teman bermain bersama seketika.',
      'Atau pilih Lawan Bot Mythomachy untuk melatih kombo dan reflek pada tingkat kesulitan yang Anda inginkan.'
    ],
    tips: 'Setiap kemenangan di arena akan menghadiahkan Pecahan Relik yang dapat digunakan untuk membuka karakter penguasa puncak.'
  },

  kuil_pemanggilan: {
    title: 'Panduan Kuil Pemanggilan Legenda',
    badge: 'Kuil Pemanggilan',
    summary: 'Kuil suci tempat Anda membangkitkan 3 Karakter Penguasa Puncak (Gilgamesh, Nyi Roro Kidul, dan Chronos-Aethelgard).',
    steps: [
      'Setiap pemanggilan memiliki peluang 35% untuk langsung membangunkan salah satu Penguasa Puncak yang belum dimiliki.',
      'Sistem Jaminan Pasti (Pity System): Anda dijamin 100% memperoleh Penguasa Puncak paling lambat pada tarikan ke-4.',
      'Setiap pemanggilan yang belum menghasilkan legenda baru akan memberikan 25 Pecahan Relik.',
      'Mengumpulkan 75 Pecahan Relik akan langsung ditukarkan otomatis menjadi 1 Karakter Penguasa Puncak.'
    ],
    tips: 'Seluruh pemanggilan dieksekusi secara instan berkat teknologi sinkronisasi secepat kilat (<600ms).'
  },

  pemilihan_karakter: {
    title: 'Panduan Pemilihan Karakter',
    badge: 'Pemilihan Karakter',
    summary: 'Pilih petarung legenda favorit Anda. Tersedia 8 Karakter Garda Depan yang langsung terbuka, serta 3 Penguasa Puncak.',
    steps: [
      'Garda Depan (Terbuka): Gatotkaca, Athena, Thor, Anubis, Susanoo, Garuda, Sun Wukong, dan Quetzalcoatl.',
      'Penguasa Puncak (Terkunci): Gilgamesh, Nyi Roro Kidul, dan Chronos-Aethelgard (dapat dibuka lewat Kuil atau Mode Demo).',
      'Perhatikan atribut Vitalitas (HP), Kecepatan Gerak, serta efek Keahlian Khusus dan Jurus Pamungkas setiap karakter.'
    ],
    tips: 'Garuda dan Quetzalcoatl memiliki sayap artikulasi yang mengepak dinamis saat melesat di udara.'
  },

  pengaturan_grafis: {
    title: 'Panduan Pengaturan Grafis & Mode Tampilan',
    badge: 'Pengaturan & Kamera',
    summary: 'Sesuaikan performa visual game agar berjalan mulus di perangkat komputer, tablet, maupun ponsel Anda.',
    steps: [
      'Mode Tampilan 2D / 3D: Berpindah secara instan antara sudut pandang samping datar (2D) dan perspektif tiga dimensi (3D) bahkan saat laga berlangsung.',
      'Preset Grafis: Tersedia 4 pilihan mulai dari Ringan (hemat daya/perangkat lama), Seimbang, Tinggi, hingga Efek Maksimal (pantulan cahaya & bayangan dinamis).',
      'Pengaturan Suara: Anda dapat menyalakan atau mematikan efek suara pertarungan kapan saja.'
    ],
    tips: 'Pohon dan pilar yang berada di antara kamera dan petarung akan otomatis memudar transparan agar pandangan tidak pernah tertutup.'
  },

  pemilihan_peta: {
    title: 'Panduan Pemilihan Peta Pertarungan',
    badge: 'Pemilihan Peta',
    summary: 'Pilih arena medan laga dengan nuansa dan efek atmosfer visual yang berbeda.',
    steps: [
      'Sanctum of Monad: Altar batu obsidian dengan ukiran sirkuit bercahaya ungu dan monolit kristal melayang di udara.',
      'Primeval Othrys: Kuil marmer purba dengan pilar megah dan pepohonan rimbun berteknologi transparansi otomatis.',
      'Chronos Horizon: Arena dinamis yang membaca jam perangkat Anda secara langsung (Fajar, Siang, Senja, atau Malam).'
    ],
    tips: 'Peta Chronos Horizon menampilkan indikator jam nyata dan menyesuaikan sudut pencahayaan matahari secara real-time.'
  },

  mode_peragaan: {
    title: 'Panduan Mode Peragaan Panggung (Demo)',
    badge: 'Mode Demo',
    summary: 'Mode khusus presentasi panggung untuk memperagakan fitur lengkap tanpa perlu persiapan rumit.',
    steps: [
      'Ketika Mode Peragaan dinyalakan, seluruh 11 karakter (termasuk 3 Penguasa Puncak) otomatis terbuka seketika.',
      'Formulir ruang tunggu dan parameter pertandingan otomatis terisi lengkap agar Anda tidak perlu mengetik di panggung.',
      'Bilah Panel Verifikasi Juri akan muncul di bagian bawah layar untuk menguji transaksi langsung dan menampilkan tautan kontrak.'
    ],
    tips: 'Mode Peragaan selalu MATI secara default saat halaman dimuat ulang sesuai standar kompetisi.'
  },

  panggung_pratinjau: {
    title: 'Panggung Pratinjau Ksatria',
    badge: 'Panggung Pratinjau',
    summary: 'Panel ini menampilkan model visual 3D Ksatria dan Medan Laga yang sedang Anda pilih secara langsung, lengkap dengan statistik Vitalitas (HP), Kecepatan, dan daftar 3 keahlian tempur.',
    steps: [
      'Gunakan tetikus (mouse drag) atau usapan layar ponsel untuk memutar model 3D ksatria 360 derajat.',
      'Periksa baris Keahlian Tempur Ksatria untuk mempelajari jurus dasar, jurus 1, dan jurus pamungkas.',
      'Gunakan tombol pintas Ganti Petarung dan Ganti Medan Laga untuk berpindah langkah konfigurasi secara instan.'
    ],
    tips: 'Anda juga dapat memutar model 3D menggunakan roda gulir mouse (wheel scroll) atau tombol putar 45 derajat di pojok panggung.'
  }
};

interface HelpModalProps {
  sectionId: HelpSectionId | null;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ sectionId, onClose }) => {
  if (!sectionId) return null;
  const data = HELP_DATA[sectionId];
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg panel-frame p-6 sm:p-7 rounded-2xl border gold-border text-left shadow-[0_12px_48px_rgba(0,0,0,0.9),0_0_24px_rgba(212,175,55,0.25)]">
        {/* Filigree Corner Flourishes */}
        <div className="absolute top-2 left-2 pointer-events-none opacity-70">
          <IconFiligreeCorner size={20} color="#D4AF37" position="top-left" />
        </div>
        <div className="absolute top-2 right-2 pointer-events-none opacity-70">
          <IconFiligreeCorner size={20} color="#D4AF37" position="top-right" />
        </div>
        <div className="absolute bottom-2 left-2 pointer-events-none opacity-70">
          <IconFiligreeCorner size={20} color="#D4AF37" position="bottom-left" />
        </div>
        <div className="absolute bottom-2 right-2 pointer-events-none opacity-70">
          <IconFiligreeCorner size={20} color="#D4AF37" position="bottom-right" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D2842]">
          <div className="flex items-center gap-3">
            <span className="help-btn-ornate pointer-events-none">?</span>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                {data.badge}
              </span>
              <h3 className="text-lg font-bold text-[#F4F2F7] font-cinzel">
                {data.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9E98B0] hover:text-white hover:bg-[#1F1B2E] transition-colors cursor-pointer"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4">
          <p className="text-sm text-[#9E98B0] leading-relaxed">
            {data.summary}
          </p>

          <div className="space-y-2.5 bg-[#0B0A0F]/60 p-4 rounded-lg border border-[#2D2842]">
            <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
              Langkah Penggunaan:
            </h4>
            <ul className="space-y-2 text-xs text-[#F4F2F7] leading-relaxed">
              {data.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#6E56CF]/30 text-[#D4AF37] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#6E56CF]/40">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-[#6E56CF]/10 border border-[#6E56CF]/30 rounded-lg">
            <p className="text-xs text-[#D4AF37] leading-relaxed">
              <strong className="text-[#F4F2F7]">Kiat Juara:</strong> {data.tips}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#2D2842] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg btn-primary text-xs uppercase tracking-wider"
          >
            Mengerti & Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};

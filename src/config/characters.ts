import { CharacterDef, CharacterId } from '../types/game';

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  gatotkaca: {
    id: 'gatotkaca',
    numericId: 0,
    name: 'Gatotkaca',
    title: 'Otot Kawat Tulang Besi',
    origin: 'Nusantara',
    maxHp: 1250,
    speed: 6.2,
    radius: 0.65,
    isApex: false,
    primaryColor: '#C49A45',
    accentColor: '#1A1A24',
    particleColor: '#F39C12',
    basicAttack: {
      name: 'Tinju Brajamusti',
      damage: 65,
      range: 1.8,
      cooldown: 0.4
    },
    skill1: {
      name: 'Langkah Tapak Jalak',
      damage: 140,
      cooldown: 4.0,
      dash: true,
      description: 'Terjangan kilat yang berhenti seketika saat menyentuh batas fisik lawan, menimbulkan 140 luka dan dorongan mundur kuat.'
    },
    ultimate: {
      name: 'Amarah Kawah Candradimuka',
      damage: 280,
      cooldown: 12.0,
      energyCost: 100,
      buff: true,
      description: 'Hantaman gelombang kejut area 280 luka yang menyerap energi bumi dan memberikan perisai pengurang kerusakan 30% selama 5 detik.'
    },
    lore: 'Ksatria Pringgandani yang sakti mandraguna dengan zirah Antakusuma, mampu melesat secepat kilat melintasi angkasa.'
  },

  athena: {
    id: 'athena',
    numericId: 1,
    name: 'Athena',
    title: 'Dewi Kebijaksanaan & Taktik Perang',
    origin: 'Yunani',
    maxHp: 1050,
    speed: 6.5,
    radius: 0.58,
    isApex: false,
    primaryColor: '#E6D087',
    accentColor: '#2A4B7C',
    particleColor: '#FFEAA7',
    basicAttack: {
      name: 'Tusukan Tombak Emas',
      damage: 55,
      range: 2.2,
      cooldown: 0.38
    },
    skill1: {
      name: 'Pantulan Perisai Aegis',
      damage: 130,
      cooldown: 4.5,
      buff: true,
      description: 'Memasang perisai Aegis yang menahan 70% kerusakan masuk lalu melancarkan serangan balik taktis sebesar 130 luka.'
    },
    ultimate: {
      name: 'Keputusan Pallas',
      damage: 260,
      cooldown: 11.0,
      energyCost: 100,
      projectile: true,
      description: 'Melemparkan tombak cahaya ilahi yang menembus pertahanan lawan sebesar 260 luka dan memperlambat langkah lawan 40%.'
    },
    lore: 'Putri Zeus penguasa strategi perang yang tidak pernah kalah karena kecerdasan taktik dan perlindungan perisai Aegis.'
  },

  thor: {
    id: 'thor',
    numericId: 2,
    name: 'Thor',
    title: 'Dewa Petir Asgard',
    origin: 'Nordik',
    maxHp: 1200,
    speed: 6.0,
    radius: 0.65,
    isApex: false,
    primaryColor: '#4A90E2',
    accentColor: '#E0E6ED',
    particleColor: '#00D2D3',
    basicAttack: {
      name: 'Ayunan Mjolnir',
      damage: 75,
      range: 1.9,
      cooldown: 0.45
    },
    skill1: {
      name: 'Sambaran Halilintar',
      damage: 150,
      cooldown: 4.2,
      projectile: true,
      description: 'Memanggil kilat vertikal berkekuatan 150 luka yang menyambar dari langit tepat di posisi lawan berada.'
    },
    ultimate: {
      name: 'Badai Asgard',
      damage: 300,
      cooldown: 13.0,
      energyCost: 100,
      description: 'Melepaskan seluruh muatan listrik Mjolnir menciptakan medan badai listrik berdiameter luas berdaya hancur 300 luka.'
    },
    lore: 'Pahlawan terkuat dari Asgard, pelindung Midgard yang bersenjatakan palu mistis Mjolnir.'
  },

  anubis: {
    id: 'anubis',
    numericId: 3,
    name: 'Anubis',
    title: 'Penuntun Jiwa Bawah Tanah',
    origin: 'Mesir',
    maxHp: 1000,
    speed: 6.4,
    radius: 0.58,
    isApex: false,
    primaryColor: '#D4AF37',
    accentColor: '#1F1924',
    particleColor: '#8E44AD',
    basicAttack: {
      name: 'Sabit Penghakiman',
      damage: 60,
      range: 2.0,
      cooldown: 0.4
    },
    skill1: {
      name: 'Timbangan Jiwa',
      damage: 120,
      cooldown: 4.5,
      description: 'Menghempaskan timbangan kebenaran yang mencabut 120 HP lawan sekaligus memulihkan 60 HP Anubis secara instan.'
    },
    ultimate: {
      name: 'Kutukan Padang Pasir',
      damage: 250,
      cooldown: 12.0,
      energyCost: 100,
      description: 'Menciptakan kubangan pasir hisap gelap berkerusakan 250 luka yang mengurangi kecepatan gerak musuh sebesar 50%.'
    },
    lore: 'Penjaga gerbang alam baka bertubuh manusia berkepala serigala emas, penimbang hati nurani para pengelana akhirat.'
  },

  susanoo: {
    id: 'susanoo',
    numericId: 4,
    name: 'Susanoo',
    title: 'Penguasa Badai & Samudra',
    origin: 'Jepang',
    maxHp: 950,
    speed: 7.2,
    radius: 0.55,
    isApex: false,
    primaryColor: '#5B86E5',
    accentColor: '#36D1DC',
    particleColor: '#54A0FF',
    basicAttack: {
      name: 'Tebasan Kusanagi',
      damage: 50,
      range: 1.8,
      cooldown: 0.32
    },
    skill1: {
      name: 'Angin Pemotong',
      damage: 135,
      cooldown: 3.8,
      projectile: true,
      description: 'Mengibaskan pedang Kusanagi melepaskan sabit angin berkecepatan tinggi yang memotong barisan musuh sejauh 5 meter.'
    },
    ultimate: {
      name: 'Tarian Seribu Badai',
      damage: 290,
      cooldown: 11.5,
      energyCost: 100,
      dash: true,
      description: 'Rangkaian 4 tebasan kilat beruntun berkecepatan supranatural yang mengiris lawan dengan total 290 kerusakan mutlak.'
    },
    lore: 'Dewa badai Takamagahara yang menumbangkan Yamata no Orochi berbekal keberanian tak tergoyahkan dan pedang legendaris.'
  },

  garuda: {
    id: 'garuda',
    numericId: 5,
    name: 'Garuda',
    title: 'Raja Burung Langit Surya',
    origin: 'Weda & Nusantara',
    maxHp: 980,
    speed: 7.0,
    radius: 0.60,
    isApex: false,
    primaryColor: '#F39C12',
    accentColor: '#C0392B',
    particleColor: '#F1C40F',
    basicAttack: {
      name: 'Cakar Api Surya',
      damage: 58,
      range: 1.8,
      cooldown: 0.36
    },
    skill1: {
      name: 'Hembusan Sayap Emas',
      damage: 125,
      cooldown: 4.0,
      description: 'Mengepakkan sayap emas menghasilkan badai angin pendorong lawan mundur sejauh 2 meter disertai 125 luka.'
    },
    ultimate: {
      name: 'Terjangan Matahari',
      damage: 275,
      cooldown: 12.0,
      energyCost: 100,
      dash: true,
      description: 'Menukik tajam dari ketinggian angkasa berselimut kobaran api surya, berhenti tepat di batas fisik target memberikan 275 ledakan luka.'
    },
    lore: 'Makhluk mitis bertubuh emas berkilau dengan bentangan sayap megah, wahana Dewa Wisnu pelindung keteraturan semesta.'
  },

  wukong: {
    id: 'wukong',
    numericId: 6,
    name: 'Sun Wukong',
    title: 'Raja Kera Akrobatik',
    origin: 'Tionghoa',
    maxHp: 1050,
    speed: 6.8,
    radius: 0.58,
    isApex: false,
    primaryColor: '#E67E22',
    accentColor: '#F1C40F',
    particleColor: '#E67E22',
    basicAttack: {
      name: 'Putaran Ruyi Jingu Bang',
      damage: 55,
      range: 2.1,
      cooldown: 0.35
    },
    skill1: {
      name: 'Bayangan Awan',
      damage: 130,
      cooldown: 4.0,
      dash: true,
      description: 'Lompatan akrobatik ke belakang sambil meninggalkan klon bayangan yang meledak menghasilkan 130 luka ke lawan di depannya.'
    },
    ultimate: {
      name: 'Pilar Langit Raksasa',
      damage: 270,
      cooldown: 11.5,
      energyCost: 100,
      description: 'Membesarkan tongkat Ruyi Jingu Bang hingga seukuran pilar kahyangan lalu menghantamkannya lurus ke depan menghancurkan arena.'
    },
    lore: 'Pendekar kera sakti yang menguasai 72 transformasi dan jungkir balik awan kinton, berjiwa bebas pantang tunduk.'
  },

  quetzalcoatl: {
    id: 'quetzalcoatl',
    numericId: 7,
    name: 'Quetzalcoatl',
    title: 'Ular Bersayap Bulu Zamrud',
    origin: 'Aztek',
    maxHp: 1020,
    speed: 6.6,
    radius: 0.62,
    isApex: false,
    primaryColor: '#2ECC71',
    accentColor: '#F39C12',
    particleColor: '#1ABC9C',
    basicAttack: {
      name: 'Cambukan Angin Zamrud',
      damage: 52,
      range: 2.2,
      cooldown: 0.38
    },
    skill1: {
      name: 'Pusaran Topan',
      damage: 135,
      cooldown: 4.2,
      description: 'Memanggil pusaran angin berputar yang menyedot lawan mendekat ke titik tengah disertai hantaman 135 kerusakan.'
    },
    ultimate: {
      name: 'Napas Matahari Kelima',
      damage: 285,
      cooldown: 12.5,
      energyCost: 100,
      projectile: true,
      description: 'Menembakkan sinar berkekuatan energi matahari purba berwarna hijau keemasan yang membakar garis lurus arena sebesar 285 luka.'
    },
    lore: 'Dewa angin, fajar, dan pengetahuan bangsa Aztek yang membawa pencerahan bagi peradaban kuno Mesoamerika.'
  },

  // 3 APEX SOVEREIGN LEGENDS (LOCKED BY DEFAULT)
  gilgamesh: {
    id: 'gilgamesh',
    numericId: 8,
    name: 'Gilgamesh',
    title: 'Raja Segala Pahlawan (Penguasa Puncak)',
    origin: 'Mesopotamia',
    maxHp: 1350,
    speed: 6.7,
    radius: 0.62,
    isApex: true,
    primaryColor: '#FFD700',
    accentColor: '#C0392B',
    particleColor: '#FFEAA7',
    basicAttack: {
      name: 'Tebasan Enkidu',
      damage: 85,
      range: 2.0,
      cooldown: 0.38
    },
    skill1: {
      name: 'Gerbang Perbendaharaan Babel',
      damage: 195,
      cooldown: 4.0,
      projectile: true,
      description: 'Membuka 4 portal cahaya emas di belakang punggung yang meluncurkan hujan tombak dan pedang legendaris berdaya 195 kerusakan.'
    },
    ultimate: {
      name: 'Rantai Langit & Bintang Pemisah Dunia',
      damage: 380,
      cooldown: 13.0,
      energyCost: 100,
      description: 'Mengikat pergerakan lawan di tempat selama 1,5 detik dengan rantai Enkidu, disusul semburan pilar energi merah-emas raksasa berdaya 380 luka mutlak.'
    },
    lore: 'Raja berdarah dua pertiga dewa dari Uruk yang memiliki perbendaharaan seluruh pusaka purba dan teknologi mistis pertama di bumi.'
  },

  nyirorokidul: {
    id: 'nyirorokidul',
    numericId: 9,
    name: 'Nyi Roro Kidul',
    title: 'Penguasa Samudra Selatan (Penguasa Puncak)',
    origin: 'Nusantara',
    maxHp: 1300,
    speed: 6.8,
    radius: 0.58,
    isApex: true,
    primaryColor: '#1ABC9C',
    accentColor: '#16A085',
    particleColor: '#A3E4D7',
    basicAttack: {
      name: 'Hempasan Gelombang Zamrud',
      damage: 80,
      range: 2.8,
      cooldown: 0.36
    },
    skill1: {
      name: 'Pusaran Karang Laut Selatan',
      damage: 185,
      cooldown: 4.5,
      description: 'Menciptakan pusaran air abisal di bawah kaki lawan yang menarik lawan mendekat, memberikan 185 kerusakan, dan memulihkan 90 HP ratu samudra.'
    },
    ultimate: {
      name: 'Tsunami Kencana Samudra',
      damage: 365,
      cooldown: 14.0,
      energyCost: 100,
      description: 'Memanggil gelombang pasang tsunami setinggi arena yang menyapu dari belakang menuju lawan, melempar lawan ke tepi arena dengan 365 kerusakan.'
    },
    lore: 'Ratu gaib perkasa yang bertakhta di istana dasar samudra selatan Jawa, menguasai gelombang laut dan pasukan abisal berzirah zamrud.'
  },

  chronos: {
    id: 'chronos',
    numericId: 10,
    name: 'Chronos-Aethelgard',
    title: 'Penjaga Waktu Paralel (Penguasa Puncak)',
    origin: 'Kosmologi Kuno',
    maxHp: 1320,
    speed: 7.0,
    radius: 0.58,
    isApex: true,
    primaryColor: '#9B59B6',
    accentColor: '#6E56CF',
    particleColor: '#D2B4DE',
    basicAttack: {
      name: 'Sabit Dimensi',
      damage: 82,
      range: 2.1,
      cooldown: 0.34
    },
    skill1: {
      name: 'Gema Paralel',
      damage: 190,
      cooldown: 4.0,
      description: 'Menciptakan bayangan kembar dari garis masa depan yang mengeksekusi serangan serempak dari dua sisi menghasilkan 190 luka.'
    },
    ultimate: {
      name: 'Hentakan Waktu Nol',
      damage: 390,
      cooldown: 14.0,
      energyCost: 100,
      description: 'Membekukan gerak musuh hingga 80% selama 2,5 detik sambil menjatuhkan monolit kristal ungu monad yang meledak dahsyat sebesar 390 kerusakan.'
    },
    lore: 'Entitas abadi penjaga kontinuitas ruang dan waktu yang mampu melipat dimensi dan merekonstruksi takdir dalam sekejap mata.'
  }
};

export const CHARACTER_LIST = Object.values(CHARACTERS);
export const VANGUARD_CHARACTERS = CHARACTER_LIST.filter(c => !c.isApex);
export const APEX_CHARACTERS = CHARACTER_LIST.filter(c => c.isApex);

export function getCharacterByNumericId(numericId: number): CharacterDef {
  const found = CHARACTER_LIST.find(c => c.numericId === numericId);
  return found || CHARACTERS.gatotkaca;
}

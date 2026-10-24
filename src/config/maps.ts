import { MapDef, MapId } from '../types/game';

export interface TimeOfDayInfo {
  phase: 'Fajar' | 'Siang' | 'Senja' | 'Malam';
  timeStr: string;
  skyColorTop: string;
  skyColorBottom: string;
  ambientLight: string;
  sunColor: string;
  sunIntensity: number;
}

export function getCurrentTimeOfDay(overrideHour?: number): TimeOfDayInfo {
  const now = new Date();
  const hour = overrideHour !== undefined ? overrideHour : now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hour.toString().padStart(2, '0')}:${minutes}`;

  // Fajar: 05:00 - 07:59
  if (hour >= 5 && hour < 8) {
    return {
      phase: 'Fajar',
      timeStr,
      skyColorTop: '#3A2E4C',
      skyColorBottom: '#F39C12',
      ambientLight: '#D35400',
      sunColor: '#F1C40F',
      sunIntensity: 1.1
    };
  }
  // Siang: 08:00 - 15:59
  if (hour >= 8 && hour < 16) {
    return {
      phase: 'Siang',
      timeStr,
      skyColorTop: '#1B2A4A',
      skyColorBottom: '#5B86E5',
      ambientLight: '#E0E6ED',
      sunColor: '#FFFFFF',
      sunIntensity: 1.4
    };
  }
  // Senja: 16:00 - 18:29
  if (hour >= 16 && (hour < 18 || (hour === 18 && now.getMinutes() < 30))) {
    return {
      phase: 'Senja',
      timeStr,
      skyColorTop: '#2C1B3D',
      skyColorBottom: '#C0392B',
      ambientLight: '#E67E22',
      sunColor: '#D35400',
      sunIntensity: 1.0
    };
  }
  // Malam: 18:30 - 04:59
  return {
    phase: 'Malam',
    timeStr,
    skyColorTop: '#06050A',
    skyColorBottom: '#14121D',
    ambientLight: '#2C273E',
    sunColor: '#6E56CF',
    sunIntensity: 0.65
  };
}

export const MAPS: Record<MapId, MapDef> = {
  monad_sanctum: {
    id: 'monad_sanctum',
    numericId: 0,
    name: 'Sanctum of Monad',
    subtitle: 'Altar Kristal Monad',
    description: 'Lantai batu obsidian kuno berukir sirkuit kosmis bercahaya ungu mistis dengan monolit kristal melayang berputar di udara.',
    themeColor: '#6E56CF',
    hasForegroundObstacles: false
  },
  primeval_othrys: {
    id: 'primeval_othrys',
    numericId: 1,
    name: 'Primeval Othrys',
    subtitle: 'Kuil Mitologi Purba',
    description: 'Kuil marmer klasik kuno megah yang dikelilingi pepohonan rimbun asri di sekeliling arena dengan atmosfer fajar peradaban mitologi.',
    themeColor: '#D4AF37',
    hasForegroundObstacles: true
  },
  chronos_horizon: {
    id: 'chronos_horizon',
    numericId: 2,
    name: 'Chronos Horizon',
    subtitle: 'Sinkronisasi Waktu Nyata',
    description: 'Langit dinamis yang tersinkronisasi otomatis dengan jam perangkat Anda (Fajar, Siang, Senja, Malam).',
    themeColor: '#2E9E6B',
    hasForegroundObstacles: true
  }
};

export const MAP_LIST = Object.values(MAPS);

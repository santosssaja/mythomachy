import { MapId, RoomInfo, AIDifficulty } from '../types/game';
import { getBurnerAddress } from './burnerSigner';
import { sendSilentTransaction } from './monadRpc';
import { stringToHex } from 'viem';

const PUBLIC_ROOMS_KEY = 'mythomachy_public_rooms';

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export function getPublicRooms(): RoomInfo[] {
  const saved = localStorage.getItem(PUBLIC_ROOMS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fall through
    }
  }

  // Initial seed rooms for instant matchmaking
  const seedRooms: RoomInfo[] = [
    {
      code: 'MONAD8',
      hostName: 'Pendekar Obsidian',
      hostAddress: '0x14121d5a7b2139048a123f81e35a92c8192a7702',
      mapId: 'monad_sanctum',
      isPrivate: false,
      isReady: true
    },
    {
      code: 'OTHRYS',
      hostName: 'Penjaga Athena',
      hostAddress: '0x7e8b9a2c3d4e5f6018273645a8b7c9d0e1f2a3b4',
      mapId: 'primeval_othrys',
      isPrivate: false,
      isReady: true
    },
    {
      code: 'ZEUS99',
      hostName: 'Ksatria Halilintar',
      hostAddress: '0x3c9a1d8f7b5e4c2a0d6f8e1b3a5c7d9e0f2a4b6c',
      mapId: 'chronos_horizon',
      isPrivate: false,
      isReady: true
    }
  ];
  localStorage.setItem(PUBLIC_ROOMS_KEY, JSON.stringify(seedRooms));
  return seedRooms;
}

export function savePublicRooms(rooms: RoomInfo[]) {
  localStorage.setItem(PUBLIC_ROOMS_KEY, JSON.stringify(rooms));
}

export function createNewRoom(mapId: MapId, isPrivate: boolean, customCode?: string): RoomInfo {
  const code = (customCode || generateRoomCode()).toUpperCase();
  const address = getBurnerAddress();
  const newRoom: RoomInfo = {
    code,
    hostName: 'Ksatria ' + address.slice(2, 6).toUpperCase(),
    hostAddress: address,
    mapId,
    isPrivate,
    isReady: true
  };

  if (!isPrivate) {
    const list = getPublicRooms().filter(r => r.code !== code);
    list.unshift(newRoom);
    savePublicRooms(list);
  }

  // Trigger silent on-chain record in background
  const bytes6Code = stringToHex(code.padEnd(6, 'X'), { size: 6 });
  const mapNumeric = mapId === 'monad_sanctum' ? 0 : mapId === 'primeval_othrys' ? 1 : 2;
  sendSilentTransaction('createRoom', [bytes6Code, isPrivate, mapNumeric]).catch(() => {});

  return newRoom;
}

export function getJoinRoomUrl(code: string): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}?room=${code}`;
}

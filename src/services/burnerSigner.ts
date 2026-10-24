import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { PlayerProfile } from '../types/game';

const STORAGE_KEY_PK = 'mythomachy_burner_pk';
const STORAGE_KEY_PROFILE = 'mythomachy_player_profile';

// Bit 0..7 (0x00FF = 255) are 8 Vanguard characters unlocked by default
export const DEFAULT_UNLOCKED_MASK = 0x00ff;
// Bit 0..10 (0x07FF = 2047) are all 11 characters
export const ALL_UNLOCKED_MASK = 0x07ff;

export function getBurnerPrivateKey(): `0x${string}` {
  let pk = localStorage.getItem(STORAGE_KEY_PK) as `0x${string}` | null;
  if (!pk || !pk.startsWith('0x') || pk.length !== 66) {
    pk = generatePrivateKey();
    localStorage.setItem(STORAGE_KEY_PK, pk);
  }
  return pk;
}

export function getBurnerAccount() {
  const pk = getBurnerPrivateKey();
  return privateKeyToAccount(pk);
}

export function getBurnerAddress(): `0x${string}` {
  return getBurnerAccount().address;
}

export function resetBurnerWallet(): `0x${string}` {
  const pk = generatePrivateKey();
  localStorage.setItem(STORAGE_KEY_PK, pk);
  const newAccount = privateKeyToAccount(pk);
  const profile = getStoredPlayerProfile();
  profile.address = newAccount.address;
  saveStoredPlayerProfile(profile);
  return newAccount.address;
}

export function getStoredPlayerProfile(): PlayerProfile {
  const address = getBurnerAddress();
  const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure default 8 characters are always unlocked
      parsed.unlockedMask = (parsed.unlockedMask || 0) | DEFAULT_UNLOCKED_MASK;
      return parsed;
    } catch {
      // Fallback
    }
  }

  const initialProfile: PlayerProfile = {
    address,
    unlockedMask: DEFAULT_UNLOCKED_MASK,
    pityCounter: 0,
    relicShards: 25,
    victories: 0,
    matchesPlayed: 0,
    lastSyncedTimestamp: Date.now()
  };
  saveStoredPlayerProfile(initialProfile);
  return initialProfile;
}

export function saveStoredPlayerProfile(profile: PlayerProfile) {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
}

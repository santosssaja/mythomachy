export type CharacterId =
  | 'gatotkaca'
  | 'athena'
  | 'thor'
  | 'anubis'
  | 'susanoo'
  | 'garuda'
  | 'wukong'
  | 'quetzalcoatl'
  | 'gilgamesh'
  | 'nyirorokidul'
  | 'chronos';

export type AnimationState =
  | 'IDLE'
  | 'WALK'
  | 'DASH'
  | 'ATTACK'
  | 'SKILL'
  | 'ULTIMATE'
  | 'HIT';

export interface CharacterSkill {
  name: string;
  damage: number;
  cooldown: number; // in seconds
  description: string;
  projectile?: boolean;
  dash?: boolean;
  buff?: boolean;
}

export interface CharacterDef {
  id: CharacterId;
  numericId: number; // 0 to 10 matching smart contract bitmask
  name: string;
  title: string;
  origin: string;
  maxHp: number;
  speed: number;
  radius: number;
  isApex: boolean;
  primaryColor: string;
  accentColor: string;
  particleColor: string;
  basicAttack: {
    name: string;
    damage: number;
    range: number;
    cooldown: number;
  };
  skill1: CharacterSkill;
  ultimate: CharacterSkill & { energyCost: number };
  lore: string;
}

export interface FighterSimState {
  id: string; // 'player1' or 'player2'
  characterId: CharacterId;
  x: number; // Left/Right axis (along arena length)
  y: number; // Height above floor
  z: number; // Depth (clamped for 2.5D fighting plane)
  vx: number;
  vy: number;
  vz: number;
  hp: number;
  maxHp: number;
  energy: number; // 0 to 100 for ultimate
  facing: number; // 1 for facing right, -1 for facing left
  state: AnimationState;
  stateTimer: number; // Elapsed time in current state
  attackHitRegistered: boolean; // Flag to prevent multiple hits per swing
  skillCooldownRemaining: number;
  ultimateCooldownRemaining: number;
  isBlocking: boolean;
  damageReductionBuff: number; // 0 to 1
  damageReductionTimer: number;
  slowTimer: number;
  slowFactor: number; // e.g. 0.5
  rootTimer: number;
  radius: number;
  comboCount: number;
  lastHitTime: number;
}

export type ViewMode = '2D' | '3D';

export type GraphicsPreset = 'low' | 'medium' | 'high' | 'ultra';

export type MapId = 'monad_sanctum' | 'primeval_othrys' | 'chronos_horizon';

export interface MapDef {
  id: MapId;
  numericId: number;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  hasForegroundObstacles: boolean;
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface RoomInfo {
  code: string;
  hostName: string;
  hostAddress: string;
  challengerAddress?: string;
  mapId: MapId;
  isPrivate: boolean;
  isReady: boolean;
}

export interface PlayerProfile {
  address: string;
  unlockedMask: number;
  pityCounter: number;
  relicShards: number;
  victories: number;
  matchesPlayed: number;
  lastSyncedTimestamp?: number;
}

export interface SummonResult {
  isNewLegend: boolean;
  legendId: number;
  character: CharacterDef;
  totalRelicShards: number;
  updatedMask: number;
  txHash?: string;
  latencyMs?: number;
}

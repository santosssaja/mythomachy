import React, { useState } from 'react';
import { CharacterDef, CharacterId, PlayerProfile } from '../types/game';
import { CHARACTER_LIST, APEX_CHARACTERS, VANGUARD_CHARACTERS } from '../config/characters';
import { soundEngine } from '../audio/soundEngine';

interface CharacterSelectViewProps {
  selectedId: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
  playerProfile: PlayerProfile;
  demoMode: boolean;
  onOpenGacha: () => void;
  onOpenHelp: () => void;
  onAdvanceTab?: () => void;
}

// Visual heraldic insignia and weapon silhouettes for all 11 mythology champions
const renderCharacterEmblem = (id: CharacterId, color: string) => {
  switch (id) {
    case 'gatotkaca':
      // Antakusuma Winged Fist & Brajamusti Gauntlet
      return (
        <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 28L8 20L14 14L20 18L14 24" />
          <path d="M20 18L26 12L32 18L28 26L20 22" />
          <path d="M6 14C10 10 16 8 20 8C24 8 30 10 34 14" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="20" cy="20" r="3" fill={color} />
          <path d="M16 32L20 36L24 32" strokeWidth="2.5" />
        </svg>
      );
    case 'athena':
      // Greek Aegis Shield & Corinthian Spear
      return (
        <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 8L32 32" strokeWidth="2.5" />
          <path d="M28 8L34 8L34 14" />
          <path d="M20 10C26 10 30 14 30 20C30 27 20 32 20 32C20 32 10 27 10 20C10 14 14 10 20 10Z" fill={color} fillOpacity="0.2" />
          <circle cx="20" cy="20" r="4" strokeWidth="1.5" />
        </svg>
      );
    case 'thor':
      // Mjolnir Warhammer & Thunder Sparks
      return (
        <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="11" y="10" width="18" height="11" rx="2" fill={color} fillOpacity="0.25" />
          <path d="M20 21V34" strokeWidth="3" />
          <path d="M18 34H22" strokeWidth="3" />
          <path d="M6 15L9 15" strokeWidth="2" />
          <path d="M31 15L34 15" strokeWidth="2" />
          <path d="M14 6L20 10L26 6" strokeWidth="1.5" />
        </svg>
      );
    case 'anubis':
      // Underworld Jackal & Ankh Staff
      return (
        <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="14" r="5" fill={color} fillOpacity="0.2" />
          <path d="M20 19V34" strokeWidth="2.5" />
          <path d="M14 24H26" strokeWidth="2.5" />
          <path d="M12 10L16 6" />
          <path d="M28 10L24 6" />
        </svg>
      );
    case 'susanoo':
      // Totsuka-no-Tsurugi Katana & Tempest Swirl
      return (
        <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 30L28 12" strokeWidth="2.5" />
          <path d="M28 12L32 8L34 10L30 14L28 12Z" fill={color} />
          <path d="M13 27L9 31" strokeWidth="3" />
          <path d="M8 16C12 14 18 16 20 20" strokeWidth="1.5" />
          <path d="M20 24C22 28 28 30 32 28" strokeWidth="1.5" />
        </svg>
      );
    case 'garuda':
      // Solar Falcon Crest & Mythic Wings
      return (
        <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="14" r="4" fill={color} fillOpacity="0.3" />
          <path d="M20 18L18 22H22L20 18Z" fill={color} />
          <path d="M6 18C11 15 16 17 20 22C24 17 29 15 34 18" strokeWidth="2" />
          <path d="M8 23C13 21 17 23 20 26C23 23 27 21 32 23" strokeWidth="1.5" />
          <path d="M17 28L20 34L23 28" strokeWidth="2" />
        </svg>
      );
    case 'wukong':
      // Ruyi Jingu Bang Staff & Monkey King Circlet
      return (
        <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 32L32 8" strokeWidth="3" />
          <path d="M7 33L11 29" strokeWidth="4" stroke="#D4AF37" />
          <path d="M29 11L33 7" strokeWidth="4" stroke="#D4AF37" />
          <path d="M15 14C17 11 23 11 25 14" strokeWidth="2" />
          <circle cx="20" cy="12" r="2" fill={color} />
        </svg>
      );
    case 'quetzalcoatl':
      // Feathered Serpent Coil & Sun Dial
      return (
        <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 28C8 24 8 16 14 12C20 8 28 8 30 14C32 20 28 26 22 26C16 26 16 20 20 18" strokeWidth="2.5" />
          <path d="M28 8L34 6L32 12" strokeWidth="1.5" fill={color} fillOpacity="0.3" />
          <circle cx="20" cy="20" r="2" fill={color} />
        </svg>
      );
    case 'gilgamesh':
      // Gate of Babylon Twin Golden Blades & Crown
      return (
        <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 32V10L16 8L18 10V32" fill={color} fillOpacity="0.25" />
          <path d="M22 32V10L24 8L26 10V32" fill={color} fillOpacity="0.25" />
          <path d="M10 26H20" strokeWidth="2" />
          <path d="M20 26H30" strokeWidth="2" />
          <path d="M12 6L20 10L28 6" strokeWidth="1.5" />
        </svg>
      );
    case 'nyirorokidul':
      // South Sea Emerald Trident & Ocean Wave
      return (
        <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 8V34" strokeWidth="2.5" />
          <path d="M14 14V18C14 21 17 24 20 24C23 24 26 21 26 18V14" strokeWidth="2" />
          <path d="M14 14L11 11" strokeWidth="2" />
          <path d="M26 14L29 11" strokeWidth="2" />
          <path d="M20 8L18 6H22L20 8Z" fill={color} />
          <path d="M8 32C12 30 16 34 20 32C24 30 28 34 32 32" strokeWidth="1.5" />
        </svg>
      );
    case 'chronos':
      // Celestial Astrolabe Hourglass & Dual Daggers
      return (
        <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="20" r="12" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M14 12H26L20 20L26 28H14L20 20L14 12Z" fill={color} fillOpacity="0.2" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="2.5" fill={color} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" stroke={color} strokeWidth="2">
          <circle cx="20" cy="20" r="10" />
        </svg>
      );
  }
};

export const CharacterSelectView: React.FC<CharacterSelectViewProps> = ({
  selectedId,
  onSelectCharacter,
  playerProfile,
  demoMode,
  onOpenGacha,
  onOpenHelp,
  onAdvanceTab
}) => {
  const [filter, setFilter] = useState<'all' | 'vanguard' | 'apex'>('all');

  const isUnlocked = (c: CharacterDef) => {
    if (demoMode) return true;
    if (!c.isApex) return true;
    return (playerProfile.unlockedMask & (1 << c.numericId)) !== 0;
  };

  const displayedList =
    filter === 'vanguard'
      ? VANGUARD_CHARACTERS
      : filter === 'apex'
      ? APEX_CHARACTERS
      : CHARACTER_LIST;

  const unlockedCount = CHARACTER_LIST.filter(c => isUnlocked(c)).length;

  return (
    <div className="card-surface p-5 sm:p-6 flex-1 min-h-0 flex flex-col justify-start space-y-4 text-left shadow-2xl overflow-hidden">
      {/* Header bar matching modern game lobby standard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D2842] pb-3.5 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-cinzel font-bold text-lg text-[#F4F2F7]">
              DAFTAR 11 KSATRIA MITOLOGI
            </h3>
            <button
              onClick={onOpenHelp}
              className="btn-help"
              title="Panduan Pemilihan Ksatria"
            >
              ?
            </button>
          </div>
          <p className="text-xs text-[#9E98B0] mt-1">
            8 Ksatria Garda Depan Siap Laga |{' '}
            <span className="text-[#D4AF37] font-semibold">
              3 Penguasa Puncak via Kuil Pemanggilan ({unlockedCount}/11 Terbuka)
            </span>
          </p>
        </div>

        {/* Spacious, clearly separated Pill Button Filters */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            onClick={() => {
              soundEngine.playClickSound();
              setFilter('all');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              filter === 'all'
                ? 'bg-[#6E56CF] border-[#9D88F5] text-[#F4F2F7] shadow-[0_0_12px_rgba(110,86,207,0.4)]'
                : 'bg-[#0B0A0F] border-[#2D2842] text-[#9E98B0] hover:text-[#F4F2F7] hover:border-[#6E56CF]/50'
            }`}
          >
            Semua (11)
          </button>
          <button
            onClick={() => {
              soundEngine.playClickSound();
              setFilter('vanguard');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              filter === 'vanguard'
                ? 'bg-[#6E56CF] border-[#9D88F5] text-[#F4F2F7] shadow-[0_0_12px_rgba(110,86,207,0.4)]'
                : 'bg-[#0B0A0F] border-[#2D2842] text-[#9E98B0] hover:text-[#F4F2F7] hover:border-[#6E56CF]/50'
            }`}
          >
            Garda Depan (8)
          </button>
          <button
            onClick={() => {
              soundEngine.playClickSound();
              setFilter('apex');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              filter === 'apex'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8518] border-[#FFE484] text-[#0B0A0F] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                : 'bg-[#0B0A0F] border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10'
            }`}
          >
            Penguasa Puncak (3)
          </button>
        </div>
      </div>

      {/* Roster Grid with Visual Crests, Weapon Silhouettes & Auto-Advance */}
      <div className="card-grid-container grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 flex-1 min-h-0 overflow-y-auto pr-2">
        {displayedList.map(f => {
          const unlocked = isUnlocked(f);
          const isSelected = selectedId === f.id;
          const charColor = f.primaryColor || '#D4AF37';

          return (
            <div
              key={f.id}
              onClick={() => {
                soundEngine.playCharacterSelectSound(f.id);
                if (unlocked) {
                  onSelectCharacter(f.id);
                  onAdvanceTab?.();
                } else {
                  onOpenGacha();
                }
              }}
              className={`card-surface p-4 flex flex-col justify-between cursor-pointer transition select-none group relative overflow-hidden ${
                isSelected
                  ? 'card-selected-gold shadow-[0_0_20px_rgba(212,175,55,0.35)]'
                  : 'card-interactive hover:border-[#6E56CF]/70'
              } ${!unlocked ? 'opacity-70 bg-[#0E0C16]/90' : ''}`}
              style={{ minHeight: '148px' }}
            >
              {/* Subtle Ambient Color Splash behind card */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ background: charColor }}
              />

              <div>
                {/* Top Origin Tag & Apex Badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1F1B2E] text-[#9E98B0] border border-[#2D2842]">
                    {f.origin}
                  </span>
                  {f.isApex ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 shadow-[0_0_8px_rgba(212,175,55,0.2)]">
                      PENGUASA PUNCAK
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#9E98B0]/70 uppercase">
                      GARDA DEPAN
                    </span>
                  )}
                </div>

                {/* Character Name + Weapon/Hallmark Emblem */}
                <div className="flex items-center gap-3">
                  {/* Ornate Weapon Hallmark Box */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: 'rgba(11, 10, 15, 0.85)',
                      borderColor: isSelected ? '#D4AF37' : 'rgba(45, 40, 66, 0.8)',
                      boxShadow: isSelected ? `0 0 12px ${charColor}44` : 'none'
                    }}
                  >
                    {renderCharacterEmblem(f.id, charColor)}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-cinzel font-bold text-base text-[#F4F2F7] tracking-wide truncate group-hover:text-[#D4AF37] transition-colors">
                      {f.name}
                    </h4>
                    <p className="text-[11px] text-[#9E98B0] truncate">
                      {f.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status and HP Stat Line */}
              <div className="pt-2.5 mt-3 border-t border-[#2D2842] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: charColor }} />
                  <span className="text-[#2E9E6B] font-bold">
                    {f.maxHp} HP
                  </span>
                </div>

                {unlocked ? (
                  <span
                    className={`font-cinzel font-bold text-[11px] tracking-wider transition-colors ${
                      isSelected ? 'text-[#D4AF37]' : 'text-[#9E98B0] group-hover:text-white'
                    }`}
                  >
                    {isSelected ? 'TERPILIH' : 'PILIH KSATRIA'}
                  </span>
                ) : (
                  <span className="font-cinzel font-bold text-[11px] uppercase text-[#D4AF37] underline tracking-wider">
                    BUKA DI KUIL
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
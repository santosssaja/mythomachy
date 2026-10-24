import React, { useState } from 'react';
import { CharacterDef, CharacterId, PlayerProfile } from '../types/game';
import { CHARACTER_LIST, CHARACTERS, APEX_CHARACTERS, VANGUARD_CHARACTERS } from '../config/characters';
import { IconLock, IconCheck, IconTemple, IconLightning, IconSwords, IconShield } from './SvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface CharacterSelectViewProps {
  selectedId: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
  playerProfile: PlayerProfile;
  demoMode: boolean;
  onOpenGacha: () => void;
  onOpenHelp: () => void;
}

export const CharacterSelectView: React.FC<CharacterSelectViewProps> = ({
  selectedId,
  onSelectCharacter,
  playerProfile,
  demoMode,
  onOpenGacha,
  onOpenHelp
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

  const selectedChar = CHARACTERS[selectedId];

  return (
    <div className="w-full space-y-6 text-left">
      {/* Section Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2D2842]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#6E56CF]/20 border border-[#6E56CF]/40 text-[#D4AF37]">
            <IconSwords size={20} color="#D4AF37" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#F4F2F7] font-cinzel">
                Daftar 11 Ksatria Legenda
              </h3>
              <button
                onClick={onOpenHelp}
                className="help-btn"
                title="Bantuan Pemilihan Karakter"
              >
                ?
              </button>
            </div>
            <p className="text-xs text-[#9E98B0]">
              Pilih pahlawan mitologi pilihan Anda untuk memimpin pertempuran di arena laga
            </p>
          </div>
        </div>

        {/* Filter Pills with padding: 8px 18px */}
        <div className="flex items-center gap-1.5 bg-[#0B0A0F] p-1.5 rounded-xl border border-[#2D2842] self-start sm:self-auto">
          <button
            onClick={() => {
              soundEngine.playClickSound();
              setFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-[#6E56CF] text-white shadow-md shadow-[#6E56CF]/30'
                : 'text-[#9E98B0] hover:text-[#F4F2F7]'
            }`}
          >
            Semua (11)
          </button>
          <button
            onClick={() => {
              soundEngine.playClickSound();
              setFilter('vanguard');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'vanguard'
                ? 'bg-[#6E56CF] text-white shadow-md shadow-[#6E56CF]/30'
                : 'text-[#9E98B0] hover:text-[#F4F2F7]'
            }`}
          >
            Garda Depan (8)
          </button>
          <button
            onClick={() => {
              soundEngine.playClickSound();
              setFilter('apex');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'apex'
                ? 'bg-[#D4AF37] text-[#0B0A0F] shadow-md shadow-[#D4AF37]/30'
                : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'
            }`}
          >
            Penguasa Puncak (3)
          </button>
        </div>
      </div>

      {/* Grid of Characters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {displayedList.map(char => {
          const unlocked = isUnlocked(char);
          const isSelected = selectedId === char.id;

          return (
            <div
              key={char.id}
              onClick={() => {
                soundEngine.playCharacterSelectSound(char.id);
                if (unlocked) {
                  onSelectCharacter(char.id);
                } else {
                  onOpenGacha();
                }
              }}
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between group ${
                isSelected
                  ? 'bg-gradient-to-b from-[#1F1B2E] to-[#14121D] border-[#D4AF37] shadow-xl shadow-[#D4AF37]/15 ring-2 ring-[#D4AF37]'
                  : unlocked
                  ? 'bg-[#14121D]/90 border-[#2D2842] hover:border-[#6E56CF]/60 hover:bg-[#1F1B2E]/60 hover:-translate-y-0.5'
                  : 'bg-[#0B0A0F]/90 border-[#2D2842] opacity-65 hover:opacity-90'
              }`}
            >
              {/* Origin Badge & Lock Status */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${char.primaryColor}20`,
                    color: char.primaryColor,
                    border: `1px solid ${char.primaryColor}40`
                  }}
                >
                  {char.origin}
                </span>
                {unlocked ? (
                  <span className="w-2 h-2 rounded-full bg-[#2E9E6B] shadow-sm shadow-[#2E9E6B]" />
                ) : (
                  <span className="p-1 rounded bg-[#0B0A0F] border border-[#D4AF37]/40 text-[#D4AF37]">
                    <IconLock size={11} color="#D4AF37" />
                  </span>
                )}
              </div>

              {/* Character Name & Archetype Title */}
              <div>
                <h4 className="font-cinzel font-bold text-sm text-[#F4F2F7] truncate group-hover:text-[#D4AF37] transition-colors">
                  {char.name}
                </h4>
                <p className="text-[10px] text-[#9E98B0] line-clamp-1 mt-0.5">
                  {char.title}
                </p>
              </div>

              {/* Bottom Stats & Selection Indicator */}
              <div className="mt-3 pt-2 border-t border-[#2D2842]/50 flex items-center justify-between text-[11px]">
                <span className="font-mono text-[#F4F2F7] font-semibold">
                  {char.maxHp} HP
                </span>
                <span
                  className={`font-cinzel font-bold text-xs ${
                    isSelected
                      ? 'text-[#D4AF37]'
                      : unlocked
                      ? 'text-[#9E98B0] group-hover:text-white'
                      : 'text-[#D4AF37]'
                  }`}
                >
                  {isSelected ? 'DIPILIH' : unlocked ? 'PILIH' : 'KUIL GACHA'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Skills Dossier for Currently Selected Character */}
      <div className="p-5 rounded-2xl bg-[#0B0A0F]/80 border border-[#2D2842] space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#2D2842] pb-2.5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] font-cinzel">
              Rincian Keahlian & Jurus
            </span>
            <h4 className="font-cinzel text-sm sm:text-base font-bold text-[#F4F2F7]">
              {selectedChar.name} — {selectedChar.title}
            </h4>
          </div>
          <span className="text-xs text-[#9E98B0] italic max-w-sm hidden md:block line-clamp-1">
            "{selectedChar.lore}"
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Basic Attack */}
          <div className="p-3.5 rounded-xl bg-[#14121D] border border-[#2D2842] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#9E98B0]">
                Serangan Dasar [J]
              </span>
              <span className="font-mono text-xs font-bold text-[#D4AF37]">
                {selectedChar.basicAttack.damage} Dmg
              </span>
            </div>
            <h5 className="font-cinzel text-xs font-bold text-[#F4F2F7]">
              {selectedChar.basicAttack.name}
            </h5>
            <p className="text-[11px] text-[#9E98B0] leading-snug">
              Jangkauan {selectedChar.basicAttack.range}m, jeda {selectedChar.basicAttack.cooldown}s.
            </p>
          </div>

          {/* Skill 1 */}
          <div className="p-3.5 rounded-xl bg-[#14121D] border border-[#6E56CF]/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#00D2D3]">
                Keahlian Khusus [K]
              </span>
              <span className="font-mono text-xs font-bold text-[#00D2D3]">
                {selectedChar.skill1.damage} Dmg
              </span>
            </div>
            <h5 className="font-cinzel text-xs font-bold text-[#F4F2F7]">
              {selectedChar.skill1.name}
            </h5>
            <p className="text-[11px] text-[#9E98B0] leading-snug">
              {selectedChar.skill1.description} (Jeda: {selectedChar.skill1.cooldown}s)
            </p>
          </div>

          {/* Ultimate */}
          <div className="p-3.5 rounded-xl bg-[#14121D] border border-[#D4AF37]/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#D9383A]">
                Jurus Pamungkas [L]
              </span>
              <span className="font-mono text-xs font-bold text-[#D9383A]">
                {selectedChar.ultimate.damage} Dmg
              </span>
            </div>
            <h5 className="font-cinzel text-xs font-bold text-[#F4F2F7]">
              {selectedChar.ultimate.name}
            </h5>
            <p className="text-[11px] text-[#9E98B0] leading-snug">
              {selectedChar.ultimate.description} Butuh Energi 100%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

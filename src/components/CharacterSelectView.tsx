import React from 'react';
import { CharacterDef, CharacterId, PlayerProfile } from '../types/game';
import { CHARACTER_LIST, CHARACTERS } from '../config/characters';
import { IconLock, IconCheck, IconTemple } from './SvgIcons';
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
  const isUnlocked = (c: CharacterDef) => {
    if (demoMode) return true;
    if (!c.isApex) return true;
    return (playerProfile.unlockedMask & (1 << c.numericId)) !== 0;
  };

  const selectedChar = CHARACTERS[selectedId];

  return (
    <div className="w-full space-y-4 text-left">
      {/* Title Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] font-cinzel">
            Pemilihan Karakter Legenda
          </h3>
          <button
            onClick={onOpenHelp}
            className="help-btn"
            title="Bantuan Pemilihan Karakter"
          >
            ?
          </button>
        </div>
        <span className="text-xs text-[#9E98B0]">
          {demoMode ? 'Mode Demo Aktif: Semua 11 Karakter Terbuka' : '8 Garda Depan Terbuka + 3 Penguasa Puncak'}
        </span>
      </div>

      {/* Grid of 11 Character Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {CHARACTER_LIST.map(char => {
          const unlocked = isUnlocked(char);
          const isSelected = selectedId === char.id;

          return (
            <button
              key={char.id}
              onClick={() => {
                if (unlocked) {
                  soundEngine.playClickSound();
                  onSelectCharacter(char.id);
                } else {
                  soundEngine.playClickSound();
                  onOpenGacha();
                }
              }}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-[#1F1B2E] to-[#14121D] border-[#D4AF37] shadow-lg shadow-[#6E56CF]/20 ring-1 ring-[#D4AF37]'
                  : unlocked
                  ? 'bg-[#14121D]/80 border-[#2D2842] hover:border-[#6E56CF]/50'
                  : 'bg-[#0B0A0F]/90 border-[#2D2842] opacity-60 hover:opacity-85'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#9E98B0]">
                    {char.origin}
                  </span>
                  {unlocked ? (
                    <span className="w-2 h-2 rounded-full bg-[#2E9E6B]" />
                  ) : (
                    <IconLock size={12} color="#D4AF37" />
                  )}
                </div>

                <h4 className="font-cinzel font-bold text-xs sm:text-sm text-[#F4F2F7] truncate">
                  {char.name}
                </h4>

                {char.isApex && (
                  <span className="inline-block mt-0.5 text-[9px] uppercase font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-1 rounded">
                    Penguasa Puncak
                  </span>
                )}
              </div>

              <div className="mt-3 pt-1.5 border-t border-[#2D2842]/40 flex items-center justify-between text-[10px]">
                <span className="text-[#9E98B0]">{char.maxHp} HP</span>
                <span
                  className={`font-semibold ${
                    isSelected
                      ? 'text-[#D4AF37]'
                      : unlocked
                      ? 'text-[#F4F2F7]'
                      : 'text-[#D4AF37]'
                  }`}
                >
                  {isSelected ? 'Dipilih' : unlocked ? 'Pilih' : 'Kuil Gacha'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Character Detail Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#14121D] border border-[#2D2842] flex flex-col md:flex-row gap-5 items-start">
        {/* Left: Summary */}
        <div className="w-full md:w-1/3 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xl font-bold font-cinzel text-[#F4F2F7]">
              {selectedChar.name}
            </h4>
            <span className="text-[10px] uppercase font-bold text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              {selectedChar.origin}
            </span>
          </div>
          <p className="text-xs text-[#D4AF37] font-semibold">
            {selectedChar.title}
          </p>
          <p className="text-xs text-[#9E98B0] leading-relaxed">
            {selectedChar.lore}
          </p>
          <div className="flex items-center gap-4 pt-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#9E98B0] block">Vitalitas</span>
              <span className="text-sm font-bold text-[#2E9E6B] font-cinzel">{selectedChar.maxHp} HP</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#9E98B0] block">Kelincahan</span>
              <span className="text-sm font-bold text-[#D4AF37] font-cinzel">{selectedChar.speed} m/s</span>
            </div>
          </div>
        </div>

        {/* Right: Skills Breakdown */}
        <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Basic Attack */}
          <div className="p-3 rounded-lg bg-[#0B0A0F]/60 border border-[#2D2842] space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#9E98B0] block">
              Serangan Dasar [J]
            </span>
            <h5 className="font-cinzel text-xs font-bold text-[#F4F2F7]">
              {selectedChar.basicAttack.name}
            </h5>
            <span className="text-xs font-bold text-[#D4AF37] block">
              {selectedChar.basicAttack.damage} Kerusakan
            </span>
            <p className="text-[11px] text-[#9E98B0]">
              Jangkauan {selectedChar.basicAttack.range}m, jeda {selectedChar.basicAttack.cooldown}s.
            </p>
          </div>

          {/* Skill 1 */}
          <div className="p-3 rounded-lg bg-[#0B0A0F]/60 border border-[#2D2842] space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#6E56CF] block font-bold">
              Keahlian Khusus [K]
            </span>
            <h5 className="font-cinzel text-xs font-bold text-[#F4F2F7]">
              {selectedChar.skill1.name}
            </h5>
            <span className="text-xs font-bold text-[#D4AF37] block">
              {selectedChar.skill1.damage} Kerusakan | {selectedChar.skill1.cooldown}s
            </span>
            <p className="text-[11px] text-[#9E98B0] leading-snug">
              {selectedChar.skill1.description}
            </p>
          </div>

          {/* Ultimate */}
          <div className="p-3 rounded-lg bg-[#0B0A0F]/60 border border-[#2D2842] space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#D9383A] block font-bold">
              Jurus Pamungkas [L]
            </span>
            <h5 className="font-cinzel text-xs font-bold text-[#F4F2F7]">
              {selectedChar.ultimate.name}
            </h5>
            <span className="text-xs font-bold text-[#D9383A] block">
              {selectedChar.ultimate.damage} Kerusakan Mutlak
            </span>
            <p className="text-[11px] text-[#9E98B0] leading-snug">
              {selectedChar.ultimate.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

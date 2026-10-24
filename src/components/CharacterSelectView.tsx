import React, { useState } from 'react';
import { CharacterDef, CharacterId, PlayerProfile } from '../types/game';
import { CHARACTER_LIST, CHARACTERS, APEX_CHARACTERS, VANGUARD_CHARACTERS } from '../config/characters';
import { IconLock, IconCheck, IconTemple, IconLightning, IconSwords, IconShield } from './SvgIcons';
import { CharacterPedestal } from './CharacterPedestal';
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
  const isSelectedUnlocked = isUnlocked(selectedChar);

  return (
    <div className="w-full space-y-5 text-left">
      {/* Section Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2D2842]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#6E56CF]/20 border border-[#6E56CF]/40 text-[#D4AF37]">
            <IconSwords size={20} color="#D4AF37" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#F4F2F7] font-cinzel">
                Daftar Petarung Legenda
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

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#0B0A0F] p-1 rounded-xl border border-[#2D2842]">
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Fighter Cards Grid (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {displayedList.map(char => {
              const unlocked = isUnlocked(char);
              const isSelected = selectedId === char.id;

              return (
                <button
                  key={char.id}
                  onClick={() => {
                    soundEngine.playCharacterSelectSound(char.id);
                    if (unlocked) {
                      onSelectCharacter(char.id);
                    } else {
                      onOpenGacha();
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#1F1B2E] to-[#14121D] border-[#D4AF37] shadow-xl shadow-[#D4AF37]/15 ring-2 ring-[#D4AF37]'
                      : unlocked
                      ? 'bg-[#14121D]/90 border-[#2D2842] hover:border-[#6E56CF]/60 hover:bg-[#1F1B2E]/60'
                      : 'bg-[#0B0A0F]/90 border-[#2D2842] opacity-65 hover:opacity-90'
                  }`}
                >
                  {/* Origin Badge & Lock Status */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded"
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
                    <h4 className="font-cinzel font-bold text-xs sm:text-sm text-[#F4F2F7] truncate group-hover:text-[#D4AF37] transition-colors">
                      {char.name}
                    </h4>
                    <p className="text-[10px] text-[#9E98B0] line-clamp-1 mt-0.5">
                      {char.title}
                    </p>
                  </div>

                  {/* Bottom Stats & Selection Indicator */}
                  <div className="mt-3 pt-2 border-t border-[#2D2842]/50 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-[#F4F2F7] font-semibold">
                      {char.maxHp} HP
                    </span>
                    <span
                      className={`font-cinzel font-bold ${
                        isSelected
                          ? 'text-[#D4AF37]'
                          : unlocked
                          ? 'text-[#9E98B0] group-hover:text-white'
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

          {/* Quick Gacha Notice for Locked Legends */}
          <div className="p-3.5 rounded-xl bg-[#6E56CF]/10 border border-[#6E56CF]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <IconTemple size={18} color="#D4AF37" />
              <span className="text-[#9E98B0]">
                Ingin membuka <strong className="text-[#F4F2F7]">Gilgamesh</strong>, <strong className="text-[#F4F2F7]">Nyi Roro Kidul</strong>, atau <strong className="text-[#F4F2F7]">Chronos</strong>?
              </span>
            </div>
            <button
              onClick={() => {
                soundEngine.playClickSound();
                onOpenGacha();
              }}
              className="px-4 py-1.5 rounded-lg btn-gold text-xs font-bold font-cinzel whitespace-nowrap"
            >
              Buka Kuil Pemanggilan
            </button>
          </div>
        </div>

        {/* Right Column: 3D Articulated Pedestal & Full Character Detail (5 cols on lg) */}
        <div className="lg:col-span-5 panel-frame p-5 rounded-2xl border gold-border space-y-4">
          {/* Header of Selected Legend */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37]">
                  {selectedChar.origin}
                </span>
                {selectedChar.isApex && (
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#6E56CF]/25 border border-[#6E56CF]/40 text-[#F4F2F7]">
                    Penguasa Puncak
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-cinzel text-[#F4F2F7] mt-1">
                {selectedChar.name}
              </h3>
              <p className="text-xs text-[#D4AF37] font-semibold">
                {selectedChar.title}
              </p>
            </div>

            {/* Quick Unlocked Status */}
            {isSelectedUnlocked ? (
              <span className="flex items-center gap-1 text-xs font-bold text-[#2E9E6B] px-2.5 py-1 rounded bg-[#2E9E6B]/15 border border-[#2E9E6B]/30">
                <IconCheck size={14} color="#2E9E6B" /> Siap Laga
              </span>
            ) : (
              <button
                onClick={onOpenGacha}
                className="flex items-center gap-1 text-xs font-bold text-[#D4AF37] px-2.5 py-1 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/40 hover:bg-[#D4AF37]/25 transition-colors"
              >
                <IconLock size={14} /> Panggil di Kuil
              </button>
            )}
          </div>

          {/* 3D Articulated Pedestal Preview */}
          <div className="relative w-full h-[280px] rounded-xl bg-gradient-to-b from-[#0B0A0F] to-[#14121D] border border-[#2D2842] overflow-hidden flex items-center justify-center">
            <CharacterPedestal characterId={selectedChar.id} />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none text-[10px] text-[#9E98B0]/80">
              <span>Klik & geser untuk memutar 3D</span>
              <span className="font-mono">Radius Fisik: {selectedChar.radius}m</span>
            </div>
          </div>

          {/* Stats Summary Bar */}
          <div className="grid grid-cols-2 gap-3 bg-[#0B0A0F]/80 p-3 rounded-xl border border-[#2D2842]">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#9E98B0] block">
                Total Vitalitas
              </span>
              <span className="text-base font-bold font-cinzel text-[#2E9E6B]">
                {selectedChar.maxHp} HP
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#9E98B0] block">
                Kecepatan Gerak
              </span>
              <span className="text-base font-bold font-cinzel text-[#D4AF37]">
                {selectedChar.speed} m/s
              </span>
            </div>
          </div>

          {/* Lore */}
          <p className="text-xs text-[#9E98B0] leading-relaxed italic bg-[#14121D]/60 p-3 rounded-xl border border-[#2D2842]/40">
            "{selectedChar.lore}"
          </p>

          {/* Skills Breakdown */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] font-cinzel">
              Rangkaian Keahlian & Jurus:
            </h4>

            {/* Basic Attack */}
            <div className="p-3 rounded-xl bg-[#0B0A0F]/70 border border-[#2D2842] flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#1F1B2E] text-[#D4AF37] border border-[#2D2842]">
                <IconSwords size={16} color="#D4AF37" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h5 className="font-cinzel text-xs font-bold text-[#F4F2F7]">
                    {selectedChar.basicAttack.name}
                  </h5>
                  <span className="text-xs font-bold text-[#D4AF37] font-mono">
                    {selectedChar.basicAttack.damage} Dmg
                  </span>
                </div>
                <p className="text-[11px] text-[#9E98B0] mt-0.5">
                  Serangan dasar jangkauan {selectedChar.basicAttack.range}m dengan jeda {selectedChar.basicAttack.cooldown}s. Tombol [J].
                </p>
              </div>
            </div>

            {/* Skill 1 */}
            <div className="p-3 rounded-xl bg-[#0B0A0F]/70 border border-[#2D2842] flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#6E56CF]/20 text-[#00D2D3] border border-[#6E56CF]/40">
                <IconLightning size={16} color="#00D2D3" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h5 className="font-cinzel text-xs font-bold text-[#F4F2F7]">
                    {selectedChar.skill1.name}
                  </h5>
                  <span className="text-xs font-bold text-[#00D2D3] font-mono">
                    {selectedChar.skill1.damage} Dmg | {selectedChar.skill1.cooldown}s
                  </span>
                </div>
                <p className="text-[11px] text-[#9E98B0] mt-0.5 leading-snug">
                  {selectedChar.skill1.description} Tombol [K].
                </p>
              </div>
            </div>

            {/* Ultimate */}
            <div className="p-3 rounded-xl bg-[#0B0A0F]/70 border border-[#D4AF37]/40 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50">
                <IconShield size={16} color="#D4AF37" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h5 className="font-cinzel text-xs font-bold text-[#F4F2F7]">
                    {selectedChar.ultimate.name}
                  </h5>
                  <span className="text-xs font-bold text-[#D9383A] font-mono">
                    {selectedChar.ultimate.damage} Dmg Mutlak
                  </span>
                </div>
                <p className="text-[11px] text-[#9E98B0] mt-0.5 leading-snug">
                  {selectedChar.ultimate.description} Butuh Energi 100%. Tombol [L].
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

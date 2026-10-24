import React, { useState } from 'react';
import { CharacterDef, MapDef, AIDifficulty } from '../types/game';
import { CharacterPedestal } from './CharacterPedestal';
import { soundEngine } from '../audio/soundEngine';
import { IconSwords, IconLightning, IconShield } from './SvgIcons';

interface LobbyShowcaseCardProps {
  selectedChar: CharacterDef;
  selectedMap: MapDef;
  onNavigateTab?: (tab: 'character' | 'map') => void;
  botDifficulty?: AIDifficulty;
  isBotMatch?: boolean;
  onOpenHelp?: () => void;
}

export const LobbyShowcaseCard: React.FC<LobbyShowcaseCardProps> = ({
  selectedChar,
  selectedMap,
  onOpenHelp
}) => {
  const [hoveredSkill, setHoveredSkill] = useState<'basic' | 'skill1' | 'ultimate' | null>(null);

  // Speed qualitative label & percentage calculation
  const speedLabel =
    selectedChar.speed >= 6.8
      ? 'Sangat Cepat'
      : selectedChar.speed >= 6.0
      ? 'Cepat'
      : selectedChar.speed >= 5.5
      ? 'Sedang-Kokoh'
      : 'Sedang-Berat';

  const speedPct = Math.min(100, Math.max(35, Math.round((selectedChar.speed / 7.2) * 100)));
  const hpPct = Math.min(100, Math.round((selectedChar.maxHp / 1400) * 100));

  return (
    <div className="character-preview-card shadow-2xl text-left relative overflow-hidden">
      {/* Top Stage Header */}
      <div className="flex items-start justify-between z-10 flex-shrink-0">
        <div>
          <span className="origin-badge bg-[#6E56CF]/20 text-[#F4F2F7] border border-[#6E56CF]/50 inline-block uppercase tracking-wider">
            {selectedChar.origin.toUpperCase()}
          </span>
          <h2 className="font-cinzel font-bold text-2xl text-[#F4F2F7] mt-1 tracking-wide">
            {selectedChar.name.toUpperCase()}
          </h2>
          <p className="text-xs text-[#D4AF37] font-medium mt-0.5">
            {selectedChar.title}
          </p>
        </div>
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="btn-help shrink-0"
            title="Panduan Panggung Pratinjau Ksatria"
          >
            ?
          </button>
        )}
      </div>

      {/* Interactive 3D Turntable Preview (With Radial Glow Backdrop & Anti-Double-Border) */}
      <div className="character-3d-stage shrink-0">
        <CharacterPedestal characterId={selectedChar.id} />
      </div>

      {/* Fighter Vitality (HP) & Speed Bars */}
      <div className="space-y-2.5">
        {/* HP */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#9E98B0]">Vitalitas Pertahanan (HP)</span>
            <span className="font-bold text-[#2E9E6B] font-mono">
              {selectedChar.maxHp.toLocaleString('id-ID')} HP
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#0B0A0F] overflow-hidden border border-[#2D2842]">
            <div
              className="h-full bg-[#2E9E6B] rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(46,158,107,0.4)]"
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>

        {/* Speed */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#9E98B0]">Kecepatan & Mobilitas</span>
            <span className="font-bold text-[#6E56CF] font-mono">
              {speedLabel} ({selectedChar.speed} m/s)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#0B0A0F] overflow-hidden border border-[#2D2842]">
            <div
              className="h-full bg-[#6E56CF] rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(110,86,207,0.4)]"
              style={{ width: `${speedPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sleek Compact Skills List with Rich Hover Tooltip */}
      <div className="pt-3 border-t border-[#2D2842] space-y-2 relative">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold uppercase tracking-wider text-[#9E98B0]">
            Keahlian Tempur:
          </span>
          <span className="text-[10px] text-[#D4AF37]/80">Arahkan kursor untuk info</span>
        </div>

        {/* Basic Attack Row */}
        <div
          onMouseEnter={() => setHoveredSkill('basic')}
          onMouseLeave={() => setHoveredSkill(null)}
          className="p-2 rounded-lg bg-[#0B0A0F]/80 border border-[#2D2842] hover:border-[#D4AF37]/60 flex items-center justify-between transition-colors cursor-help group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="skill-key-badge bg-[#1F1B2E] text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
              DASAR [J]
            </span>
            <span className="text-xs font-bold text-[#F4F2F7] truncate">
              {selectedChar.basicAttack.name}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-[#D4AF37] shrink-0 pl-2">
            {selectedChar.basicAttack.damage} Dmg
          </span>
        </div>

        {/* Skill 1 Row */}
        <div
          onMouseEnter={() => setHoveredSkill('skill1')}
          onMouseLeave={() => setHoveredSkill(null)}
          className="p-2 rounded-lg bg-[#0B0A0F]/80 border border-[#2D2842] hover:border-[#00D2D3]/60 flex items-center justify-between transition-colors cursor-help group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="skill-key-badge bg-[#1F1B2E] text-[#00D2D3] border border-[#00D2D3]/30 shrink-0">
              JURUS 1 [K]
            </span>
            <span className="text-xs font-bold text-[#F4F2F7] truncate">
              {selectedChar.skill1.name}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-[#00D2D3] shrink-0 pl-2">
            {selectedChar.skill1.damage} Dmg
          </span>
        </div>

        {/* Ultimate Row */}
        <div
          onMouseEnter={() => setHoveredSkill('ultimate')}
          onMouseLeave={() => setHoveredSkill(null)}
          className="p-2 rounded-lg bg-[#0B0A0F]/80 border border-[#2D2842] hover:border-[#D9383A]/60 flex items-center justify-between transition-colors cursor-help group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="skill-key-badge bg-[#1F1B2E] text-[#D9383A] border border-[#D9383A]/30 shrink-0">
              PAMUNGKAS [L]
            </span>
            <span className="text-xs font-bold text-[#F4F2F7] truncate">
              {selectedChar.ultimate.name}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-[#D9383A] shrink-0 pl-2">
            {selectedChar.ultimate.damage} Dmg
          </span>
        </div>

        {/* Floating Tooltip Popover for Skill Details */}
        {hoveredSkill && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-3 rounded-xl bg-[#0B0A0F]/95 border border-[#D4AF37]/70 shadow-2xl backdrop-blur-md z-30 pointer-events-none animate-fade-in text-xs space-y-1">
            {hoveredSkill === 'basic' && (
              <>
                <div className="font-cinzel font-bold text-[#D4AF37] flex justify-between items-center">
                  <span>{selectedChar.basicAttack.name}</span>
                  <span className="font-mono text-[11px] text-[#F4F2F7]">{selectedChar.basicAttack.damage} Kerusakan</span>
                </div>
                <p className="text-[11px] text-[#9E98B0] leading-snug">
                  Serangan pukulan fisik berjarak {selectedChar.basicAttack.range}m dengan jeda waktu {selectedChar.basicAttack.cooldown}s per eksekusi.
                </p>
              </>
            )}
            {hoveredSkill === 'skill1' && (
              <>
                <div className="font-cinzel font-bold text-[#00D2D3] flex justify-between items-center">
                  <span>{selectedChar.skill1.name}</span>
                  <span className="font-mono text-[11px] text-[#F4F2F7]">{selectedChar.skill1.damage} Kerusakan</span>
                </div>
                <p className="text-[11px] text-[#9E98B0] leading-snug">
                  {selectedChar.skill1.description} (Jeda waktu: {selectedChar.skill1.cooldown}s).
                </p>
              </>
            )}
            {hoveredSkill === 'ultimate' && (
              <>
                <div className="font-cinzel font-bold text-[#D9383A] flex justify-between items-center">
                  <span>{selectedChar.ultimate.name}</span>
                  <span className="font-mono text-[11px] text-[#F4F2F7]">{selectedChar.ultimate.damage} Kerusakan</span>
                </div>
                <p className="text-[11px] text-[#9E98B0] leading-snug">
                  {selectedChar.ultimate.description} Membutuhkan 100% Energi Laga untuk melancarkan serangan pemungkas.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { CharacterDef, MapDef } from '../types/game';
import { CharacterPedestal } from './CharacterPedestal';
import { IconSwords, IconLightning, IconShield, IconClock } from './SvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface LobbyShowcaseCardProps {
  selectedChar: CharacterDef;
  selectedMap: MapDef;
  onNavigateTab: (tab: 'character' | 'map') => void;
}

export const LobbyShowcaseCard: React.FC<LobbyShowcaseCardProps> = ({
  selectedChar,
  selectedMap,
  onNavigateTab
}) => {
  return (
    <div className="w-full panel-frame rounded-2xl border gold-border p-5 flex flex-col justify-between space-y-4 shadow-2xl relative overflow-hidden">
      {/* Background Ambient Aura based on Selected Map Theme */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 25%, ${selectedMap.themeColor} 0%, transparent 75%)`
        }}
      />

      {/* Top Details */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded"
              style={{
                backgroundColor: `${selectedChar.primaryColor}20`,
                color: selectedChar.primaryColor,
                border: `1px solid ${selectedChar.primaryColor}40`
              }}
            >
              {selectedChar.origin}
            </span>
            {selectedChar.isApex && (
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#6E56CF]/25 border border-[#6E56CF]/40 text-[#F4F2F7]">
                Penguasa Puncak
              </span>
            )}
          </div>

          {/* Map Indicator Badge */}
          <span className="text-[10px] font-semibold text-[#9E98B0] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedMap.themeColor }} />
            {selectedMap.name}
          </span>
        </div>

        <div>
          <h3 className="font-cinzel text-xl sm:text-2xl font-black text-[#F4F2F7] tracking-wide">
            {selectedChar.name}
          </h3>
          <p className="text-xs text-[#D4AF37] font-semibold mt-0.5">
            {selectedChar.title}
          </p>
        </div>
      </div>

      {/* 3D Articulated Pedestal Showcase */}
      <div className="relative z-10 w-full h-[260px] rounded-xl bg-gradient-to-b from-[#0B0A0F]/80 to-[#14121D]/90 border border-[#2D2842] overflow-hidden flex items-center justify-center shadow-inner">
        <CharacterPedestal characterId={selectedChar.id} />
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none text-[10px] text-[#9E98B0]/80">
          <span>Geser mouse untuk rotasi 3D</span>
          <span className="font-mono">Radius: {selectedChar.radius}m</span>
        </div>
      </div>

      {/* HP & Speed Stat Bars */}
      <div className="relative z-10 space-y-2.5 bg-[#0B0A0F]/70 p-3.5 rounded-xl border border-[#2D2842]">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9E98B0] font-medium">Vitalitas (HP)</span>
            <span className="font-cinzel font-bold text-[#2E9E6B]">
              {selectedChar.maxHp} HP
            </span>
          </div>
          <div className="w-full bg-[#1F1B2E] h-2 rounded-full overflow-hidden border border-[#2D2842]">
            <div
              className="h-full bg-gradient-to-r from-[#2E9E6B] to-[#257C54] rounded-full"
              style={{ width: `${Math.min(100, (selectedChar.maxHp / 1400) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#2D2842]/50">
          <span className="text-[#9E98B0]">Kecepatan Gerak:</span>
          <span className="font-mono font-bold text-[#D4AF37]">{selectedChar.speed} m/s</span>
        </div>
      </div>

      {/* Quick-Preview Icons of 3 Skills with Hover Info */}
      <div className="relative z-10 space-y-1.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#9E98B0] block">
          Pratinjau Keahlian:
        </span>
        <div className="grid grid-cols-3 gap-2">
          {/* Basic */}
          <div
            className="p-2 rounded-lg bg-[#0B0A0F]/80 border border-[#2D2842] text-center hover:border-[#D4AF37]/60 transition-colors cursor-help group relative"
            title={`${selectedChar.basicAttack.name}: ${selectedChar.basicAttack.damage} Dmg`}
          >
            <div className="flex justify-center mb-1 text-[#D4AF37]">
              <IconSwords size={16} color="#D4AF37" />
            </div>
            <span className="text-[10px] font-bold block text-[#F4F2F7] truncate">
              {selectedChar.basicAttack.name}
            </span>
            <span className="text-[9px] text-[#9E98B0] block mt-0.5">
              {selectedChar.basicAttack.damage} Dmg [J]
            </span>
          </div>

          {/* Skill 1 */}
          <div
            className="p-2 rounded-lg bg-[#0B0A0F]/80 border border-[#2D2842] text-center hover:border-[#6E56CF]/60 transition-colors cursor-help group relative"
            title={`${selectedChar.skill1.name}: ${selectedChar.skill1.damage} Dmg (${selectedChar.skill1.cooldown}s)`}
          >
            <div className="flex justify-center mb-1 text-[#00D2D3]">
              <IconLightning size={16} color="#00D2D3" />
            </div>
            <span className="text-[10px] font-bold block text-[#F4F2F7] truncate">
              {selectedChar.skill1.name}
            </span>
            <span className="text-[9px] text-[#9E98B0] block mt-0.5">
              {selectedChar.skill1.damage} Dmg [K]
            </span>
          </div>

          {/* Ultimate */}
          <div
            className="p-2 rounded-lg bg-[#0B0A0F]/80 border border-[#2D2842] text-center hover:border-[#D9383A]/60 transition-colors cursor-help group relative"
            title={`${selectedChar.ultimate.name}: ${selectedChar.ultimate.damage} Dmg Mutlak`}
          >
            <div className="flex justify-center mb-1 text-[#D9383A]">
              <IconShield size={16} color="#D9383A" />
            </div>
            <span className="text-[10px] font-bold block text-[#F4F2F7] truncate">
              {selectedChar.ultimate.name}
            </span>
            <span className="text-[9px] text-[#D9383A] font-bold block mt-0.5">
              {selectedChar.ultimate.damage} Dmg [L]
            </span>
          </div>
        </div>
      </div>

      {/* Quick Shortcut Buttons */}
      <div className="relative z-10 pt-2 border-t border-[#2D2842] grid grid-cols-2 gap-2.5">
        <button
          onClick={() => {
            soundEngine.playClickSound();
            onNavigateTab('character');
          }}
          className="py-2 px-3 rounded-lg bg-[#1F1B2E] border border-[#2D2842] text-xs font-semibold text-[#F4F2F7] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all text-center"
        >
          Ganti Ksatria
        </button>

        <button
          onClick={() => {
            soundEngine.playClickSound();
            onNavigateTab('map');
          }}
          className="py-2 px-3 rounded-lg bg-[#1F1B2E] border border-[#2D2842] text-xs font-semibold text-[#F4F2F7] hover:border-[#6E56CF] hover:text-[#6E56CF] transition-all text-center"
        >
          Ganti Medan
        </button>
      </div>
    </div>
  );
};

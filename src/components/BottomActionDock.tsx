import React from 'react';
import { CharacterDef, MapDef, AIDifficulty, RoomInfo } from '../types/game';
import { IconSwords } from './SvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface BottomActionDockProps {
  selectedChar: CharacterDef;
  selectedMap: MapDef;
  isBotMatch: boolean;
  botDifficulty: AIDifficulty;
  currentRoom: RoomInfo | null;
  onLaunchMatch: () => void;
  demoMode: boolean;
}

export const BottomActionDock: React.FC<BottomActionDockProps> = ({
  selectedChar,
  selectedMap,
  isBotMatch,
  botDifficulty,
  currentRoom,
  onLaunchMatch,
  demoMode
}) => {
  const diffLabel =
    botDifficulty === 'easy'
      ? 'Bot Santai'
      : botDifficulty === 'medium'
      ? 'Bot Taktis'
      : 'Bot Legenda';

  const opponentLabel = isBotMatch
    ? diffLabel
    : `Pemain (${currentRoom?.code || 'Acak'})`;

  return (
    <div
      className={`fixed ${
        demoMode ? 'bottom-16' : 'bottom-0'
      } left-0 right-0 z-30 bg-[#14121D]/95 backdrop-blur-md border-t border-[#2D2842] shadow-[0_-8px_24px_rgba(0,0,0,0.6),0_-2px_12px_rgba(212,175,55,0.12)] transition-all`}
      style={{ padding: '16px 28px' }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side: Clean Summary Pills */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          {/* Fighter Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0B0A0F] border border-[#2D2842] text-[#F4F2F7]">
            <span className="text-[#9E98B0] font-medium">Ksatria:</span>
            <span className="font-cinzel font-bold text-[#D4AF37]">
              {selectedChar.name}
            </span>
            <span className="text-[10px] text-[#9E98B0] font-sans">
              ({selectedChar.origin})
            </span>
          </div>

          {/* Map Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0B0A0F] border border-[#2D2842] text-[#F4F2F7]">
            <span className="text-[#9E98B0] font-medium">Medan:</span>
            <span className="font-cinzel font-bold text-[#6E56CF]">
              {selectedMap.name}
            </span>
          </div>

          {/* Opponent Mode Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0B0A0F] border border-[#2D2842] text-[#F4F2F7]">
            <span className="text-[#9E98B0] font-medium">Lawan:</span>
            <span className="font-semibold text-[#2E9E6B]">
              {opponentLabel}
            </span>
          </div>
        </div>

        {/* Right Side: ONE High-Impact Primary CTA Button */}
        <button
          onClick={() => {
            soundEngine.playMatchStartSound();
            onLaunchMatch();
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-xl cursor-pointer transition-all duration-200 group"
          style={{
            padding: '14px 32px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
            color: '#0B0A0F',
            boxShadow: '0 4px 18px rgba(212, 175, 55, 0.45)',
            border: '1px solid #FFE484'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 26px rgba(212, 175, 55, 0.7)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 18px rgba(212, 175, 55, 0.45)';
          }}
        >
          <IconSwords size={18} color="#0B0A0F" />
          <span className="font-cinzel text-xs sm:text-sm font-black uppercase whitespace-nowrap">
            MASUK ARENA LAGA SEKARANG
          </span>
        </button>
      </div>
    </div>
  );
};

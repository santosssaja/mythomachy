import React from 'react';
import { FighterSimState } from '../types/game';
import { CHARACTERS } from '../config/characters';
import { IconShield, IconLightning, IconSwords, IconFlame } from './SvgIcons';

interface MatchHudProps {
  p1: FighterSimState;
  p2: FighterSimState;
  p1Name: string;
  p2Name: string;
  onPlayerAction: (action: 'ATTACK' | 'SKILL' | 'ULTIMATE' | 'BLOCK' | 'DASH' | 'JUMP') => void;
  onExitMatch: () => void;
}

export const MatchHud: React.FC<MatchHudProps> = ({
  p1,
  p2,
  p1Name,
  p2Name,
  onPlayerAction,
  onExitMatch
}) => {
  const p1Char = CHARACTERS[p1.characterId];
  const p2Char = CHARACTERS[p2.characterId];

  const p1HpPercent = Math.max(0, Math.min(100, (p1.hp / p1.maxHp) * 100));
  const p2HpPercent = Math.max(0, Math.min(100, (p2.hp / p2.maxHp) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30">
      {/* 1. Top HUD: Full-width Header with 3-Column Grid (Left: P1, Center: Exit, Right: P2) */}
      <div className="combat-hud-header">
        {/* Player 1 HUD (Left) */}
        <div className="space-y-1 text-left min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-cinzel font-black text-xs sm:text-sm text-[#F4F2F7] truncate">
                {p1Char.name}
              </span>
              <span className="text-[10px] text-[#D4AF37] font-semibold hidden md:inline truncate">
                ({p1Name})
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#F4F2F7] ml-2 flex-shrink-0">
              {p1.hp} / {p1.maxHp}
            </span>
          </div>

          {/* P1 Health Bar */}
          <div className="w-full bg-[#14121D] h-3.5 sm:h-4 rounded-md overflow-hidden border border-[#2D2842] p-0.5 shadow-inner">
            <div
              className="h-full rounded-sm transition-all duration-200"
              style={{
                width: `${p1HpPercent}%`,
                background:
                  p1HpPercent > 30
                    ? 'linear-gradient(90deg, #2E9E6B 0%, #257C54 100%)'
                    : 'linear-gradient(90deg, #D9383A 0%, #A92628 100%)'
              }}
            />
          </div>

          {/* P1 Energy Bar for Ultimate */}
          <div className="w-full bg-[#0B0A0F] h-1.5 sm:h-2 rounded-sm overflow-hidden border border-[#2D2842]/60">
            <div
              className="h-full bg-gradient-to-r from-[#6E56CF] to-[#D4AF37] transition-all duration-300"
              style={{ width: `${p1.energy}%` }}
            />
          </div>

          {/* Buffs / Status Indicators */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {p1.isBlocking && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#3498DB]/20 border border-[#3498DB]/40 text-[#3498DB]">
                Menangkis (Aegis)
              </span>
            )}
            {p1.damageReductionBuff > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#2E9E6B]/20 border border-[#2E9E6B]/40 text-[#2E9E6B]">
                Perisai Baja -30%
              </span>
            )}
            {p1.slowTimer > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#9B59B6]/20 border border-[#9B59B6]/40 text-[#9B59B6]">
                Efek Lambat
              </span>
            )}
          </div>
        </div>

        {/* Center: Keluar Laga Button (Separated in Middle Column to prevent collision) */}
        <div className="flex items-center justify-center pointer-events-auto px-1">
          <button
            onClick={onExitMatch}
            className="px-3.5 py-1.5 rounded-lg bg-[#14121D]/90 border border-[#2D2842] text-[#9E98B0] hover:text-[#F4F2F7] hover:border-[#D4AF37]/60 text-[10px] sm:text-[11px] font-cinzel font-bold tracking-wider transition-all shadow-md hover:shadow-[0_0_12px_rgba(212,175,55,0.25)] cursor-pointer whitespace-nowrap"
          >
            KELUAR LAGA
          </button>
        </div>

        {/* Player 2 HUD (Right) */}
        <div className="space-y-1 text-right min-w-0">
          <div className="flex items-center justify-between flex-row-reverse">
            <div className="flex items-center gap-1.5 flex-row-reverse truncate">
              <span className="font-cinzel font-black text-xs sm:text-sm text-[#F4F2F7] truncate">
                {p2Char.name}
              </span>
              <span className="text-[10px] text-[#D4AF37] font-semibold hidden md:inline truncate">
                ({p2Name})
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#F4F2F7] mr-2 flex-shrink-0">
              {p2.hp} / {p2.maxHp}
            </span>
          </div>

          {/* P2 Health Bar */}
          <div className="w-full bg-[#14121D] h-3.5 sm:h-4 rounded-md overflow-hidden border border-[#2D2842] p-0.5 flex justify-end shadow-inner">
            <div
              className="h-full rounded-sm transition-all duration-200"
              style={{
                width: `${p2HpPercent}%`,
                background:
                  p2HpPercent > 30
                    ? 'linear-gradient(90deg, #2E9E6B 0%, #257C54 100%)'
                    : 'linear-gradient(90deg, #D9383A 0%, #A92628 100%)'
              }}
            />
          </div>

          {/* P2 Energy Bar */}
          <div className="w-full bg-[#0B0A0F] h-1.5 sm:h-2 rounded-sm overflow-hidden border border-[#2D2842]/60 flex justify-end">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#6E56CF] transition-all duration-300"
              style={{ width: `${p2.energy}%` }}
            />
          </div>

          {/* P2 Status Indicators */}
          <div className="flex items-center justify-end gap-1.5 pt-0.5">
            {p2.isBlocking && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#3498DB]/20 border border-[#3498DB]/40 text-[#3498DB]">
                Menangkis
              </span>
            )}
            {p2.slowTimer > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#9B59B6]/20 border border-[#9B59B6]/40 text-[#9B59B6]">
                Efek Lambat
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Bottom Controls / On-Screen Touch Buttons */}
      <div className="absolute bottom-3 left-4 right-4 sm:left-6 sm:right-6 flex items-end justify-between gap-3 pointer-events-auto">
        {/* Left Side: Movement Info / D-Pad */}
        <div className="hidden sm:flex items-center gap-2 p-2 rounded-lg bg-[#0B0A0F]/85 border border-[#2D2842] text-[10px] sm:text-[11px] text-[#9E98B0] shadow-md">
          <span>Gerak: <strong className="text-[#F4F2F7]">A / D</strong></span>
          <span>| Lompat: <strong className="text-[#F4F2F7]">W</strong></span>
          <span>| Tangkis: <strong className="text-[#F4F2F7]">S</strong></span>
        </div>

        {/* Right Side: Action Skills Buttons with Cooldowns */}
        <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
          {/* Tangkis (Block) */}
          <button
            onMouseDown={() => onPlayerAction('BLOCK')}
            onTouchStart={() => onPlayerAction('BLOCK')}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#1F1B2E] border border-[#2D2842] text-[#F4F2F7] flex flex-col items-center justify-center active:scale-95 transition-all shadow-lg cursor-pointer hover:border-[#3498DB]/50"
          >
            <IconShield size={16} color="#3498DB" />
            <span className="text-[9px] font-bold mt-0.5">Tangkis</span>
            <span className="text-[8px] text-[#9E98B0]">[S]</span>
          </button>

          {/* Serangan Dasar [J] */}
          <button
            onClick={() => onPlayerAction('ATTACK')}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#14121D] border border-[#6E56CF]/60 text-[#F4F2F7] flex flex-col items-center justify-center active:scale-95 transition-all shadow-lg shadow-[#6E56CF]/10 cursor-pointer hover:border-[#D4AF37]/60"
          >
            <IconSwords size={16} color="#D4AF37" />
            <span className="text-[9px] font-bold mt-0.5">Pukul</span>
            <span className="text-[8px] text-[#9E98B0]">[J]</span>
          </button>

          {/* Keahlian Khusus [K] */}
          <button
            onClick={() => onPlayerAction('SKILL')}
            disabled={p1.skillCooldownRemaining > 0}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex flex-col items-center justify-center active:scale-95 transition-all shadow-lg relative cursor-pointer ${
              p1.skillCooldownRemaining > 0
                ? 'bg-[#0B0A0F] border-[#2D2842] opacity-50 cursor-not-allowed'
                : 'bg-[#6E56CF]/30 border-[#6E56CF] text-[#F4F2F7] hover:bg-[#6E56CF]/40'
            }`}
          >
            <IconLightning size={16} color="#00D2D3" />
            <span className="text-[9px] font-bold mt-0.5">Keahlian</span>
            <span className="text-[8px] text-[#9E98B0]">[K]</span>
            {p1.skillCooldownRemaining > 0 && (
              <span className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center font-bold font-mono text-[11px] text-[#D4AF37]">
                {p1.skillCooldownRemaining.toFixed(1)}s
              </span>
            )}
          </button>

          {/* Jurus Pamungkas (Ultimate) [L] */}
          <button
            onClick={() => onPlayerAction('ULTIMATE')}
            disabled={p1.energy < 100 || p1.ultimateCooldownRemaining > 0}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border flex flex-col items-center justify-center active:scale-95 transition-all shadow-xl relative cursor-pointer ${
              p1.energy >= 100 && p1.ultimateCooldownRemaining <= 0
                ? 'bg-gradient-to-b from-[#FFE484] via-[#D4AF37] to-[#A58019] border-[#FFF099] shadow-[0_0_22px_rgba(212,175,55,0.7)] text-[#0B0A0F] animate-pulse-glow'
                : 'bg-[#181524] border-[#D4AF37]/40 hover:border-[#D4AF37]/70 text-[#F4F2F7] shadow-[0_0_12px_rgba(212,175,55,0.15)] cursor-not-allowed'
            }`}
          >
            <IconFlame
              size={18}
              color={p1.energy >= 100 ? '#0B0A0F' : '#D4AF37'}
              className={p1.energy >= 100 ? 'drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]' : 'drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]'}
            />
            <span
              className={`text-[9px] font-black uppercase font-cinzel mt-0.5 tracking-wider ${
                p1.energy >= 100 ? 'text-[#0B0A0F]' : 'text-[#F4F2F7]'
              }`}
            >
              Pamungkas
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-[8px] font-bold ${p1.energy >= 100 ? 'text-[#0B0A0F]/80' : 'text-[#A09DB5]'}`}>
                [L]
              </span>
              {p1.energy < 100 && (
                <span className="font-mono text-[8px] font-extrabold text-[#D4AF37] bg-[#0B0A0F]/80 px-1 rounded border border-[#D4AF37]/30">
                  {Math.round(p1.energy)}%
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { FighterSimState } from '../types/game';
import { CHARACTERS } from '../config/characters';
import { IconShield, IconLightning, IconSwords } from './SvgIcons';

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
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-30 select-none">
      {/* Top HUD: Health & Energy Bars */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-2 gap-4 sm:gap-8 items-start">
        {/* Player 1 HUD (Left) */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-cinzel font-black text-sm sm:text-base text-[#F4F2F7]">
                {p1Char.name}
              </span>
              <span className="text-[10px] text-[#D4AF37] font-semibold hidden sm:inline">
                ({p1Name})
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#F4F2F7]">
              {p1.hp} / {p1.maxHp}
            </span>
          </div>

          {/* P1 Health Bar */}
          <div className="w-full bg-[#14121D] h-4 rounded-md overflow-hidden border border-[#2D2842] p-0.5">
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
          <div className="w-full bg-[#0B0A0F] h-2 rounded-sm overflow-hidden border border-[#2D2842]/60">
            <div
              className="h-full bg-gradient-to-r from-[#6E56CF] to-[#D4AF37] transition-all duration-300"
              style={{ width: `${p1.energy}%` }}
            />
          </div>

          {/* Buffs / Status Indicators */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {p1.isBlocking && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#3498DB]/20 border border-[#3498DB]/40 text-[#3498DB]">
                Menangkis (Aegis)
              </span>
            )}
            {p1.damageReductionBuff > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2E9E6B]/20 border border-[#2E9E6B]/40 text-[#2E9E6B]">
                Perisai Baja -30%
              </span>
            )}
            {p1.slowTimer > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#9B59B6]/20 border border-[#9B59B6]/40 text-[#9B59B6]">
                Efek Lambat
              </span>
            )}
          </div>
        </div>

        {/* Player 2 HUD (Right) */}
        <div className="space-y-1.5 text-right">
          <div className="flex items-center justify-between flex-row-reverse">
            <div className="flex items-center gap-2 flex-row-reverse">
              <span className="font-cinzel font-black text-sm sm:text-base text-[#F4F2F7]">
                {p2Char.name}
              </span>
              <span className="text-[10px] text-[#D4AF37] font-semibold hidden sm:inline">
                ({p2Name})
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#F4F2F7]">
              {p2.hp} / {p2.maxHp}
            </span>
          </div>

          {/* P2 Health Bar */}
          <div className="w-full bg-[#14121D] h-4 rounded-md overflow-hidden border border-[#2D2842] p-0.5 flex justify-end">
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
          <div className="w-full bg-[#0B0A0F] h-2 rounded-sm overflow-hidden border border-[#2D2842]/60 flex justify-end">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#6E56CF] transition-all duration-300"
              style={{ width: `${p2.energy}%` }}
            />
          </div>

          {/* P2 Status Indicators */}
          <div className="flex items-center justify-end gap-1.5 pt-0.5">
            {p2.isBlocking && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#3498DB]/20 border border-[#3498DB]/40 text-[#3498DB]">
                Menangkis
              </span>
            )}
            {p2.slowTimer > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#9B59B6]/20 border border-[#9B59B6]/40 text-[#9B59B6]">
                Efek Lambat
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Versus Clash Indicator & Exit Button */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <button
          onClick={onExitMatch}
          className="pointer-events-auto px-3 py-1 rounded bg-[#0B0A0F]/80 border border-[#2D2842] text-[#9E98B0] hover:text-white text-xs transition-colors"
        >
          Keluar Laga
        </button>
      </div>

      {/* Bottom Controls / On-Screen Touch Buttons */}
      <div className="w-full max-w-4xl mx-auto flex items-end justify-between gap-4 pointer-events-auto">
        {/* Left Side: Movement Info / D-Pad */}
        <div className="hidden sm:flex items-center gap-2 p-2 rounded-lg bg-[#0B0A0F]/80 border border-[#2D2842] text-[11px] text-[#9E98B0]">
          <span>Gerak: <strong className="text-[#F4F2F7]">A / D</strong></span>
          <span>| Lompat: <strong className="text-[#F4F2F7]">W</strong></span>
          <span>| Tangkis: <strong className="text-[#F4F2F7]">S</strong></span>
        </div>

        {/* Right Side: Action Skills Buttons with Cooldowns */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Tangkis (Block) */}
          <button
            onMouseDown={() => onPlayerAction('BLOCK')}
            onTouchStart={() => onPlayerAction('BLOCK')}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#1F1B2E] border border-[#2D2842] text-[#F4F2F7] flex flex-col items-center justify-center active:scale-95 transition-all shadow-lg"
          >
            <IconShield size={18} color="#3498DB" />
            <span className="text-[10px] font-bold mt-1">Tangkis</span>
            <span className="text-[9px] text-[#9E98B0]">[S]</span>
          </button>

          {/* Serangan Dasar [J] */}
          <button
            onClick={() => onPlayerAction('ATTACK')}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#14121D] border border-[#6E56CF]/60 text-[#F4F2F7] flex flex-col items-center justify-center active:scale-95 transition-all shadow-lg shadow-[#6E56CF]/10"
          >
            <IconSwords size={18} color="#D4AF37" />
            <span className="text-[10px] font-bold mt-1">Pukul</span>
            <span className="text-[9px] text-[#9E98B0]">[J]</span>
          </button>

          {/* Keahlian Khusus [K] */}
          <button
            onClick={() => onPlayerAction('SKILL')}
            disabled={p1.skillCooldownRemaining > 0}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border flex flex-col items-center justify-center active:scale-95 transition-all shadow-lg relative ${
              p1.skillCooldownRemaining > 0
                ? 'bg-[#0B0A0F] border-[#2D2842] opacity-50'
                : 'bg-[#6E56CF]/30 border-[#6E56CF] text-[#F4F2F7] hover:bg-[#6E56CF]/40'
            }`}
          >
            <IconLightning size={18} color="#00D2D3" />
            <span className="text-[10px] font-bold mt-1">Keahlian</span>
            <span className="text-[9px] text-[#9E98B0]">[K]</span>
            {p1.skillCooldownRemaining > 0 && (
              <span className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center font-bold font-mono text-xs text-[#D4AF37]">
                {p1.skillCooldownRemaining.toFixed(1)}s
              </span>
            )}
          </button>

          {/* Jurus Pamungkas (Ultimate) [L] */}
          <button
            onClick={() => onPlayerAction('ULTIMATE')}
            disabled={p1.energy < 100 || p1.ultimateCooldownRemaining > 0}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border flex flex-col items-center justify-center active:scale-95 transition-all shadow-xl relative ${
              p1.energy >= 100 && p1.ultimateCooldownRemaining <= 0
                ? 'btn-gold animate-pulse-glow text-[#0B0A0F]'
                : 'bg-[#0B0A0F] border-[#2D2842] text-[#9E98B0] opacity-50'
            }`}
          >
            <IconLightning size={22} color={p1.energy >= 100 ? '#0B0A0F' : '#9E98B0'} />
            <span className="text-[10px] font-black uppercase font-cinzel mt-1">
              Pamungkas
            </span>
            <span className="text-[9px]">[L]</span>
            {p1.energy < 100 && (
              <span className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center font-bold font-mono text-xs text-[#D4AF37]">
                {Math.round(p1.energy)}%
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ViewMode, PlayerProfile } from '../types/game';
import {
  IconSoundOn,
  IconSoundMute,
  IconSettings,
  IconTemple,
  IconRelicShard,
  IconGemJade
} from './SvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface HeaderProps {
  demoMode: boolean;
  onToggleDemoMode: () => void;
  viewMode?: ViewMode;
  onToggleViewMode?: () => void;
  onOpenGacha: () => void;
  onOpenSettings: () => void;
  onOpenAudit: () => void;
  isAuditActive?: boolean;
  playerProfile: PlayerProfile;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  demoMode,
  onToggleDemoMode,
  onOpenGacha,
  onOpenSettings,
  onOpenAudit,
  isAuditActive = false,
  playerProfile,
  isMuted,
  onToggleMute
}) => {
  return (
    <header className="top-header bg-[#0B0A0F]/95 backdrop-blur-md z-30 shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
      <div className="w-full h-full max-w-[1520px] mx-auto px-6 flex items-center justify-between gap-4">
        {/* Game Title & Sovereign Crest */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#6E56CF] to-[#14121D] p-[1.5px] shadow-[0_0_15px_rgba(110,86,207,0.45)]">
            <div className="w-full h-full bg-[#0B0A0F] rounded-[10px] flex items-center justify-center font-cinzel-decorative font-black text-base text-[#D4AF37] border border-[#D4AF37]/30">
              M
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel-decorative font-black text-lg sm:text-xl tracking-wider gold-title-gradient">
                MYTHOMACHY
              </h1>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/40 shadow-[0_0_8px_rgba(212,175,55,0.2)] font-cinzel">
                Laga Legenda
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#9E98B0] font-medium hidden sm:block">
              Pertarungan Mitologi Multidimensi
            </p>
          </div>
        </div>

        {/* Right Action Controls & Compact Player Badges */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Compact Player Status Badges (Relic & Victories) */}
          <div className="hidden md:flex items-center gap-2 mr-1">
            <div
              className="header-pill bg-[#14121D] border border-[#2D2842] text-xs font-cinzel hover:border-[#D4AF37]/50 transition-colors"
              style={{ padding: '6px 14px' }}
              title="Pecahan Relik Pemain"
            >
              <IconRelicShard size={14} color="#D4AF37" />
              <span className="text-xs font-bold text-[#D4AF37] font-mono">{playerProfile.relicShards}</span>
              <span className="text-[10px] text-[#9E98B0] hidden xl:inline uppercase font-bold">Relik</span>
            </div>

            <div
              className="header-pill bg-[#14121D] border border-[#2D2842] text-xs font-cinzel hover:border-[#2E9E6B]/50 transition-colors"
              style={{ padding: '6px 14px' }}
              title="Total Kemenangan Laga"
            >
              <IconGemJade size={14} color="#2E9E6B" />
              <span className="text-xs font-bold text-[#2E9E6B] font-mono">{playerProfile.victories}</span>
              <span className="text-[10px] text-[#9E98B0] hidden xl:inline uppercase font-bold">Menang</span>
            </div>
          </div>

          {/* Kuil Pemanggilan Button (Prestigious Ornate Gold Frame with Safe Padding) */}
          <button
            onClick={() => {
              soundEngine.playClickSound();
              onOpenGacha();
            }}
            className="header-pill bg-gradient-to-r from-[#D4AF37]/25 via-[#1F1B2E] to-[#6E56CF]/25 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/35 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs font-bold font-cinzel tracking-wider shadow-sm cursor-pointer"
            style={{ padding: '8px 16px' }}
          >
            <IconTemple size={16} color="#D4AF37" />
            <span className="hidden sm:inline">Kuil Pemanggilan</span>
          </button>

          {/* Audit Monad Blockchain Button */}
          <button
            onClick={() => {
              soundEngine.playClickSound();
              onOpenAudit();
            }}
            className={`header-pill border text-xs font-bold font-cinzel transition-all cursor-pointer ${
              isAuditActive
                ? 'bg-[#6E56CF] border-[#9D88F5] text-white shadow-[0_0_14px_rgba(110,86,207,0.6)]'
                : 'bg-[#14121D] border-[#2D2842] text-[#D4AF37] hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/10'
            }`}
            style={{ padding: '8px 14px' }}
            title="Buka Halaman Audit Blockchain & Telemetri Monad"
          >
            <span className="w-2 h-2 rounded-full bg-[#2E9E6B] animate-pulse shrink-0" />
            <span className="hidden sm:inline">Audit Monad</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="w-9 h-9 rounded-xl bg-[#14121D] border border-[#2D2842] text-[#9E98B0] hover:text-[#F4F2F7] hover:border-[#6E56CF] transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          >
            {isMuted ? <IconSoundMute size={16} /> : <IconSoundOn size={16} />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => {
              soundEngine.playClickSound();
              onOpenSettings();
            }}
            className="w-9 h-9 rounded-xl bg-[#14121D] border border-[#2D2842] text-[#9E98B0] hover:text-[#F4F2F7] hover:border-[#6E56CF] transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Pengaturan Game"
          >
            <IconSettings size={16} />
          </button>

          {/* DEMO MODE TOGGLE: Sleek Proportional Pill (OFF BY DEFAULT) */}
          <button
            onClick={onToggleDemoMode}
            className={`header-pill border transition-all cursor-pointer select-none ${
              demoMode
                ? 'bg-[#D4AF37]/15 border-[#D4AF37]/60 text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                : 'bg-[#14121D] border-[#2D2842] text-[#9E98B0] hover:text-[#F4F2F7] hover:border-[#6E56CF]/60'
            }`}
            style={{ padding: '6px 14px' }}
            title="Sakelar Peragaan Panggung (Mode Demo)"
          >
            <div className={`rune-switch-track ${demoMode ? 'active' : ''}`}>
              <div className="rune-switch-knob" />
            </div>
            <span className="text-[11px] font-bold font-cinzel tracking-wider uppercase whitespace-nowrap">
              Mode Demo
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

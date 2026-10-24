import React from 'react';
import { ViewMode, PlayerProfile } from '../types/game';
import {
  IconSoundOn,
  IconSoundMute,
  IconSettings,
  IconTemple,
  IconRelicShard,
  IconTrophy,
  IconEye
} from './SvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface HeaderProps {
  demoMode: boolean;
  onToggleDemoMode: () => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  onOpenGacha: () => void;
  onOpenSettings: () => void;
  playerProfile: PlayerProfile;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  demoMode,
  onToggleDemoMode,
  viewMode,
  onToggleViewMode,
  onOpenGacha,
  onOpenSettings,
  playerProfile,
  isMuted,
  onToggleMute
}) => {
  return (
    <header className="w-full bg-[#0B0A0F]/90 backdrop-blur-md border-b border-[#2D2842] px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Game Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6E56CF] to-[#D4AF37] p-0.5 flex items-center justify-center shadow-lg shadow-[#6E56CF]/20">
            <div className="w-full h-full bg-[#14121D] rounded-[7px] flex items-center justify-center font-cinzel font-black text-sm text-[#D4AF37]">
              M
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel font-extrabold text-base md:text-lg tracking-wider text-[#F4F2F7]">
                MYTHOMACHY
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                Laga Legenda
              </span>
            </div>
            <p className="text-[11px] text-[#9E98B0] hidden sm:block">
              Pertarungan Mitologi Multidimensi
            </p>
          </div>
        </div>

        {/* Center: Player Stats in Natural Game Terminology */}
        <div className="hidden md:flex items-center gap-5 px-4 py-1.5 rounded-lg bg-[#14121D] border border-[#2D2842]">
          <div className="flex items-center gap-2">
            <IconRelicShard size={16} color="#D4AF37" />
            <span className="text-xs text-[#9E98B0]">Pecahan Relik:</span>
            <span className="text-xs font-bold text-[#D4AF37] font-cinzel">
              {playerProfile.relicShards}
            </span>
          </div>
          <div className="h-3 w-px bg-[#2D2842]" />
          <div className="flex items-center gap-2">
            <IconTrophy size={16} color="#2E9E6B" />
            <span className="text-xs text-[#9E98B0]">Kemenangan:</span>
            <span className="text-xs font-bold text-[#2E9E6B] font-cinzel">
              {playerProfile.victories}
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Kuil Pemanggilan Button (Prestigious Gold Border) */}
          <button
            onClick={() => {
              soundEngine.playClickSound();
              onOpenGacha();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37]/20 via-[#1F1B2E] to-[#D4AF37]/15 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/30 hover:shadow-lg hover:shadow-[#D4AF37]/25 hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs font-bold font-cinzel tracking-wider shadow-sm"
          >
            <IconTemple size={16} color="#D4AF37" />
            <span className="hidden sm:inline">Kuil Pemanggilan</span>
          </button>

          {/* 2D / 3D Switcher Button */}
          <button
            onClick={() => {
              soundEngine.playClickSound();
              onToggleViewMode();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              viewMode === '3D'
                ? 'bg-[#6E56CF] border-[#8B74E6] text-white shadow-md shadow-[#6E56CF]/30'
                : 'bg-[#1F1B2E] border-[#D4AF37] text-[#D4AF37]'
            }`}
          >
            <IconEye size={14} />
            <span>Mode {viewMode}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-[#14121D] border border-[#2D2842] text-[#9E98B0] hover:text-[#F4F2F7] hover:border-[#6E56CF] transition-colors"
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
            className="p-2 rounded-lg bg-[#14121D] border border-[#2D2842] text-[#9E98B0] hover:text-[#F4F2F7] hover:border-[#6E56CF] transition-colors"
            title="Pengaturan Game"
          >
            <IconSettings size={16} />
          </button>

          {/* DEMO MODE TOGGLE (OFF BY DEFAULT) */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#2D2842]">
            <label className="flex items-center cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={onToggleDemoMode}
                  className="sr-only"
                />
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${
                    demoMode ? 'bg-[#D4AF37]' : 'bg-[#2D2842]'
                  }`}
                />
                <div
                  className={`dot absolute left-0.5 top-0.5 bg-[#0B0A0F] w-4 h-4 rounded-full transition-transform ${
                    demoMode ? 'transform translate-x-5 bg-white' : ''
                  }`}
                />
              </div>
              <span
                className={`ml-2 text-xs font-bold font-cinzel ${
                  demoMode ? 'text-[#D4AF37]' : 'text-[#9E98B0]'
                } hidden xl:inline`}
              >
                Demo
              </span>
            </label>
          </div>
        </div>
      </div>
    </header>
  );
};

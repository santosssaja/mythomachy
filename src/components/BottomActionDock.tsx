import React from 'react';
import { soundEngine } from '../audio/soundEngine';
import { IconSwords, IconWeaponGlyphLeft, IconWeaponGlyphRight } from './SvgIcons';

interface BottomActionDockProps {
  onLaunchMatch: () => void;
  demoMode: boolean;
  isReady?: boolean;
  selectedChar?: any;
  selectedMap?: any;
  isBotMatch?: boolean;
  botDifficulty?: any;
  currentRoom?: any;
}

export const BottomActionDock: React.FC<BottomActionDockProps> = ({
  onLaunchMatch,
  demoMode,
  isReady = true
}) => {
  return (
    <footer className="flex-shrink-0 w-full bg-[#0B0A0F]/95 backdrop-blur-md border-t border-[#2D2842] px-6 py-3 shadow-[0_-10px_35px_rgba(0,0,0,0.9),0_-2px_15px_rgba(212,175,55,0.25)] z-30 flex items-center justify-center">
      <div className="w-full max-w-[1520px] mx-auto flex items-center justify-center">
        {/* Prominent High-Impact Center Primary CTA Button */}
        <button
          onClick={() => {
            soundEngine.playMatchStartSound();
            onLaunchMatch();
          }}
          className={`w-full sm:w-auto min-w-[340px] md:min-w-[440px] btn-primary-gold px-12 py-3 rounded-xl flex items-center justify-center gap-3.5 transition-all duration-300 group cursor-pointer ${
            isReady
              ? 'shadow-[0_0_30px_rgba(212,175,55,0.55)] hover:shadow-[0_0_42px_rgba(212,175,55,0.85)] hover:scale-[1.02] active:scale-[0.99]'
              : 'opacity-90'
          }`}
        >
          <IconWeaponGlyphLeft
            size={18}
            color="#0B0A0F"
            className="opacity-80 group-hover:-translate-x-1 transition-transform"
          />
          <IconSwords size={20} color="#0B0A0F" />
          <span className="font-cinzel text-sm sm:text-base font-black uppercase tracking-widest text-[#0B0A0F] whitespace-nowrap">
            MASUK ARENA LAGA SEKARANG
          </span>
          <IconWeaponGlyphRight
            size={18}
            color="#0B0A0F"
            className="opacity-80 group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </footer>
  );
};

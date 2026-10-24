import React, { useState, useEffect } from 'react';
import { MapId } from '../types/game';
import { MAP_LIST, getCurrentTimeOfDay } from '../config/maps';
import { soundEngine } from '../audio/soundEngine';

interface MapSelectViewProps {
  selectedMapId: MapId;
  onSelectMap: (id: MapId) => void;
  onOpenHelp: () => void;
}

// Seamless illustrative arena environment graphics (No inner borders or conflicting corner radii)
const renderArenaIllustration = (id: MapId, timePhase: string) => {
  switch (id) {
    case 'monad_sanctum':
      return (
        <div className="w-full h-full bg-gradient-to-b from-[#0B061A] via-[#1A1033] to-[#0D0818]">
          <svg viewBox="0 0 300 135" className="w-full h-full object-cover" preserveAspectRatio="none">
            <defs>
              <radialGradient id="monadGlow" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#6E56CF" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#4A2F8B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0B061A" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="monadPillarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#251A40" />
                <stop offset="50%" stopColor="#3E2E69" />
                <stop offset="100%" stopColor="#1E1435" />
              </linearGradient>
            </defs>
            {/* Ambient Cosmic Core */}
            <circle cx="150" cy="55" r="80" fill="url(#monadGlow)" />
            {/* Stars */}
            <circle cx="45" cy="25" r="1.5" fill="#D4AF37" opacity="0.8" />
            <circle cx="120" cy="18" r="1.2" fill="#FFFFFF" opacity="0.9" />
            <circle cx="210" cy="30" r="1.5" fill="#D4AF37" opacity="0.7" />
            <circle cx="270" cy="20" r="1.2" fill="#A89AE0" opacity="0.9" />
            {/* Monad Celestial Energy Sigil */}
            <polygon points="150,24 168,46 150,68 132,46" fill="none" stroke="#D4AF37" strokeWidth="1.8" opacity="0.95" />
            <polygon points="150,32 161,46 150,60 139,46" fill="#6E56CF" fillOpacity="0.65" />
            {/* Temple Pillars */}
            <rect x="25" y="42" width="16" height="80" fill="url(#monadPillarGrad)" rx="2" />
            <line x1="33" y1="46" x2="33" y2="115" stroke="#6E56CF" strokeWidth="1.5" opacity="0.8" />
            <rect x="259" y="42" width="16" height="80" fill="url(#monadPillarGrad)" rx="2" />
            <line x1="267" y1="46" x2="267" y2="115" stroke="#6E56CF" strokeWidth="1.5" opacity="0.8" />
            {/* Inner smaller pillars */}
            <rect x="65" y="58" width="12" height="64" fill="url(#monadPillarGrad)" opacity="0.8" />
            <rect x="223" y="58" width="12" height="64" fill="url(#monadPillarGrad)" opacity="0.8" />
            {/* Floor Stage with Monad Lines */}
            <polygon points="0,118 300,118 300,135 0,135" fill="#130D23" />
            <line x1="0" y1="118" x2="300" y2="118" stroke="#6E56CF" strokeWidth="1.5" />
            <line x1="75" y1="118" x2="150" y2="135" stroke="#9D88F5" strokeWidth="1" opacity="0.4" />
            <line x1="225" y1="118" x2="150" y2="135" stroke="#9D88F5" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>
      );

    case 'primeval_othrys':
      return (
        <div className="w-full h-full bg-gradient-to-b from-[#091510] via-[#10261C] to-[#0A1611]">
          <svg viewBox="0 0 300 135" className="w-full h-full object-cover" preserveAspectRatio="none">
            <defs>
              <radialGradient id="othrysMoon" cx="70%" cy="30%" r="40%">
                <stop offset="0%" stopColor="#C4E7D4" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#2E9E6B" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#091510" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="treeCanopy" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E5C3E" />
                <stop offset="100%" stopColor="#0B2317" />
              </linearGradient>
            </defs>
            {/* Primordial Moon & Mist */}
            <circle cx="210" cy="38" r="32" fill="url(#othrysMoon)" />
            {/* Background Mountain Peaks */}
            <polygon points="0,95 70,40 150,100" fill="#0C1F17" />
            <polygon points="120,100 190,50 280,105" fill="#0E241B" />
            {/* Massive Ancient Titan Trees */}
            <path d="M30 125 Q40 68 45 38 Q50 68 60 125 Z" fill="#1C3D2D" />
            <ellipse cx="45" cy="35" rx="30" ry="20" fill="url(#treeCanopy)" />
            <path d="M245 125 Q255 62 260 34 Q265 62 275 125 Z" fill="#1C3D2D" />
            <ellipse cx="260" cy="32" rx="32" ry="21" fill="url(#treeCanopy)" />
            {/* Firefly Spirit Motes */}
            <circle cx="95" cy="60" r="2" fill="#58E69E" opacity="0.8" />
            <circle cx="140" cy="50" r="1.5" fill="#58E69E" opacity="0.7" />
            <circle cx="175" cy="72" r="2.2" fill="#58E69E" opacity="0.9" />
            {/* Mossy Stage Floor */}
            <polygon points="0,118 300,118 300,135 0,135" fill="#0A1812" />
            <line x1="0" y1="118" x2="300" y2="118" stroke="#2E9E6B" strokeWidth="1.5" />
          </svg>
        </div>
      );

    case 'chronos_horizon':
      return (
        <div className="w-full h-full bg-gradient-to-b from-[#170E24] via-[#2A1835] to-[#120B1D]">
          <svg viewBox="0 0 300 135" className="w-full h-full object-cover" preserveAspectRatio="none">
            <defs>
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F5D77F" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#170E24" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Dynamic Sun/Moon Celestial Core */}
            <circle cx="150" cy="52" r="44" fill="url(#sunGlow)" />
            <circle cx="150" cy="52" r="15" fill="#FFE484" />
            {/* Celestial Dial & Astrolabe Rings */}
            <circle cx="150" cy="52" r="34" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.85" />
            <circle cx="150" cy="52" r="50" fill="none" stroke="#A89AE0" strokeWidth="1" strokeDasharray="2 4" opacity="0.65" />
            {/* Meridian Lines */}
            <line x1="150" y1="10" x2="150" y2="94" stroke="#D4AF37" strokeWidth="1" opacity="0.6" />
            <line x1="108" y1="52" x2="192" y2="52" stroke="#D4AF37" strokeWidth="1" opacity="0.6" />
            {/* Hourglass Obelisks */}
            <polygon points="35,38 48,65 35,92 55,92 42,65 55,38" fill="#2E2042" stroke="#D4AF37" strokeWidth="1" />
            <polygon points="245,38 258,65 245,92 265,92 252,65 265,38" fill="#2E2042" stroke="#D4AF37" strokeWidth="1" />
            {/* Stage Horizon Floor */}
            <polygon points="0,118 300,118 300,135 0,135" fill="#140D21" />
            <line x1="0" y1="118" x2="300" y2="118" stroke="#D4AF37" strokeWidth="1.5" />
          </svg>
        </div>
      );
  }
};

export const MapSelectView: React.FC<MapSelectViewProps> = ({
  selectedMapId,
  onSelectMap,
  onOpenHelp
}) => {
  const [clock, setClock] = useState(getCurrentTimeOfDay());

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(getCurrentTimeOfDay());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="card-surface p-5 sm:p-6 flex-1 min-h-0 flex flex-col justify-start space-y-4 text-left shadow-2xl overflow-hidden">
      {/* Header Bar with Generous Padding */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2D2842] pb-3.5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <h3 className="font-cinzel font-bold text-lg text-[#F4F2F7]">
            PEMILIHAN MEDAN PERTARUNGAN
          </h3>
          <button
            onClick={onOpenHelp}
            className="btn-help"
            title="Panduan Pemilihan Medan"
          >
            ?
          </button>
        </div>
        <div className="text-xs text-[#D4AF37] font-cinzel font-bold tracking-wider">
          3 Medan Laga Suci Tersedia
        </div>
      </div>

      {/* 3 Map Cards with Seamless Integrated Artworks & No Text Touching Borders */}
      <div className="card-grid-container grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0 overflow-y-auto pr-2">
        {MAP_LIST.map(m => {
          const isSelected = selectedMapId === m.id;
          const extraTimeTag =
            m.id === 'chronos_horizon'
              ? ` (${clock.timeStr} WIB - ${clock.phase})`
              : '';

          return (
            <div
              key={m.id}
              onClick={() => {
                soundEngine.playClickSound();
                onSelectMap(m.id);
              }}
              className={`stage-card group ${isSelected ? 'active' : ''}`}
            >
              {/* Seamless Integrated Arena Illustration at Top */}
              <div className="stage-card-illustration">
                {renderArenaIllustration(m.id, clock.phase)}
              </div>

              {/* Card Body with Generous Internal Padding (Text Never Touches Borders) */}
              <div className="stage-card-body">
                <div>
                  <h4 className="font-cinzel font-bold text-base text-[#F4F2F7] group-hover:text-[#D4AF37] transition-colors tracking-wide">
                    {m.name}
                  </h4>
                  <p className="text-[11px] text-[#D4AF37] font-semibold mt-0.5 mb-1.5">
                    {m.subtitle}
                    {extraTimeTag}
                  </p>
                  <p className="text-xs text-[#9E98B0] leading-relaxed line-clamp-3">
                    {m.description}
                  </p>
                </div>

                {/* Clean Stage Footer (Right-Aligned Status Badge) */}
                <div className="stage-card-footer">
                  {isSelected ? (
                    <span className="px-3.5 py-1 rounded-md bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-cinzel font-bold text-xs tracking-wider shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                      TERPILIH
                    </span>
                  ) : (
                    <span className="px-3.5 py-1 rounded-md bg-[#1F1B2E] border border-[#2D2842] text-[#9E98B0] group-hover:text-white group-hover:border-[#6E56CF] font-cinzel font-bold text-xs tracking-wider transition-colors">
                      PILIH MEDAN
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
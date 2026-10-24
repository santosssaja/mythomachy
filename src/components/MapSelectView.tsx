import React, { useState, useEffect } from 'react';
import { MapId } from '../types/game';
import { MAPS, MAP_LIST, getCurrentTimeOfDay } from '../config/maps';
import { IconClock } from './SvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface MapSelectViewProps {
  selectedMapId: MapId;
  onSelectMap: (id: MapId) => void;
  onOpenHelp: () => void;
}

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
    <div className="w-full space-y-3 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] font-cinzel">
            Pemilihan Peta Arena
          </h3>
          <button
            onClick={onOpenHelp}
            className="help-btn"
            title="Bantuan Pemilihan Peta"
          >
            ?
          </button>
        </div>
        <span className="text-xs text-[#9E98B0]">3 Medan Laga Berbeda</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {MAP_LIST.map(m => {
          const isSelected = selectedMapId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                soundEngine.playClickSound();
                onSelectMap(m.id);
              }}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-[#1F1B2E] to-[#14121D] border-[#D4AF37] shadow-xl shadow-[#6E56CF]/15 ring-1 ring-[#D4AF37]'
                  : 'bg-[#14121D]/80 border-[#2D2842] hover:border-[#6E56CF]/50'
              }`}
            >
              {/* Top Bar inside card */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${m.themeColor}20`,
                      color: m.themeColor,
                      border: `1px solid ${m.themeColor}40`
                    }}
                  >
                    {m.subtitle}
                  </span>

                  {m.id === 'chronos_horizon' && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#2E9E6B]/15 border border-[#2E9E6B]/30 text-[#2E9E6B] text-[10px] font-mono">
                      <IconClock size={12} color="#2E9E6B" />
                      <span>{clock.timeStr} ({clock.phase})</span>
                    </div>
                  )}
                </div>

                <h4 className="font-cinzel font-bold text-base text-[#F4F2F7]">
                  {m.name}
                </h4>
                <p className="text-xs text-[#9E98B0] mt-1.5 leading-relaxed">
                  {m.description}
                </p>
              </div>

              {/* Status indicator */}
              <div className="mt-4 pt-2 border-t border-[#2D2842]/60 flex items-center justify-between text-[11px]">
                <span className="text-[#9E98B0]">
                  {m.hasForegroundObstacles ? 'Pohon Transparan Aktif' : 'Monolit Terapung Ungu'}
                </span>
                <span className={`font-bold font-cinzel ${isSelected ? 'text-[#D4AF37]' : 'text-[#9E98B0]'}`}>
                  {isSelected ? 'Dipilih' : 'Pilih Peta'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { MapId } from '../types/game';
import { MAPS, MAP_LIST, getCurrentTimeOfDay } from '../config/maps';
import { IconClock, IconSwords } from './SvgIcons';
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
    <div className="w-full space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2D2842]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#6E56CF]/20 border border-[#6E56CF]/40 text-[#D4AF37]">
            <IconSwords size={20} color="#D4AF37" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#F4F2F7] font-cinzel">
                Pemilihan Medan Laga
              </h3>
              <button
                onClick={onOpenHelp}
                className="help-btn"
                title="Bantuan Pemilihan Peta"
              >
                ?
              </button>
            </div>
            <p className="text-xs text-[#9E98B0]">
              Pilih atmosfer arena tempur dengan kondisi visual dan efek lingkungan dinamis
            </p>
          </div>
        </div>
        <span className="text-xs text-[#9E98B0] self-start sm:self-auto">
          3 Medan Laga Berbeda
        </span>
      </div>

      {/* 3 Map Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MAP_LIST.map(m => {
          const isSelected = selectedMapId === m.id;
          return (
            <div
              key={m.id}
              onClick={() => {
                soundEngine.playClickSound();
                onSelectMap(m.id);
              }}
              className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'bg-gradient-to-b from-[#1F1B2E] to-[#14121D] border-[#D4AF37] shadow-xl shadow-[#6E56CF]/20 ring-1 ring-[#D4AF37]'
                  : 'bg-[#14121D] border-[#2D2842] hover:border-[#6E56CF]/60 hover:-translate-y-1'
              }`}
              style={{ minHeight: '220px' }}
            >
              {/* Top Bar inside card */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded"
                    style={{
                      backgroundColor: `${m.themeColor}20`,
                      color: m.themeColor,
                      border: `1px solid ${m.themeColor}40`
                    }}
                  >
                    {m.subtitle}
                  </span>

                  {m.id === 'chronos_horizon' && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2E9E6B]/15 border border-[#2E9E6B]/40 text-[#2E9E6B] text-[10px] font-mono">
                      <IconClock size={12} color="#2E9E6B" />
                      <span>{clock.timeStr} ({clock.phase})</span>
                    </div>
                  )}
                </div>

                <h4 className="font-cinzel font-bold text-base sm:text-lg text-[#F4F2F7]">
                  {m.name}
                </h4>
                <p className="text-xs text-[#9E98B0] mt-2 leading-relaxed">
                  {m.description}
                </p>
              </div>

              {/* Status indicator with clean divider */}
              <div className="mt-5 pt-3 border-t border-[#2D2842] flex items-center justify-between text-xs">
                <span className="text-[#9E98B0] text-[11px]">
                  {m.hasForegroundObstacles ? 'Pohon Transparan Aktif' : 'Monolit Kristal Ungu'}
                </span>
                <span className={`font-bold font-cinzel text-xs ${isSelected ? 'text-[#D4AF37]' : 'text-[#9E98B0] group-hover:text-white'}`}>
                  {isSelected ? 'DIPILIH' : 'PILIH PETA'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { GraphicsPreset, ViewMode } from '../types/game';
import { IconClose, IconSettings, IconSoundOn, IconSoundMute, IconEye } from './SvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: GraphicsPreset;
  onSelectPreset: (p: GraphicsPreset) => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHelp: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preset,
  onSelectPreset,
  viewMode,
  onToggleViewMode,
  isMuted,
  onToggleMute,
  onOpenHelp
}) => {
  if (!isOpen) return null;

  const presets: { id: GraphicsPreset; label: string; desc: string }[] = [
    { id: 'low', label: 'Ringan', desc: 'Performa maksimal tanpa bayangan, cocok untuk perangkat hemat daya (0.75x)' },
    { id: 'medium', label: 'Seimbang', desc: 'Keseimbangan grafis dan kecepatan optimal (1.0x)' },
    { id: 'high', label: 'Tinggi', desc: 'Bayangan halus dan partikel lengkap berkualitas tinggi' },
    { id: 'ultra', label: 'Efek Maksimal', desc: 'Pencahayaan penuh, efek cincin energi, partikel tebal resolusi asli' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg modal-container panel-frame rounded-2xl border gold-border text-left shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D2842]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#6E56CF]/20 border border-[#6E56CF]/40 text-[#D4AF37]">
              <IconSettings size={20} color="#D4AF37" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#F4F2F7] font-cinzel">
                  Pengaturan & Grafis
                </h3>
                <button
                  onClick={onOpenHelp}
                  className="help-btn-ornate"
                  title="Bantuan Pengaturan Grafis"
                >
                  ?
                </button>
              </div>
              <p className="text-xs text-[#9E98B0]">
                Sesuaikan mode kamera visual dan kualitas performa game
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#9E98B0] hover:text-white hover:bg-[#1F1B2E] transition-colors"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 text-sm">
          {/* View Mode 2D / 3D */}
          <div className="setting-row bg-[#0B0A0F]/70 border border-[#2D2842] flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-[#F4F2F7] block text-sm">Sudut Pandang Kamera</span>
              <span className="text-xs text-[#9E98B0] mt-0.5 block">
                Beralih bebas antara perspektif 3D dinamis atau 2D samping
              </span>
            </div>
            <button
              onClick={() => {
                soundEngine.playClickSound();
                onToggleViewMode();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-xs font-bold shrink-0"
            >
              <IconEye size={15} />
              <span>Mode {viewMode}</span>
            </button>
          </div>

          {/* Audio Mute */}
          <div className="setting-row bg-[#0B0A0F]/70 border border-[#2D2842] flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-[#F4F2F7] block text-sm">Efek Suara (SFX)</span>
              <span className="text-xs text-[#9E98B0] mt-0.5 block">
                Aktifkan suara benturan serangan, jurus, dan interaksi menu
              </span>
            </div>
            <button
              onClick={onToggleMute}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                isMuted
                  ? 'bg-[#14121D] border-[#2D2842] text-[#9E98B0]'
                  : 'bg-[#2E9E6B]/20 border-[#2E9E6B] text-[#2E9E6B]'
              }`}
            >
              {isMuted ? <IconSoundMute size={15} /> : <IconSoundOn size={15} />}
              <span>{isMuted ? 'Mati' : 'Aktif'}</span>
            </button>
          </div>

          {/* Graphics Presets */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] block font-cinzel">
              Kualitas Grafis:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map(p => {
                const active = preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      soundEngine.playClickSound();
                      onSelectPreset(p.id);
                    }}
                    className={`graphics-card border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-[#6E56CF]/20 border-[#D4AF37] text-white shadow-lg shadow-[#6E56CF]/20'
                        : 'bg-[#14121D] border-[#2D2842] text-[#9E98B0] hover:border-[#6E56CF]/40'
                    }`}
                  >
                    <span className="font-bold text-sm block font-cinzel text-[#F4F2F7]">
                      {p.label}
                    </span>
                    <span className="text-[11px] text-[#9E98B0] line-clamp-2 mt-1">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#2D2842] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl btn-primary text-xs uppercase tracking-wider font-cinzel font-bold shadow-md cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

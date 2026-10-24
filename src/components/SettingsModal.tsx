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
      <div className="relative w-full max-w-lg panel-frame p-6 rounded-2xl border gold-border text-left shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D2842]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#6E56CF]/20 border border-[#6E56CF]/40 text-[#D4AF37]">
              <IconSettings size={20} color="#D4AF37" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#F4F2F7] font-cinzel">
                  Pengaturan & Grafis
                </h3>
                <button
                  onClick={onOpenHelp}
                  className="help-btn"
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
            className="p-1.5 rounded-lg text-[#9E98B0] hover:text-white hover:bg-[#1F1B2E] transition-colors"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="py-5 space-y-5 text-sm">
          {/* View Mode 2D / 3D */}
          <div className="p-4 rounded-xl bg-[#0B0A0F]/70 border border-[#2D2842] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#F4F2F7] block">Sudut Pandang Kamera</span>
              <span className="text-xs text-[#9E98B0]">
                Beralih bebas antara perspektif 3D atau tampilan samping datar 2D
              </span>
            </div>
            <button
              onClick={() => {
                soundEngine.playClickSound();
                onToggleViewMode();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-xs font-bold"
            >
              <IconEye size={15} />
              <span>Mode {viewMode}</span>
            </button>
          </div>

          {/* Audio Mute */}
          <div className="p-4 rounded-xl bg-[#0B0A0F]/70 border border-[#2D2842] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#F4F2F7] block">Efek Suara Sintetis</span>
              <span className="text-xs text-[#9E98B0]">
                Synthesizer Web Audio API tanpa perlu file eksternal
              </span>
            </div>
            <button
              onClick={onToggleMute}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all ${
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
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] block font-cinzel">
              Kualitas Grafis:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map(p => {
                const active = preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      soundEngine.playClickSound();
                      onSelectPreset(p.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
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
            className="px-6 py-2 rounded-lg btn-primary text-xs uppercase tracking-wider font-cinzel"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

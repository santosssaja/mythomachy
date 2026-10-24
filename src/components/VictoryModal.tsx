import React from 'react';
import { CharacterDef } from '../types/game';
import { IconTrophy, IconSwords, IconRelicShard, IconRefresh } from './SvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface VictoryModalProps {
  winnerId: string; // 'player1' or 'player2'
  winnerName: string;
  winnerChar: CharacterDef;
  isP1Winner: boolean;
  onReturnToLobby: () => void;
  onRematch?: () => void;
  relicsAwarded: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winnerName,
  winnerChar,
  isP1Winner,
  onReturnToLobby,
  onRematch,
  relicsAwarded
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className={`result-modal ${isP1Winner ? 'border-[#D4AF37]/50 shadow-[0_0_35px_rgba(212,175,55,0.25)]' : 'border-[#D9383A]/40 shadow-[0_0_35px_rgba(217,56,58,0.2)]'}`}>
        {/* 1. Centered Heraldic Crest / Trophy Badge */}
        <div className={`result-icon-badge ${!isP1Winner ? 'defeat' : ''}`}>
          {isP1Winner ? (
            <IconTrophy size={34} color="#D4AF37" />
          ) : (
            <IconSwords size={30} color="#D9383A" />
          )}
        </div>

        {/* 2. Structured Information Hierarchy */}
        <div>
          <span
            className={`text-xs uppercase font-bold tracking-widest block font-cinzel ${
              isP1Winner ? 'text-[#D4AF37]' : 'text-[#D9383A]'
            }`}
          >
            Pertarungan Selesai
          </span>

          <h2
            className={`text-3xl sm:text-4xl font-black font-cinzel tracking-wider my-1.5 ${
              isP1Winner ? 'gold-title-gradient' : 'text-[#F4F2F7]'
            }`}
          >
            {isP1Winner ? 'KEMENANGAN' : 'KEKALAHAN'}
          </h2>

          <p className="result-subtitle text-xs sm:text-sm text-[#A0A0B8] max-w-sm mx-auto leading-relaxed">
            {isP1Winner ? (
              'Anda berhasil menundukkan lawan dan membuktikan keperkasaan legenda!'
            ) : (
              <>
                <strong className="text-white font-bold">{winnerName}</strong> menguasai laga menggunakan <strong className="text-[#D4AF37] font-bold">{winnerChar.name}</strong> ({winnerChar.origin}).
              </>
            )}
          </p>
        </div>

        {/* 3. Reward / Tactical Settlement Banner */}
        {isP1Winner ? (
          <div className="w-full box-border p-4 rounded-xl bg-[#0B0A0F]/80 border border-[#D4AF37]/40 flex items-center justify-center gap-3.5 mb-4 shadow-inner">
            <IconRelicShard size={26} color="#D4AF37" />
            <div className="text-left">
              <span className="text-[10px] text-[#9E98B0] uppercase font-bold tracking-wider block">
                Hadiah Kemenangan Laga:
              </span>
              <span className="font-bold text-sm text-[#D4AF37] font-cinzel">
                +{relicsAwarded} Pecahan Relik Diperoleh
              </span>
            </div>
          </div>
        ) : (
          <div className="result-tip-box">
            <span className="block text-center leading-relaxed">
              Tetap asah reflek penangkisan dan lancarkan serangan balasan pada laga berikutnya.
            </span>
          </div>
        )}

        {/* 4. Action Buttons Area: Rematch (Primary) + Back to Lobby (Secondary) */}
        <div
          className="result-actions"
          style={!onRematch ? { gridTemplateColumns: '1fr' } : undefined}
        >
          {onRematch && (
            <button
              onClick={() => {
                soundEngine.playClickSound();
                onRematch();
              }}
              className="btn-rematch"
            >
              <IconRefresh size={16} color="#0B0A0F" />
              <span>TANDING ULANG</span>
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playClickSound();
              onReturnToLobby();
            }}
            className="btn-lobby"
          >
            <span>KE RUANG TUNGGU</span>
          </button>
        </div>
      </div>
    </div>
  );
};

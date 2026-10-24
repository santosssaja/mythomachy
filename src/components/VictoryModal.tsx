import React from 'react';
import { CharacterDef } from '../types/game';
import { IconTrophy, IconRelicShard } from './SvgIcons';

interface VictoryModalProps {
  winnerId: string; // 'player1' or 'player2'
  winnerName: string;
  winnerChar: CharacterDef;
  isP1Winner: boolean;
  onReturnToLobby: () => void;
  relicsAwarded: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winnerName,
  winnerChar,
  isP1Winner,
  onReturnToLobby,
  relicsAwarded
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md panel-frame p-6 sm:p-8 rounded-2xl border gold-border text-center shadow-2xl space-y-5">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#6E56CF] p-1 flex items-center justify-center shadow-xl shadow-[#D4AF37]/30">
          <div className="w-full h-full bg-[#14121D] rounded-full flex items-center justify-center">
            <IconTrophy size={32} color="#D4AF37" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">
            {isP1Winner ? 'Kemenangan Mutlak!' : 'Pertarungan Selesai'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#F4F2F7] font-cinzel">
            {winnerName}
          </h2>
          <p className="text-xs text-[#9E98B0]">
            Menguasai laga menggunakan legenda <strong className="text-[#F4F2F7]">{winnerChar.name}</strong> ({winnerChar.origin})
          </p>
        </div>

        {isP1Winner && (
          <div className="p-4 rounded-xl bg-[#0B0A0F]/80 border border-[#2D2842] flex items-center justify-center gap-3">
            <IconRelicShard size={24} color="#D4AF37" />
            <div className="text-left">
              <span className="text-[11px] text-[#9E98B0] block">Hadiah Kemenangan Laga:</span>
              <span className="font-bold text-sm text-[#D4AF37] font-cinzel">
                +{relicsAwarded} Pecahan Relik Diperoleh
              </span>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-[#2D2842]">
          <button
            onClick={onReturnToLobby}
            className="w-full py-3.5 rounded-xl btn-gold text-xs font-black font-cinzel shadow-lg"
          >
            Kembali ke Ruang Tunggu
          </button>
        </div>
      </div>
    </div>
  );
};

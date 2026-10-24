import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { PlayerProfile, SummonResult, CharacterDef } from '../types/game';
import { executeSummonApexLegend } from '../services/monadRpc';
import { APEX_CHARACTERS } from '../config/characters';
import { soundEngine } from '../audio/soundEngine';
import {
  IconClose,
  IconTemple,
  IconRelicShard,
  IconCheck,
  IconLock
} from './SvgIcons';

interface GachaTempleModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onProfileUpdated: (p: PlayerProfile) => void;
  onOpenHelp: () => void;
  demoMode: boolean;
}

export const GachaTempleModal: React.FC<GachaTempleModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onProfileUpdated,
  onOpenHelp,
  demoMode
}) => {
  const [summoning, setSummoning] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'charging' | 'revealed'>('idle');
  const [lastResult, setLastResult] = useState<SummonResult | null>(null);

  if (!isOpen) return null;

  const handleSummon = async () => {
    soundEngine.playClickSound();
    setSummoning(true);
    setAnimationPhase('charging');
    soundEngine.playGachaSummonChimes(false);

    try {
      const res = await executeSummonApexLegend();
      
      // Delay for dramatic visual & audio climax
      setTimeout(() => {
        setAnimationPhase('revealed');
        setLastResult(res);
        setSummoning(false);
        soundEngine.playGachaSummonChimes(res.isNewLegend);

        if (res.isNewLegend) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#6E56CF', '#2E9E6B', '#FFFFFF']
          });
        }

        onProfileUpdated({
          ...playerProfile,
          unlockedMask: res.updatedMask,
          pityCounter: res.isNewLegend ? 0 : (playerProfile.pityCounter + 1) % 4,
          relicShards: res.totalRelicShards
        });
      }, 1400);
    } catch {
      setSummoning(false);
      setAnimationPhase('idle');
    }
  };

  const isApexUnlocked = (char: CharacterDef) => {
    if (demoMode) return true;
    return (playerProfile.unlockedMask & (1 << char.numericId)) !== 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl panel-frame p-6 sm:p-8 rounded-2xl border gold-border text-left shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D2842] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#6E56CF]/20 border border-[#6E56CF]/40 text-[#D4AF37]">
              <IconTemple size={22} color="#D4AF37" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-[#F4F2F7] font-cinzel">
                  Kuil Pemanggilan Legenda
                </h2>
                <button
                  onClick={onOpenHelp}
                  className="help-btn"
                  title="Bantuan Kuil Pemanggilan"
                >
                  ?
                </button>
              </div>
              <p className="text-xs text-[#9E98B0]">
                Bangkitkan 3 Penguasa Puncak Abadi dengan Sistem Jaminan Pasti
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

        {/* Content Body */}
        <div className="py-6 overflow-y-auto space-y-6 flex-grow">
          {/* Pity Progress Indicator & Relic Shards Counter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pity Progress */}
            <div className="p-4 rounded-xl bg-[#0B0A0F]/80 border border-[#2D2842] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-[#9E98B0] font-semibold">
                  Jaminan Legenda Puncak:
                </span>
                <span className="text-xs font-bold text-[#D4AF37] font-cinzel">
                  Tarikan ke-{playerProfile.pityCounter + 1} dari 4
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-[#1F1B2E] h-2.5 rounded-full overflow-hidden border border-[#2D2842]">
                <div
                  className="h-full bg-gradient-to-r from-[#6E56CF] to-[#D4AF37] transition-all duration-500 rounded-full"
                  style={{ width: `${((playerProfile.pityCounter) / 4) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-[#9E98B0] mt-2">
                Pasti mendapatkan karakter baru pada tarikan ke-4 jika belum diperoleh.
              </span>
            </div>

            {/* Relic Shards */}
            <div className="p-4 rounded-xl bg-[#0B0A0F]/80 border border-[#2D2842] flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#9E98B0] font-semibold block mb-1">
                  Pecahan Relik Dimiliki:
                </span>
                <div className="flex items-center gap-2">
                  <IconRelicShard size={22} color="#D4AF37" />
                  <span className="text-xl font-black text-[#D4AF37] font-cinzel">
                    {playerProfile.relicShards}
                  </span>
                  <span className="text-xs text-[#9E98B0]">/ 75 untuk tukar otomatis</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Apex Sovereign Legends Showcase */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-3 font-cinzel">
              Legenda Penguasa Puncak:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {APEX_CHARACTERS.map(char => {
                const unlocked = isApexUnlocked(char);
                return (
                  <div
                    key={char.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      unlocked
                        ? 'bg-[#1F1B2E]/90 border-[#D4AF37]/50 shadow-md shadow-[#D4AF37]/10'
                        : 'bg-[#14121D]/70 border-[#2D2842] opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                        {char.origin}
                      </span>
                      {unlocked ? (
                        <span className="flex items-center gap-1 text-[11px] text-[#2E9E6B] font-bold">
                          <IconCheck size={14} color="#2E9E6B" /> Terbuka
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-[#9E98B0]">
                          <IconLock size={14} /> Terkunci
                        </span>
                      )}
                    </div>

                    <h4 className="font-cinzel font-bold text-sm text-[#F4F2F7]">
                      {char.name}
                    </h4>
                    <p className="text-[11px] text-[#9E98B0] mt-0.5 mb-2 line-clamp-1">
                      {char.title}
                    </p>

                    <div className="text-[11px] space-y-1 bg-[#0B0A0F]/60 p-2 rounded-lg border border-[#2D2842]/60">
                      <div className="flex justify-between">
                        <span className="text-[#9E98B0]">Vitalitas:</span>
                        <span className="font-bold text-[#F4F2F7]">{char.maxHp} HP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9E98B0]">Pukulan Dasar:</span>
                        <span className="font-bold text-[#D4AF37]">{char.basicAttack.damage} Dmg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9E98B0]">Jurus Pamungkas:</span>
                        <span className="font-bold text-[#D9383A]">{char.ultimate.damage} Dmg</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summon Animation / Result Stage */}
          {animationPhase === 'charging' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 bg-[#6E56CF]/10 rounded-xl border border-[#6E56CF]/40 animate-pulse">
              <div className="w-16 h-16 rounded-full border-4 border-[#D4AF37] border-t-transparent animate-spin flex items-center justify-center">
                <IconTemple size={28} color="#D4AF37" />
              </div>
              <p className="font-cinzel text-sm font-bold text-[#D4AF37] tracking-wider uppercase">
                Membuka Gerbang Dimensi Purba...
              </p>
              <span className="text-xs text-[#9E98B0]">
                Menyelaraskan energi relik kecepatan kilat (&lt;600ms)
              </span>
            </div>
          )}

          {animationPhase === 'revealed' && lastResult && (
            <div
              className={`p-5 rounded-xl border text-center space-y-2 animate-scale-up ${
                lastResult.isNewLegend
                  ? 'bg-gradient-to-b from-[#D4AF37]/20 to-[#1F1B2E] border-[#D4AF37] shadow-xl shadow-[#D4AF37]/20'
                  : 'bg-[#14121D] border-[#6E56CF]/40'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37] block">
                {lastResult.isNewLegend ? 'Legenda Penguasa Puncak Terbuka!' : 'Energi Relik Diperoleh'}
              </span>

              <h3 className="font-cinzel text-xl sm:text-2xl font-black text-[#F4F2F7]">
                {lastResult.character.name}
              </h3>
              <p className="text-xs text-[#D4AF37] font-semibold">
                {lastResult.character.title}
              </p>

              <p className="text-xs text-[#9E98B0] max-w-md mx-auto pt-1">
                {lastResult.isNewLegend
                  ? `Selamat! Karakter ${lastResult.character.name} kini resmi terbuka dan dapat Anda gunakan di semua arena laga.`
                  : `Anda memperoleh +25 Pecahan Relik (Total: ${lastResult.totalRelicShards}). Tarikan berikutnya semakin mendekati jaminan legenda!`}
              </p>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-[#2D2842] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <span className="text-xs text-[#9E98B0]">
            Peluang dasar: 35% | Jaminan Pasti: Tarikan ke-4 atau 75 Pecahan Relik
          </span>

          <button
            onClick={handleSummon}
            disabled={summoning}
            className="w-full sm:w-auto px-8 py-3 rounded-xl btn-gold text-sm font-black font-cinzel shadow-xl"
          >
            {summoning ? 'Memanggil...' : 'Lakukan Pemanggilan'}
          </button>
        </div>
      </div>
    </div>
  );
};

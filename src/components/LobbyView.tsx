import React, { useState, useEffect } from 'react';
import { MapId, RoomInfo, AIDifficulty, CharacterId } from '../types/game';
import { getPublicRooms, createNewRoom, getJoinRoomUrl } from '../services/roomService';
import { QRCodeSvg } from './QRCodeSvg';
import {
  IconSwords,
  IconBot,
  IconUser,
  IconQrCode,
  IconCopy,
  IconCheck
} from './SvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface LobbyViewProps {
  selectedMapId: MapId;
  selectedCharId: CharacterId;
  demoMode: boolean;
  onStartMatchVsBot: (difficulty: AIDifficulty) => void;
  onStartMatchVsPlayer: (room: RoomInfo) => void;
  onOpenHelp: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  selectedMapId,
  selectedCharId,
  demoMode,
  onStartMatchVsBot,
  onStartMatchVsPlayer,
  onOpenHelp
}) => {
  const [activeTab, setActiveTab] = useState<'bot' | 'pvp'>('bot');
  const [botDifficulty, setBotDifficulty] = useState<AIDifficulty>('medium');
  const [publicRooms, setPublicRooms] = useState<RoomInfo[]>([]);
  const [createdRoom, setCreatedRoom] = useState<RoomInfo | null>(null);
  const [roomType, setRoomType] = useState<'public' | 'private'>('public');
  const [customRoomCode, setCustomRoomCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setPublicRooms(getPublicRooms());
    if (demoMode) {
      setCustomRoomCode('BLITZ8');
    }
  }, [demoMode]);

  const handleCreateRoom = () => {
    soundEngine.playClickSound();
    const code = demoMode && !customRoomCode ? 'BLITZ8' : customRoomCode || undefined;
    const room = createNewRoom(selectedMapId, roomType === 'private', code);
    setCreatedRoom(room);
    setPublicRooms(getPublicRooms());
  };

  const handleCopyLink = () => {
    if (!createdRoom) return;
    const url = getJoinRoomUrl(createdRoom.code);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full panel-frame p-6 sm:p-8 rounded-2xl border gold-border text-left space-y-6">
      {/* Lobby Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2D2842]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#6E56CF]/20 border border-[#6E56CF]/40 text-[#D4AF37]">
            <IconSwords size={24} color="#D4AF37" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#F4F2F7] font-cinzel">
                Ruang Tunggu & Mode Pertandingan
              </h2>
              <button
                onClick={onOpenHelp}
                className="help-btn"
                title="Bantuan Ruang Tunggu"
              >
                ?
              </button>
            </div>
            <p className="text-xs text-[#9E98B0]">
              Pilih bertarung melawan kecerdasan bot cerdas atau tantang ksatria lain secara langsung
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 bg-[#0B0A0F] p-1 rounded-xl border border-[#2D2842]">
          <button
            onClick={() => {
              soundEngine.playClickSound();
              setActiveTab('bot');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bot'
                ? 'bg-[#6E56CF] text-white shadow-md shadow-[#6E56CF]/40'
                : 'text-[#9E98B0] hover:text-[#F4F2F7]'
            }`}
          >
            <IconBot size={16} />
            <span>Lawan Bot</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClickSound();
              setActiveTab('pvp');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pvp'
                ? 'bg-[#6E56CF] text-white shadow-md shadow-[#6E56CF]/40'
                : 'text-[#9E98B0] hover:text-[#F4F2F7]'
            }`}
          >
            <IconUser size={16} />
            <span>Lawan Pemain</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Bot Mythomachy State Machine AI */}
      {activeTab === 'bot' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] block font-cinzel">
              Tingkat Kesulitan Bot Cerdas:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  { id: 'easy', label: 'Santai', desc: 'Cocok untuk pemula mengenal kombo dan jurus, reflek santai' },
                  { id: 'medium', label: 'Taktis', desc: 'Menjaga jarak, menangkis serangan berat, dan memanfaatkan jeda keahlian' },
                  { id: 'hard', label: 'Legenda', desc: 'Reflek sempurna, kombo beruntun mematikan, jurus pamungkas instan' }
                ] as const
              ).map(d => {
                const isSelected = botDifficulty === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      soundEngine.playClickSound();
                      setBotDifficulty(d.id);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#6E56CF]/20 border-[#D4AF37] text-white shadow-lg shadow-[#6E56CF]/25 ring-1 ring-[#D4AF37]'
                        : 'bg-[#14121D] border-[#2D2842] text-[#9E98B0] hover:border-[#6E56CF]/40'
                    }`}
                  >
                    <span className="font-bold text-sm block font-cinzel text-[#F4F2F7]">
                      {d.label}
                    </span>
                    <span className="text-xs text-[#9E98B0] block mt-1">
                      {d.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0A0F]/70 border border-[#2D2842] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#F4F2F7] block">
                Pertarungan Latihan Mandiri Tanpa Antrean
              </span>
              <p className="text-xs text-[#9E98B0]">
                Tersedia hadiah 15 Pecahan Relik setiap memenangkan pertandingan.
              </p>
            </div>
            <button
              onClick={() => {
                soundEngine.playClickSound();
                onStartMatchVsBot(botDifficulty);
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl btn-primary text-sm font-black font-cinzel shadow-xl shadow-[#6E56CF]/30"
            >
              Mulai Laga vs Bot
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Multi-Device Waiting Room (Public/Private + QR Code) */}
      {activeTab === 'pvp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Room Form */}
            <div className="p-5 rounded-xl bg-[#0B0A0F]/80 border border-[#2D2842] space-y-4">
              <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#D4AF37]">
                Buat Ruang Tunggu Baru
              </h3>

              {/* Type Switcher */}
              <div className="flex gap-3">
                <button
                  onClick={() => setRoomType('public')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    roomType === 'public'
                      ? 'bg-[#6E56CF]/30 border-[#6E56CF] text-white'
                      : 'bg-[#14121D] border-[#2D2842] text-[#9E98B0]'
                  }`}
                >
                  Ruang Publik
                </button>
                <button
                  onClick={() => setRoomType('private')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    roomType === 'private'
                      ? 'bg-[#6E56CF]/30 border-[#6E56CF] text-white'
                      : 'bg-[#14121D] border-[#2D2842] text-[#9E98B0]'
                  }`}
                >
                  Ruang Privat (QR Code)
                </button>
              </div>

              {/* Custom / Pre-filled Code */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#9E98B0]">Kode Unik Ruang (6 Karakter):</label>
                <input
                  type="text"
                  maxLength={6}
                  value={customRoomCode}
                  onChange={e => setCustomRoomCode(e.target.value.toUpperCase())}
                  placeholder={demoMode ? 'BLITZ8' : 'Contoh: MONAD8'}
                  className="w-full px-3 py-2 rounded-lg bg-[#14121D] border border-[#2D2842] text-[#F4F2F7] font-mono text-sm uppercase focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                onClick={handleCreateRoom}
                className="w-full py-3 rounded-xl btn-gold text-xs font-black font-cinzel"
              >
                Buat Ruang Sekarang
              </button>

              {/* Created Room Preview with QR Code */}
              {createdRoom && (
                <div className="pt-4 border-t border-[#2D2842] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#9E98B0] block">Kode Ruang Anda:</span>
                      <span className="font-mono text-xl font-black text-[#D4AF37]">
                        {createdRoom.code}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F1B2E] border border-[#2D2842] text-xs text-[#F4F2F7] hover:border-[#D4AF37]"
                    >
                      {copiedLink ? <IconCheck size={14} color="#2E9E6B" /> : <IconCopy size={14} />}
                      <span>{copiedLink ? 'Tersalin' : 'Salin Tautan'}</span>
                    </button>
                  </div>

                  {/* Inline SVG QR Code */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#14121D] p-3 rounded-xl border border-[#2D2842]">
                    <QRCodeSvg value={getJoinRoomUrl(createdRoom.code)} size={130} />
                    <div className="text-xs text-[#9E98B0] space-y-1">
                      <strong className="text-[#F4F2F7] block">Pindai dari Perangkat Lain:</strong>
                      <p>
                        Arahkan kamera ponsel ke QR Code ini untuk langsung memasuki ruang laga secara otomatis.
                      </p>
                      <button
                        onClick={() => {
                          soundEngine.playClickSound();
                          onStartMatchVsPlayer(createdRoom);
                        }}
                        className="mt-2 px-4 py-2 rounded-lg btn-primary text-xs font-bold font-cinzel"
                      >
                        Mulai Laga di Ruang Ini
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Public Rooms List for 1-Click Joining */}
            <div className="p-5 rounded-xl bg-[#0B0A0F]/80 border border-[#2D2842] flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#D4AF37] mb-3">
                  Daftar Ruang Publik Terbuka
                </h3>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {publicRooms.map(r => (
                    <div
                      key={r.code}
                      className="p-3 rounded-xl bg-[#14121D] border border-[#2D2842] flex items-center justify-between hover:border-[#6E56CF]/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#F4F2F7]">
                            {r.code}
                          </span>
                          <span className="text-[10px] text-[#2E9E6B] font-semibold bg-[#2E9E6B]/15 px-1.5 rounded">
                            Tersedia
                          </span>
                        </div>
                        <span className="text-[11px] text-[#9E98B0] block">
                          Tuan Rumah: {r.hostName}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          soundEngine.playClickSound();
                          onStartMatchVsPlayer(r);
                        }}
                        className="px-4 py-2 rounded-lg btn-primary text-xs font-bold font-cinzel"
                      >
                        Gabung
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Match Button */}
              <button
                onClick={() => {
                  soundEngine.playClickSound();
                  const targetRoom = publicRooms[0] || createNewRoom(selectedMapId, false, 'QUICK8');
                  onStartMatchVsPlayer(targetRoom);
                }}
                className="w-full py-3.5 rounded-xl btn-gold text-xs font-black font-cinzel shadow-lg shadow-[#D4AF37]/20"
              >
                Lawan Pemain Acak (Antrean Cepat)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { MapId, RoomInfo, AIDifficulty, CharacterId } from '../types/game';
import { getPublicRooms, createNewRoom, getJoinRoomUrl } from '../services/roomService';
import { CHARACTERS } from '../config/characters';
import { MAPS } from '../config/maps';
import { QRCodeSvg } from './QRCodeSvg';
import {
  IconSwords,
  IconBot,
  IconUser,
  IconCopy,
  IconCheck,
  IconRelicShard,
  IconTrophy
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

  const selectedChar = CHARACTERS[selectedCharId];
  const selectedMap = MAPS[selectedMapId];

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
    <div className="w-full space-y-6 text-left">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2D2842]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#6E56CF]/20 border border-[#6E56CF]/40 text-[#D4AF37]">
            <IconSwords size={20} color="#D4AF37" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#F4F2F7] font-cinzel">
                Pilih Mode Pertandingan
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
              Tantang kecerdasan bot cerdas atau buat ruang tanding bersama lawan lain
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-[#0B0A0F] p-1 rounded-xl border border-[#2D2842]">
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
            <span>Lawan Bot Cerdas</span>
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
            <span>Ruang Antrean Pemain</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Bot Mythomachy State Machine AI */}
      {activeTab === 'bot' && (
        <div className="space-y-6">
          {/* Difficulty Level Cards */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] block font-cinzel">
              Tingkat Kesulitan Bot Cerdas:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {(
                [
                  {
                    id: 'easy',
                    label: 'Santai (Pemula)',
                    desc: 'Jeda reflek santai (~450ms). Cocok untuk menghafal kombo jurus dan mekanika keahlian tanpa tekanan berat.',
                    badge: 'Santai'
                  },
                  {
                    id: 'medium',
                    label: 'Taktis (Standar)',
                    desc: 'Reflek taktis (~220ms). Mampu menangkis serangan berat, menjaga jarak ideal, dan memanfaatkan jeda keahlian.',
                    badge: 'Direkomendasikan'
                  },
                  {
                    id: 'hard',
                    label: 'Legenda (Turnamen)',
                    desc: 'Reflek instan (~80ms). Eksekusi kombo beruntun mematikan, lompatan mengejutkan, dan pamungkas langsung saat terisi.',
                    badge: 'Tantangan Tinggi'
                  }
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
                    className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#1F1B2E] to-[#14121D] border-[#D4AF37] shadow-xl shadow-[#6E56CF]/20 ring-1 ring-[#D4AF37]'
                        : 'bg-[#14121D] border-[#2D2842] text-[#9E98B0] hover:border-[#6E56CF]/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                              : 'bg-[#2D2842]/40 text-[#9E98B0]'
                          }`}
                        >
                          {d.badge}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#2E9E6B] shadow-sm shadow-[#2E9E6B]" />
                        )}
                      </div>

                      <h4 className="font-bold text-sm sm:text-base font-cinzel text-[#F4F2F7]">
                        {d.label}
                      </h4>
                      <p className="text-xs text-[#9E98B0] mt-1.5 leading-relaxed">
                        {d.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-[#2D2842]/60 flex items-center justify-between text-[11px]">
                      <span className="text-[#2E9E6B] font-semibold flex items-center gap-1">
                        <IconRelicShard size={13} color="#2E9E6B" /> +15 Pecahan Menang
                      </span>
                      <span className={`font-cinzel font-bold ${isSelected ? 'text-[#D4AF37]' : 'text-[#9E98B0]'}`}>
                        {isSelected ? 'Dipilih' : 'Pilih Level'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Launch Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#14121D] to-[#1F1B2E] border border-[#2D2842] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#6E56CF]/20 border border-[#6E56CF]/40 flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
                <IconTrophy size={24} color="#D4AF37" />
              </div>
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-cinzel font-bold text-sm text-[#F4F2F7]">
                    Ksatria: {selectedChar.name}
                  </span>
                  <span className="text-[#9E98B0] text-xs">|</span>
                  <span className="text-xs text-[#D4AF37] font-semibold">
                    Medan: {selectedMap.name}
                  </span>
                </div>
                <p className="text-xs text-[#9E98B0]">
                  Latihan mandiri instan tanpa antrean dengan sinkronisasi server cepat.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playMatchStartSound();
                onStartMatchVsBot(botDifficulty);
              }}
              className="w-full md:w-auto px-10 py-4 rounded-xl btn-primary text-sm font-black font-cinzel shadow-2xl shadow-[#6E56CF]/40 whitespace-nowrap"
            >
              Mulai Laga vs Bot Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Multi-Device Waiting Room (Public/Private + QR Code) */}
      {activeTab === 'pvp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Room Form */}
            <div className="p-5 rounded-2xl bg-[#0B0A0F]/80 border border-[#2D2842] space-y-4">
              <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#D4AF37]">
                Buat Ruang Tanding Baru
              </h3>

              {/* Type Switcher */}
              <div className="flex gap-3">
                <button
                  onClick={() => setRoomType('public')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    roomType === 'public'
                      ? 'bg-[#6E56CF]/30 border-[#6E56CF] text-white shadow-md'
                      : 'bg-[#14121D] border-[#2D2842] text-[#9E98B0]'
                  }`}
                >
                  Ruang Publik
                </button>
                <button
                  onClick={() => setRoomType('private')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    roomType === 'private'
                      ? 'bg-[#6E56CF]/30 border-[#6E56CF] text-white shadow-md'
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
                  className="w-full px-4 py-2.5 rounded-xl bg-[#14121D] border border-[#2D2842] text-[#F4F2F7] font-mono text-sm uppercase focus:outline-none focus:border-[#D4AF37]"
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
                      <span className="font-mono text-2xl font-black text-[#D4AF37]">
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
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#14121D] p-3.5 rounded-xl border border-[#2D2842]">
                    <QRCodeSvg value={getJoinRoomUrl(createdRoom.code)} size={130} />
                    <div className="text-xs text-[#9E98B0] space-y-1">
                      <strong className="text-[#F4F2F7] block">Pindai dari Perangkat Lain:</strong>
                      <p>
                        Arahkan kamera ponsel lain ke QR Code ini untuk langsung memasuki ruang laga.
                      </p>
                      <button
                        onClick={() => {
                          soundEngine.playMatchStartSound();
                          onStartMatchVsPlayer(createdRoom);
                        }}
                        className="mt-2 px-4 py-2 rounded-lg btn-primary text-xs font-bold font-cinzel"
                      >
                        Masuk Arena Ruang Ini
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Public Rooms List for 1-Click Joining */}
            <div className="p-5 rounded-2xl bg-[#0B0A0F]/80 border border-[#2D2842] flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#D4AF37] mb-3">
                  Daftar Ruang Publik Terbuka
                </h3>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {publicRooms.map(r => (
                    <div
                      key={r.code}
                      className="p-3.5 rounded-xl bg-[#14121D] border border-[#2D2842] flex items-center justify-between hover:border-[#6E56CF]/60 transition-colors"
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
                          soundEngine.playMatchStartSound();
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
                  soundEngine.playMatchStartSound();
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

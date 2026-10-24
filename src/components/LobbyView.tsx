import React, { useState, useEffect } from 'react';
import { MapId, RoomInfo, AIDifficulty } from '../types/game';
import { getPublicRooms, createNewRoom, getJoinRoomUrl } from '../services/roomService';
import { QRCodeSvg } from './QRCodeSvg';
import {
  IconSwords,
  IconBot,
  IconUser,
  IconCopy,
  IconCheck,
  IconRelicShard,
  IconGemJade,
  IconFiligreeCorner
} from './SvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface LobbyViewProps {
  selectedMapId: MapId;
  demoMode: boolean;
  botDifficulty: AIDifficulty;
  onSelectDifficulty: (diff: AIDifficulty) => void;
  onSelectRoom: (room: RoomInfo) => void;
  onOpenHelp: () => void;
  onAdvanceTab?: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  selectedMapId,
  demoMode,
  botDifficulty,
  onSelectDifficulty,
  onSelectRoom,
  onOpenHelp,
  onAdvanceTab
}) => {
  const [activeTab, setActiveTab] = useState<'bot' | 'pvp'>('bot');
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
    onSelectRoom(room);
    onAdvanceTab?.();
  };

  const handleCopyLink = () => {
    if (!createdRoom) return;
    const url = getJoinRoomUrl(createdRoom.code);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const difficultyList = [
    {
      id: 'easy' as const,
      label: 'Santai (Pemula)',
      desc: 'Jeda reflek santai (~450ms). Cocok untuk melatih kombo dan pergerakan tanpa tekanan agresi berat.',
      badge: 'Santai',
      badgeColor: 'text-[#9E98B0] bg-[#2D2842]/40 border-[#2D2842]',
      relicReward: 10
    },
    {
      id: 'medium' as const,
      label: 'Taktis (Standar)',
      desc: 'Reflek taktis (~220ms). Menjaga jarak optimal, menangkis serangan berat, dan melancarkan serangan balasan.',
      badge: 'Direkomendasikan',
      badgeColor: 'text-[#D4AF37] bg-[#D4AF37]/15 border-[#D4AF37]/40',
      relicReward: 20
    },
    {
      id: 'hard' as const,
      label: 'Legenda (Turnamen)',
      desc: 'Reflek instan (~80ms). Eksekusi kombo beruntun tanpa ampun, penangkisan proyektil, dan jurus pamungkas mematikan.',
      badge: 'Tantangan Tinggi',
      badgeColor: 'text-[#D9383A] bg-[#D9383A]/15 border-[#D9383A]/40',
      relicReward: 35
    }
  ];

  return (
    <div className="card-surface p-5 sm:p-6 flex-1 min-h-0 flex flex-col justify-start space-y-4 text-left shadow-2xl overflow-hidden">
      {/* Top Header Controls with Segmented Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3.5 border-b border-[#2D2842] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#6E56CF]/20 border border-[#6E56CF]/40 text-[#D4AF37]">
            <IconSwords size={20} color="#D4AF37" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#F4F2F7] font-cinzel">
                Mode Pertandingan
              </h2>
              <button
                onClick={onOpenHelp}
                className="help-btn-ornate"
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

        {/* Segmented Switch: Lawan Bot Cerdas / Ruang Antrean Pemain with padding: 8px 18px */}
        <div className="flex items-center gap-1.5 bg-[#0B0A0F] p-1.5 rounded-xl border border-[#2D2842] self-start sm:self-auto shadow-inner">
          <button
            onClick={() => {
              soundEngine.playClickSound();
              setActiveTab('bot');
            }}
            className={`flex items-center gap-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bot'
                ? 'bg-gradient-to-r from-[#6E56CF] to-[#4D38A2] text-white shadow-md shadow-[#6E56CF]/40 border border-[#9D88F5]/40'
                : 'text-[#9E98B0] hover:text-[#F4F2F7]'
            }`}
            style={{ padding: '8px 18px' }}
          >
            <IconBot size={16} />
            <span>Lawan Bot Cerdas</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClickSound();
              setActiveTab('pvp');
            }}
            className={`flex items-center gap-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pvp'
                ? 'bg-gradient-to-r from-[#6E56CF] to-[#4D38A2] text-white shadow-md shadow-[#6E56CF]/40 border border-[#9D88F5]/40'
                : 'text-[#9E98B0] hover:text-[#F4F2F7]'
            }`}
            style={{ padding: '8px 18px' }}
          >
            <IconUser size={16} />
            <span>Ruang Antrean Pemain</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content Container for Bot and PvP Modes */}
      <div className="card-grid-container flex-1 min-h-0 overflow-y-auto pr-2 space-y-4">
        {/* Mode 1: Bot Mythomachy Difficulty Gate Cards */}
        {activeTab === 'bot' && (
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] block font-cinzel">
              Tingkat Kesulitan Bot Cerdas:
            </label>

            <div
              className="grid grid-cols-1 md:grid-cols-3"
              style={{ gap: '16px' }}
            >
            {difficultyList.map(d => {
              const isSelected = botDifficulty === d.id;
              const isRecommended = d.id === 'medium';
              return (
                <div
                  key={d.id}
                  onClick={() => {
                    soundEngine.playClickSound();
                    onSelectDifficulty(d.id);
                    onAdvanceTab?.();
                  }}
                  className={`gate-card card-surface card-interactive rounded-2xl border text-left transition-all duration-300 cursor-pointer relative group ${
                    isSelected ? 'selected card-selected-gold' : ''
                  }`}
                  style={{
                    padding: '24px',
                    minHeight: '210px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {/* Faint Watermark Background Text */}
                  <div className="gate-card-watermark">
                    {d.id === 'easy' ? 'SANTAI' : d.id === 'medium' ? 'TAKTIS' : 'LEGENDA'}
                  </div>

                  {/* Top content */}
                  <div className="relative z-10">
                    {/* Prestigious Recommended Gold Badge or Difficulty Badge */}
                    <div style={{ marginBottom: '10px' }}>
                      {isRecommended ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider rounded-md border border-[#FFE484] bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#AA8518] text-[#0B0A0F] shadow-[0_2px_10px_rgba(212,175,55,0.4)]"
                          style={{ padding: '4px 12px' }}
                        >
                          <IconSwords size={12} color="#0B0A0F" />
                          Direkomendasikan
                        </span>
                      ) : (
                        <span
                          className={`inline-block text-[11px] font-bold uppercase tracking-wider rounded border ${d.badgeColor}`}
                          style={{ padding: '4px 12px' }}
                        >
                          {d.badge}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-base font-cinzel text-[#F4F2F7] mt-1 tracking-wide">
                      {d.label}
                    </h4>

                    <p className="text-xs text-[#9E98B0] mt-2 leading-relaxed">
                      {d.desc}
                    </p>
                  </div>

                  {/* Clean Divider Line separating description from reward and status */}
                  <div
                    className="relative z-10 flex items-center justify-between text-xs"
                    style={{
                      borderTop: '1px solid #2D2842',
                      paddingTop: '12px',
                      marginTop: '16px'
                    }}
                  >
                    <span className="text-[#2E9E6B] font-semibold flex items-center gap-1.5 font-mono">
                      <IconGemJade size={14} color="#2E9E6B" /> +{d.relicReward} Pecahan Menang
                    </span>
                    <span
                      className={`font-cinzel font-bold text-xs tracking-wider ${
                        isSelected ? 'text-[#D4AF37]' : 'text-[#9E98B0] group-hover:text-white'
                      }`}
                    >
                      {isSelected ? 'DIPILIH' : 'PILIH LEVEL'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Multi-Device Waiting Room (Public/Private + QR Code) */}
      {activeTab === 'pvp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Room Form */}
            <div className="p-6 rounded-2xl bg-[#0B0A0F]/80 border border-[#2D2842] space-y-4">
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
                    <QRCodeSvg value={getJoinRoomUrl(createdRoom.code)} size={120} />
                    <div className="text-xs text-[#9E98B0] space-y-1">
                      <strong className="text-[#F4F2F7] block">Pindai dari Perangkat Lain:</strong>
                      <p>
                        Arahkan kamera ponsel lain ke QR Code ini untuk langsung memasuki ruang laga.
                      </p>
                      <button
                        onClick={() => {
                          soundEngine.playClickSound();
                          onSelectRoom(createdRoom);
                          onAdvanceTab?.();
                        }}
                        className="mt-2 px-4 py-2 rounded-lg btn-primary text-xs font-bold font-cinzel"
                      >
                        Pilih Ruang Ini
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Public Rooms List for 1-Click Joining */}
            <div className="p-6 rounded-2xl bg-[#0B0A0F]/80 border border-[#2D2842] flex flex-col justify-between space-y-4">
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
                          soundEngine.playClickSound();
                          onSelectRoom(r);
                          onAdvanceTab?.();
                        }}
                        className="px-4 py-2 rounded-lg btn-primary text-xs font-bold font-cinzel"
                      >
                        Pilih
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
                  onSelectRoom(targetRoom);
                  onAdvanceTab?.();
                }}
                className="w-full py-3 rounded-xl btn-gold text-xs font-black font-cinzel shadow-lg shadow-[#D4AF37]/20"
              >
                Pilih Pemain Acak (Antrean Cepat)
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

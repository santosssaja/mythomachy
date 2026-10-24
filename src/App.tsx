import React, { useState, useEffect } from 'react';
import {
  CharacterId,
  GraphicsPreset,
  MapId,
  ViewMode,
  PlayerProfile,
  AIDifficulty,
  RoomInfo
} from './types/game';
import { getStoredPlayerProfile } from './services/burnerSigner';
import { CHARACTERS } from './config/characters';
import { MAPS } from './config/maps';
import { soundEngine } from './audio/soundEngine';
import { Header } from './components/Header';
import { JudgeVerificationBar } from './components/JudgeVerificationBar';
import { CharacterSelectView } from './components/CharacterSelectView';
import { MapSelectView } from './components/MapSelectView';
import { LobbyView } from './components/LobbyView';
import { GachaTempleModal } from './components/GachaTempleModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal, HelpSectionId } from './components/HelpModal';
import { ArenaView } from './components/ArenaView';
import { IconSwords, IconBot, IconUser, IconTemple } from './components/SvgIcons';

export type LobbyTab = 'mode' | 'character' | 'map';

export const App: React.FC = () => {
  // CRITICAL RULE: demoMode MUST initialize to false (OFF) by default
  const [demoMode, setDemoMode] = useState<boolean>(false);

  // View state: 'lobby' or 'match'
  const [currentView, setCurrentView] = useState<'lobby' | 'match'>('lobby');

  // Lobby flow step tab: 'mode' | 'character' | 'map'
  const [activeTab, setActiveTab] = useState<LobbyTab>('mode');

  // Game configuration
  const [viewMode, setViewMode] = useState<ViewMode>('3D');
  const [graphicsPreset, setGraphicsPreset] = useState<GraphicsPreset>('high');
  const [selectedMapId, setSelectedMapId] = useState<MapId>('monad_sanctum');
  const [selectedCharId, setSelectedCharId] = useState<CharacterId>('gatotkaca');
  const [opponentCharId, setOpponentCharId] = useState<CharacterId>('athena');

  // Matchmaking setup
  const [isBotMatch, setIsBotMatch] = useState<boolean>(true);
  const [botDifficulty, setBotDifficulty] = useState<AIDifficulty>('medium');
  const [currentRoom, setCurrentRoom] = useState<RoomInfo | null>(null);

  // Player Profile from Burner Account mirror
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => getStoredPlayerProfile());

  // Audio mute
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getIsMuted());

  // Modal triggers
  const [isGachaOpen, setIsGachaOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [helpSection, setHelpSection] = useState<HelpSectionId | null>(null);

  // Check URL parameters for join room (?room=CODE)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setCurrentRoom({
        code: roomParam.toUpperCase(),
        hostName: 'Penantang Tamu',
        hostAddress: '0x14121d5a7b2139048a123f81e35a92c8192a7702',
        mapId: 'monad_sanctum',
        isPrivate: true,
        isReady: true
      });
      setActiveTab('mode');
    }
  }, []);

  const handleToggleDemoMode = () => {
    soundEngine.playClickSound();
    const nextVal = !demoMode;
    setDemoMode(nextVal);
    if (nextVal) {
      soundEngine.playThunderSound();
    }
  };

  const handleToggleViewMode = () => {
    setViewMode(prev => (prev === '3D' ? '2D' : '3D'));
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    soundEngine.setMuted(next);
    setIsMuted(next);
  };

  const handleStartBotMatch = (diff: AIDifficulty) => {
    setIsBotMatch(true);
    setBotDifficulty(diff);

    // Pick an opponent character
    const candidates: CharacterId[] = [
      'athena',
      'thor',
      'anubis',
      'susanoo',
      'garuda',
      'wukong',
      'quetzalcoatl',
      'gilgamesh',
      'nyirorokidul',
      'chronos'
    ].filter(id => id !== selectedCharId) as CharacterId[];
    const randomOpponent = candidates[Math.floor(Math.random() * candidates.length)];
    setOpponentCharId(randomOpponent);

    setCurrentView('match');
  };

  const handleStartPlayerMatch = (room: RoomInfo) => {
    setIsBotMatch(false);
    setCurrentRoom(room);
    setSelectedMapId(room.mapId);

    const candidates: CharacterId[] = [
      'athena',
      'thor',
      'gilgamesh',
      'nyirorokidul',
      'chronos'
    ].filter(id => id !== selectedCharId) as CharacterId[];
    setOpponentCharId(candidates[Math.floor(Math.random() * candidates.length)]);

    setCurrentView('match');
  };

  const selectedChar = CHARACTERS[selectedCharId];
  const selectedMap = MAPS[selectedMapId];

  return (
    <div className={`min-h-screen bg-[#0B0A0F] text-[#F4F2F7] flex flex-col ${demoMode ? 'pb-24' : 'pb-10'}`}>
      {/* Top Header & Settings Bar */}
      <Header
        demoMode={demoMode}
        onToggleDemoMode={handleToggleDemoMode}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        onOpenGacha={() => setIsGachaOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        playerProfile={playerProfile}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Game Screen */}
      <main className="max-w-7xl mx-auto w-full px-4 pt-5 flex-grow flex flex-col">
        {currentView === 'lobby' ? (
          <div className="space-y-6 animate-fade-in pb-12">
            {/* Step Navigation Flow Bar */}
            <div className="panel-frame p-3 sm:p-4 rounded-2xl border gold-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    soundEngine.playClickSound();
                    setActiveTab('mode');
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-cinzel transition-all ${
                    activeTab === 'mode'
                      ? 'btn-primary shadow-lg shadow-[#6E56CF]/40 text-white'
                      : 'bg-[#14121D] border border-[#2D2842] text-[#9E98B0] hover:text-[#F4F2F7] hover:border-[#6E56CF]/40'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-sans">
                    1
                  </span>
                  <span>Mode Laga</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClickSound();
                    setActiveTab('character');
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-cinzel transition-all ${
                    activeTab === 'character'
                      ? 'btn-primary shadow-lg shadow-[#6E56CF]/40 text-white'
                      : 'bg-[#14121D] border border-[#2D2842] text-[#9E98B0] hover:text-[#F4F2F7] hover:border-[#6E56CF]/40'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-sans">
                    2
                  </span>
                  <span>Pilih Petarung ({selectedChar.name})</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClickSound();
                    setActiveTab('map');
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-cinzel transition-all ${
                    activeTab === 'map'
                      ? 'btn-primary shadow-lg shadow-[#6E56CF]/40 text-white'
                      : 'bg-[#14121D] border border-[#2D2842] text-[#9E98B0] hover:text-[#F4F2F7] hover:border-[#6E56CF]/40'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-sans">
                    3
                  </span>
                  <span>Pilih Medan ({selectedMap.name})</span>
                </button>
              </div>

              {/* Quick Gacha Trigger */}
              <button
                onClick={() => {
                  soundEngine.playClickSound();
                  setIsGachaOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/25 transition-all text-xs font-bold font-cinzel shadow-sm"
              >
                <IconTemple size={16} color="#D4AF37" />
                <span>Kuil Pemanggilan Gacha</span>
              </button>
            </div>

            {/* Persistent Battle Readiness Deck */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#14121D] via-[#1F1B2E] to-[#14121D] border border-[#D4AF37]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#6E56CF]/25 border border-[#6E56CF]/50 flex items-center justify-center text-[#D4AF37]">
                    <IconSwords size={22} color="#D4AF37" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#9E98B0] font-semibold block">
                      Petarung Dipilih:
                    </span>
                    <span className="font-cinzel font-black text-sm sm:text-base text-[#F4F2F7]">
                      {selectedChar.name} ({selectedChar.origin})
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block h-8 w-px bg-[#2D2842]" />

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9E98B0] font-semibold block">
                    Medan Laga:
                  </span>
                  <span className="font-cinzel font-bold text-xs sm:text-sm text-[#D4AF37]">
                    {selectedMap.name}
                  </span>
                </div>

                <div className="hidden sm:block h-8 w-px bg-[#2D2842]" />

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9E98B0] font-semibold block">
                    Mode Pertandingan:
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#2E9E6B]">
                    {isBotMatch ? `Bot (${botDifficulty})` : `Lawan Pemain (${currentRoom?.code || 'Acak'})`}
                  </span>
                </div>
              </div>

              {/* 1-Click Launch Button */}
              <button
                onClick={() => {
                  soundEngine.playMatchStartSound();
                  if (isBotMatch) {
                    handleStartBotMatch(botDifficulty);
                  } else {
                    handleStartPlayerMatch(currentRoom || {
                      code: 'QUICK8',
                      hostName: 'Penantang Langsung',
                      hostAddress: '0x14121d5a7b2139048a123f81e35a92c8192a7702',
                      mapId: selectedMapId,
                      isPrivate: false,
                      isReady: true
                    });
                  }
                }}
                className="w-full md:w-auto px-8 py-3.5 rounded-xl btn-gold text-xs sm:text-sm font-black font-cinzel shadow-xl shadow-[#D4AF37]/30 whitespace-nowrap"
              >
                Masuk Arena Laga Sekarang
              </button>
            </div>

            {/* Tab 1: Lobby Mode View */}
            {activeTab === 'mode' && (
              <div className="animate-fade-in">
                <LobbyView
                  selectedMapId={selectedMapId}
                  selectedCharId={selectedCharId}
                  demoMode={demoMode}
                  onStartMatchVsBot={handleStartBotMatch}
                  onStartMatchVsPlayer={handleStartPlayerMatch}
                  onOpenHelp={() => setHelpSection('ruang_tunggu')}
                />
              </div>
            )}

            {/* Tab 2: Character Selection View */}
            {activeTab === 'character' && (
              <div className="panel-frame p-6 sm:p-8 rounded-2xl border gold-border animate-fade-in">
                <CharacterSelectView
                  selectedId={selectedCharId}
                  onSelectCharacter={setSelectedCharId}
                  playerProfile={playerProfile}
                  demoMode={demoMode}
                  onOpenGacha={() => setIsGachaOpen(true)}
                  onOpenHelp={() => setHelpSection('pemilihan_karakter')}
                />
              </div>
            )}

            {/* Tab 3: Map Selection View */}
            {activeTab === 'map' && (
              <div className="panel-frame p-6 sm:p-8 rounded-2xl border gold-border animate-fade-in">
                <MapSelectView
                  selectedMapId={selectedMapId}
                  onSelectMap={setSelectedMapId}
                  onOpenHelp={() => setHelpSection('pemilihan_peta')}
                />
              </div>
            )}
          </div>
        ) : (
          /* Match Arena View */
          <div className="animate-fade-in flex-grow flex flex-col justify-center">
            <ArenaView
              mapId={selectedMapId}
              viewMode={viewMode}
              graphicsPreset={graphicsPreset}
              p1CharId={selectedCharId}
              p2CharId={opponentCharId}
              p1Name="Ksatria Anda"
              p2Name={isBotMatch ? `Bot Mythomachy (${botDifficulty})` : `Lawan ${currentRoom?.code || 'Online'}`}
              isBotMatch={isBotMatch}
              botDifficulty={botDifficulty}
              playerProfile={playerProfile}
              onProfileUpdated={setPlayerProfile}
              onExitMatch={() => setCurrentView('lobby')}
            />
          </div>
        )}
      </main>

      {/* Kuil Pemanggilan Gacha Modal */}
      <GachaTempleModal
        isOpen={isGachaOpen}
        onClose={() => setIsGachaOpen(false)}
        playerProfile={playerProfile}
        onProfileUpdated={setPlayerProfile}
        onOpenHelp={() => setHelpSection('kuil_pemanggilan')}
        demoMode={demoMode}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preset={graphicsPreset}
        onSelectPreset={setGraphicsPreset}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenHelp={() => setHelpSection('pengaturan_grafis')}
      />

      {/* Contextual ? Help Modal */}
      <HelpModal
        sectionId={helpSection}
        onClose={() => setHelpSection(null)}
      />

      {/* Judge Verification Bar (Visible ONLY when Demo Mode is ON) */}
      {demoMode && (
        <JudgeVerificationBar
          onOpenHelp={() => setHelpSection('mode_peragaan')}
        />
      )}
    </div>
  );
};

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
import { LobbyShowcaseCard } from './components/LobbyShowcaseCard';
import { BottomActionDock } from './components/BottomActionDock';
import { GachaTempleModal } from './components/GachaTempleModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal, HelpSectionId } from './components/HelpModal';
import { ArenaView } from './components/ArenaView';

export type LobbyTab = 'mode' | 'character' | 'map';

export const App: React.FC = () => {
  // CRITICAL RULE: demoMode MUST initialize to false (OFF) by default
  const [demoMode, setDemoMode] = useState<boolean>(false);

  // View state: 'lobby' or 'match'
  const [currentView, setCurrentView] = useState<'lobby' | 'match'>('lobby');

  // Active step navigation tab: 'mode' | 'character' | 'map'
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
      setIsBotMatch(false);
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

  const handleSelectRoom = (room: RoomInfo) => {
    setIsBotMatch(false);
    setCurrentRoom(room);
    setSelectedMapId(room.mapId);
  };

  const handleLaunchMatch = () => {
    soundEngine.playMatchStartSound();

    // Pick opponent character if not already set
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

  const selectedChar = CHARACTERS[selectedCharId];
  const selectedMap = MAPS[selectedMapId];

  const diffSublabel =
    botDifficulty === 'easy'
      ? 'Bot Santai'
      : botDifficulty === 'medium'
      ? 'Bot Taktis'
      : 'Bot Legenda';

  const modeSublabel = isBotMatch
    ? diffSublabel
    : `Pemain (${currentRoom?.code || 'Acak'})`;

  return (
    <div
      className={`min-h-screen bg-[#0B0A0F] text-[#F4F2F7] flex flex-col relative ${
        demoMode ? 'pb-36' : 'pb-28'
      }`}
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 0%, rgba(110, 86, 207, 0.16) 0%, transparent 65%), radial-gradient(circle at 100% 100%, rgba(212, 175, 55, 0.08) 0%, transparent 55%)'
      }}
    >
      {/* Top Header & Settings Bar (KUIL PEMANGGILAN exists ONLY here) */}
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
      <main className="max-w-[1400px] mx-auto w-full px-5 sm:px-7 pt-4 flex-grow flex flex-col">
        {currentView === 'lobby' ? (
          <div className="space-y-6 animate-fade-in flex-grow flex flex-col">
            {/* Step Navigation Tabs with Proper Breathing Room (margin: 20px 0, gap: 12px) */}
            <div
              className="flex flex-wrap items-center"
              style={{ margin: '16px 0 20px 0', gap: '12px' }}
            >
              {/* Step 1: Mode Laga */}
              <button
                onClick={() => {
                  soundEngine.playClickSound();
                  setActiveTab('mode');
                  setIsBotMatch(true);
                }}
                className={`flex-1 min-w-[200px] flex items-center gap-3.5 transition-all duration-200 cursor-pointer text-left border ${
                  activeTab === 'mode'
                    ? 'bg-gradient-to-r from-[#6E56CF]/30 via-[#1F1B2E] to-[#6E56CF]/20 border-[#D4AF37] shadow-lg shadow-[#6E56CF]/20'
                    : 'bg-[#14121D] border-[#2D2842] text-[#9E98B0] hover:border-[#6E56CF]/60 hover:text-[#F4F2F7]'
                }`}
                style={{ padding: '12px 24px', borderRadius: '8px' }}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    activeTab === 'mode'
                      ? 'bg-[#D4AF37] text-[#0B0A0F]'
                      : 'bg-[#1F1B2E] text-[#9E98B0] border border-[#2D2842]'
                  }`}
                >
                  1
                </span>
                <div>
                  <span
                    className={`font-cinzel text-xs sm:text-sm font-bold block ${
                      activeTab === 'mode' ? 'text-[#F4F2F7]' : 'text-[#9E98B0]'
                    }`}
                  >
                    1. Mode Pertandingan
                  </span>
                  <span className="text-[11px] text-[#D4AF37] block mt-0.5 font-medium">
                    {modeSublabel}
                  </span>
                </div>
              </button>

              {/* Step 2: Pilih Petarung */}
              <button
                onClick={() => {
                  soundEngine.playClickSound();
                  setActiveTab('character');
                }}
                className={`flex-1 min-w-[200px] flex items-center gap-3.5 transition-all duration-200 cursor-pointer text-left border ${
                  activeTab === 'character'
                    ? 'bg-gradient-to-r from-[#6E56CF]/30 via-[#1F1B2E] to-[#6E56CF]/20 border-[#D4AF37] shadow-lg shadow-[#6E56CF]/20'
                    : 'bg-[#14121D] border-[#2D2842] text-[#9E98B0] hover:border-[#6E56CF]/60 hover:text-[#F4F2F7]'
                }`}
                style={{ padding: '12px 24px', borderRadius: '8px' }}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    activeTab === 'character'
                      ? 'bg-[#D4AF37] text-[#0B0A0F]'
                      : 'bg-[#1F1B2E] text-[#9E98B0] border border-[#2D2842]'
                  }`}
                >
                  2
                </span>
                <div>
                  <span
                    className={`font-cinzel text-xs sm:text-sm font-bold block ${
                      activeTab === 'character' ? 'text-[#F4F2F7]' : 'text-[#9E98B0]'
                    }`}
                  >
                    2. Pilih Ksatria
                  </span>
                  <span className="text-[11px] text-[#D4AF37] block mt-0.5 font-medium truncate max-w-[150px]">
                    {selectedChar.name} ({selectedChar.origin})
                  </span>
                </div>
              </button>

              {/* Step 3: Pilih Medan */}
              <button
                onClick={() => {
                  soundEngine.playClickSound();
                  setActiveTab('map');
                }}
                className={`flex-1 min-w-[200px] flex items-center gap-3.5 transition-all duration-200 cursor-pointer text-left border ${
                  activeTab === 'map'
                    ? 'bg-gradient-to-r from-[#6E56CF]/30 via-[#1F1B2E] to-[#6E56CF]/20 border-[#D4AF37] shadow-lg shadow-[#6E56CF]/20'
                    : 'bg-[#14121D] border-[#2D2842] text-[#9E98B0] hover:border-[#6E56CF]/60 hover:text-[#F4F2F7]'
                }`}
                style={{ padding: '12px 24px', borderRadius: '8px' }}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    activeTab === 'map'
                      ? 'bg-[#D4AF37] text-[#0B0A0F]'
                      : 'bg-[#1F1B2E] text-[#9E98B0] border border-[#2D2842]'
                  }`}
                >
                  3
                </span>
                <div>
                  <span
                    className={`font-cinzel text-xs sm:text-sm font-bold block ${
                      activeTab === 'map' ? 'text-[#F4F2F7]' : 'text-[#9E98B0]'
                    }`}
                  >
                    3. Pilih Medan Laga
                  </span>
                  <span className="text-[11px] text-[#D4AF37] block mt-0.5 font-medium truncate max-w-[150px]">
                    {selectedMap.name}
                  </span>
                </div>
              </button>
            </div>

            {/* UPGRADE TO A 2-COLUMN "AAA FIGHTING GAME LOBBY" LAYOUT (12 Columns) */}
            <div
              className="grid grid-cols-1 lg:grid-cols-12 items-start flex-grow"
              style={{ gap: '24px' }}
            >
              {/* Left Column (4 Columns): Live Fighter & Arena Showcase Card */}
              <div className="lg:col-span-4 sticky top-20">
                <LobbyShowcaseCard
                  selectedChar={selectedChar}
                  selectedMap={selectedMap}
                  onNavigateTab={tab => setActiveTab(tab)}
                />
              </div>

              {/* Right Column (8 Columns): Active Step Configuration Panel */}
              <div className="lg:col-span-8 panel-frame p-6 sm:p-7 rounded-2xl border gold-border">
                {activeTab === 'mode' && (
                  <div
                    className="animate-fade-in"
                    style={{ transition: 'opacity 180ms ease-out' }}
                  >
                    <LobbyView
                      selectedMapId={selectedMapId}
                      demoMode={demoMode}
                      botDifficulty={botDifficulty}
                      onSelectDifficulty={diff => {
                        setBotDifficulty(diff);
                        setIsBotMatch(true);
                      }}
                      onSelectRoom={handleSelectRoom}
                      onOpenHelp={() => setHelpSection('ruang_tunggu')}
                    />
                  </div>
                )}

                {activeTab === 'character' && (
                  <div
                    className="animate-fade-in"
                    style={{ transition: 'opacity 180ms ease-out' }}
                  >
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

                {activeTab === 'map' && (
                  <div
                    className="animate-fade-in"
                    style={{ transition: 'opacity 180ms ease-out' }}
                  >
                    <MapSelectView
                      selectedMapId={selectedMapId}
                      onSelectMap={setSelectedMapId}
                      onOpenHelp={() => setHelpSection('pemilihan_peta')}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ONE Unified Bottom Action Dock */}
            <BottomActionDock
              selectedChar={selectedChar}
              selectedMap={selectedMap}
              isBotMatch={isBotMatch}
              botDifficulty={botDifficulty}
              currentRoom={currentRoom}
              onLaunchMatch={handleLaunchMatch}
              demoMode={demoMode}
            />
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
              p2Name={
                isBotMatch
                  ? `Bot Mythomachy (${diffSublabel})`
                  : `Lawan ${currentRoom?.code || 'Online'}`
              }
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

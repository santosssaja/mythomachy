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
import { CHARACTERS, CHARACTER_LIST } from './config/characters';
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
import { AuditView } from './components/AuditView';
import { IconCheck, IconFiligreeCorner, IconGemJade } from './components/SvgIcons';

export type LobbyTab = 'mode' | 'character' | 'map';

const ASH_PARTICLES = [
  { left: '6%', top: '88%', delay: '0s', duration: '8.5s', size: 4 },
  { left: '16%', top: '78%', delay: '2.4s', duration: '11s', size: 3 },
  { left: '26%', top: '92%', delay: '1.1s', duration: '9.2s', size: 5 },
  { left: '39%', top: '82%', delay: '4.2s', duration: '12s', size: 3 },
  { left: '52%', top: '86%', delay: '0.6s', duration: '10.4s', size: 4 },
  { left: '65%', top: '74%', delay: '3.1s', duration: '8.8s', size: 3 },
  { left: '78%', top: '85%', delay: '1.7s', duration: '11.2s', size: 5 },
  { left: '88%', top: '79%', delay: '4.6s', duration: '9.8s', size: 4 },
  { left: '12%', top: '62%', delay: '2.8s', duration: '10s', size: 3 },
  { left: '94%', top: '64%', delay: '1.9s', duration: '12.5s', size: 3 },
  { left: '34%', top: '69%', delay: '4.8s', duration: '9.1s', size: 4 },
  { left: '71%', top: '60%', delay: '1.4s', duration: '10.8s', size: 4 }
];

export const App: React.FC = () => {
  // CRITICAL RULE: demoMode MUST initialize to false (OFF) by default
  const [demoMode, setDemoMode] = useState<boolean>(false);

  // View state: 'lobby', 'match', or 'audit'
  const [currentView, setCurrentView] = useState<'lobby' | 'match' | 'audit'>('lobby');

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

  const unlockedCount = CHARACTER_LIST.filter(
    c => demoMode || !c.isApex || (playerProfile.unlockedMask & (1 << c.numericId)) !== 0
  ).length;

  return (
    <div
      className="app-wrapper text-[#F4F2F7] relative select-none"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 0%, rgba(110, 86, 207, 0.20) 0%, transparent 65%), radial-gradient(circle at 100% 100%, rgba(212, 175, 55, 0.10) 0%, transparent 55%)'
      }}
    >
      {/* Subtle Floating Cosmic Purple Embers Overlay */}
      {ASH_PARTICLES.map((p, idx) => (
        <div
          key={idx}
          className="particle-ash"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: `${p.size}px`,
            height: `${p.size}px`
          }}
        />
      ))}

      {/* Top Header & Settings Bar (KUIL PEMANGGILAN exists ONLY here) */}
      <Header
        demoMode={demoMode}
        onToggleDemoMode={handleToggleDemoMode}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        onOpenGacha={() => setIsGachaOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAudit={() => setCurrentView(prev => (prev === 'audit' ? 'lobby' : 'audit'))}
        isAuditActive={currentView === 'audit'}
        playerProfile={playerProfile}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* MAIN WORKSPACE: AUDIT PAGE, 2-COLUMN LOBBY, OR MATCH ARENA */}
      {currentView === 'audit' ? (
        <AuditView
          onClose={() => setCurrentView('lobby')}
          playerProfile={playerProfile}
          onProfileUpdated={setPlayerProfile}
        />
      ) : currentView === 'lobby' ? (
        <>
          <main className="main-content relative z-10 animate-fade-in">
            {/* LEFT COLUMN: LIVE FIGHTER & ARENA SHOWCASE STAGE */}
            <aside className="left-panel">
              <LobbyShowcaseCard
                selectedChar={selectedChar}
                selectedMap={selectedMap}
                onNavigateTab={tab => setActiveTab(tab)}
                botDifficulty={botDifficulty}
                isBotMatch={isBotMatch}
                onOpenHelp={() => setHelpSection('panggung_pratinjau')}
              />
            </aside>

            {/* RIGHT COLUMN: STEP NAVIGATION & ACTIVE CONFIGURATION PANEL */}
            <section className="right-panel">
              {/* Spacious Segmented Step Tabs */}
              <nav className="stepper-nav grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <button
                  onClick={() => {
                    soundEngine.playClickSound();
                    setActiveTab('mode');
                    setIsBotMatch(true);
                  }}
                  className={`card-surface px-5 py-3 text-left flex items-center gap-3 cursor-pointer transition select-none ${
                    activeTab === 'mode' ? 'card-selected-monad' : 'hover:border-[#6E56CF]'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                      activeTab === 'mode'
                        ? 'bg-[#6E56CF] text-[#F4F2F7]'
                        : 'bg-[#1F1B2E] border border-[#2D2842] text-[#9E98B0]'
                    }`}
                  >
                    1
                  </span>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#F4F2F7]">
                      Mode Laga
                    </div>
                    <div className="text-[11px] text-[#9E98B0] truncate mt-0.5">
                      {modeSublabel}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClickSound();
                    setActiveTab('character');
                  }}
                  className={`card-surface px-5 py-3 text-left flex items-center gap-3 cursor-pointer transition select-none ${
                    activeTab === 'character' ? 'card-selected-monad' : 'hover:border-[#6E56CF]'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                      activeTab === 'character'
                        ? 'bg-[#6E56CF] text-[#F4F2F7]'
                        : 'bg-[#1F1B2E] border border-[#2D2842] text-[#9E98B0]'
                    }`}
                  >
                    2
                  </span>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#F4F2F7]">
                      Pilih Petarung
                    </div>
                    <div className="text-[11px] text-[#D4AF37] truncate mt-0.5">
                      {selectedChar.name} ({unlockedCount}/11 Terbuka)
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClickSound();
                    setActiveTab('map');
                  }}
                  className={`card-surface px-5 py-3 text-left flex items-center gap-3 cursor-pointer transition select-none ${
                    activeTab === 'map' ? 'card-selected-monad' : 'hover:border-[#6E56CF]'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                      activeTab === 'map'
                        ? 'bg-[#6E56CF] text-[#F4F2F7]'
                        : 'bg-[#1F1B2E] border border-[#2D2842] text-[#9E98B0]'
                    }`}
                  >
                    3
                  </span>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#F4F2F7]">
                      Pilih Medan
                    </div>
                    <div className="text-[11px] text-[#9E98B0] truncate mt-0.5">
                      {selectedMap.name}
                    </div>
                  </div>
                </button>
              </nav>

              {/* Active Step Panel */}
              {activeTab === 'mode' && (
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
                  onAdvanceTab={() => setActiveTab('character')}
                />
              )}

              {activeTab === 'character' && (
                <CharacterSelectView
                  selectedId={selectedCharId}
                  onSelectCharacter={setSelectedCharId}
                  playerProfile={playerProfile}
                  demoMode={demoMode}
                  onOpenGacha={() => setIsGachaOpen(true)}
                  onOpenHelp={() => setHelpSection('pemilihan_karakter')}
                  onAdvanceTab={() => setActiveTab('map')}
                />
              )}

              {activeTab === 'map' && (
                <MapSelectView
                  selectedMapId={selectedMapId}
                  onSelectMap={setSelectedMapId}
                  onOpenHelp={() => setHelpSection('pemilihan_peta')}
                />
              )}
            </section>
          </main>

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
        </>
      ) : (
        /* Match Arena View */
        <main className="max-w-[1520px] w-full mx-auto px-4 sm:px-6 pt-3 flex-1 min-h-0 flex flex-col relative z-10 animate-fade-in overflow-hidden">
          <ArenaView
            mapId={selectedMapId}
            viewMode={viewMode}
            graphicsPreset={graphicsPreset}
            p1CharId={selectedCharId}
            p2CharId={opponentCharId}
            p1Name="Ksatria Anda"
            p2Name={
              isBotMatch
                ? diffSublabel
                : `Lawan ${currentRoom?.code || 'Online'}`
            }
            isBotMatch={isBotMatch}
            botDifficulty={botDifficulty}
            playerProfile={playerProfile}
            onProfileUpdated={setPlayerProfile}
            onExitMatch={() => setCurrentView('lobby')}
          />
        </main>
      )}

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

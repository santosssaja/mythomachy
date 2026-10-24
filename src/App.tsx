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

export const App: React.FC = () => {
  // CRITICAL RULE: demoMode MUST initialize to false (OFF) by default
  const [demoMode, setDemoMode] = useState<boolean>(false);

  // View state: 'lobby' or 'match'
  const [currentView, setCurrentView] = useState<'lobby' | 'match'>('lobby');

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

  return (
    <div className={`min-h-screen bg-[#0B0A0F] text-[#F4F2F7] flex flex-col ${demoMode ? 'pb-20' : 'pb-8'}`}>
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
      <main className="max-w-7xl mx-auto w-full px-4 pt-6 flex-grow flex flex-col">
        {currentView === 'lobby' ? (
          <div className="space-y-8 animate-fade-in pb-10">
            {/* 1. Lobby Waiting Room & Matchmaking */}
            <LobbyView
              selectedMapId={selectedMapId}
              selectedCharId={selectedCharId}
              demoMode={demoMode}
              onStartMatchVsBot={handleStartBotMatch}
              onStartMatchVsPlayer={handleStartPlayerMatch}
              onOpenHelp={() => setHelpSection('ruang_tunggu')}
            />

            {/* 2. Character Selection View */}
            <div className="panel-frame p-6 sm:p-8 rounded-2xl border gold-border">
              <CharacterSelectView
                selectedId={selectedCharId}
                onSelectCharacter={setSelectedCharId}
                playerProfile={playerProfile}
                demoMode={demoMode}
                onOpenGacha={() => setIsGachaOpen(true)}
                onOpenHelp={() => setHelpSection('pemilihan_karakter')}
              />
            </div>

            {/* 3. Map Selection View */}
            <div className="panel-frame p-6 sm:p-8 rounded-2xl border gold-border">
              <MapSelectView
                selectedMapId={selectedMapId}
                onSelectMap={setSelectedMapId}
                onOpenHelp={() => setHelpSection('pemilihan_peta')}
              />
            </div>
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

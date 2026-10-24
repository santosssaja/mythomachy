import React, { useEffect, useRef, useState } from 'react';
import {
  CharacterId,
  FighterSimState,
  GraphicsPreset,
  MapId,
  ViewMode,
  AIDifficulty,
  PlayerProfile
} from '../types/game';
import { Mythomachy3DScene } from '../engine/threeScene';
import { CHARACTERS } from '../config/characters';
import { updateFighterState, resolveFighterCollision, processCombatHits } from '../engine/physics';
import { FighterAI } from '../engine/ai';
import { combatEffects } from '../engine/effects';
import { MatchHud } from './MatchHud';
import { VictoryModal } from './VictoryModal';
import { sendSilentTransaction } from '../services/monadRpc';
import { saveStoredPlayerProfile } from '../services/burnerSigner';
import { soundEngine } from '../audio/soundEngine';
import { stringToHex } from 'viem';

interface ArenaViewProps {
  mapId: MapId;
  viewMode: ViewMode;
  graphicsPreset: GraphicsPreset;
  p1CharId: CharacterId;
  p2CharId: CharacterId;
  p1Name: string;
  p2Name: string;
  isBotMatch: boolean;
  botDifficulty: AIDifficulty;
  playerProfile: PlayerProfile;
  onProfileUpdated: (p: PlayerProfile) => void;
  onExitMatch: () => void;
}

export const ArenaView: React.FC<ArenaViewProps> = ({
  mapId,
  viewMode,
  graphicsPreset,
  p1CharId,
  p2CharId,
  p1Name,
  p2Name,
  isBotMatch,
  botDifficulty,
  playerProfile,
  onProfileUpdated,
  onExitMatch
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Mythomachy3DScene | null>(null);
  const aiRef = useRef<FighterAI>(new FighterAI(botDifficulty));

  // Fighter simulation state
  const p1Char = CHARACTERS[p1CharId];
  const p2Char = CHARACTERS[p2CharId];

  const [p1State, setP1State] = useState<FighterSimState>(() => ({
    id: 'player1',
    characterId: p1CharId,
    x: -3.5,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    hp: p1Char.maxHp,
    maxHp: p1Char.maxHp,
    energy: 40,
    facing: 1,
    state: 'IDLE',
    stateTimer: 0,
    attackHitRegistered: false,
    skillCooldownRemaining: 0,
    ultimateCooldownRemaining: 0,
    isBlocking: false,
    damageReductionBuff: 0,
    damageReductionTimer: 0,
    slowTimer: 0,
    slowFactor: 1.0,
    rootTimer: 0,
    radius: p1Char.radius,
    comboCount: 0,
    lastHitTime: 0
  }));

  const [p2State, setP2State] = useState<FighterSimState>(() => ({
    id: 'player2',
    characterId: p2CharId,
    x: 3.5,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    hp: p2Char.maxHp,
    maxHp: p2Char.maxHp,
    energy: 30,
    facing: -1,
    state: 'IDLE',
    stateTimer: 0,
    attackHitRegistered: false,
    skillCooldownRemaining: 0,
    ultimateCooldownRemaining: 0,
    isBlocking: false,
    damageReductionBuff: 0,
    damageReductionTimer: 0,
    slowTimer: 0,
    slowFactor: 1.0,
    rootTimer: 0,
    radius: p2Char.radius,
    comboCount: 0,
    lastHitTime: 0
  }));

  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null);
  const [damageTexts, setDamageTexts] = useState(combatEffects.getTexts());
  const [matchIntro, setMatchIntro] = useState<string>('BERSIAP...');
  const [skillBanner, setSkillBanner] = useState<{ text: string; color: string } | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Trigger match start intro sequence
  useEffect(() => {
    const t1 = setTimeout(() => setMatchIntro('LAGA DIMULAI!'), 900);
    const t2 = setTimeout(() => setMatchIntro(''), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Screen shake helper
  const triggerScreenShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  // Mutable refs for high-frequency physics update loop
  const p1Ref = useRef<FighterSimState>(p1State);
  const p2Ref = useRef<FighterSimState>(p2State);
  const keysDown = useRef<Record<string, boolean>>({});

  // Sync state refs
  useEffect(() => {
    p1Ref.current = p1State;
  }, [p1State]);
  useEffect(() => {
    p2Ref.current = p2State;
  }, [p2State]);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new Mythomachy3DScene(containerRef.current, mapId, graphicsPreset);
    scene.setViewMode(viewMode);
    sceneRef.current = scene;

    return () => {
      scene.destroy();
    };
  }, [mapId]);

  // Update view mode dynamically
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setViewMode(viewMode);
    }
  }, [viewMode]);

  // Update graphics preset dynamically
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.applyGraphicsPreset(graphicsPreset);
    }
  }, [graphicsPreset]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysDown.current[key] = true;

      const p1 = p1Ref.current;
      if (p1.hp <= 0 || winner) return;

      if (key === 'j') {
        // Basic Attack
        if (p1.state !== 'ATTACK' && p1.state !== 'SKILL' && p1.state !== 'ULTIMATE') {
          p1.state = 'ATTACK';
          p1.stateTimer = 0;
          p1.attackHitRegistered = false;
        }
      } else if (key === 'k') {
        // Skill 1
        if (p1.skillCooldownRemaining <= 0 && p1.state !== 'SKILL' && p1.state !== 'ULTIMATE') {
          p1.state = 'SKILL';
          p1.stateTimer = 0;
          p1.attackHitRegistered = false;
          p1.skillCooldownRemaining = p1Char.skill1.cooldown;
          setSkillBanner({ text: `${p1Char.name}: ${p1Char.skill1.name}`, color: '#00D2D3' });
          setTimeout(() => setSkillBanner(null), 1400);
          if (p1Char.skill1.dash) {
            p1.vx = p1.facing * p1Char.speed * 2.2;
          }
        }
      } else if (key === 'l') {
        // Ultimate
        if (p1.energy >= 100 && p1.ultimateCooldownRemaining <= 0) {
          p1.state = 'ULTIMATE';
          p1.stateTimer = 0;
          p1.attackHitRegistered = false;
          p1.energy = 0;
          p1.ultimateCooldownRemaining = p1Char.ultimate.cooldown;
          setSkillBanner({ text: `${p1Char.name}: ${p1Char.ultimate.name}!`, color: '#D4AF37' });
          triggerScreenShake();
          setTimeout(() => setSkillBanner(null), 2000);
        }
      } else if (key === 'w' || key === 'arrowup') {
        // Jump
        if (p1.y === 0) {
          p1.vy = 12.5;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysDown.current[key] = false;
      if (key === 's' || key === 'arrowdown') {
        p1Ref.current.isBlocking = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [winner, p1Char]);

  // Main 60 FPS Physics & Render Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const rawDt = (time - lastTime) / 1000;
      lastTime = time;
      const dt = Math.min(rawDt, 0.05); // Cap to avoid lag jumps

      const p1 = p1Ref.current;
      const p2 = p2Ref.current;

      if (!winner) {
        // 1. Process P1 Input Movement
        const keys = keysDown.current;
        p1.isBlocking = Boolean(keys['s'] || keys['arrowdown']);

        if (p1.state !== 'ATTACK' && p1.state !== 'SKILL' && p1.state !== 'ULTIMATE' && p1.state !== 'HIT') {
          let moveDir = 0;
          if (keys['a'] || keys['arrowleft']) moveDir -= 1;
          if (keys['d'] || keys['arrowright']) moveDir += 1;

          if (moveDir !== 0 && !p1.isBlocking) {
            p1.state = 'WALK';
            p1.facing = moveDir;
            p1.vx = moveDir * p1Char.speed * p1.slowFactor;
            p1.x += p1.vx * dt;
          } else {
            p1.state = 'IDLE';
            p1.vx = 0;
          }
        }

        // 2. Process P2 AI
        if (isBotMatch) {
          aiRef.current.update(p2, p1, dt);
        }

        // 3. Update Individual Timers & Gravity
        updateFighterState(p1, dt);
        updateFighterState(p2, dt);

        // 4. Strict Sub-stepped Anti-Clipping Collision Resolution
        resolveFighterCollision(p1, p2, 4);

        // 5. Process Combat Hits
        const hitP1toP2 = processCombatHits(p1, p2);
        if (hitP1toP2) {
          combatEffects.addDamageText(hitP1toP2.x, hitP1toP2.y, hitP1toP2.damage, hitP1toP2.blocked);
          if (hitP1toP2.damage > 90) triggerScreenShake();
        }

        const hitP2toP1 = processCombatHits(p2, p1);
        if (hitP2toP1) {
          combatEffects.addDamageText(hitP2toP1.x, hitP2toP1.y, hitP2toP1.damage, hitP2toP1.blocked);
          if (hitP2toP1.damage > 90) triggerScreenShake();
        }

        // 6. Check Win Condition
        if (p2.hp <= 0 && !winner) {
          setWinner('player1');
          soundEngine.playGachaSummonChimes(true);
          handleMatchSettlement('player1');
        } else if (p1.hp <= 0 && !winner) {
          setWinner('player2');
          handleMatchSettlement('player2');
        }
      }

      // 7. Update Combat Floating Texts
      combatEffects.update(dt);
      setDamageTexts([...combatEffects.getTexts()]);

      // 8. Render Three.js Scene
      if (sceneRef.current) {
        sceneRef.current.render(p1, p2, dt);
      }

      // Push state to React UI (for HUD meters)
      setP1State({ ...p1 });
      setP2State({ ...p2 });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [winner, isBotMatch, p1Char]);

  // Settle Match On-Chain Silently & Award Relics
  const handleMatchSettlement = (winningPlayer: 'player1' | 'player2') => {
    const isP1 = winningPlayer === 'player1';
    const relicReward = !isBotMatch ? 25 : botDifficulty === 'easy' ? 10 : botDifficulty === 'medium' ? 20 : 35;
    if (isP1) {
      const updated = {
        ...playerProfile,
        victories: playerProfile.victories + 1,
        matchesPlayed: playerProfile.matchesPlayed + 1,
        relicShards: playerProfile.relicShards + relicReward
      };
      saveStoredPlayerProfile(updated);
      onProfileUpdated(updated);
    } else {
      const updated = {
        ...playerProfile,
        matchesPlayed: playerProfile.matchesPlayed + 1
      };
      saveStoredPlayerProfile(updated);
      onProfileUpdated(updated);
    }

    // Trigger silent on-chain match settlement
    const bytes6Room = stringToHex('MONAD8', { size: 6 });
    sendSilentTransaction('settleMatch', [
      bytes6Room,
      playerProfile.address,
      p1Char.numericId,
      p2Char.numericId
    ]).catch(() => {});
  };

  const handlePlayerOnScreenAction = (action: 'ATTACK' | 'SKILL' | 'ULTIMATE' | 'BLOCK' | 'DASH' | 'JUMP') => {
    const p1 = p1Ref.current;
    if (p1.hp <= 0 || winner) return;

    if (action === 'ATTACK') {
      if (p1.state !== 'ATTACK' && p1.state !== 'SKILL' && p1.state !== 'ULTIMATE') {
        p1.state = 'ATTACK';
        p1.stateTimer = 0;
        p1.attackHitRegistered = false;
      }
    } else if (action === 'SKILL') {
      if (p1.skillCooldownRemaining <= 0) {
        p1.state = 'SKILL';
        p1.stateTimer = 0;
        p1.attackHitRegistered = false;
        p1.skillCooldownRemaining = p1Char.skill1.cooldown;
        setSkillBanner({ text: `${p1Char.name}: ${p1Char.skill1.name}`, color: '#00D2D3' });
        setTimeout(() => setSkillBanner(null), 1400);
        if (p1Char.skill1.dash) {
          p1.vx = p1.facing * p1Char.speed * 2.2;
        }
      }
    } else if (action === 'ULTIMATE') {
      if (p1.energy >= 100 && p1.ultimateCooldownRemaining <= 0) {
        p1.state = 'ULTIMATE';
        p1.stateTimer = 0;
        p1.attackHitRegistered = false;
        p1.energy = 0;
        p1.ultimateCooldownRemaining = p1Char.ultimate.cooldown;
        setSkillBanner({ text: `${p1Char.name}: ${p1Char.ultimate.name}!`, color: '#D4AF37' });
        triggerScreenShake();
        setTimeout(() => setSkillBanner(null), 2000);
      }
    } else if (action === 'BLOCK') {
      p1.isBlocking = !p1.isBlocking;
    }
  };

  return (
    <div className={`relative w-full h-[82vh] min-h-[550px] bg-[#0B0A0F] rounded-2xl overflow-hidden border border-[#2D2842] shadow-2xl ${isShaking ? 'shake-screen' : ''}`}>
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Match Intro Banner */}
      {matchIntro && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="text-center animate-scale-up">
            <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] block font-cinzel">
              Ronde 1
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-cinzel tracking-wider text-[#F4F2F7] drop-shadow-[0_4px_16px_rgba(212,175,55,0.6)]">
              {matchIntro}
            </h2>
          </div>
        </div>
      )}

      {/* Skill Cast Announcement Banner */}
      {skillBanner && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-slide-down">
          <div className="px-5 py-2 rounded-xl bg-[#0B0A0F]/90 border border-[#D4AF37] shadow-xl shadow-[#D4AF37]/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
            <span className="font-cinzel font-black text-xs sm:text-sm tracking-wider uppercase text-[#F4F2F7]">
              {skillBanner.text}
            </span>
          </div>
        </div>
      )}

      {/* Floating Damage Text Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {damageTexts.map(dt => (
          <div
            key={dt.id}
            className="absolute font-cinzel font-black text-sm sm:text-base animate-bounce"
            style={{
              left: `${50 + (dt.x / 14) * 45}%`,
              top: `${55 - dt.y * 12}%`,
              color: dt.color,
              opacity: dt.life,
              textShadow: '0 2px 8px rgba(0,0,0,0.9)'
            }}
          >
            {dt.text}
          </div>
        ))}
      </div>

      {/* In-Game HUD Controls */}
      <MatchHud
        p1={p1State}
        p2={p2State}
        p1Name={p1Name}
        p2Name={p2Name}
        onPlayerAction={handlePlayerOnScreenAction}
        onExitMatch={onExitMatch}
      />

      {/* Match Settlement / Victory Modal */}
      {winner && (
        <VictoryModal
          winnerId={winner}
          winnerName={winner === 'player1' ? p1Name : p2Name}
          winnerChar={winner === 'player1' ? p1Char : p2Char}
          isP1Winner={winner === 'player1'}
          onReturnToLobby={onExitMatch}
          relicsAwarded={!isBotMatch ? 25 : botDifficulty === 'easy' ? 10 : botDifficulty === 'medium' ? 20 : 35}
        />
      )}
    </div>
  );
};

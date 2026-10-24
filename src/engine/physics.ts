import { FighterSimState } from '../types/game';
import { CHARACTERS } from '../config/characters';
import { soundEngine } from '../audio/soundEngine';

export const ARENA_BOUND_X = 13.5;
export const GRAVITY = -32;

export interface AttackHitEvent {
  attackerId: string;
  defenderId: string;
  damage: number;
  blocked: boolean;
  knockback: number;
  x: number;
  y: number;
  skillName: string;
}

/**
 * Update a single fighter's internal timers, movement, jumping, and state transitions
 */
export function updateFighterState(fighter: FighterSimState, dt: number) {
  // Update state timer
  fighter.stateTimer += dt;

  // Update cooldowns
  if (fighter.skillCooldownRemaining > 0) {
    fighter.skillCooldownRemaining = Math.max(0, fighter.skillCooldownRemaining - dt);
  }
  if (fighter.ultimateCooldownRemaining > 0) {
    fighter.ultimateCooldownRemaining = Math.max(0, fighter.ultimateCooldownRemaining - dt);
  }

  // Update buffs & debuffs
  if (fighter.damageReductionTimer > 0) {
    fighter.damageReductionTimer -= dt;
    if (fighter.damageReductionTimer <= 0) {
      fighter.damageReductionBuff = 0;
    }
  }

  if (fighter.slowTimer > 0) {
    fighter.slowTimer -= dt;
    if (fighter.slowTimer <= 0) {
      fighter.slowFactor = 1.0;
    }
  }

  if (fighter.rootTimer > 0) {
    fighter.rootTimer -= dt;
    fighter.vx = 0;
  }

  // Apply gravity
  if (fighter.y > 0 || fighter.vy > 0) {
    fighter.vy += GRAVITY * dt;
    fighter.y += fighter.vy * dt;
    if (fighter.y <= 0) {
      fighter.y = 0;
      fighter.vy = 0;
    }
  }

  // State completion checks
  if (fighter.state === 'ATTACK' && fighter.stateTimer >= 0.35) {
    fighter.state = 'IDLE';
    fighter.attackHitRegistered = false;
  } else if (fighter.state === 'DASH' && fighter.stateTimer >= 0.28) {
    fighter.state = 'IDLE';
  } else if (fighter.state === 'SKILL' && fighter.stateTimer >= 0.55) {
    fighter.state = 'IDLE';
    fighter.attackHitRegistered = false;
  } else if (fighter.state === 'ULTIMATE' && fighter.stateTimer >= 1.2) {
    fighter.state = 'IDLE';
    fighter.attackHitRegistered = false;
  } else if (fighter.state === 'HIT' && fighter.stateTimer >= 0.3) {
    fighter.state = 'IDLE';
  }

  // Clamp within arena bounds
  if (fighter.x < -ARENA_BOUND_X) {
    fighter.x = -ARENA_BOUND_X;
    fighter.vx = 0;
  } else if (fighter.x > ARENA_BOUND_X) {
    fighter.x = ARENA_BOUND_X;
    fighter.vx = 0;
  }
}

/**
 * Strict Sub-stepped Anti-Clipping Cylinder Collision Resolution
 * minDistance = f1.radius + f2.radius
 * Ensures fighters stop physically against each other and never overlap or clip through
 */
export function resolveFighterCollision(
  f1: FighterSimState,
  f2: FighterSimState,
  subSteps: number = 4
) {
  const minDistance = f1.radius + f2.radius;

  for (let step = 0; step < subSteps; step++) {
    const dx = f2.x - f1.x;
    const dist = Math.abs(dx);

    if (dist < minDistance) {
      const overlap = minDistance - dist;
      const push = overlap / 2;

      // Stop dash immediately if touching opponent's boundary
      if (f1.state === 'DASH') {
        f1.vx = 0;
        f1.state = 'IDLE';
      }
      if (f2.state === 'DASH') {
        f2.vx = 0;
        f2.state = 'IDLE';
      }

      if (dx >= 0) {
        // f1 is to the left, f2 is to the right
        f1.x -= push;
        f2.x += push;
      } else {
        // f1 is to the right, f2 is to the left
        f1.x += push;
        f2.x -= push;
      }

      // Re-clamp bounds
      f1.x = Math.max(-ARENA_BOUND_X, Math.min(ARENA_BOUND_X, f1.x));
      f2.x = Math.max(-ARENA_BOUND_X, Math.min(ARENA_BOUND_X, f2.x));
    }
  }
}

/**
 * Check and resolve attack hits between attacker and defender
 */
export function processCombatHits(
  attacker: FighterSimState,
  defender: FighterSimState
): AttackHitEvent | null {
  if (attacker.attackHitRegistered || defender.hp <= 0) return null;

  const charDef = CHARACTERS[attacker.characterId];
  const dist = Math.abs(defender.x - attacker.x);
  const isFacingDefender =
    (attacker.facing === 1 && defender.x > attacker.x) ||
    (attacker.facing === -1 && defender.x < attacker.x);

  let rawDmg = 0;
  let knockback = 0;
  let skillName = '';
  let hitTriggered = false;

  if (attacker.state === 'ATTACK' && attacker.stateTimer >= 0.12) {
    if (dist <= charDef.basicAttack.range && isFacingDefender) {
      rawDmg = charDef.basicAttack.damage;
      knockback = 0.8;
      skillName = charDef.basicAttack.name;
      hitTriggered = true;
      soundEngine.playHitSound(false);
    }
  } else if (attacker.state === 'SKILL' && attacker.stateTimer >= 0.2) {
    const range = charDef.skill1.dash ? 3.5 : charDef.skill1.projectile ? 9.0 : 2.8;
    if (dist <= range && isFacingDefender) {
      rawDmg = charDef.skill1.damage;
      knockback = 2.4;
      skillName = charDef.skill1.name;
      hitTriggered = true;

      // Special skill side-effects
      if (attacker.characterId === 'anubis') {
        // Heals 60 HP
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + 60);
      } else if (attacker.characterId === 'nyirorokidul') {
        // Heals 90 HP
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + 90);
      } else if (attacker.characterId === 'athena') {
        // Counter dmg
        rawDmg += 30;
      }

      soundEngine.playHitSound(true);
      if (attacker.characterId === 'thor') {
        soundEngine.playThunderSound();
      } else if (attacker.characterId === 'nyirorokidul') {
        soundEngine.playOceanWaveSound();
      }
    }
  } else if (attacker.state === 'ULTIMATE' && attacker.stateTimer >= 0.35) {
    // Ultimate AoE check
    const range = 8.5;
    if (dist <= range) {
      rawDmg = charDef.ultimate.damage;
      knockback = 4.0;
      skillName = charDef.ultimate.name;
      hitTriggered = true;

      // Special ultimate effects
      if (attacker.characterId === 'gatotkaca') {
        attacker.damageReductionBuff = 0.3;
        attacker.damageReductionTimer = 5.0;
      } else if (attacker.characterId === 'athena' || attacker.characterId === 'anubis') {
        defender.slowTimer = 3.5;
        defender.slowFactor = 0.5;
      } else if (attacker.characterId === 'gilgamesh') {
        defender.rootTimer = 1.5;
      } else if (attacker.characterId === 'chronos') {
        defender.slowTimer = 2.5;
        defender.slowFactor = 0.2; // 80% time slow
      }

      soundEngine.playUltimateSound();
      if (attacker.characterId === 'thor') soundEngine.playThunderSound();
      if (attacker.characterId === 'nyirorokidul') soundEngine.playOceanWaveSound();
    }
  }

  if (hitTriggered) {
    attacker.attackHitRegistered = true;
    attacker.energy = Math.min(100, attacker.energy + 18);

    // Apply block reduction
    let actualDmg = rawDmg;
    let blocked = false;
    if (defender.isBlocking) {
      actualDmg = Math.round(rawDmg * 0.35); // 65% block
      blocked = true;
      knockback *= 0.4;
    }

    // Apply defender buff reduction
    if (defender.damageReductionBuff > 0) {
      actualDmg = Math.round(actualDmg * (1 - defender.damageReductionBuff));
    }

    defender.hp = Math.max(0, defender.hp - actualDmg);
    defender.state = 'HIT';
    defender.stateTimer = 0;
    defender.energy = Math.min(100, defender.energy + 10);

    // Knockback
    const knockDir = attacker.facing;
    defender.x += knockDir * knockback;
    defender.x = Math.max(-ARENA_BOUND_X, Math.min(ARENA_BOUND_X, defender.x));

    return {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: actualDmg,
      blocked,
      knockback,
      x: defender.x,
      y: defender.y + 1.2,
      skillName
    };
  }

  return null;
}

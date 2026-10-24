import { AIDifficulty, FighterSimState } from '../types/game';
import { CHARACTERS } from '../config/characters';

export class FighterAI {
  private difficulty: AIDifficulty;
  private thinkCooldown: number = 0;
  private currentAction: 'IDLE' | 'APPROACH' | 'RETREAT' | 'ATTACK' | 'SKILL' | 'ULTIMATE' | 'BLOCK' = 'IDLE';

  // Anti-aggression pacing and humanized recovery timers
  private attackRecoveryTimer: number = 0; // Breathing room between bot attack chains
  private blockDurationTimer: number = 0;  // Finite guard duration before dropping defense
  private hesitationTimer: number = 0;     // Mid-range neutral game posturing

  constructor(difficulty: AIDifficulty = 'medium') {
    this.difficulty = difficulty;
  }

  public setDifficulty(diff: AIDifficulty) {
    this.difficulty = diff;
  }

  public update(bot: FighterSimState, opponent: FighterSimState, dt: number) {
    if (bot.hp <= 0 || opponent.hp <= 0) return;

    // Tick down pacing timers
    this.thinkCooldown -= dt;
    if (this.attackRecoveryTimer > 0) this.attackRecoveryTimer -= dt;
    if (this.hesitationTimer > 0) this.hesitationTimer -= dt;

    // Handle block duration limit (never turtle indefinitely)
    if (this.blockDurationTimer > 0) {
      this.blockDurationTimer -= dt;
      if (this.blockDurationTimer <= 0 && this.currentAction === 'BLOCK') {
        this.currentAction = 'IDLE';
        bot.isBlocking = false;
      }
    }

    const dist = Math.abs(opponent.x - bot.x);
    const facingOpponent = opponent.x > bot.x ? 1 : -1;
    bot.facing = facingOpponent;

    // Humanized reaction delays (giving the player fair punish windows)
    const reactionDelay =
      this.difficulty === 'easy' ? 0.60 + Math.random() * 0.15 :
      this.difficulty === 'medium' ? 0.38 + Math.random() * 0.10 :
      0.20 + Math.random() * 0.06;

    if (this.thinkCooldown <= 0) {
      this.thinkCooldown = reactionDelay;
      this.decideNextAction(bot, opponent, dist);
    }

    // Execute decision
    this.executeAction(bot, opponent, dist, dt);
  }

  private decideNextAction(bot: FighterSimState, opponent: FighterSimState, dist: number) {
    const charDef = CHARACTERS[bot.characterId];

    // Priority 1: Humanized Reactive Blocking (Fair, no instant-read omniscience)
    if (opponent.state === 'ATTACK' || opponent.state === 'SKILL' || opponent.state === 'ULTIMATE') {
      const blockProb =
        this.difficulty === 'easy' ? 0.08 :
        this.difficulty === 'medium' ? 0.28 : 0.50;

      // Only block if reasonably close and reaction check succeeds
      if (dist < 3.2 && Math.random() < blockProb) {
        this.currentAction = 'BLOCK';
        // Hold block for a brief moment then drop guard
        this.blockDurationTimer = 0.30 + Math.random() * 0.25;
        return;
      }
    }

    // Priority 2: Respect Attack Recovery Window (Anti-Spam / Anti-Aggression)
    // When the bot has just attacked, it must observe, wait, or space before striking again
    if (this.attackRecoveryTimer > 0) {
      if (dist < charDef.basicAttack.range + 0.4) {
        // In close range during recovery: 50% wait, 40% step back, 10% cautious guard
        const roll = Math.random();
        if (roll < 0.50) {
          this.currentAction = 'IDLE';
        } else if (roll < 0.90) {
          this.currentAction = 'RETREAT';
        } else {
          this.currentAction = 'BLOCK';
          this.blockDurationTimer = 0.25;
        }
      } else {
        // At mid range during recovery: observe or circle
        this.currentAction = Math.random() < 0.65 ? 'IDLE' : 'RETREAT';
      }
      return;
    }

    // Priority 3: Ultimate Ability (Fair trigger rates with cooldown)
    if (bot.energy >= 100 && bot.ultimateCooldownRemaining <= 0) {
      const triggerProb =
        this.difficulty === 'easy' ? 0.30 :
        this.difficulty === 'medium' ? 0.55 : 0.78;

      if (dist < 5.0 && Math.random() < triggerProb) {
        this.currentAction = 'ULTIMATE';
        this.attackRecoveryTimer = this.difficulty === 'easy' ? 1.2 : 0.8;
        return;
      }
    }

    // Priority 4: Cast Skill 1 (Non-spammed, deliberate pacing)
    if (bot.skillCooldownRemaining <= 0) {
      const optimalRange = charDef.skill1.dash ? 4.5 : charDef.skill1.projectile ? 7.5 : 2.4;
      const skillProb =
        this.difficulty === 'easy' ? 0.35 :
        this.difficulty === 'medium' ? 0.55 : 0.75;

      if (dist <= optimalRange && Math.random() < skillProb) {
        this.currentAction = 'SKILL';
        this.attackRecoveryTimer =
          this.difficulty === 'easy' ? 0.95 :
          this.difficulty === 'medium' ? 0.60 : 0.35;
        return;
      }
    }

    // Priority 5: Basic Attack in Melee Range (With hesitation & pauses)
    const meleeThreshold = charDef.basicAttack.range + 0.15;
    if (dist <= meleeThreshold) {
      const attackProb =
        this.difficulty === 'easy' ? 0.45 :
        this.difficulty === 'medium' ? 0.65 : 0.80;

      if (Math.random() < attackProb) {
        this.currentAction = 'ATTACK';
        // Set post-attack cooldown so bot doesn't spam consecutive attacks endlessly
        this.attackRecoveryTimer =
          this.difficulty === 'easy' ? 0.85 + Math.random() * 0.40 : // 0.85s - 1.25s
          this.difficulty === 'medium' ? 0.50 + Math.random() * 0.25 : // 0.50s - 0.75s
          0.30 + Math.random() * 0.15; // 0.30s - 0.45s
      } else {
        // Feint / hesitation in melee range: step back or wait
        this.currentAction = Math.random() < 0.60 ? 'IDLE' : 'RETREAT';
        this.hesitationTimer = 0.4;
      }
      return;
    }

    // Priority 6: Spacing & Neutral Game (Footsies instead of mindless sprinting)
    if (dist > charDef.basicAttack.range + 0.5) {
      if (dist > 5.5) {
        // Far away: close the distance
        this.currentAction = 'APPROACH';
      } else {
        // Mid-range neutral game (2.0 - 5.5 units):
        // Introduce natural rhythm: approach, pause, or step back to bait whiffs
        const neutralRoll = Math.random();
        if (this.difficulty === 'easy') {
          // Easy bot gives lots of room (40% approach, 40% idle, 20% retreat)
          this.currentAction = neutralRoll < 0.40 ? 'APPROACH' : neutralRoll < 0.80 ? 'IDLE' : 'RETREAT';
        } else if (this.difficulty === 'medium') {
          // Medium bot has good rhythm (55% approach, 25% idle, 20% retreat)
          this.currentAction = neutralRoll < 0.55 ? 'APPROACH' : neutralRoll < 0.80 ? 'IDLE' : 'RETREAT';
        } else {
          // Hard bot is tactical (65% approach, 15% idle, 20% retreat)
          this.currentAction = neutralRoll < 0.65 ? 'APPROACH' : neutralRoll < 0.80 ? 'IDLE' : 'RETREAT';
        }
      }
    } else {
      // In-and-out spacing
      this.currentAction = Math.random() < 0.40 ? 'RETREAT' : 'IDLE';
    }
  }

  private executeAction(bot: FighterSimState, opponent: FighterSimState, dist: number, dt: number) {
    const charDef = CHARACTERS[bot.characterId];
    const speed = charDef.speed * bot.slowFactor;

    // Reset blocking unless explicitly in BLOCK action
    bot.isBlocking = this.currentAction === 'BLOCK';

    if (bot.state === 'HIT' || bot.state === 'SKILL' || bot.state === 'ULTIMATE' || bot.state === 'ATTACK') {
      return;
    }

    switch (this.currentAction) {
      case 'BLOCK':
        bot.isBlocking = true;
        bot.state = 'IDLE';
        bot.vx = 0;
        break;

      case 'ATTACK':
        bot.state = 'ATTACK';
        bot.stateTimer = 0;
        bot.attackHitRegistered = false;
        break;

      case 'SKILL':
        if (bot.skillCooldownRemaining <= 0) {
          bot.state = 'SKILL';
          bot.stateTimer = 0;
          bot.attackHitRegistered = false;
          bot.skillCooldownRemaining = charDef.skill1.cooldown;
          if (charDef.skill1.dash) {
            bot.vx = bot.facing * speed * 1.8;
          }
        }
        break;

      case 'ULTIMATE':
        if (bot.energy >= 100 && bot.ultimateCooldownRemaining <= 0) {
          bot.state = 'ULTIMATE';
          bot.stateTimer = 0;
          bot.attackHitRegistered = false;
          bot.energy = 0;
          bot.ultimateCooldownRemaining = charDef.ultimate.cooldown;
        }
        break;

      case 'APPROACH': {
        bot.state = 'WALK';
        // Controlled, natural movement speed (avoiding relentless heat-seeking feel)
        const approachPace =
          this.difficulty === 'easy' ? 0.70 :
          this.difficulty === 'medium' ? 0.85 : 0.95;
        bot.vx = bot.rootTimer <= 0 ? bot.facing * (speed * approachPace) : 0;

        // Occasional tactical jump only on Hard difficulty
        if (this.difficulty === 'hard' && dist < 4.0 && Math.random() < 0.008 && bot.y === 0) {
          bot.vy = 11.0;
        }
        break;
      }

      case 'RETREAT':
        bot.state = 'WALK';
        bot.vx = bot.rootTimer <= 0 ? -bot.facing * (speed * 0.75) : 0;
        break;

      case 'IDLE':
      default:
        bot.state = 'IDLE';
        bot.vx = 0;
        break;
    }
  }
}

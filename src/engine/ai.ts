import { AIDifficulty, FighterSimState } from '../types/game';
import { CHARACTERS } from '../config/characters';

export class FighterAI {
  private difficulty: AIDifficulty;
  private thinkCooldown: number = 0;
  private currentAction: 'IDLE' | 'APPROACH' | 'RETREAT' | 'ATTACK' | 'SKILL' | 'ULTIMATE' | 'BLOCK' = 'IDLE';

  constructor(difficulty: AIDifficulty = 'medium') {
    this.difficulty = difficulty;
  }

  public setDifficulty(diff: AIDifficulty) {
    this.difficulty = diff;
  }

  public update(bot: FighterSimState, opponent: FighterSimState, dt: number) {
    if (bot.hp <= 0 || opponent.hp <= 0) return;

    this.thinkCooldown -= dt;

    const dist = Math.abs(opponent.x - bot.x);
    const facingOpponent = (opponent.x > bot.x ? 1 : -1);
    bot.facing = facingOpponent;

    // Reaction times based on difficulty
    const reactionDelay =
      this.difficulty === 'easy' ? 0.45 :
      this.difficulty === 'medium' ? 0.22 : 0.08;

    if (this.thinkCooldown <= 0) {
      this.thinkCooldown = reactionDelay + Math.random() * 0.1;
      this.decideNextAction(bot, opponent, dist);
    }

    // Execute decision
    this.executeAction(bot, opponent, dist, dt);
  }

  private decideNextAction(bot: FighterSimState, opponent: FighterSimState, dist: number) {
    const charDef = CHARACTERS[bot.characterId];

    // Priority 1: High level reactive blocking
    if (this.difficulty !== 'easy' && (opponent.state === 'ATTACK' || opponent.state === 'SKILL' || opponent.state === 'ULTIMATE')) {
      const blockProb = this.difficulty === 'hard' ? 0.85 : 0.55;
      if (dist < 3.5 && Math.random() < blockProb) {
        this.currentAction = 'BLOCK';
        return;
      }
    }

    // Priority 2: Unleash Ultimate if charged
    if (bot.energy >= 100 && bot.ultimateCooldownRemaining <= 0) {
      const triggerProb = this.difficulty === 'easy' ? 0.5 : 0.9;
      if (dist < 6.0 && Math.random() < triggerProb) {
        this.currentAction = 'ULTIMATE';
        return;
      }
    }

    // Priority 3: Cast Skill 1
    if (bot.skillCooldownRemaining <= 0) {
      const optimalRange = charDef.skill1.dash ? 5.5 : charDef.skill1.projectile ? 8.0 : 2.5;
      if (dist <= optimalRange) {
        this.currentAction = 'SKILL';
        return;
      }
    }

    // Priority 4: Basic Attack if in melee range
    if (dist <= charDef.basicAttack.range + 0.3) {
      this.currentAction = 'ATTACK';
      return;
    }

    // Priority 5: Spacing & Movement
    if (dist > charDef.basicAttack.range + 0.5) {
      // Approach
      this.currentAction = 'APPROACH';
    } else {
      // Tactical spacing
      if (this.difficulty === 'hard' && Math.random() < 0.3) {
        this.currentAction = 'RETREAT';
      } else {
        this.currentAction = 'APPROACH';
      }
    }
  }

  private executeAction(bot: FighterSimState, opponent: FighterSimState, dist: number, dt: number) {
    const charDef = CHARACTERS[bot.characterId];
    const speed = charDef.speed * bot.slowFactor;

    // Reset block unless currently in block action
    bot.isBlocking = false;

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
            bot.vx = bot.facing * speed * 2.2;
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

      case 'APPROACH':
        bot.state = 'WALK';
        bot.vx = bot.facing * speed;
        bot.x += bot.vx * dt;
        // Occasional tactical jump
        if (this.difficulty === 'hard' && dist < 4.0 && Math.random() < 0.015 && bot.y === 0) {
          bot.vy = 12.0;
        }
        break;

      case 'RETREAT':
        bot.state = 'WALK';
        bot.vx = -bot.facing * (speed * 0.85);
        bot.x += bot.vx * dt;
        break;

      default:
        bot.state = 'IDLE';
        bot.vx = 0;
        break;
    }
  }
}

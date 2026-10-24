export interface CombatText {
  id: string;
  text: string;
  x: number; // in world coordinates
  y: number;
  color: string;
  life: number; // 0 to 1
  blocked?: boolean;
}

export class CombatEffectsManager {
  private texts: CombatText[] = [];

  public addDamageText(x: number, y: number, damage: number, blocked: boolean = false) {
    this.texts.push({
      id: Math.random().toString(),
      text: blocked ? `Tangkis! -${damage}` : `-${damage}`,
      x: x + (Math.random() - 0.5) * 0.4,
      y: y + 0.8,
      color: blocked ? '#3498DB' : '#D9383A',
      life: 1.0,
      blocked
    });
  }

  public update(dt: number) {
    this.texts.forEach(t => {
      t.life -= dt * 1.5;
      t.y += dt * 0.8;
    });
    this.texts = this.texts.filter(t => t.life > 0);
  }

  public getTexts(): CombatText[] {
    return this.texts;
  }
}

export const combatEffects = new CombatEffectsManager();

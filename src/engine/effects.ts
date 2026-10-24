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

  public addDamageText(
    x: number,
    y: number,
    damage: number,
    blocked: boolean = false,
    comboCount: number = 0
  ) {
    let label = blocked ? `Tangkis! -${damage}` : `-${damage}`;
    if (!blocked && comboCount > 1) {
      label += ` (${comboCount}x)`;
    }

    this.texts.push({
      id: Math.random().toString(),
      text: label,
      x: x + (Math.random() - 0.5) * 0.4,
      y: y + 0.8,
      color: blocked ? '#3498DB' : comboCount >= 3 ? '#FFEAA7' : '#D9383A',
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

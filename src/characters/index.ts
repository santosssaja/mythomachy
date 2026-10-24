import { CharacterDef, CharacterId } from '../types/game';
import { CharacterModule } from './types';
import { gatotkacaModule } from './modules/gatotkaca';
import { athenaModule } from './modules/athena';
import { thorModule } from './modules/thor';
import { anubisModule } from './modules/anubis';
import { susanooModule } from './modules/susanoo';
import { garudaModule } from './modules/garuda';
import { wukongModule } from './modules/wukong';
import { quetzalcoatlModule } from './modules/quetzalcoatl';
import { gilgameshModule } from './modules/gilgamesh';
import { nyirorokidulModule } from './modules/nyirorokidul';
import { chronosModule } from './modules/chronos';

export * from './types';

export const CHARACTER_MODULES: Record<CharacterId, CharacterModule> = {
  gatotkaca: gatotkacaModule,
  athena: athenaModule,
  thor: thorModule,
  anubis: anubisModule,
  susanoo: susanooModule,
  garuda: garudaModule,
  wukong: wukongModule,
  quetzalcoatl: quetzalcoatlModule,
  gilgamesh: gilgameshModule,
  nyirorokidul: nyirorokidulModule,
  chronos: chronosModule
};

export function getCharacterModule(id: CharacterId): CharacterModule {
  return CHARACTER_MODULES[id] || CHARACTER_MODULES.gatotkaca;
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  gatotkaca: gatotkacaModule.def,
  athena: athenaModule.def,
  thor: thorModule.def,
  anubis: anubisModule.def,
  susanoo: susanooModule.def,
  garuda: garudaModule.def,
  wukong: wukongModule.def,
  quetzalcoatl: quetzalcoatlModule.def,
  gilgamesh: gilgameshModule.def,
  nyirorokidul: nyirorokidulModule.def,
  chronos: chronosModule.def
};

export const CHARACTER_LIST: CharacterDef[] = Object.values(CHARACTERS);
export const VANGUARD_CHARACTERS: CharacterDef[] = CHARACTER_LIST.filter(c => !c.isApex);
export const APEX_CHARACTERS: CharacterDef[] = CHARACTER_LIST.filter(c => c.isApex);

export function getCharacterByNumericId(numericId: number): CharacterDef {
  const found = CHARACTER_LIST.find(c => c.numericId === numericId);
  return found || CHARACTERS.gatotkaca;
}

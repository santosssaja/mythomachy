import * as THREE from 'three';
import { CharacterDef, AnimationState } from '../types/game';

export interface RigComponents {
  root: THREE.Group;
  torsoGroup: THREE.Group;
  torso: THREE.Mesh;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  weapon: THREE.Group;
  leftWing?: THREE.Group;
  rightWing?: THREE.Group;
  auraGroup: THREE.Group;
  specialGroup?: THREE.Group;
}

export interface CharacterHelperMaterials {
  primary: THREE.MeshStandardMaterial;
  accent: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  glow: THREE.MeshBasicMaterial;
}

export interface CharacterModule {
  def: CharacterDef;
  buildUniqueVisuals(
    components: RigComponents,
    materials: THREE.Material[],
    helperMats: CharacterHelperMaterials
  ): void;
  animate(
    components: RigComponents,
    state: AnimationState,
    stateTimer: number,
    facing: number,
    dt: number
  ): void;
}

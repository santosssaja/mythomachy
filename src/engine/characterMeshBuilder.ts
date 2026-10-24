import * as THREE from 'three';
import { CharacterId, AnimationState } from '../types/game';
import { getCharacterModule } from '../characters';
import { RigComponents, CharacterHelperMaterials } from '../characters/types';

export interface ArticulatedCharacterRig {
  root: THREE.Group;
  characterId: CharacterId;
  torso: THREE.Mesh;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  weapon: THREE.Group;
  leftWing?: THREE.Group;
  rightWing?: THREE.Group;
  auraGroup: THREE.Group;
  materials: THREE.Material[];
  updateAnimation: (state: AnimationState, stateTimer: number, facing: number) => void;
  dispose: () => void;
}

/**
 * Procedural Articulated 3D Character Rigging Generator
 * Builds high-fidelity procedural humanoid skeleton and delegates visual hallmark & animations to character modules
 */
export function createArticulatedCharacterRig(charId: CharacterId): ArticulatedCharacterRig {
  const charModule = getCharacterModule(charId);
  const def = charModule.def;
  const root = new THREE.Group();
  const materials: THREE.Material[] = [];

  // Helper materials
  const primaryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(def.primaryColor),
    roughness: 0.35,
    metalness: def.isApex ? 0.8 : 0.4
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(def.accentColor),
    roughness: 0.4,
    metalness: 0.3
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#D4AF37'),
    roughness: 0.25,
    metalness: 0.85
  });
  const glowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(def.particleColor),
    wireframe: false
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: charId === 'anubis' ? 0x1f1924 : 0xdfb48c,
    roughness: 0.6,
    metalness: 0.1
  });

  materials.push(primaryMat, accentMat, goldMat, glowMat, skinMat);

  const helperMats: CharacterHelperMaterials = {
    primary: primaryMat,
    accent: accentMat,
    gold: goldMat,
    glow: glowMat
  };

  // 1. Torso & Pelvis
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 1.0;
  root.add(torsoGroup);

  const torsoGeo = new THREE.BoxGeometry(0.55, 0.65, 0.35);
  const torso = new THREE.Mesh(torsoGeo, primaryMat);
  torso.castShadow = true;
  torso.receiveShadow = true;
  torsoGroup.add(torso);

  // Chest plate
  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.4, 0.38), goldMat);
  chestPlate.position.set(0, 0.1, 0.02);
  torsoGroup.add(chestPlate);

  // 2. Head & Neck
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.55, 0);
  torsoGroup.add(headGroup);

  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.32), skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // 3. Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.38, 0.25, 0);
  torsoGroup.add(leftArm);

  const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), goldMat);
  leftArm.add(leftShoulder);
  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 8), skinMat);
  leftUpperArm.position.set(0, -0.22, 0);
  leftArm.add(leftUpperArm);

  // 4. Right Arm (Weapon Arm)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.38, 0.25, 0);
  torsoGroup.add(rightArm);

  const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), goldMat);
  rightArm.add(rightShoulder);
  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 8), skinMat);
  rightUpperArm.position.set(0, -0.22, 0);
  rightArm.add(rightUpperArm);

  // 5. Weapon Attachment
  const weapon = new THREE.Group();
  weapon.position.set(0, -0.42, 0.15);
  rightArm.add(weapon);

  // 6. Left & Right Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.18, -0.35, 0);
  torsoGroup.add(leftLeg);
  const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.65, 8), accentMat);
  leftThigh.position.set(0, -0.32, 0);
  leftLeg.add(leftThigh);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.18, -0.35, 0);
  torsoGroup.add(rightLeg);
  const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.65, 8), accentMat);
  rightThigh.position.set(0, -0.32, 0);
  rightLeg.add(rightThigh);

  // 7. Aura group
  const auraGroup = new THREE.Group();
  root.add(auraGroup);

  const rigComponents: RigComponents = {
    root,
    torsoGroup,
    torso,
    headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    weapon,
    auraGroup
  };

  // Delegate character-specific mesh hallmark building to module
  charModule.buildUniqueVisuals(rigComponents, materials, helperMats);

  // Procedural Animation System delegated to character module
  const updateAnimation = (state: AnimationState, stateTimer: number, facing: number) => {
    charModule.animate(rigComponents, state, stateTimer, facing, 0.016);
  };

  const dispose = () => {
    materials.forEach(m => m.dispose());
  };

  return {
    root,
    characterId: charId,
    torso,
    head: headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    weapon,
    leftWing: rigComponents.leftWing,
    rightWing: rigComponents.rightWing,
    auraGroup,
    materials,
    updateAnimation,
    dispose
  };
}

import * as THREE from 'three';
import { CharacterId, AnimationState } from '../types/game';
import { CHARACTERS } from '../config/characters';

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
 * Builds high-fidelity procedural humanoid geometry with articulated joints, weapons, and wings
 */
export function createArticulatedCharacterRig(charId: CharacterId): ArticulatedCharacterRig {
  const def = CHARACTERS[charId];
  const root = new THREE.Group();
  const materials: THREE.Material[] = [];

  // Base materials
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

  // 1. Torso & Pelvis
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 1.0;
  root.add(torsoGroup);

  const torsoGeo = new THREE.BoxGeometry(0.55, 0.65, 0.35);
  const torso = new THREE.Mesh(torsoGeo, primaryMat);
  torso.castShadow = true;
  torso.receiveShadow = true;
  torsoGroup.add(torso);

  // Chest armor crest / detail
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

  // Character-specific headwear & helmets
  if (charId === 'gatotkaca') {
    // Kuluk / winged crown
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 5), goldMat);
    crown.position.set(0, 0.3, 0);
    headGroup.add(crown);
  } else if (charId === 'athena') {
    // Corinthian helmet crest
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.42), accentMat);
    crest.position.set(0, 0.3, -0.05);
    headGroup.add(crest);
  } else if (charId === 'thor') {
    // Winged Norse helmet
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.15), goldMat);
    wingL.position.set(-0.22, 0.18, 0);
    wingL.rotation.z = 0.4;
    const wingR = wingL.clone();
    wingR.position.x = 0.22;
    wingR.rotation.z = -0.4;
    headGroup.add(wingL, wingR);
  } else if (charId === 'anubis') {
    // Jackal ears
    const earGeo = new THREE.ConeGeometry(0.08, 0.38, 4);
    const earL = new THREE.Mesh(earGeo, accentMat);
    earL.position.set(-0.16, 0.32, 0);
    const earR = new THREE.Mesh(earGeo, accentMat);
    earR.position.set(0.16, 0.32, 0);
    headGroup.add(earL, earR);
  } else if (charId === 'gilgamesh' || charId === 'chronos') {
    // Radiant halo / crown
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 8, 24), glowMat);
    halo.position.set(0, 0.22, -0.1);
    headGroup.add(halo);
  }

  // 3. Left Arm (Shoulder, Upper Arm, Forearm, Hand)
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

  // Procedural weapon meshes
  if (charId === 'thor') {
    // Mjolnir
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), accentMat);
    const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.4), goldMat);
    hammerHead.position.set(0, 0.3, 0);
    weapon.add(handle, hammerHead);
  } else if (charId === 'athena') {
    // Golden Spear
    const spearPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8), goldMat);
    const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.35, 4), primaryMat);
    spearTip.position.set(0, 0.9, 0);
    weapon.add(spearPole, spearTip);
    // Shield on left arm
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 16), goldMat);
    shield.rotation.z = Math.PI / 2;
    shield.position.set(-0.15, -0.25, 0.1);
    leftArm.add(shield);
  } else if (charId === 'wukong') {
    // Ruyi Jingu Bang staff
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.7), accentMat);
    const tipL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.25), goldMat);
    tipL.position.y = 0.75;
    const tipR = tipL.clone();
    tipR.position.y = -0.75;
    weapon.add(staff, tipL, tipR);
  } else if (charId === 'anubis' || charId === 'chronos') {
    // Scythe
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6), accentMat);
    const scytheBlade = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 6, 12, Math.PI), goldMat);
    scytheBlade.position.set(0.3, 0.65, 0);
    weapon.add(pole, scytheBlade);
  } else if (charId === 'gilgamesh') {
    // Twin golden swords
    const sword1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.04), goldMat);
    sword1.position.set(0, 0.35, 0);
    weapon.add(sword1);
  } else {
    // Gauntlets / energy blades
    const gauntlet = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.18), goldMat);
    weapon.add(gauntlet);
  }

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

  // 7. Articulated Wings for Garuda & Quetzalcoatl
  let leftWing: THREE.Group | undefined;
  let rightWing: THREE.Group | undefined;

  if (charId === 'garuda' || charId === 'quetzalcoatl') {
    const wingMat = new THREE.MeshStandardMaterial({
      color: charId === 'garuda' ? 0xf39c12 : 0x2ecc71,
      roughness: 0.3,
      metalness: 0.6,
      side: THREE.DoubleSide
    });
    materials.push(wingMat);

    // Left Wing
    leftWing = new THREE.Group();
    leftWing.position.set(-0.25, 0.2, -0.15);
    torsoGroup.add(leftWing);

    // Primary feathered bone
    const wingGeo = new THREE.PlaneGeometry(1.2, 0.65, 4, 2);
    const wingMeshL = new THREE.Mesh(wingGeo, wingMat);
    wingMeshL.position.set(-0.6, 0.2, 0);
    wingMeshL.rotation.y = 0.3;
    leftWing.add(wingMeshL);

    // Right Wing
    rightWing = new THREE.Group();
    rightWing.position.set(0.25, 0.2, -0.15);
    torsoGroup.add(rightWing);

    const wingMeshR = new THREE.Mesh(wingGeo, wingMat);
    wingMeshR.position.set(0.6, 0.2, 0);
    wingMeshR.rotation.y = -0.3;
    rightWing.add(wingMeshR);
  }

  // 8. Aura group for ultimate & special effects
  const auraGroup = new THREE.Group();
  root.add(auraGroup);

  // Procedural Animation System: Sinusoidal & Keyframe state updates
  const updateAnimation = (state: AnimationState, stateTimer: number, facing: number) => {
    // Facing direction
    root.rotation.y = facing === 1 ? Math.PI / 2 : -Math.PI / 2;

    const t = stateTimer;

    // Wing flapping animation for winged characters
    if (leftWing && rightWing) {
      const wingSpeed = state === 'DASH' ? 18 : 6;
      const wingAmp = state === 'DASH' ? 0.45 : 0.25;
      const flap = Math.sin(t * wingSpeed) * wingAmp;
      leftWing.rotation.z = 0.2 + flap;
      leftWing.rotation.y = 0.3 + flap * 0.5;
      rightWing.rotation.z = -0.2 - flap;
      rightWing.rotation.y = -0.3 - flap * 0.5;
    }

    switch (state) {
      case 'IDLE':
        // Breathing up-and-down + gentle sway
        torsoGroup.position.y = 1.0 + Math.sin(t * 3.5) * 0.035;
        headGroup.rotation.x = Math.sin(t * 3.5) * 0.04;
        leftArm.rotation.x = Math.sin(t * 3.0) * 0.08;
        rightArm.rotation.x = -Math.sin(t * 3.0) * 0.08;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        root.rotation.z = 0;
        break;

      case 'WALK': {
        // Legs & arms alternate phase swing
        const walkCycle = Math.sin(t * 11);
        torsoGroup.position.y = 1.0 + Math.abs(Math.sin(t * 11)) * 0.05;
        leftLeg.rotation.x = walkCycle * 0.6;
        rightLeg.rotation.x = -walkCycle * 0.6;
        leftArm.rotation.x = -walkCycle * 0.5;
        rightArm.rotation.x = walkCycle * 0.5;
        root.rotation.z = 0;
        break;
      }

      case 'DASH':
        // Lean forward 35 degrees + arms streamlined
        torsoGroup.position.y = 0.85;
        root.rotation.z = -facing * 0.45; // Lean forward
        leftArm.rotation.x = 0.9;
        rightArm.rotation.x = -0.9;
        leftLeg.rotation.x = 0.4;
        rightLeg.rotation.x = -0.4;
        break;

      case 'ATTACK': {
        // Fast shoulder joint swing & weapon strike
        const attackProgress = Math.min(1, t / 0.35);
        const swing = Math.sin(attackProgress * Math.PI);
        rightArm.rotation.x = -1.2 + swing * 2.4;
        torsoGroup.rotation.y = swing * 0.35;
        headGroup.rotation.y = -swing * 0.2;
        break;
      }

      case 'SKILL': {
        // Raising arms & leaping forward
        const skillProg = Math.min(1, t / 0.55);
        torsoGroup.position.y = 1.0 + Math.sin(skillProg * Math.PI) * 0.35;
        leftArm.rotation.x = -1.8;
        rightArm.rotation.x = -1.8;
        rightArm.rotation.z = -0.4;
        break;
      }

      case 'ULTIMATE': {
        // Ascending into air + radiant particle posture
        torsoGroup.position.y = 1.4 + Math.sin(t * 8) * 0.08;
        leftArm.rotation.z = 1.2;
        rightArm.rotation.z = -1.2;
        leftArm.rotation.x = -0.6;
        rightArm.rotation.x = -0.6;
        headGroup.rotation.x = -0.4; // Look upwards to heaven
        break;
      }

      case 'HIT': {
        // Flinch backwards & recoil
        torsoGroup.position.y = 0.95;
        root.rotation.z = facing * 0.35; // Recoil back
        headGroup.rotation.x = 0.3;
        leftArm.rotation.x = 0.8;
        rightArm.rotation.x = 0.8;
        break;
      }
    }
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
    leftWing,
    rightWing,
    auraGroup,
    materials,
    updateAnimation,
    dispose
  };
}

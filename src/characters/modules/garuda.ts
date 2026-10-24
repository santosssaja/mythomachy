import * as THREE from 'three';
import { CharacterModule, RigComponents, CharacterHelperMaterials } from '../types';

export const garudaModule: CharacterModule = {
  def: {
    id: 'garuda',
    numericId: 5,
    name: 'Garuda',
    title: 'Raja Burung Langit Surya',
    origin: 'Weda & Nusantara',
    maxHp: 980,
    speed: 7.0,
    radius: 0.60,
    isApex: false,
    primaryColor: '#F39C12',
    accentColor: '#C0392B',
    particleColor: '#F1C40F',
    basicAttack: {
      name: 'Cakar Api Surya',
      damage: 58,
      range: 1.8,
      cooldown: 0.36
    },
    skill1: {
      name: 'Hembusan Sayap Emas',
      damage: 125,
      cooldown: 4.0,
      description: 'Mengepakkan sayap emas menghasilkan badai angin pendorong lawan mundur sejauh 2 meter disertai 125 luka.'
    },
    ultimate: {
      name: 'Terjangan Matahari',
      damage: 275,
      cooldown: 12.0,
      energyCost: 100,
      dash: true,
      description: 'Menukik tajam dari ketinggian angkasa berselimut kobaran api surya, berhenti tepat di batas fisik target memberikan 275 ledakan luka.'
    },
    lore: 'Makhluk mitis bertubuh emas berkilau dengan bentangan sayap megah, wahana Dewa Wisnu pelindung keteraturan semesta.'
  },

  buildUniqueVisuals(components, materials, helperMats) {
    const { headGroup, torsoGroup, weapon } = components;

    // 1. Golden Eagle Beak
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 4), helperMats.gold);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, -0.05, 0.28);
    headGroup.add(beak);

    // 2. Solar Feathers Crown
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 6), helperMats.primary);
    crown.position.set(0, 0.32, 0);
    headGroup.add(crown);

    // 3. Large Articulated Golden Wings on Back
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xf39c12,
      roughness: 0.4,
      metalness: 0.6,
      side: THREE.DoubleSide
    });
    materials.push(wingMat);

    const leftWing = new THREE.Group();
    leftWing.position.set(-0.25, 0.2, -0.15);
    const wingGeo = new THREE.PlaneGeometry(1.25, 0.7, 4, 2);
    const wingMeshL = new THREE.Mesh(wingGeo, wingMat);
    wingMeshL.position.set(-0.6, 0.2, 0);
    wingMeshL.rotation.y = 0.3;
    leftWing.add(wingMeshL);
    torsoGroup.add(leftWing);
    components.leftWing = leftWing;

    const rightWing = new THREE.Group();
    rightWing.position.set(0.25, 0.2, -0.15);
    const wingMeshR = new THREE.Mesh(wingGeo, wingMat);
    wingMeshR.position.set(0.6, 0.2, 0);
    wingMeshR.rotation.y = -0.3;
    rightWing.add(wingMeshR);
    torsoGroup.add(rightWing);
    components.rightWing = rightWing;

    // 4. Solar Talons on Fist
    const talonGeo = new THREE.BoxGeometry(0.04, 0.3, 0.12);
    const talon1 = new THREE.Mesh(talonGeo, helperMats.gold);
    talon1.position.set(0.05, 0.1, 0);
    const talon2 = talon1.clone();
    talon2.position.set(-0.05, 0.1, 0);
    weapon.add(talon1, talon2);
  },

  animate(components, state, stateTimer, facing, dt) {
    const { torsoGroup, headGroup, leftArm, rightArm, leftLeg, rightLeg, leftWing, rightWing } = components;
    const t = stateTimer;

    // Wing flapping animation
    if (leftWing && rightWing) {
      const speed = state === 'DASH' ? 20 : state === 'ULTIMATE' ? 24 : 7;
      const amp = state === 'DASH' ? 0.5 : 0.3;
      const flap = Math.sin(t * speed) * amp;
      leftWing.rotation.z = 0.2 + flap;
      leftWing.rotation.y = 0.3 + flap * 0.5;
      rightWing.rotation.z = -0.2 - flap;
      rightWing.rotation.y = -0.3 - flap * 0.5;
    }

    switch (state) {
      case 'IDLE':
        // Hovering slightly off the ground with gentle wing flaps
        torsoGroup.position.y = 1.08 + Math.sin(t * 3.5) * 0.04;
        leftArm.rotation.x = 0.3;
        rightArm.rotation.x = -0.3;
        break;

      case 'WALK': {
        const cycle = Math.sin(t * 12);
        torsoGroup.position.y = 1.1 + Math.abs(cycle) * 0.05;
        leftLeg.rotation.x = cycle * 0.6;
        rightLeg.rotation.x = -cycle * 0.6;
        break;
      }

      case 'DASH':
        // Full aerodynamic flight dash
        torsoGroup.position.y = 0.9;
        torsoGroup.rotation.x = 0.38;
        leftArm.rotation.x = 1.2;
        rightArm.rotation.x = -1.2;
        break;

      case 'ATTACK': {
        // Cakar Api Surya: Talon thrust with wing beat forward
        const p = Math.min(1, t / 0.36);
        const lunge = Math.sin(p * Math.PI);
        rightArm.rotation.x = -1.8 * lunge;
        torsoGroup.rotation.y = lunge * 0.4;
        break;
      }

      case 'SKILL': {
        // Hembusan Sayap Emas: Both wings thrust forward to push air
        const p = Math.min(1, t / 0.5);
        if (leftWing && rightWing) {
          leftWing.rotation.y = 1.2 * Math.sin(p * Math.PI);
          rightWing.rotation.y = -1.2 * Math.sin(p * Math.PI);
        }
        leftArm.rotation.x = -1.2;
        rightArm.rotation.x = -1.2;
        break;
      }

      case 'ULTIMATE': {
        // Terjangan Matahari: Ascent, flare, solar dive
        const p = Math.min(1, t / 1.2);
        if (p < 0.55) {
          torsoGroup.position.y = 1.8;
          headGroup.rotation.x = -0.5;
        } else {
          torsoGroup.position.y = 0.6;
          torsoGroup.rotation.x = 0.4;
          rightArm.rotation.x = -2.0;
        }
        break;
      }

      case 'HIT':
        torsoGroup.position.y = 0.95;
        torsoGroup.rotation.x = -0.28;
        break;
    }
  }
};

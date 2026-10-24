import * as THREE from 'three';
import { CharacterModule, RigComponents, CharacterHelperMaterials } from '../types';

export const gatotkacaModule: CharacterModule = {
  def: {
    id: 'gatotkaca',
    numericId: 0,
    name: 'Gatotkaca',
    title: 'Otot Kawat Tulang Besi',
    origin: 'Nusantara',
    maxHp: 1250,
    speed: 6.2,
    radius: 0.65,
    isApex: false,
    primaryColor: '#C49A45',
    accentColor: '#1A1A24',
    particleColor: '#F39C12',
    basicAttack: {
      name: 'Tinju Brajamusti',
      damage: 65,
      range: 1.8,
      cooldown: 0.4
    },
    skill1: {
      name: 'Langkah Tapak Jalak',
      damage: 140,
      cooldown: 4.0,
      dash: true,
      description: 'Terjangan kilat yang berhenti seketika saat menyentuh batas fisik lawan, menimbulkan 140 luka dan dorongan mundur kuat.'
    },
    ultimate: {
      name: 'Amarah Kawah Candradimuka',
      damage: 280,
      cooldown: 12.0,
      energyCost: 100,
      buff: true,
      description: 'Hantaman gelombang kejut area 280 luka yang menyerap energi bumi dan memberikan perisai pengurang kerusakan 30% selama 5 detik.'
    },
    lore: 'Ksatria Pringgandani yang sakti mandraguna dengan zirah Antakusuma, mampu melesat secepat kilat melintasi angkasa.'
  },

  buildUniqueVisuals(components, materials, helperMats) {
    const { headGroup, torsoGroup, weapon } = components;

    // 1. Winged Crown (Kuluk Antakusuma)
    const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.18, 8), helperMats.gold);
    crownBase.position.y = 0.28;
    headGroup.add(crownBase);

    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.12), helperMats.gold);
    wingL.position.set(-0.25, 0.32, -0.05);
    wingL.rotation.z = 0.35;
    const wingR = wingL.clone();
    wingR.position.x = 0.25;
    wingR.rotation.z = -0.35;
    headGroup.add(wingL, wingR);

    // 2. Garudamukha Radiant Star on Chest
    const starGeo = new THREE.OctahedronGeometry(0.14, 0);
    const star = new THREE.Mesh(starGeo, helperMats.glow);
    star.position.set(0, 0.08, 0.23);
    star.rotation.z = Math.PI / 4;
    torsoGroup.add(star);

    // 3. Brajamusti Iron Knuckle Braces on Right Fist
    const knuckleMat = new THREE.MeshStandardMaterial({ color: 0x22222b, roughness: 0.2, metalness: 0.9 });
    materials.push(knuckleMat);
    const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.18), knuckleMat);
    knuckle.position.set(0, -0.08, 0);
    weapon.add(knuckle);
  },

  animate(components, state, stateTimer, facing, dt) {
    const { torsoGroup, headGroup, leftArm, rightArm, leftLeg, rightLeg } = components;
    const t = stateTimer;

    switch (state) {
      case 'IDLE':
        // Strong, resolute wide stance breathing
        torsoGroup.position.y = 1.0 + Math.sin(t * 3.2) * 0.03;
        headGroup.rotation.x = Math.sin(t * 3.2) * 0.03;
        leftArm.rotation.x = 0.2 + Math.sin(t * 3.0) * 0.05;
        rightArm.rotation.x = -0.2 - Math.sin(t * 3.0) * 0.05;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        break;

      case 'WALK': {
        const cycle = Math.sin(t * 10);
        torsoGroup.position.y = 1.0 + Math.abs(cycle) * 0.04;
        leftLeg.rotation.x = cycle * 0.55;
        rightLeg.rotation.x = -cycle * 0.55;
        leftArm.rotation.x = -cycle * 0.45;
        rightArm.rotation.x = cycle * 0.45;
        break;
      }

      case 'DASH':
        // Low forward charge, flying posture
        torsoGroup.position.y = 0.82;
        torsoGroup.rotation.x = 0.38;
        leftArm.rotation.x = 1.2;
        rightArm.rotation.x = -1.1;
        leftLeg.rotation.x = 0.5;
        rightLeg.rotation.x = -0.5;
        break;

      case 'ATTACK': {
        // Tinju Brajamusti: Shoulder wind-up and explosive straight punch
        const p = Math.min(1, t / 0.35);
        if (p < 0.3) {
          // Wind up
          rightArm.rotation.x = 0.8;
          rightArm.rotation.y = -0.6;
          torsoGroup.rotation.y = -0.4;
        } else {
          // Explosive punch
          const snap = Math.sin((p - 0.3) / 0.7 * Math.PI);
          rightArm.rotation.x = -1.6 - snap * 0.4;
          rightArm.rotation.y = 0.2;
          torsoGroup.rotation.y = 0.6;
          headGroup.rotation.y = -0.3;
        }
        break;
      }

      case 'SKILL': {
        // Langkah Tapak Jalak: Crouch dash, hard plant foot, upward uppercut smash
        const p = Math.min(1, t / 0.55);
        if (p < 0.4) {
          torsoGroup.position.y = 0.75;
          rightArm.rotation.x = 1.1;
          leftArm.rotation.x = -0.9;
        } else {
          torsoGroup.position.y = 1.25;
          rightArm.rotation.x = -2.2;
          torsoGroup.rotation.x = -0.3;
        }
        break;
      }

      case 'ULTIMATE': {
        // Amarah Kawah Candradimuka: Levitate skyward, absorb energy, double fist ground strike
        const p = Math.min(1, t / 1.2);
        if (p < 0.6) {
          torsoGroup.position.y = 1.6 + Math.sin(t * 12) * 0.08;
          leftArm.rotation.z = 1.4;
          rightArm.rotation.z = -1.4;
          leftArm.rotation.x = -0.8;
          rightArm.rotation.x = -0.8;
          headGroup.rotation.x = -0.5;
        } else {
          torsoGroup.position.y = 0.6;
          leftArm.rotation.x = -1.4;
          rightArm.rotation.x = -1.4;
          headGroup.rotation.x = 0.4;
          torsoGroup.rotation.x = 0.25;
        }
        break;
      }

      case 'HIT':
        torsoGroup.position.y = 0.95;
        torsoGroup.rotation.x = -0.28;
        headGroup.rotation.x = 0.3;
        leftArm.rotation.x = 0.7;
        rightArm.rotation.x = 0.7;
        break;
    }
  }
};

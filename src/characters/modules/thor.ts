import * as THREE from 'three';
import { CharacterModule, RigComponents, CharacterHelperMaterials } from '../types';

export const thorModule: CharacterModule = {
  def: {
    id: 'thor',
    numericId: 2,
    name: 'Thor',
    title: 'Dewa Petir Asgard',
    origin: 'Nordik',
    maxHp: 1200,
    speed: 6.0,
    radius: 0.65,
    isApex: false,
    primaryColor: '#4A90E2',
    accentColor: '#E0E6ED',
    particleColor: '#00D2D3',
    basicAttack: {
      name: 'Ayunan Mjolnir',
      damage: 75,
      range: 1.9,
      cooldown: 0.45
    },
    skill1: {
      name: 'Sambaran Halilintar',
      damage: 150,
      cooldown: 4.2,
      projectile: true,
      description: 'Memanggil kilat vertikal berkekuatan 150 luka yang menyambar dari langit tepat di posisi lawan berada.'
    },
    ultimate: {
      name: 'Badai Asgard',
      damage: 300,
      cooldown: 13.0,
      energyCost: 100,
      description: 'Melepaskan seluruh muatan listrik Mjolnir menciptakan medan badai listrik berdiameter luas berdaya hancur 300 luka.'
    },
    lore: 'Pahlawan terkuat dari Asgard, pelindung Midgard yang bersenjatakan palu mistis Mjolnir.'
  },

  buildUniqueVisuals(components, materials, helperMats) {
    const { headGroup, torsoGroup, weapon } = components;

    // 1. Winged Norse Helmet
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.16), helperMats.gold);
    wingL.position.set(-0.24, 0.2, 0);
    wingL.rotation.z = 0.42;
    const wingR = wingL.clone();
    wingR.position.x = 0.24;
    wingR.rotation.z = -0.42;
    headGroup.add(wingL, wingR);

    // 2. Crimson Norse Battle Cape
    const capeMat = new THREE.MeshStandardMaterial({ color: 0x9e2a2b, roughness: 0.6 });
    materials.push(capeMat);
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 1.1), capeMat);
    cape.position.set(0, -0.1, -0.16);
    cape.rotation.x = 0.15;
    torsoGroup.add(cape);

    // 3. Mjolnir War Hammer
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 8), helperMats.accent);
    const hammerHeadMat = new THREE.MeshStandardMaterial({ color: 0x5a6275, roughness: 0.3, metalness: 0.8 });
    materials.push(hammerHeadMat);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.24), hammerHeadMat);
    head.position.y = 0.45;

    // Lightning rune core on hammer
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.26), helperMats.glow);
    core.position.y = 0.45;

    weapon.add(handle, head, core);
  },

  animate(components, state, stateTimer, facing, dt) {
    const { root, torsoGroup, headGroup, leftArm, rightArm, leftLeg, rightLeg } = components;
    if (facing !== 0) {
      root.rotation.y = facing === 1 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      root.rotation.y = 0;
    }
    const t = stateTimer;

    switch (state) {
      case 'IDLE':
        // Heavy, stalwart breathing with hammer held at waist
        torsoGroup.position.y = 1.0 + Math.sin(t * 3.0) * 0.035;
        headGroup.rotation.x = Math.sin(t * 3.0) * 0.03;
        leftArm.rotation.x = 0.3;
        rightArm.rotation.x = -0.6 + Math.sin(t * 2.8) * 0.04;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        root.rotation.z = 0;
        break;

      case 'WALK': {
        const cycle = Math.sin(t * 9.5);
        torsoGroup.position.y = 1.0 + Math.abs(cycle) * 0.05;
        leftLeg.rotation.x = cycle * 0.55;
        rightLeg.rotation.x = -cycle * 0.55;
        leftArm.rotation.x = -cycle * 0.4;
        rightArm.rotation.x = -0.6 + cycle * 0.3;
        root.rotation.z = 0;
        break;
      }

      case 'DASH':
        torsoGroup.position.y = 0.85;
        root.rotation.z = -facing * 0.45;
        leftArm.rotation.x = 0.8;
        rightArm.rotation.x = -1.3; // Hammer leading charge
        leftLeg.rotation.x = 0.45;
        rightLeg.rotation.x = -0.45;
        break;

      case 'ATTACK': {
        // Ayunan Mjolnir: Heavy overhead baseball swing
        const p = Math.min(1, t / 0.45);
        if (p < 0.35) {
          rightArm.rotation.x = 1.2;
          torsoGroup.rotation.y = -0.5;
        } else {
          const swing = Math.sin((p - 0.35) / 0.65 * Math.PI);
          rightArm.rotation.x = -1.8 - swing * 0.3;
          torsoGroup.rotation.y = 0.8;
        }
        break;
      }

      case 'SKILL': {
        // Sambaran Halilintar: Lifts hammer to heaven then crashes down
        const p = Math.min(1, t / 0.55);
        if (p < 0.5) {
          rightArm.rotation.x = -2.4; // Straight to the sky
          headGroup.rotation.x = -0.4;
        } else {
          rightArm.rotation.x = -0.6;
          torsoGroup.position.y = 0.8;
        }
        break;
      }

      case 'ULTIMATE': {
        // Badai Asgard: Propeller spin, flight, thunderous slam
        const p = Math.min(1, t / 1.3);
        if (p < 0.65) {
          torsoGroup.position.y = 1.5 + Math.sin(t * 10) * 0.08;
          rightArm.rotation.x = -2.2;
          rightArm.rotation.z = Math.sin(t * 30) * 0.6; // Spinning hammer
          leftArm.rotation.z = 1.0;
        } else {
          torsoGroup.position.y = 0.6;
          rightArm.rotation.x = -1.2;
        }
        break;
      }

      case 'HIT':
        torsoGroup.position.y = 0.95;
        root.rotation.z = facing * 0.35;
        headGroup.rotation.x = 0.3;
        break;
    }
  }
};

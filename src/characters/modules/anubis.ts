import * as THREE from 'three';
import { CharacterModule, RigComponents, CharacterHelperMaterials } from '../types';

export const anubisModule: CharacterModule = {
  def: {
    id: 'anubis',
    numericId: 3,
    name: 'Anubis',
    title: 'Penuntun Jiwa Bawah Tanah',
    origin: 'Mesir',
    maxHp: 1000,
    speed: 6.4,
    radius: 0.58,
    isApex: false,
    primaryColor: '#D4AF37',
    accentColor: '#1F1924',
    particleColor: '#8E44AD',
    basicAttack: {
      name: 'Sabit Penghakiman',
      damage: 60,
      range: 2.0,
      cooldown: 0.4
    },
    skill1: {
      name: 'Timbangan Jiwa',
      damage: 120,
      cooldown: 4.5,
      description: 'Menghempaskan timbangan kebenaran yang mencabut 120 HP lawan sekaligus memulihkan 60 HP Anubis secara instan.'
    },
    ultimate: {
      name: 'Kutukan Padang Pasir',
      damage: 250,
      cooldown: 12.0,
      energyCost: 100,
      description: 'Menciptakan kubangan pasir hisap gelap berkerusakan 250 luka yang mengurangi kecepatan gerak musuh sebesar 50%.'
    },
    lore: 'Penjaga gerbang alam baka bertubuh manusia berkepala serigala emas, penimbang hati nurani para pengelana akhirat.'
  },

  buildUniqueVisuals(components, materials, helperMats) {
    const { headGroup, weapon } = components;

    // 1. Jackal Muzzle & Long Pointed Ears
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 6), helperMats.accent);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0, 0.28);
    headGroup.add(snout);

    const earGeo = new THREE.ConeGeometry(0.08, 0.38, 4);
    const earL = new THREE.Mesh(earGeo, helperMats.accent);
    earL.position.set(-0.16, 0.35, -0.05);
    earL.rotation.z = -0.15;
    const earR = new THREE.Mesh(earGeo, helperMats.accent);
    earR.position.set(0.16, 0.35, -0.05);
    earR.rotation.z = 0.15;
    headGroup.add(earL, earR);

    // 2. Pharaoh Nemes Headcloth Flaps
    const flapGeo = new THREE.BoxGeometry(0.08, 0.45, 0.18);
    const flapL = new THREE.Mesh(flapGeo, helperMats.gold);
    flapL.position.set(-0.25, -0.05, 0);
    const flapR = new THREE.Mesh(flapGeo, helperMats.gold);
    flapR.position.set(0.25, -0.05, 0);
    headGroup.add(flapL, flapR);

    // 3. Ankh Scythe Staff
    const staffShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.0, 8), helperMats.accent);
    staffShaft.position.set(0, 0.25, 0);

    const ankhRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 16), helperMats.gold);
    ankhRing.position.set(0, 1.25, 0);

    const scytheBlade = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.6, 6), helperMats.gold);
    scytheBlade.position.set(0.25, 1.15, 0);
    scytheBlade.rotation.z = -Math.PI / 3;

    weapon.add(staffShaft, ankhRing, scytheBlade);
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
        // Enigmatic upright posture, staff planted lightly
        torsoGroup.position.y = 1.0 + Math.sin(t * 2.8) * 0.025;
        headGroup.rotation.x = Math.sin(t * 2.8) * 0.02;
        leftArm.rotation.x = 0.1;
        rightArm.rotation.x = -0.5;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        root.rotation.z = 0;
        break;

      case 'WALK': {
        const cycle = Math.sin(t * 10);
        torsoGroup.position.y = 1.0 + Math.abs(cycle) * 0.035;
        leftLeg.rotation.x = cycle * 0.5;
        rightLeg.rotation.x = -cycle * 0.5;
        leftArm.rotation.x = -cycle * 0.35;
        rightArm.rotation.x = -0.5 + cycle * 0.25;
        root.rotation.z = 0;
        break;
      }

      case 'DASH':
        torsoGroup.position.y = 0.88;
        root.rotation.z = -facing * 0.42;
        leftArm.rotation.x = 0.9;
        rightArm.rotation.x = -1.2;
        break;

      case 'ATTACK': {
        // Sabit Penghakiman: Sweeping scythe curve slash
        const p = Math.min(1, t / 0.4);
        const slash = Math.sin(p * Math.PI);
        rightArm.rotation.x = -1.6 * slash;
        rightArm.rotation.z = -0.8 * slash;
        torsoGroup.rotation.y = slash * 0.45;
        break;
      }

      case 'SKILL': {
        // Timbangan Jiwa: Left hand holds out scales, right hand channels life siphon
        const p = Math.min(1, t / 0.55);
        leftArm.rotation.x = -1.4; // Palm extended
        leftArm.rotation.z = -0.3;
        rightArm.rotation.x = -0.9;
        headGroup.rotation.x = 0.15;
        break;
      }

      case 'ULTIMATE': {
        // Kutukan Padang Pasir: Plants staff, incants dark sands
        const p = Math.min(1, t / 1.2);
        if (p < 0.4) {
          rightArm.rotation.x = -1.8;
        } else {
          torsoGroup.position.y = 0.85;
          rightArm.rotation.x = -0.6; // Staff planted into floor
          leftArm.rotation.x = -1.5;
          leftArm.rotation.z = 0.8;
          headGroup.rotation.x = -0.3;
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

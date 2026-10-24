import * as THREE from 'three';
import { CharacterModule, RigComponents, CharacterHelperMaterials } from '../types';

export const chronosModule: CharacterModule = {
  def: {
    id: 'chronos',
    numericId: 10,
    name: 'Chronos-Aethelgard',
    title: 'Penjaga Waktu Paralel (Penguasa Puncak)',
    origin: 'Kosmologi Kuno',
    maxHp: 1320,
    speed: 7.0,
    radius: 0.58,
    isApex: true,
    primaryColor: '#9B59B6',
    accentColor: '#6E56CF',
    particleColor: '#D2B4DE',
    basicAttack: {
      name: 'Sabit Dimensi',
      damage: 82,
      range: 2.1,
      cooldown: 0.34
    },
    skill1: {
      name: 'Gema Paralel',
      damage: 190,
      cooldown: 4.0,
      description: 'Menciptakan bayangan kembar dari garis masa depan yang mengeksekusi serangan serempak dari dua sisi menghasilkan 190 luka.'
    },
    ultimate: {
      name: 'Hentakan Waktu Nol',
      damage: 390,
      cooldown: 14.0,
      energyCost: 100,
      description: 'Membekukan gerak musuh hingga 80% selama 2,5 detik sambil menjatuhkan monolit kristal ungu monad yang meledak dahsyat sebesar 390 kerusakan.'
    },
    lore: 'Entitas abadi penjaga kontinuitas ruang dan waktu yang mampu melipat dimensi dan merekonstruksi takdir dalam sekejap mata.'
  },

  buildUniqueVisuals(components, materials, helperMats) {
    const { headGroup, torsoGroup, weapon, leftArm } = components;

    // 1. Cosmic Void Cowl / Hood
    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.4, 6), helperMats.accent);
    hood.position.set(0, 0.28, -0.05);
    headGroup.add(hood);

    // 2. Rotating Astrolabe Celestial Rings on Back
    const astrolabeGroup = new THREE.Group();
    const ringGeo1 = new THREE.TorusGeometry(0.42, 0.02, 6, 24);
    const ring1 = new THREE.Mesh(ringGeo1, helperMats.gold);
    const ringGeo2 = new THREE.TorusGeometry(0.32, 0.02, 6, 20);
    const ring2 = new THREE.Mesh(ringGeo2, helperMats.glow);
    ring2.rotation.x = Math.PI / 3;

    astrolabeGroup.position.set(0, 0.15, -0.32);
    astrolabeGroup.add(ring1, ring2);
    torsoGroup.add(astrolabeGroup);
    components.specialGroup = astrolabeGroup;

    // 3. Twin Singularity Time Daggers (One on weapon/rightArm, one on leftArm)
    const daggerMat = new THREE.MeshStandardMaterial({
      color: 0x6e56cf,
      roughness: 0.2,
      metalness: 0.8
    });
    materials.push(daggerMat);

    const daggerR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.75, 0.08), daggerMat);
    daggerR.position.set(0, 0.35, 0);
    weapon.add(daggerR);

    const daggerL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.75, 0.08), daggerMat);
    daggerL.position.set(0, -0.3, 0.1);
    daggerL.rotation.x = Math.PI; // Inverted grip
    leftArm.add(daggerL);
  },

  animate(components, state, stateTimer, facing, dt) {
    const { torsoGroup, headGroup, leftArm, rightArm, leftLeg, rightLeg, specialGroup } = components;
    const t = stateTimer;

    // Continuous Astrolabe celestial spin
    if (specialGroup) {
      specialGroup.rotation.z += dt * (state === 'ULTIMATE' ? 8 : 1.5);
      specialGroup.rotation.y += dt * (state === 'ULTIMATE' ? 6 : 1.0);
    }

    switch (state) {
      case 'IDLE':
        // Shifting, temporal phasing stance
        torsoGroup.position.y = 1.0 + Math.sin(t * 3.8) * 0.03;
        leftArm.rotation.x = 0.3;
        rightArm.rotation.x = -0.4;
        break;

      case 'WALK': {
        const cycle = Math.sin(t * 11);
        torsoGroup.position.y = 1.0 + Math.abs(cycle) * 0.03;
        leftLeg.rotation.x = cycle * 0.55;
        rightLeg.rotation.x = -cycle * 0.55;
        break;
      }

      case 'DASH':
        // Temporal phase warp dash
        torsoGroup.position.y = 0.85;
        torsoGroup.rotation.x = 0.35;
        break;

      case 'ATTACK': {
        // Sabit Dimensi: Scissor cross-cut with twin daggers
        const p = Math.min(1, t / 0.34);
        const cross = Math.sin(p * Math.PI);
        rightArm.rotation.x = -1.6 * cross;
        leftArm.rotation.x = -1.6 * cross;
        torsoGroup.rotation.y = cross * 0.3;
        break;
      }

      case 'SKILL': {
        // Gema Paralel: Rapid phase flicker
        const p = Math.min(1, t / 0.45);
        torsoGroup.position.x = Math.sin(p * Math.PI * 4) * 0.15;
        rightArm.rotation.x = -1.8;
        break;
      }

      case 'ULTIMATE': {
        // Hentakan Waktu Nol: Astrolabe hyper-spin, freeze time, summon violet monolith
        const p = Math.min(1, t / 1.3);
        if (p < 0.6) {
          torsoGroup.position.y = 1.5;
          leftArm.rotation.x = -2.2;
          rightArm.rotation.x = -2.2;
          headGroup.rotation.x = -0.4;
        } else {
          torsoGroup.position.y = 0.8;
          leftArm.rotation.x = -1.0;
          rightArm.rotation.x = -1.0;
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

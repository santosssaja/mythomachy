import * as THREE from 'three';
import { CharacterModule, RigComponents, CharacterHelperMaterials } from '../types';

export const gilgameshModule: CharacterModule = {
  def: {
    id: 'gilgamesh',
    numericId: 8,
    name: 'Gilgamesh',
    title: 'Raja Segala Pahlawan (Penguasa Puncak)',
    origin: 'Mesopotamia',
    maxHp: 1350,
    speed: 6.7,
    radius: 0.62,
    isApex: true,
    primaryColor: '#FFD700',
    accentColor: '#C0392B',
    particleColor: '#FFEAA7',
    basicAttack: {
      name: 'Tebasan Enkidu',
      damage: 85,
      range: 2.0,
      cooldown: 0.38
    },
    skill1: {
      name: 'Gerbang Perbendaharaan Babel',
      damage: 195,
      cooldown: 4.0,
      projectile: true,
      description: 'Membuka 4 portal cahaya emas di belakang punggung yang meluncurkan hujan tombak dan pedang legendaris berdaya 195 kerusakan.'
    },
    ultimate: {
      name: 'Rantai Langit & Bintang Pemisah Dunia',
      damage: 380,
      cooldown: 13.0,
      energyCost: 100,
      description: 'Mengikat pergerakan lawan di tempat selama 1,5 detik dengan rantai Enkidu, disusul semburan pilar energi merah-emas raksasa berdaya 380 luka mutlak.'
    },
    lore: 'Raja berdarah dua pertiga dewa dari Uruk yang memiliki perbendaharaan seluruh pusaka purba dan teknologi mistis pertama di bumi.'
  },

  buildUniqueVisuals(components, materials, helperMats) {
    const { headGroup, torsoGroup, weapon, auraGroup } = components;

    // 1. Golden Crown & Pauldrons
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.15, 6), helperMats.gold);
    crown.position.y = 0.25;
    headGroup.add(crown);

    const pauldronGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const pauldronL = new THREE.Mesh(pauldronGeo, helperMats.gold);
    pauldronL.position.set(-0.45, 0.25, 0);
    const pauldronR = new THREE.Mesh(pauldronGeo, helperMats.gold);
    pauldronR.position.set(0.45, 0.25, 0);
    torsoGroup.add(pauldronL, pauldronR);

    // 2. Gate of Babylon Floating Gold Portals (4 behind back)
    const portalGroup = new THREE.Group();
    const portalGeo = new THREE.TorusGeometry(0.22, 0.03, 8, 16);
    const portalCoords = [
      [-0.45, 0.6, -0.4],
      [0.45, 0.6, -0.4],
      [-0.55, 0.1, -0.4],
      [0.55, 0.1, -0.4]
    ];
    portalCoords.forEach(([px, py, pz]) => {
      const pMesh = new THREE.Mesh(portalGeo, helperMats.gold);
      pMesh.position.set(px, py, pz);
      const ripple = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), helperMats.glow);
      ripple.position.set(px, py, pz + 0.01);
      portalGroup.add(pMesh, ripple);
    });
    torsoGroup.add(portalGroup);
    components.specialGroup = portalGroup;

    // 3. Golden Sword of the King
    const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.35, 0.1), helperMats.gold);
    swordBlade.position.set(0, 0.65, 0);
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), helperMats.accent);
    hilt.position.set(0, -0.1, 0);
    weapon.add(swordBlade, hilt);
  },

  animate(components, state, stateTimer, facing, dt) {
    const { root, torsoGroup, headGroup, leftArm, rightArm, leftLeg, rightLeg, specialGroup } = components;
    if (facing !== 0) {
      root.rotation.y = facing === 1 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      root.rotation.y = 0;
    }
    const t = stateTimer;

    // Gate of Babylon subtle idle ripple rotation
    if (specialGroup) {
      specialGroup.rotation.z = Math.sin(t * 2) * 0.05;
    }

    switch (state) {
      case 'IDLE':
        // Haughty sovereign stance, one hand on hip
        torsoGroup.position.y = 1.0 + Math.sin(t * 3.0) * 0.025;
        headGroup.rotation.x = -0.05; // Chin raised slightly
        leftArm.rotation.x = 0.5; // Hand on hip
        leftArm.rotation.z = 0.3;
        rightArm.rotation.x = -0.3;
        root.rotation.z = 0;
        break;

      case 'WALK': {
        const cycle = Math.sin(t * 9);
        torsoGroup.position.y = 1.0 + Math.abs(cycle) * 0.04;
        leftLeg.rotation.x = cycle * 0.5;
        rightLeg.rotation.x = -cycle * 0.5;
        break;
      }

      case 'DASH':
        torsoGroup.position.y = 0.88;
        root.rotation.z = -facing * 0.42;
        break;

      case 'ATTACK': {
        // Tebasan Enkidu: Contemptuous one-handed golden slash
        const p = Math.min(1, t / 0.38);
        const slash = Math.sin(p * Math.PI);
        rightArm.rotation.x = -1.7 * slash;
        torsoGroup.rotation.y = slash * 0.35;
        break;
      }

      case 'SKILL': {
        // Gerbang Perbendaharaan Babel: Crosses arms, portals shine forward
        const p = Math.min(1, t / 0.55);
        leftArm.rotation.x = -1.1;
        leftArm.rotation.y = 0.6; // Crossed arms
        rightArm.rotation.x = -1.1;
        rightArm.rotation.y = -0.6;
        if (specialGroup) {
          specialGroup.position.z = 0.1 * Math.sin(p * Math.PI);
        }
        break;
      }

      case 'ULTIMATE': {
        // Rantai Langit & Bintang Pemisah Dunia: Raises right hand, celestial vortex
        const p = Math.min(1, t / 1.3);
        if (p < 0.5) {
          torsoGroup.position.y = 1.4;
          rightArm.rotation.x = -2.5; // Hand pointed to the heavens
          headGroup.rotation.x = -0.4;
        } else {
          torsoGroup.position.y = 1.0;
          rightArm.rotation.x = -1.2;
        }
        break;
      }

      case 'HIT':
        torsoGroup.position.y = 0.95;
        root.rotation.z = facing * 0.35;
        break;
    }
  }
};

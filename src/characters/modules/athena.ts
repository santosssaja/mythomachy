import * as THREE from 'three';
import { CharacterModule, RigComponents, CharacterHelperMaterials } from '../types';

export const athenaModule: CharacterModule = {
  def: {
    id: 'athena',
    numericId: 1,
    name: 'Athena',
    title: 'Dewi Kebijaksanaan & Taktik Perang',
    origin: 'Yunani',
    maxHp: 1050,
    speed: 6.5,
    radius: 0.58,
    isApex: false,
    primaryColor: '#E6D087',
    accentColor: '#2A4B7C',
    particleColor: '#FFEAA7',
    basicAttack: {
      name: 'Tusukan Tombak Emas',
      damage: 55,
      range: 2.2,
      cooldown: 0.38
    },
    skill1: {
      name: 'Pantulan Perisai Aegis',
      damage: 130,
      cooldown: 4.5,
      buff: true,
      description: 'Memasang perisai Aegis yang menahan 70% kerusakan masuk lalu melancarkan serangan balik taktis sebesar 130 luka.'
    },
    ultimate: {
      name: 'Keputusan Pallas',
      damage: 260,
      cooldown: 11.0,
      energyCost: 100,
      projectile: true,
      description: 'Melemparkan tombak cahaya ilahi yang menembus pertahanan lawan sebesar 260 luka dan memperlambat langkah lawan 40%.'
    },
    lore: 'Putri Zeus penguasa strategi perang yang tidak pernah kalah karena kecerdasan taktik dan perlindungan perisai Aegis.'
  },

  buildUniqueVisuals(components, materials, helperMats) {
    const { headGroup, leftArm, weapon } = components;

    // 1. Corinthian Helmet with Blue/Gold Crest
    const helmGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.25, 8);
    const helm = new THREE.Mesh(helmGeo, helperMats.gold);
    helm.position.y = 0.22;
    headGroup.add(helm);

    const crestMat = new THREE.MeshStandardMaterial({ color: 0x2a4b7c, roughness: 0.5 });
    materials.push(crestMat);
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.4), crestMat);
    crest.position.set(0, 0.42, 0);
    headGroup.add(crest);

    // 2. Aegis Round Shield on Left Forearm
    const shieldGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 16);
    const shield = new THREE.Mesh(shieldGeo, helperMats.gold);
    shield.rotation.x = Math.PI / 2;
    shield.rotation.z = Math.PI / 2;
    shield.position.set(-0.15, -0.15, 0);
    leftArm.add(shield);

    // 3. Hoplite Long Spear in Right Hand
    const spearShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 2.3, 8),
      helperMats.accent
    );
    spearShaft.position.set(0, 0.3, 0);
    const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.4, 8), helperMats.gold);
    spearTip.position.set(0, 1.45, 0);
    weapon.add(spearShaft, spearTip);
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
        // Disciplined hoplite stance: shield in front, spear angled upward
        torsoGroup.position.y = 1.0 + Math.sin(t * 3.4) * 0.025;
        headGroup.rotation.x = Math.sin(t * 3.4) * 0.02;
        leftArm.rotation.x = -0.5; // Shield held forward
        leftArm.rotation.z = -0.3;
        rightArm.rotation.x = -0.4 + Math.sin(t * 3.0) * 0.04;
        rightArm.rotation.z = -0.1;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        root.rotation.z = 0;
        break;

      case 'WALK': {
        const cycle = Math.sin(t * 11);
        torsoGroup.position.y = 1.0 + Math.abs(cycle) * 0.04;
        leftLeg.rotation.x = cycle * 0.55;
        rightLeg.rotation.x = -cycle * 0.55;
        leftArm.rotation.x = -0.5 - cycle * 0.2; // Shield kept in guard
        rightArm.rotation.x = -0.4 + cycle * 0.4;
        root.rotation.z = 0;
        break;
      }

      case 'DASH':
        torsoGroup.position.y = 0.88;
        root.rotation.z = -facing * 0.4;
        leftArm.rotation.x = -1.2; // Shield point forward
        rightArm.rotation.x = 0.6; // Spear trailing
        leftLeg.rotation.x = 0.4;
        rightLeg.rotation.x = -0.4;
        break;

      case 'ATTACK': {
        // Tusukan Tombak Emas: Fast spear lunge with shield covering chest
        const p = Math.min(1, t / 0.35);
        const lunge = Math.sin(p * Math.PI);
        leftArm.rotation.x = -0.8; // Shield held firm
        rightArm.rotation.x = -1.8 * lunge; // Piercing spear thrust
        torsoGroup.rotation.y = lunge * 0.25;
        break;
      }

      case 'SKILL': {
        // Pantulan Perisai Aegis: Raises shield high, deflects, then shield-bashes
        const p = Math.min(1, t / 0.55);
        if (p < 0.5) {
          leftArm.rotation.x = -1.5;
          leftArm.rotation.y = 0.4;
          leftArm.rotation.z = 0.2;
        } else {
          // Shield bash
          leftArm.rotation.x = -1.8;
          torsoGroup.rotation.y = -0.5;
        }
        break;
      }

      case 'ULTIMATE': {
        // Keputusan Pallas: Javelin vault throw
        const p = Math.min(1, t / 1.1);
        if (p < 0.5) {
          torsoGroup.position.y = 1.25;
          rightArm.rotation.x = 1.2; // Spear drawn back overhead
          leftArm.rotation.x = -1.1; // Left arm aiming forward
          headGroup.rotation.x = -0.2;
        } else {
          // Forceful javelin throw
          torsoGroup.position.y = 1.0;
          rightArm.rotation.x = -2.2;
          torsoGroup.rotation.y = 0.5;
        }
        break;
      }

      case 'HIT':
        torsoGroup.position.y = 0.95;
        root.rotation.z = facing * 0.3;
        leftArm.rotation.x = 0.5;
        rightArm.rotation.x = 0.5;
        break;
    }
  }
};

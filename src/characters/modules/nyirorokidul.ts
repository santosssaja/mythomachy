import * as THREE from 'three';
import { CharacterModule, RigComponents, CharacterHelperMaterials } from '../types';

export const nyirorokidulModule: CharacterModule = {
  def: {
    id: 'nyirorokidul',
    numericId: 9,
    name: 'Nyi Roro Kidul',
    title: 'Penguasa Samudra Selatan (Penguasa Puncak)',
    origin: 'Nusantara',
    maxHp: 1300,
    speed: 6.8,
    radius: 0.58,
    isApex: true,
    primaryColor: '#1ABC9C',
    accentColor: '#16A085',
    particleColor: '#A3E4D7',
    basicAttack: {
      name: 'Hempasan Gelombang Zamrud',
      damage: 80,
      range: 2.8,
      cooldown: 0.36
    },
    skill1: {
      name: 'Pusaran Karang Laut Selatan',
      damage: 185,
      cooldown: 4.5,
      description: 'Menciptakan pusaran air abisal di bawah kaki lawan yang menarik lawan mendekat, memberikan 185 kerusakan, dan memulihkan 90 HP ratu samudra.'
    },
    ultimate: {
      name: 'Tsunami Kencana Samudra',
      damage: 365,
      cooldown: 14.0,
      energyCost: 100,
      description: 'Memanggil gelombang pasang tsunami setinggi arena yang menyapu dari belakang menuju lawan, melempar lawan ke tepi arena dengan 365 kerusakan.'
    },
    lore: 'Ratu gaib perkasa yang bertakhta di istana dasar samudra selatan Jawa, menguasai gelombang laut dan pasukan abisal berzirah zamrud.'
  },

  buildUniqueVisuals(components, materials, helperMats) {
    const { headGroup, torsoGroup, weapon } = components;

    // 1. Royal Crown of the Southern Ocean
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.9 });
    materials.push(crownMat);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 6), crownMat);
    crown.position.y = 0.35;
    headGroup.add(crown);

    // 2. Royal Emerald Gown / Silk Sash (Sampur)
    const sashMat = new THREE.MeshStandardMaterial({
      color: 0x1abc9c,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    materials.push(sashMat);

    const sashL = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.9), sashMat);
    sashL.position.set(-0.25, -0.4, 0.1);
    sashL.rotation.y = 0.2;
    const sashR = sashL.clone();
    sashR.position.x = 0.25;
    sashR.rotation.y = -0.2;
    torsoGroup.add(sashL, sashR);

    // 3. Ocean Water Whip
    const whipMat = new THREE.MeshStandardMaterial({
      color: 0x48dbfb,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8
    });
    materials.push(whipMat);

    const whip = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.03, 8, 24, Math.PI * 1.5), whipMat);
    whip.position.set(0, 0.2, 0);
    whip.rotation.z = Math.PI / 4;
    weapon.add(whip);
  },

  animate(components, state, stateTimer, facing, dt) {
    const { root, torsoGroup, headGroup, leftArm, rightArm, leftLeg, rightLeg, weapon } = components;
    if (facing !== 0) {
      root.rotation.y = facing === 1 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      root.rotation.y = 0;
    }
    const t = stateTimer;

    // Whip undulating water motion
    weapon.rotation.z = Math.PI / 4 + Math.sin(t * 8) * 0.25;

    switch (state) {
      case 'IDLE':
        // Royal, floating ethereal posture like hovering over water
        torsoGroup.position.y = 1.05 + Math.sin(t * 2.5) * 0.04;
        headGroup.rotation.y = Math.sin(t * 2.0) * 0.06;
        leftArm.rotation.x = 0.3;
        leftArm.rotation.z = 0.2;
        rightArm.rotation.x = -0.3;
        root.rotation.z = 0;
        break;

      case 'WALK': {
        const cycle = Math.sin(t * 9);
        torsoGroup.position.y = 1.05 + Math.abs(cycle) * 0.03;
        leftLeg.rotation.x = cycle * 0.45;
        rightLeg.rotation.x = -cycle * 0.45;
        break;
      }

      case 'DASH':
        torsoGroup.position.y = 0.9;
        root.rotation.z = -facing * 0.4;
        break;

      case 'ATTACK': {
        // Hempasan Gelombang Zamrud: Elegant whip lash
        const p = Math.min(1, t / 0.36);
        const flick = Math.sin(p * Math.PI);
        rightArm.rotation.x = -2.0 * flick;
        torsoGroup.rotation.y = flick * 0.4;
        break;
      }

      case 'SKILL': {
        // Pusaran Karang Laut Selatan: Pirouette spin, conjuring geyser
        const p = Math.min(1, t / 0.55);
        torsoGroup.rotation.y = p * Math.PI * 2;
        leftArm.rotation.x = -1.6;
        rightArm.rotation.x = -1.6;
        break;
      }

      case 'ULTIMATE': {
        // Tsunami Kencana Samudra: Ascends high atop tidal wave, commanding ocean surge
        const p = Math.min(1, t / 1.4);
        if (p < 0.6) {
          torsoGroup.position.y = 1.6 + Math.sin(t * 6) * 0.06;
          leftArm.rotation.x = -2.2;
          rightArm.rotation.x = -2.2;
          headGroup.rotation.x = -0.3;
        } else {
          torsoGroup.position.y = 1.0;
          leftArm.rotation.x = -0.8;
          rightArm.rotation.x = -0.8;
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

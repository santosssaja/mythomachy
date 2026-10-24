import * as THREE from 'three';
import { CharacterModule, RigComponents, CharacterHelperMaterials } from '../types';

export const quetzalcoatlModule: CharacterModule = {
  def: {
    id: 'quetzalcoatl',
    numericId: 7,
    name: 'Quetzalcoatl',
    title: 'Ular Bersayap Bulu Zamrud',
    origin: 'Aztek',
    maxHp: 1020,
    speed: 6.6,
    radius: 0.62,
    isApex: false,
    primaryColor: '#2ECC71',
    accentColor: '#F39C12',
    particleColor: '#1ABC9C',
    basicAttack: {
      name: 'Cambukan Angin Zamrud',
      damage: 52,
      range: 2.2,
      cooldown: 0.38
    },
    skill1: {
      name: 'Pusaran Topan',
      damage: 135,
      cooldown: 4.2,
      description: 'Memanggil pusaran angin berputar yang menyedot lawan mendekat ke titik tengah disertai hantaman 135 kerusakan.'
    },
    ultimate: {
      name: 'Napas Matahari Kelima',
      damage: 285,
      cooldown: 12.5,
      energyCost: 100,
      projectile: true,
      description: 'Menembakkan sinar berkekuatan energi matahari purba berwarna hijau keemasan yang membakar garis lurus arena sebesar 285 luka.'
    },
    lore: 'Dewa angin, fajar, dan pengetahuan bangsa Aztek yang membawa pencerahan bagi peradaban kuno Mesoamerika.'
  },

  buildUniqueVisuals(components, materials, helperMats) {
    const { headGroup, torsoGroup, weapon } = components;

    // 1. Serpent Dragon Crown & Feathered Crest
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 5), helperMats.gold);
    crest.position.set(0, 0.35, -0.05);
    headGroup.add(crest);

    // 2. Emerald Plumage Wings on Back
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x27ae60,
      roughness: 0.4,
      metalness: 0.5,
      side: THREE.DoubleSide
    });
    materials.push(wingMat);

    const leftWing = new THREE.Group();
    leftWing.position.set(-0.25, 0.2, -0.15);
    const wingGeo = new THREE.PlaneGeometry(1.25, 0.65, 4, 2);
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

    // 3. Serpent Wind Totem Weapon
    const totem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.2, 6), helperMats.primary);
    totem.position.set(0, 0.25, 0);
    weapon.add(totem);
  },

  animate(components, state, stateTimer, facing, dt) {
    const { torsoGroup, headGroup, leftArm, rightArm, leftLeg, rightLeg, leftWing, rightWing } = components;
    const t = stateTimer;

    // Flapping wings
    if (leftWing && rightWing) {
      const speed = state === 'DASH' ? 18 : 6.5;
      const flap = Math.sin(t * speed) * 0.35;
      leftWing.rotation.z = 0.2 + flap;
      rightWing.rotation.z = -0.2 - flap;
    }

    switch (state) {
      case 'IDLE':
        // Serpentine sinuous sway
        torsoGroup.position.y = 1.02 + Math.sin(t * 3.0) * 0.03;
        torsoGroup.rotation.y = Math.sin(t * 2.5) * 0.08;
        break;

      case 'WALK': {
        const cycle = Math.sin(t * 11);
        torsoGroup.position.y = 1.02 + Math.abs(cycle) * 0.04;
        leftLeg.rotation.x = cycle * 0.55;
        rightLeg.rotation.x = -cycle * 0.55;
        break;
      }

      case 'DASH':
        torsoGroup.position.y = 0.85;
        torsoGroup.rotation.x = 0.38;
        break;

      case 'ATTACK': {
        // Cambukan Angin Zamrud: Serpent strike whip
        const p = Math.min(1, t / 0.38);
        const whip = Math.sin(p * Math.PI);
        rightArm.rotation.x = -1.7 * whip;
        torsoGroup.rotation.y = whip * 0.5;
        break;
      }

      case 'SKILL': {
        // Pusaran Topan: Full body 360 spin
        const p = Math.min(1, t / 0.5);
        torsoGroup.rotation.y = p * Math.PI * 4;
        leftArm.rotation.z = 1.2;
        rightArm.rotation.z = -1.2;
        break;
      }

      case 'ULTIMATE': {
        // Napas Matahari Kelima: Reared back serpent charging solar beam
        const p = Math.min(1, t / 1.25);
        if (p < 0.5) {
          torsoGroup.position.y = 1.35;
          torsoGroup.rotation.x = -0.3; // Reared back
          leftArm.rotation.x = -1.2;
          rightArm.rotation.x = -1.2;
        } else {
          torsoGroup.rotation.x = 0.4; // Thrust forward breathing beam
          torsoGroup.position.y = 0.9;
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

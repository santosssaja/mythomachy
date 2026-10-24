import * as THREE from 'three';
import { CharacterModule, RigComponents, CharacterHelperMaterials } from '../types';

export const wukongModule: CharacterModule = {
  def: {
    id: 'wukong',
    numericId: 6,
    name: 'Sun Wukong',
    title: 'Raja Kera Akrobatik',
    origin: 'Tionghoa',
    maxHp: 1050,
    speed: 6.8,
    radius: 0.58,
    isApex: false,
    primaryColor: '#E67E22',
    accentColor: '#F1C40F',
    particleColor: '#E67E22',
    basicAttack: {
      name: 'Putaran Ruyi Jingu Bang',
      damage: 55,
      range: 2.1,
      cooldown: 0.35
    },
    skill1: {
      name: 'Bayangan Awan',
      damage: 130,
      cooldown: 4.0,
      dash: true,
      description: 'Lompatan akrobatik ke belakang sambil meninggalkan klon bayangan yang meledak menghasilkan 130 luka ke lawan di depannya.'
    },
    ultimate: {
      name: 'Pilar Langit Raksasa',
      damage: 270,
      cooldown: 11.5,
      energyCost: 100,
      description: 'Membesarkan tongkat Ruyi Jingu Bang hingga seukuran pilar kahyangan lalu menghantamkannya lurus ke depan menghancurkan arena.'
    },
    lore: 'Pendekar kera sakti yang menguasai 72 transformasi dan jungkir balik awan kinton, berjiwa bebas pantang tunduk.'
  },

  buildUniqueVisuals(components, materials, helperMats) {
    const { headGroup, torsoGroup, weapon } = components;

    // 1. Golden Tightening Fillet Circlet on Forehead
    const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 6, 16), helperMats.gold);
    circlet.position.set(0, 0.12, 0);
    circlet.rotation.x = Math.PI / 2;
    headGroup.add(circlet);

    // 2. Monkey Tail
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xb85d19, roughness: 0.7 });
    materials.push(tailMat);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.8, 6), tailMat);
    tail.position.set(0, -0.3, -0.25);
    tail.rotation.x = -0.7;
    torsoGroup.add(tail);

    // 3. Ruyi Jingu Bang Staff with Golden Caps
    const redShaftMat = new THREE.MeshStandardMaterial({ color: 0x9b1d20, roughness: 0.4 });
    materials.push(redShaftMat);
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.1, 8), redShaftMat);
    staff.position.set(0, 0.2, 0);

    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.35, 8), helperMats.gold);
    topCap.position.set(0, 1.1, 0);
    const botCap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.35, 8), helperMats.gold);
    botCap.position.set(0, -0.7, 0);

    weapon.add(staff, topCap, botCap);
  },

  animate(components, state, stateTimer, facing, dt) {
    const { torsoGroup, headGroup, leftArm, rightArm, leftLeg, rightLeg, weapon } = components;
    const t = stateTimer;

    switch (state) {
      case 'IDLE':
        // Agile monkey crouch, restless head tilts, resting staff across shoulders
        torsoGroup.position.y = 0.95 + Math.sin(t * 5.0) * 0.025;
        headGroup.rotation.z = Math.sin(t * 3.0) * 0.12;
        leftArm.rotation.x = -0.4;
        rightArm.rotation.x = -0.8;
        break;

      case 'WALK': {
        const cycle = Math.sin(t * 13);
        torsoGroup.position.y = 0.95 + Math.abs(cycle) * 0.04;
        leftLeg.rotation.x = cycle * 0.65;
        rightLeg.rotation.x = -cycle * 0.65;
        break;
      }

      case 'DASH':
        // Akrobatik somersault / cloud roll
        torsoGroup.position.y = 0.78;
        torsoGroup.rotation.x = 0.45;
        break;

      case 'ATTACK': {
        // Putaran Ruyi Jingu Bang: Rapid staff spin
        const p = Math.min(1, t / 0.35);
        weapon.rotation.z = p * Math.PI * 6; // Fast spinning staff
        rightArm.rotation.x = -1.2;
        torsoGroup.rotation.y = Math.sin(p * Math.PI) * 0.35;
        break;
      }

      case 'SKILL': {
        // Bayangan Awan: Vault backflip off staff
        const p = Math.min(1, t / 0.55);
        torsoGroup.position.y = 1.0 + Math.sin(p * Math.PI) * 0.6;
        torsoGroup.rotation.x = -p * Math.PI * 2; // Full backflip along local sagittal axis
        break;
      }

      case 'ULTIMATE': {
        // Pilar Langit Raksasa: Overhead massive two-handed downward pillar strike
        const p = Math.min(1, t / 1.15);
        if (p < 0.45) {
          torsoGroup.position.y = 1.35;
          rightArm.rotation.x = -2.6; // High overhead
          leftArm.rotation.x = -2.6;
        } else {
          torsoGroup.position.y = 0.7;
          rightArm.rotation.x = -0.4;
          leftArm.rotation.x = -0.4;
          torsoGroup.rotation.x = 0.4;
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

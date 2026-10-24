import * as THREE from 'three';
import { CharacterModule, RigComponents, CharacterHelperMaterials } from '../types';

export const susanooModule: CharacterModule = {
  def: {
    id: 'susanoo',
    numericId: 4,
    name: 'Susanoo',
    title: 'Penguasa Badai & Samudra',
    origin: 'Jepang',
    maxHp: 950,
    speed: 7.2,
    radius: 0.55,
    isApex: false,
    primaryColor: '#5B86E5',
    accentColor: '#36D1DC',
    particleColor: '#54A0FF',
    basicAttack: {
      name: 'Tebasan Kusanagi',
      damage: 50,
      range: 1.8,
      cooldown: 0.32
    },
    skill1: {
      name: 'Angin Pemotong',
      damage: 135,
      cooldown: 3.8,
      projectile: true,
      description: 'Mengibaskan pedang Kusanagi melepaskan sabit angin berkecepatan tinggi yang memotong barisan musuh sejauh 5 meter.'
    },
    ultimate: {
      name: 'Tarian Seribu Badai',
      damage: 290,
      cooldown: 11.5,
      energyCost: 100,
      dash: true,
      description: 'Rangkaian 4 tebasan kilat beruntun berkecepatan supranatural yang mengiris lawan dengan total 290 kerusakan mutlak.'
    },
    lore: 'Dewa badai Takamagahara yang menumbangkan Yamata no Orochi berbekal keberanian tak tergoyahkan dan pedang legendaris.'
  },

  buildUniqueVisuals(components, materials, helperMats) {
    const { headGroup, torsoGroup, weapon } = components;

    // 1. Samurai Kabuto with Golden Crescent Horn (Maedate)
    const helmet = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.2, 8), helperMats.primary);
    helmet.position.y = 0.22;
    headGroup.add(helmet);

    const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 6, 12, Math.PI), helperMats.gold);
    crescent.position.set(0, 0.38, 0.12);
    crescent.rotation.x = 0.3;
    headGroup.add(crescent);

    // 2. Straw Shimenawa Waist Sash
    const sash = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 6, 16), helperMats.accent);
    sash.position.set(0, -0.32, 0);
    sash.rotation.x = Math.PI / 2;
    torsoGroup.add(sash);

    // 3. Kusanagi Katana Blade
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xd8ecf8, roughness: 0.15, metalness: 0.95 });
    materials.push(bladeMat);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.4, 0.08), bladeMat);
    blade.position.set(0, 0.7, 0);

    const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 8), helperMats.gold);
    guard.position.set(0, 0.02, 0);

    const tsuka = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.32, 8), helperMats.accent);
    tsuka.position.set(0, -0.15, 0);

    weapon.add(blade, guard, tsuka);
  },

  animate(components, state, stateTimer, facing, dt) {
    const { torsoGroup, headGroup, leftArm, rightArm, leftLeg, rightLeg } = components;
    const t = stateTimer;

    switch (state) {
      case 'IDLE':
        // Agile, focused Iaido stance with blade angled down
        torsoGroup.position.y = 1.0 + Math.sin(t * 4.0) * 0.02;
        leftArm.rotation.x = 0.4;
        rightArm.rotation.x = -0.3 + Math.sin(t * 3.5) * 0.03;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        break;

      case 'WALK': {
        const cycle = Math.sin(t * 13);
        torsoGroup.position.y = 1.0 + Math.abs(cycle) * 0.03;
        leftLeg.rotation.x = cycle * 0.6;
        rightLeg.rotation.x = -cycle * 0.6;
        leftArm.rotation.x = -cycle * 0.4;
        rightArm.rotation.x = -0.3 + cycle * 0.3;
        break;
      }

      case 'DASH':
        torsoGroup.position.y = 0.82;
        torsoGroup.rotation.x = 0.42; // Very low forward ninja sprint
        leftArm.rotation.x = 1.1;
        rightArm.rotation.x = 1.1; // Both arms trailing behind
        break;

      case 'ATTACK': {
        // Tebasan Kusanagi: Lightning-fast Iaido diagonal draw
        const p = Math.min(1, t / 0.32);
        if (p < 0.25) {
          rightArm.rotation.x = 0.5;
          torsoGroup.rotation.y = -0.4;
        } else {
          const slash = Math.sin((p - 0.25) / 0.75 * Math.PI);
          rightArm.rotation.x = -1.9 * slash;
          rightArm.rotation.z = -0.6 * slash;
          torsoGroup.rotation.y = 0.7 * slash;
        }
        break;
      }

      case 'SKILL': {
        // Angin Pemotong: Horizontal sweeping slice releasing air blade
        const p = Math.min(1, t / 0.45);
        const sweep = Math.sin(p * Math.PI);
        rightArm.rotation.x = -1.2;
        rightArm.rotation.y = -1.4 * sweep;
        torsoGroup.rotation.y = 0.8 * sweep;
        break;
      }

      case 'ULTIMATE': {
        // Tarian Seribu Badai: 4-step zig-zag lightning slashes
        const step = Math.floor(t * 8) % 4;
        torsoGroup.position.y = 0.9 + (step % 2) * 0.3;
        torsoGroup.rotation.y = Math.sin(t * 20) * 0.4;
        rightArm.rotation.x = -1.8 + Math.cos(t * 24) * 0.8;
        rightArm.rotation.z = Math.sin(t * 24) * 0.8;
        break;
      }

      case 'HIT':
        torsoGroup.position.y = 0.95;
        torsoGroup.rotation.x = -0.28;
        break;
    }
  }
};

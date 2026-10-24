import * as THREE from 'three';
import { GraphicsPreset, MapId, ViewMode, FighterSimState } from '../types/game';
import { getCurrentTimeOfDay } from '../config/maps';
import { createArticulatedCharacterRig, ArticulatedCharacterRig } from './characterMeshBuilder';

export interface ForegroundObstacle {
  mesh: THREE.Mesh | THREE.Group;
  materials: THREE.Material[];
  currentOpacity: number;
  targetOpacity: number;
}

export class Mythomachy3DScene {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public perspectiveCamera: THREE.PerspectiveCamera;
  public orthoCamera: THREE.OrthographicCamera;
  public viewMode: ViewMode = '3D';
  public graphicsPreset: GraphicsPreset = 'high';

  private fighter1Rig: ArticulatedCharacterRig | null = null;
  private fighter2Rig: ArticulatedCharacterRig | null = null;

  private mapId: MapId = 'monad_sanctum';
  private mapGroup: THREE.Group = new THREE.Group();
  private foregroundObstacles: ForegroundObstacle[] = [];
  private floatingMonoliths: THREE.Mesh[] = [];

  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private particleSystems: THREE.Points[] = [];

  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;
  private pointLights: THREE.PointLight[] = [];

  constructor(container: HTMLElement, mapId: MapId = 'monad_sanctum', preset: GraphicsPreset = 'high') {
    this.container = container;
    this.mapId = mapId;
    this.graphicsPreset = preset;

    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 700;

    // Initialize Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0a0f);
    this.scene.fog = new THREE.FogExp2(0x0b0a0f, 0.018);

    // Initialize Cameras
    this.perspectiveCamera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    this.perspectiveCamera.position.set(0, 4.2, 12.5);
    this.perspectiveCamera.lookAt(0, 1.8, 0);

    const aspect = width / height;
    const d = 8.5;
    this.orthoCamera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100);
    this.orthoCamera.position.set(0, 3.2, 14);
    this.orthoCamera.lookAt(0, 2.0, 0);

    // Initialize Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.applyGraphicsPreset(preset);

    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfff7e6, 1.4);
    this.dirLight.position.set(5, 12, 7);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.bias = -0.001;
    this.scene.add(this.dirLight);

    // Dynamic Hemisphere Fill for natural ambient light from sky and arena bounce
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x241d3b, 1.0);
    hemiLight.position.set(0, 15, 0);
    this.scene.add(hemiLight);

    // Front-Fill Light (Warm camera-facing light so characters' front armor and faces pop)
    const frontLight = new THREE.DirectionalLight(0xfff1dc, 0.85);
    frontLight.position.set(0, 5, 12);
    this.scene.add(frontLight);

    // Back-Rim Silhouette Light (Ensures fighters never blend into dark sky)
    const rimLight = new THREE.DirectionalLight(0xa594fd, 0.75);
    rimLight.position.set(0, 7, -8);
    this.scene.add(rimLight);

    // Build Map Environment
    this.scene.add(this.mapGroup);
    this.loadMap(mapId);

    // Resize Handler
    window.addEventListener('resize', this.onResize);
  }

  public setViewMode(mode: ViewMode) {
    this.viewMode = mode;
  }

  public setMap(mapId: MapId) {
    this.mapId = mapId;
    this.loadMap(mapId);
  }

  public applyGraphicsPreset(preset: GraphicsPreset) {
    this.graphicsPreset = preset;
    const width = this.container.clientWidth || 1200;
    const height = this.container.clientHeight || 700;

    let pixelRatio = window.devicePixelRatio;
    let shadowsEnabled = true;

    if (preset === 'low') {
      pixelRatio = 0.75;
      shadowsEnabled = false;
    } else if (preset === 'medium') {
      pixelRatio = 1.0;
      shadowsEnabled = true;
      this.renderer.shadowMap.type = THREE.BasicShadowMap;
    } else if (preset === 'high') {
      pixelRatio = Math.min(1.5, window.devicePixelRatio);
      shadowsEnabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } else if (preset === 'ultra') {
      pixelRatio = window.devicePixelRatio;
      shadowsEnabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.shadowMap.enabled = shadowsEnabled;
    this.renderer.setSize(width, height);
  }

  /**
   * Build Map Environments
   */
  private loadMap(mapId: MapId) {
    // Clear old map group
    while (this.mapGroup.children.length > 0) {
      const obj = this.mapGroup.children[0];
      this.mapGroup.remove(obj);
    }
    this.foregroundObstacles = [];
    this.floatingMonoliths = [];
    this.pointLights.forEach(pl => this.scene.remove(pl));
    this.pointLights = [];

    // Shared Arena Floor
    const floorGeo = new THREE.BoxGeometry(32, 1, 10);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x14121d,
      roughness: 0.35,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, -0.5, 0);
    floor.receiveShadow = true;
    this.mapGroup.add(floor);

    if (mapId === 'monad_sanctum') {
      // Sanctum of Monad: Obsidian stone with refined purple circuits and floating violet monoliths
      this.scene.background = new THREE.Color(0x0c0a15);
      this.ambientLight.color.set(0x9d90c9);
      this.ambientLight.intensity = 1.05;
      this.dirLight.color.set(0xfff5e6);
      this.dirLight.intensity = 1.4;

      // Soft, non-glaring arcane circuits on floor (low contrast, anti-barcode)
      const runeTexCanvas = document.createElement('canvas');
      runeTexCanvas.width = 512;
      runeTexCanvas.height = 256;
      const ctx = runeTexCanvas.getContext('2d')!;
      ctx.clearRect(0, 0, 512, 256);

      ctx.strokeStyle = 'rgba(110, 86, 207, 0.25)';
      ctx.lineWidth = 2;

      // Soft circular ritual array
      ctx.beginPath();
      ctx.arc(256, 128, 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(256, 128, 100, 0, Math.PI * 2);
      ctx.stroke();

      // Widely spaced, subtle geometric lines
      for (let i = 0; i < 512; i += 96) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 32, 128);
        ctx.lineTo(i, 256);
        ctx.stroke();
      }

      const runeTex = new THREE.CanvasTexture(runeTexCanvas);
      runeTex.wrapS = THREE.RepeatWrapping;
      runeTex.repeat.set(2, 1);
      const runeMat = new THREE.MeshBasicMaterial({
        map: runeTex,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });
      const runePlane = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), runeMat);
      runePlane.rotation.x = -Math.PI / 2;
      runePlane.position.set(0, 0.01, 0);
      this.mapGroup.add(runePlane);

      // Floating Violet Monoliths
      const monoGeo = new THREE.OctahedronGeometry(1.2, 0);
      const monoMat = new THREE.MeshStandardMaterial({
        color: 0x6e56cf,
        emissive: 0x3d1c8c,
        roughness: 0.15,
        metalness: 0.9
      });
      const positions = [
        [-9, 3.5, -3],
        [-5, 4.2, -4],
        [0, 5.0, -4.5],
        [5, 4.2, -4],
        [9, 3.5, -3]
      ];
      positions.forEach(([x, y, z]) => {
        const mono = new THREE.Mesh(monoGeo, monoMat);
        mono.position.set(x, y, z);
        mono.scale.set(0.8, 1.8, 0.8);
        mono.castShadow = true;
        this.floatingMonoliths.push(mono);
        this.mapGroup.add(mono);

        // Violet point light
        const pl = new THREE.PointLight(0x6e56cf, 1.5, 7);
        pl.position.set(x, y, z);
        this.pointLights.push(pl);
        this.scene.add(pl);
      });
    } else if (mapId === 'primeval_othrys') {
      // Primeval Othrys: Ancient mythological temple with marble columns and lush trees (including foreground trees!)
      this.scene.background = new THREE.Color(0x1a2130);
      this.ambientLight.color.set(0xd4af37);
      this.ambientLight.intensity = 0.85;
      this.dirLight.color.set(0xfff7e6);
      this.dirLight.intensity = 1.3;

      // Marble columns along perimeter
      const colGeo = new THREE.CylinderGeometry(0.55, 0.65, 8.5, 16);
      const colMat = new THREE.MeshStandardMaterial({ color: 0xdfdcd5, roughness: 0.4 });
      for (let x = -13; x <= 13; x += 5.2) {
        const col = new THREE.Mesh(colGeo, colMat);
        col.position.set(x, 4.25, -4);
        col.castShadow = true;
        this.mapGroup.add(col);
      }

      // Perimeter Lush Trees & Foreground Trees (Between camera z=12 and arena z=0)
      this.createTree(-12, 0, 4.5, true);  // Foreground tree Left
      this.createTree(12, 0, 4.5, true);   // Foreground tree Right
      this.createTree(-6, 0, 5.5, true);   // Foreground tree Mid-Left
      this.createTree(6, 0, 5.5, true);    // Foreground tree Mid-Right
      this.createTree(-14, 0, -3, false);  // Background tree
      this.createTree(14, 0, -3, false);   // Background tree
    } else if (mapId === 'chronos_horizon') {
      // Chronos Horizon: Dynamic Real-Time Sky & Lighting from Device Time
      const timeInfo = getCurrentTimeOfDay();
      this.scene.background = new THREE.Color(timeInfo.skyColorBottom);
      this.ambientLight.color.set(timeInfo.ambientLight);
      this.ambientLight.intensity = 0.8;
      this.dirLight.color.set(timeInfo.sunColor);
      this.dirLight.intensity = timeInfo.sunIntensity;

      // Temple pillars with clock/astrolabe rings
      const colGeo = new THREE.CylinderGeometry(0.5, 0.6, 8, 12);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x2e9e6b, roughness: 0.3, metalness: 0.5 });
      for (let x = -11; x <= 11; x += 5.5) {
        const col = new THREE.Mesh(colGeo, colMat);
        col.position.set(x, 4, -3.5);
        this.mapGroup.add(col);
      }

      // Dynamic trees
      this.createTree(-7, 0, 5.0, true);
      this.createTree(7, 0, 5.0, true);
    }
  }

  /**
   * Procedural Tree Generator with Support for Dynamic Camera Occlusion Transparency
   */
  private createTree(x: number, y: number, z: number, isForeground: boolean) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);

    // Trunk
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x4a2f1b,
      roughness: 0.8,
      transparent: true,
      opacity: 1.0
    });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 4.5, 8), trunkMat);
    trunk.position.y = 2.25;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Leaves / Canopy
    const leavesMat = new THREE.MeshStandardMaterial({
      color: 0x27ae60,
      roughness: 0.5,
      transparent: true,
      opacity: 1.0
    });
    const canopy1 = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.2, 8), leavesMat);
    canopy1.position.y = 4.8;
    canopy1.castShadow = true;

    const canopy2 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.6, 8), leavesMat);
    canopy2.position.y = 6.2;
    canopy2.castShadow = true;

    treeGroup.add(canopy1, canopy2);
    this.mapGroup.add(treeGroup);

    if (isForeground) {
      this.foregroundObstacles.push({
        mesh: treeGroup,
        materials: [trunkMat, leavesMat],
        currentOpacity: 1.0,
        targetOpacity: 1.0
      });
    }
  }

  /**
   * Spawn or update fighter 3D rigs
   */
  public updateFighterMeshes(f1: FighterSimState, f2: FighterSimState) {
    // Check if rigs need creation or recreation
    if (!this.fighter1Rig || this.fighter1Rig.characterId !== f1.characterId) {
      if (this.fighter1Rig) {
        this.scene.remove(this.fighter1Rig.root);
        this.fighter1Rig.dispose();
      }
      this.fighter1Rig = createArticulatedCharacterRig(f1.characterId);
      this.scene.add(this.fighter1Rig.root);
    }

    if (!this.fighter2Rig || this.fighter2Rig.characterId !== f2.characterId) {
      if (this.fighter2Rig) {
        this.scene.remove(this.fighter2Rig.root);
        this.fighter2Rig.dispose();
      }
      this.fighter2Rig = createArticulatedCharacterRig(f2.characterId);
      this.scene.add(this.fighter2Rig.root);
    }

    // Position, Orient & Animate Fighter 1
    this.fighter1Rig.root.position.set(f1.x, f1.y, f1.z);
    this.fighter1Rig.root.rotation.y = f1.facing === 1 ? Math.PI * 0.42 : -Math.PI * 0.42;
    this.fighter1Rig.updateAnimation(f1.state, f1.stateTimer, f1.facing);

    // Position, Orient & Animate Fighter 2
    this.fighter2Rig.root.position.set(f2.x, f2.y, f2.z);
    this.fighter2Rig.root.rotation.y = f2.facing === 1 ? Math.PI * 0.42 : -Math.PI * 0.42;
    this.fighter2Rig.updateAnimation(f2.state, f2.stateTimer, f2.facing);
  }

  /**
   * Check Camera Occlusion: Smoothly transitions foreground trees/pillars to opacity 0.20
   * when between active camera and fighters/midpoint
   */
  public checkCameraOcclusion(f1: FighterSimState, f2: FighterSimState, dt: number) {
    const activeCam = this.viewMode === '3D' ? this.perspectiveCamera : this.orthoCamera;
    const camPos = activeCam.position;

    // Test points: Fighter 1, Fighter 2, Midpoint
    const targets = [
      new THREE.Vector3(f1.x, f1.y + 1.2, f1.z),
      new THREE.Vector3(f2.x, f2.y + 1.2, f2.z),
      new THREE.Vector3((f1.x + f2.x) / 2, 1.2, (f1.z + f2.z) / 2)
    ];

    this.foregroundObstacles.forEach(obs => {
      let isObstructing = false;
      const obsPos = obs.mesh.position;

      // Check each ray from camera to targets
      for (const target of targets) {
        const dir = new THREE.Vector3().subVectors(target, camPos);
        const distToTarget = dir.length();
        dir.normalize();

        this.raycaster.set(camPos, dir);
        this.raycaster.far = distToTarget;

        const intersects = this.raycaster.intersectObjects(obs.mesh.children, true);
        if (intersects.length > 0) {
          isObstructing = true;
          break;
        }

        // Geometric proximity fallback along line of sight
        const t = (obsPos.z - camPos.z) / (target.z - camPos.z);
        if (t > 0.1 && t < 0.95) {
          const expectedX = camPos.x + t * (target.x - camPos.x);
          if (Math.abs(obsPos.x - expectedX) < 1.8) {
            isObstructing = true;
            break;
          }
        }
      }

      // Smooth opacity transition
      obs.targetOpacity = isObstructing ? 0.20 : 1.0;
      obs.currentOpacity += (obs.targetOpacity - obs.currentOpacity) * Math.min(1, dt * 10);

      obs.materials.forEach(mat => {
        mat.transparent = true;
        mat.opacity = obs.currentOpacity;
        mat.depthWrite = obs.currentOpacity > 0.6;
      });
    });
  }

  /**
   * Render frame loop
   */
  public render(f1: FighterSimState, f2: FighterSimState, dt: number) {
    // Update rigs
    this.updateFighterMeshes(f1, f2);

    // Update floating monoliths in Sanctum of Monad
    if (this.mapId === 'monad_sanctum') {
      const now = performance.now() * 0.0015;
      this.floatingMonoliths.forEach((mono, idx) => {
        mono.rotation.y += dt * 0.8;
        mono.position.y += Math.sin(now + idx) * dt * 0.3;
      });
    }

    // Dynamic camera framing based on fighter distance
    const midX = (f1.x + f2.x) / 2;
    const fighterDist = Math.abs(f1.x - f2.x);

    if (this.viewMode === '3D') {
      const targetCamX = midX * 0.6;
      const targetCamZ = Math.max(10.5, 9.0 + fighterDist * 0.35);
      this.perspectiveCamera.position.x += (targetCamX - this.perspectiveCamera.position.x) * dt * 4;
      this.perspectiveCamera.position.z += (targetCamZ - this.perspectiveCamera.position.z) * dt * 4;
      this.perspectiveCamera.lookAt(midX, 1.8, 0);
    } else {
      // 2D Orthographic mode
      this.orthoCamera.position.x = midX;
      this.orthoCamera.lookAt(midX, 2.0, 0);
    }

    // Handle transparent trees occlusion
    this.checkCameraOcclusion(f1, f2, dt);

    // Render active camera
    const activeCamera = this.viewMode === '3D' ? this.perspectiveCamera : this.orthoCamera;
    this.renderer.render(this.scene, activeCamera);
  }

  private onResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return;

    this.perspectiveCamera.aspect = width / height;
    this.perspectiveCamera.updateProjectionMatrix();

    const aspect = width / height;
    const d = 8.5;
    this.orthoCamera.left = -d * aspect;
    this.orthoCamera.right = d * aspect;
    this.orthoCamera.top = d;
    this.orthoCamera.bottom = -d;
    this.orthoCamera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  /**
   * Project a 3D world position to 2D screen coordinates (pixels relative to canvas)
   */
  public projectToScreen(worldX: number, worldY: number, worldZ: number = 0): { x: number; y: number } | null {
    const camera = this.viewMode === '3D' ? this.perspectiveCamera : this.orthoCamera;
    const canvas = this.renderer.domElement;
    if (!canvas) return null;

    const vector = new THREE.Vector3(worldX, worldY, worldZ);
    vector.project(camera);

    // If point is behind the camera in perspective mode
    if (this.viewMode === '3D' && vector.z > 1) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    const x = (vector.x * 0.5 + 0.5) * rect.width;
    const y = (-(vector.y * 0.5) + 0.5) * rect.height;

    return { x, y };
  }

  public destroy() {
    window.removeEventListener('resize', this.onResize);
    if (this.fighter1Rig) this.fighter1Rig.dispose();
    if (this.fighter2Rig) this.fighter2Rig.dispose();
    this.renderer.dispose();
  }
}

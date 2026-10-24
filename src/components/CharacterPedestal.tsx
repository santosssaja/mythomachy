import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CharacterId } from '../types/game';
import { createArticulatedCharacterRig, ArticulatedCharacterRig } from '../engine/characterMeshBuilder';

interface CharacterPedestalProps {
  characterId: CharacterId;
  className?: string;
}

export const CharacterPedestal: React.FC<CharacterPedestalProps> = ({ characterId, className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<ArticulatedCharacterRig | null>(null);
  const rotationAngleRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.25, 4.0);
    camera.lookAt(0, 0.95, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Canvas styling for seamless desktop mouse drag & mobile touch
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.userSelect = 'none';
    renderer.domElement.style.webkitUserSelect = 'none';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    // Lights (Balanced Studio & Low Uplights for Character Silhouette)
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffecd2, 1.8);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x6e56cf, 2.4);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const goldPoint = new THREE.PointLight(0xd4af37, 2.2, 6);
    goldPoint.position.set(0, 0.3, 1.4);
    scene.add(goldPoint);

    // Uplight & Backlight so dark trousers/feet contrast crisply against stage
    const footLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    footLight.position.set(0, 0.1, 2.4);
    scene.add(footLight);

    const backRim = new THREE.DirectionalLight(0x8a70eb, 2.2);
    backRim.position.set(0, 0.8, -2.4);
    scene.add(backRim);

    // Turntable Group: holds pedestal base, gold ring, and character model
    // Rotated synchronously by rotationAngleRef for true 360 showcase
    const turntableGroup = new THREE.Group();
    scene.add(turntableGroup);

    // Pedestal base (Slightly narrowed to prevent edge clipping)
    const baseGeo = new THREE.CylinderGeometry(0.92, 1.05, 0.22, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x14121d,
      roughness: 0.3,
      metalness: 0.8
    });
    const pedestal = new THREE.Mesh(baseGeo, baseMat);
    pedestal.position.y = -0.11;
    turntableGroup.add(pedestal);

    // Golden ring border with ancient glyph styling (Fits completely inside canvas)
    const ringGeo = new THREE.TorusGeometry(0.95, 0.032, 8, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.9
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    turntableGroup.add(ring);

    // Articulated 3D Rig attached to turntable
    const rig = createArticulatedCharacterRig(characterId);
    rig.root.position.y = 0.0;
    turntableGroup.add(rig.root);
    rigRef.current = rig;

    let isDragging = false;
    let prevPointerX = 0;
    let rotationVelocity = 0;

    // --- DESKTOP POINTER & MOUSE INTERACTION ---
    const onPointerDown = (e: PointerEvent) => {
      // Primary button only
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      isDragging = true;
      setIsInteracting(true);
      prevPointerX = e.clientX;
      rotationVelocity = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - prevPointerX;
      rotationVelocity = delta * 0.014;
      rotationAngleRef.current += rotationVelocity;
      prevPointerX = e.clientX;
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        setIsInteracting(false);
      }
    };

    // --- MOUSE WHEEL ROTATION ON DESKTOP ---
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const step = delta * 0.003;
      rotationVelocity = step * 0.3;
      rotationAngleRef.current += step;
    };

    // --- MOBILE TOUCH EVENTS WITH PREVENT DEFAULT ---
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        setIsInteracting(true);
        prevPointerX = e.touches[0].clientX;
        rotationVelocity = 0;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const delta = e.touches[0].clientX - prevPointerX;
      rotationVelocity = delta * 0.016;
      rotationAngleRef.current += rotationVelocity;
      prevPointerX = e.touches[0].clientX;
      if (e.cancelable) {
        e.preventDefault(); // Prevent page scrolling during character rotation
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    // Bind initiation events to the container / canvas
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });

    // Global move & up events on window guarantee unbroken dragging across desktop screens
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    let animId: number;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;

      if (isDragging) {
        // Continuous rotation driven by user drag
      } else if (Math.abs(rotationVelocity) > 0.0003) {
        rotationAngleRef.current += rotationVelocity;
        rotationVelocity *= 0.93; // Smooth inertial glide
      } else {
        rotationAngleRef.current += 0.004; // Regal slow turntable idle spin
      }

      // Rotate entire turntable group (pedestal + ring + character)
      turntableGroup.rotation.y = rotationAngleRef.current;

      // Update character procedural idle animation (facing = 0 keeps character facing forward)
      rig.updateAnimation('IDLE', elapsed, 0);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('resize', onResize);

      rig.dispose();
      renderer.dispose();
    };
  }, [characterId]);

  const handleManualRotate = (dir: 'left' | 'right') => {
    const delta = dir === 'left' ? -0.45 : 0.45;
    rotationAngleRef.current += delta;
  };

  return (
    <div
      className={`relative w-full h-full min-h-[220px] select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Canvas Mount with Grab / Grabbing Cursors */}
      <div
        ref={mountRef}
        className={`w-full h-full ${
          isInteracting ? 'cursor-grabbing' : 'cursor-grab'
        } transition-shadow duration-300`}
        style={{ touchAction: 'none' }}
      />

      {/* Quick Rotate Buttons with clean inline SVGs (ZERO EMOJIS) */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10 pointer-events-auto">
        <button
          onClick={() => handleManualRotate('left')}
          className="w-7 h-7 rounded-lg bg-[#0B0A0F]/85 border border-[#2D2842] text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#1F1B2E] flex items-center justify-center transition-all active:scale-90 shadow-md cursor-pointer"
          title="Putar Kiri 45 Derajat"
          aria-label="Putar Kiri"
        >
          {/* Clean Rotate Left Curved Arrow SVG */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
        <button
          onClick={() => handleManualRotate('right')}
          className="w-7 h-7 rounded-lg bg-[#0B0A0F]/85 border border-[#2D2842] text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#1F1B2E] flex items-center justify-center transition-all active:scale-90 shadow-md cursor-pointer"
          title="Putar Kanan 45 Derajat"
          aria-label="Putar Kanan"
        >
          {/* Clean Rotate Right Curved Arrow SVG */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
      </div>

      {/* Subtle Interaction Guide Pill */}
      <div
        className={`rotate-hint-pill absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-[#9E98B0] flex items-center gap-1.5 pointer-events-none transition-opacity duration-300 z-10 ${
          isHovered || isInteracting ? 'opacity-95 border-[#D4AF37]/50 text-[#D4AF37]' : 'opacity-70'
        }`}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
        <span className="font-medium whitespace-nowrap">Geser / Gulir untuk Putar 360°</span>
      </div>
    </div>
  );
};

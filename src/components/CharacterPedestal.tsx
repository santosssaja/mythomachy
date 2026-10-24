import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.35, 3.8);
    camera.lookAt(0, 1.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffecd2, 1.5);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x6e56cf, 2.0);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const goldPoint = new THREE.PointLight(0xd4af37, 1.8, 6);
    goldPoint.position.set(0, 0.2, 1.2);
    scene.add(goldPoint);

    // Pedestal base
    const baseGeo = new THREE.CylinderGeometry(1.2, 1.35, 0.25, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x14121d,
      roughness: 0.3,
      metalness: 0.8
    });
    const pedestal = new THREE.Mesh(baseGeo, baseMat);
    pedestal.position.y = -0.12;
    scene.add(pedestal);

    // Golden ring border
    const ringGeo = new THREE.TorusGeometry(1.22, 0.04, 8, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.9
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    // Articulated 3D Rig
    const rig = createArticulatedCharacterRig(characterId);
    rig.root.position.y = 0.0;
    scene.add(rig.root);
    rigRef.current = rig;

    let isDragging = false;
    let prevMouseX = 0;
    let rotationAngle = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - prevMouseX;
      rotationAngle += delta * 0.012;
      prevMouseX = e.clientX;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let animId: number;
    let startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;

      if (!isDragging) {
        rotationAngle += 0.007; // Slow graceful auto-rotation
      }

      rig.root.rotation.y = rotationAngle;
      rig.updateAnimation('IDLE', elapsed, 1);

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
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      rig.dispose();
      renderer.dispose();
    };
  }, [characterId]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[340px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}
      title="Geser mouse untuk memutar 360 derajat"
    />
  );
};

import * as THREE from 'three';
import {
  createWoodTexture,
  createFloorTileTexture,
  createCeilingTileTexture,
  createComputerScreenTexture,
  createWhiteboardTexture,
  createDoorSignTexture,
  createWindowSkyTexture,
  createPaintingTexture
} from './textures.js';

/**
 * Material Manager
 * Caches and provides reusable PBR materials to ensure high performance
 */
export class MaterialManager {
  constructor() {
    this.materials = new Map();
    this.initSharedMaterials();
  }

  initSharedMaterials() {
    // Floor
    const floorTexture = createFloorTileTexture();
    this.materials.set('floor', new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.85,
      metalness: 0.1
    }));

    // Ceiling
    const ceilingTexture = createCeilingTileTexture();
    this.materials.set('ceiling', new THREE.MeshStandardMaterial({
      map: ceilingTexture,
      roughness: 0.9,
      metalness: 0.05
    }));

    // Drywall / Walls (Modern warm off-white / light slate)
    this.materials.set('wall', new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.8,
      metalness: 0.05
    }));

    // Accent Wall (Navy / Teal executive feature wall)
    this.materials.set('wallAccent', new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.1
    }));

    // Wood Desks & Tables
    const woodTexture = createWoodTexture();
    this.materials.set('woodDesk', new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.45,
      metalness: 0.05
    }));

    // Dark walnut wood for executive meeting table
    const darkWoodTex = woodTexture.clone();
    this.materials.set('woodDark', new THREE.MeshStandardMaterial({
      map: darkWoodTex,
      color: 0x7c4d28,
      roughness: 0.4,
      metalness: 0.1
    }));

    // Metal (Table legs, chair frames, shelf uprights)
    this.materials.set('metalDark', new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.35,
      metalness: 0.8
    }));

    this.materials.set('metalChrome', new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      roughness: 0.2,
      metalness: 0.95
    }));

    this.materials.set('metalGold', new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.8
    }));

    // Ergonomic Chair Fabric
    this.materials.set('chairFabric', new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9,
      metalness: 0.05
    }));

    this.materials.set('chairCushion', new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Cool cyan-blue accent chairs
      roughness: 0.85,
      metalness: 0.05
    }));

    // Computer Monitor Bezel
    this.materials.set('plasticBlack', new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.4,
      metalness: 0.2
    }));

    // Computer Screen Display (Emissive so it glows realistically)
    const screenTex = createComputerScreenTexture();
    this.materials.set('computerScreen', new THREE.MeshStandardMaterial({
      map: screenTex,
      emissive: 0xffffff,
      emissiveMap: screenTex,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.1
    }));

    // Glass (Windows, conference room partitions)
    this.materials.set('glass', new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5,
      thickness: 0.05
    }));

    // Window Frame
    this.materials.set('windowFrame', new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.8
    }));

    // Sky backdrop outside windows
    const skyTex = createWindowSkyTexture();
    this.materials.set('windowSky', new THREE.MeshBasicMaterial({
      map: skyTex
    }));

    // Whiteboard
    const whiteboardTex = createWhiteboardTexture();
    this.materials.set('whiteboard', new THREE.MeshStandardMaterial({
      map: whiteboardTex,
      roughness: 0.2,
      metalness: 0.1
    }));

    // Door wood
    this.materials.set('doorWood', new THREE.MeshStandardMaterial({
      map: woodTexture,
      color: 0x854d0e,
      roughness: 0.5,
      metalness: 0.1
    }));

    // Door Sign
    const signTex = createDoorSignTexture();
    this.materials.set('doorSign', new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.3,
      metalness: 0.5
    }));

    // Plant foliage
    this.materials.set('plantLeaf', new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide
    }));

    this.materials.set('plantPot', new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.6,
      metalness: 0.1
    }));

    this.materials.set('plantSoil', new THREE.MeshStandardMaterial({
      color: 0x3f2e20,
      roughness: 0.95,
      metalness: 0.0
    }));

    // Books
    this.materials.set('bookRed', new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 }));
    this.materials.set('bookBlue', new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.6 }));
    this.materials.set('bookGreen', new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 }));
    this.materials.set('bookYellow', new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 }));

    // Ceiling Light Fixture (Emissive panel)
    this.materials.set('lightPanel', new THREE.MeshBasicMaterial({
      color: 0xffffff
    }));

    // Modern art painting
    const paintingTex = createPaintingTexture();
    this.materials.set('painting', new THREE.MeshStandardMaterial({
      map: paintingTex,
      roughness: 0.4
    }));
  }

  get(name) {
    if (!this.materials.has(name)) {
      console.warn(`Material "${name}" not found in MaterialManager.`);
      return new THREE.MeshStandardMaterial({ color: 0xff00ff });
    }
    return this.materials.get(name);
  }
}

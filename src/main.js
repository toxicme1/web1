import * as THREE from 'three';
import { MaterialManager } from './materials.js';
import { OfficeEnvironment } from './office.js';
import { PlayerControls } from './controls.js';
import { InteractionSystem } from './interactions.js';
import { UIController } from './ui.js';
import { SoundEffects } from './audio.js';

/**
 * Main Application Orchestrator
 */
class VirtualOfficeApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    this.initThree();
    this.initSystems();
    this.setupResizeListener();
    this.startAnimationLoop();
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);
    this.scene.fog = new THREE.FogExp2(0x0a0e17, 0.015);

    // 2. Camera (First-person perspective)
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 100);

    // 3. Renderer with hardware optimizations
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);
  }

  initSystems() {
    // Audio synthesis
    this.soundEffects = new SoundEffects();

    // Material caching manager
    this.materials = new MaterialManager();

    // 3D Office architecture, furniture & lights
    this.office = new OfficeEnvironment(this.scene, this.materials);

    // Player controls with continuous collision detection against office obstacles
    this.controls = new PlayerControls(
      this.camera,
      this.renderer.domElement,
      this.office.colliders,
      this.soundEffects
    );

    // UI & Minimap Manager
    this.ui = new UIController(this.controls, this.soundEffects);

    // Crosshair raycaster interaction system
    this.interactions = new InteractionSystem(
      this.camera,
      this.office.interactiveObjects,
      this.soundEffects,
      (data) => {
        this.ui.openModal(data);
      }
    );

    // Dismiss loading screen
    setTimeout(() => {
      this.ui.hideLoadingScreen();
    }, 600);
  }

  setupResizeListener() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  startAnimationLoop() {
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = this.clock.getDelta();

      // Update player movement and collision
      this.controls.update(delta);

      // Update interaction raycasting
      this.interactions.update();

      // Update real-time HUD minimap
      this.ui.updateMinimap(this.camera.position, this.controls.euler);

      // Render 3D Scene
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
}

// Bootstrap application on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.__app = new VirtualOfficeApp();
});

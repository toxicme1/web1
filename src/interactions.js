import * as THREE from 'three';

/**
 * Object Interaction System
 * Casts a ray from the center of the viewport (player crosshair) to detect clickable objects
 * Triggers interactive overlays (Computer, Whiteboard, Door, Plant, Coffee)
 */
export class InteractionSystem {
  constructor(camera, interactiveObjects = [], soundEffects = null, onInteractCallback = null) {
    this.camera = camera;
    this.interactiveObjects = interactiveObjects;
    this.soundEffects = soundEffects;
    this.onInteract = onInteractCallback;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 4.5; // Max interaction distance (meters)
    this.centerScreen = new THREE.Vector2(0, 0);

    this.hoveredObject = null;
    this.crosshairElement = document.getElementById('crosshair');
    this.promptElement = document.getElementById('interaction-prompt');

    this.bindEvents();
  }

  bindEvents() {
    this.onClick = this.onClick.bind(this);
    window.addEventListener('click', this.onClick);
    window.addEventListener('touchend', (e) => {
      // Mobile tap interaction
      if (this.hoveredObject) {
        this.triggerInteraction(this.hoveredObject);
      }
    });
  }

  onClick(event) {
    // Check if pointer is locked or clicking directly
    if (this.hoveredObject) {
      this.triggerInteraction(this.hoveredObject);
    }
  }

  triggerInteraction(object) {
    const data = object.userData;
    if (!data) return;

    if (this.soundEffects) {
      if (data.type === 'door') {
        this.soundEffects.playDoor();
      } else {
        this.soundEffects.playInteract();
      }
    }

    if (this.onInteract) {
      this.onInteract(data);
    }
  }

  update() {
    this.raycaster.setFromCamera(this.centerScreen, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      // Walk up parent tree to find interactive userData if needed
      let target = hit.object;
      while (target && !target.userData?.isInteractive && target.parent) {
        target = target.parent;
      }

      if (target && target.userData?.isInteractive) {
        if (this.hoveredObject !== target) {
          this.hoveredObject = target;
          this.showPrompt(target.userData);
        }
        return;
      }
    }

    if (this.hoveredObject) {
      this.hoveredObject = null;
      this.hidePrompt();
    }
  }

  showPrompt(userData) {
    if (this.crosshairElement) {
      this.crosshairElement.classList.add('hovering');
    }
    if (this.promptElement) {
      this.promptElement.classList.add('visible');
      const actionVerb = userData.type === 'door' ? 'Inspect' : 'Open';
      this.promptElement.innerHTML = `
        <span class="key-hint">E / Click</span>
        <span class="prompt-text">${actionVerb} ${userData.name || 'Object'}</span>
      `;
    }
  }

  hidePrompt() {
    if (this.crosshairElement) {
      this.crosshairElement.classList.remove('hovering');
    }
    if (this.promptElement) {
      this.promptElement.classList.remove('visible');
    }
  }

  dispose() {
    window.removeEventListener('click', this.onClick);
  }
}

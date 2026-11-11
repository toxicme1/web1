import * as THREE from 'three';

/**
 * First-Person Player Controller
 * Features:
 * - Pointer Lock mouse look (yaw & pitch limits)
 * - WASD keys + Arrow keys
 * - Shift to Sprint (1.8x speed)
 * - Space to Jump with gravity
 * - Continuous Swept / Bounding Box Collision Detection
 * - Mobile virtual touch controls support
 * - Realistic head bobbing & audio footstep triggers
 */
export class PlayerControls {
  constructor(camera, domElement, colliders = [], soundEffects = null) {
    this.camera = camera;
    this.domElement = domElement;
    this.colliders = colliders;
    this.soundEffects = soundEffects;

    this.isLocked = false;
    this.enabled = true;

    // Player physical properties
    this.height = 1.7; // Eye level in meters
    this.radius = 0.45; // Collision bounding cylinder radius
    this.walkSpeed = 4.0;
    this.runSpeed = 7.5;
    this.jumpForce = 4.8;
    this.gravity = 15.0;

    // Movement state
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isSprinting = false;
    this.canJump = false;

    // Head bobbing
    this.bobTimer = 0;
    this.footstepTimer = 0;

    // Camera Euler angles
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.minPolarAngle = -Math.PI / 2 + 0.05;
    this.maxPolarAngle = Math.PI / 2 - 0.05;

    // Initial position in office: entrance near workstations
    this.camera.position.set(-8, this.height, 0);

    // Event listeners
    this.bindEvents();
  }

  bindEvents() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);

    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
  }

  lock() {
    this.domElement.requestPointerLock();
  }

  unlock() {
    document.exitPointerLock();
  }

  onPointerLockChange() {
    this.isLocked = document.pointerLockElement === this.domElement;
    if (this.onLockChange) {
      this.onLockChange(this.isLocked);
    }
  }

  onKeyDown(event) {
    if (!this.enabled) return;

    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = true;
        break;
      case 'Space':
        if (this.canJump) {
          this.velocity.y = this.jumpForce;
          this.canJump = false;
        }
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = false;
        break;
    }
  }

  onMouseMove(event) {
    if (!this.isLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    this.euler.setFromQuaternion(this.camera.quaternion);

    this.euler.y -= movementX * 0.0022;
    this.euler.x -= movementY * 0.0022;

    this.euler.x = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
  }

  /**
   * Checks if player bounding box at proposed position collides with any registered obstacle
   */
  checkCollision(position) {
    const r = this.radius;
    const playerBox = new THREE.Box3(
      new THREE.Vector3(position.x - r, 0.1, position.z - r),
      new THREE.Vector3(position.x + r, this.height + 0.1, position.z + r)
    );

    for (let i = 0; i < this.colliders.length; i++) {
      if (playerBox.intersectsBox(this.colliders[i])) {
        return true;
      }
    }
    return false;
  }

  /**
   * Updates player position with collision sliding
   */
  update(delta) {
    // Clamp delta to avoid tunneling on lag spikes
    const dt = Math.min(delta, 0.1);

    // Apply gravity
    this.velocity.y -= this.gravity * dt;

    // Movement direction vector relative to camera yaw
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    const speed = this.isSprinting ? this.runSpeed : this.walkSpeed;

    // Damping horizontal velocities
    const damping = 10.0;
    this.velocity.x -= this.velocity.x * damping * dt;
    this.velocity.z -= this.velocity.z * damping * dt;

    if (this.moveForward || this.moveBackward) {
      this.velocity.z -= this.direction.z * speed * 8.0 * dt;
    }
    if (this.moveLeft || this.moveRight) {
      this.velocity.x -= this.direction.x * speed * 8.0 * dt;
    }

    // Convert local velocity to world space using camera yaw (ignore pitch)
    const yawEuler = new THREE.Euler(0, this.euler.y, 0, 'YXZ');
    const moveWorld = new THREE.Vector3(
      -this.velocity.x * dt,
      0,
      this.velocity.z * dt
    ).applyEuler(yawEuler);

    // Proposed new position
    const currentPos = this.camera.position.clone();
    const targetPos = currentPos.clone();

    // Move in X with collision slide
    targetPos.x += moveWorld.x;
    if (this.checkCollision(targetPos)) {
      targetPos.x = currentPos.x; // Block X movement
    }

    // Move in Z with collision slide
    targetPos.z += moveWorld.z;
    if (this.checkCollision(targetPos)) {
      targetPos.z = currentPos.z; // Block Z movement
    }

    // Update Y (vertical jump/falling)
    targetPos.y += this.velocity.y * dt;

    // Ground check
    if (targetPos.y <= this.height) {
      this.velocity.y = 0;
      targetPos.y = this.height;
      this.canJump = true;
    }

    // Ceiling check
    if (targetPos.y > 3.4) {
      targetPos.y = 3.4;
      this.velocity.y = 0;
    }

    // Apply calculated position
    this.camera.position.copy(targetPos);

    // Head bobbing and footstep sounds
    const horizontalSpeed = Math.hypot(moveWorld.x, moveWorld.z) / dt;
    if (horizontalSpeed > 0.5 && this.canJump) {
      const bobFreq = this.isSprinting ? 14 : 9;
      this.bobTimer += dt * bobFreq;

      // Small vertical oscillation
      const bobOffset = Math.sin(this.bobTimer) * 0.035;
      this.camera.position.y += bobOffset;

      // Footstep sound cadence
      this.footstepTimer += dt;
      const stepInterval = this.isSprinting ? 0.3 : 0.45;
      if (this.footstepTimer >= stepInterval) {
        this.footstepTimer = 0;
        if (this.soundEffects) {
          this.soundEffects.playFootstep(this.isSprinting);
        }
      }
    } else {
      this.bobTimer = 0;
    }
  }

  dispose() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
  }
}

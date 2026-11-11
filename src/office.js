import * as THREE from 'three';

/**
 * Procedural 3D Office Environment
 * Builds walls, floors, ceiling, windows, furniture, computers, plants, whiteboard, and lighting.
 * Manages collision bounding boxes and interactive targets.
 */
export class OfficeEnvironment {
  constructor(scene, materialManager) {
    this.scene = scene;
    this.materials = materialManager;

    // Office dimensions (meters)
    this.roomWidth = 26;
    this.roomDepth = 18;
    this.roomHeight = 3.6;

    // Arrays for collision and interactions
    this.colliders = [];        // THREE.Box3 bounding boxes for collision
    this.interactiveObjects = []; // Meshes tagged with type and metadata for raycasting
    this.lights = [];

    // Shared geometries to minimize memory & draw calls
    this.sharedGeometries = {
      box: new THREE.BoxGeometry(1, 1, 1),
      cylinder: new THREE.CylinderGeometry(1, 1, 1, 16),
      sphere: new THREE.SphereGeometry(1, 16, 16)
    };

    this.buildAll();
  }

  buildAll() {
    this.buildArchitecture();
    this.buildLighting();
    this.buildWorkstations();
    this.buildConferenceRoom();
    this.buildBreakArea();
    this.buildBookshelves();
    this.buildDecorationsAndPlants();
    this.buildWhiteboard();
  }

  /**
   * Helper to register a static box collider
   */
  addCollider(box3) {
    this.colliders.push(box3);
  }

  addColliderFromMesh(mesh, margin = 0.05) {
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    // Add small margin around collider
    box.min.x -= margin;
    box.min.z -= margin;
    box.max.x += margin;
    box.max.z += margin;
    this.colliders.push(box);
    return box;
  }

  buildArchitecture() {
    const W = this.roomWidth;
    const D = this.roomDepth;
    const H = this.roomHeight;

    // Floor
    const floorGeo = new THREE.PlaneGeometry(W, D);
    const floor = new THREE.Mesh(floorGeo, this.materials.get('floor'));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(W, D);
    const ceiling = new THREE.Mesh(ceilingGeo, this.materials.get('ceiling'));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = H;
    this.scene.add(ceiling);

    // Outer Walls (Thickness = 0.3)
    const wallThick = 0.3;

    // North Wall (Z = -D/2)
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(W, H, wallThick),
      this.materials.get('wall')
    );
    northWall.position.set(0, H / 2, -D / 2);
    northWall.receiveShadow = true;
    this.scene.add(northWall);
    this.addColliderFromMesh(northWall);

    // South Wall (Z = D/2) with feature accent color
    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(W, H, wallThick),
      this.materials.get('wallAccent')
    );
    southWall.position.set(0, H / 2, D / 2);
    southWall.receiveShadow = true;
    this.scene.add(southWall);
    this.addColliderFromMesh(southWall);

    // East Wall (X = W/2)
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, H, D),
      this.materials.get('wall')
    );
    eastWall.position.set(W / 2, H / 2, 0);
    eastWall.receiveShadow = true;
    this.scene.add(eastWall);
    this.addColliderFromMesh(eastWall);

    // West Wall (X = -W/2) - Has large scenic window cutouts
    this.buildWestWallWithWindows(wallThick, H, D);

    // Interior Divider: Conference Room at positive X (+5 to +13)
    this.buildInteriorPartitions();
  }

  buildWestWallWithWindows(wallThick, H, D) {
    const W = this.roomWidth;
    // Lower sill wall
    const sillHeight = 0.9;
    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, sillHeight, D),
      this.materials.get('wall')
    );
    sill.position.set(-W / 2, sillHeight / 2, 0);
    this.scene.add(sill);
    this.addColliderFromMesh(sill);

    // Upper header wall
    const headerHeight = 0.5;
    const header = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, headerHeight, D),
      this.materials.get('wall')
    );
    header.position.set(-W / 2, H - headerHeight / 2, 0);
    this.scene.add(header);

    // Window pillars
    const windowH = H - sillHeight - headerHeight;
    const windowY = sillHeight + windowH / 2;
    const pillarCount = 5;
    const pillarWidth = 0.4;
    const spacing = D / pillarCount;

    for (let i = 0; i <= pillarCount; i++) {
      const pZ = -D / 2 + i * spacing;
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(wallThick * 1.2, windowH, pillarWidth),
        this.materials.get('windowFrame')
      );
      pillar.position.set(-W / 2, windowY, pZ);
      this.scene.add(pillar);
    }

    // Glass panes
    const glassPane = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, windowH - 0.05, D - 0.2),
      this.materials.get('glass')
    );
    glassPane.position.set(-W / 2, windowY, 0);
    this.scene.add(glassPane);

    // Scenic skyline backdrop outside windows
    const skyBackdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(D + 6, H + 4),
      this.materials.get('windowSky')
    );
    skyBackdrop.rotation.y = Math.PI / 2;
    skyBackdrop.position.set(-W / 2 - 2.5, H / 2, 0);
    this.scene.add(skyBackdrop);
  }

  buildInteriorPartitions() {
    const H = this.roomHeight;
    // Glass Partition Wall separating Main Open Space and Conference Room
    // Located at X = 4.5, running from Z = -9 to Z = 2
    // With a doorway gap from Z = -2.5 to -0.5
    const glassWallZ1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, H - 0.2, 5.5),
      this.materials.get('glass')
    );
    glassWallZ1.position.set(4.5, H / 2, -6.0);
    this.scene.add(glassWallZ1);
    this.addColliderFromMesh(glassWallZ1);

    // Glass Wall framing
    const frame1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, H, 0.12),
      this.materials.get('metalDark')
    );
    frame1.position.set(4.5, H / 2, -3.25);
    this.scene.add(frame1);

    const glassWallZ2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, H - 0.2, 3.5),
      this.materials.get('glass')
    );
    glassWallZ2.position.set(4.5, H / 2, 1.0);
    this.scene.add(glassWallZ2);
    this.addColliderFromMesh(glassWallZ2);

    // Conference Room Doorway at X = 4.5, Z = -1.5
    // Header above door
    const doorHeader = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.8, 2.0),
      this.materials.get('wall')
    );
    doorHeader.position.set(4.5, H - 0.4, -1.5);
    this.scene.add(doorHeader);

    // Actual Door Frame
    const doorFrameLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 2.4, 0.1),
      this.materials.get('metalDark')
    );
    doorFrameLeft.position.set(4.5, 1.2, -2.45);
    this.scene.add(doorFrameLeft);

    const doorFrameRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 2.4, 0.1),
      this.materials.get('metalDark')
    );
    doorFrameRight.position.set(4.5, 1.2, -0.55);
    this.scene.add(doorFrameRight);

    // Interactive Conference Room Door (Semi-open/inspectable)
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 2.35, 1.8),
      this.materials.get('doorWood')
    );
    door.position.set(4.5, 1.18, -1.5);
    this.scene.add(door);
    this.addColliderFromMesh(door);

    // Door handle (Brass / Chrome)
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.04, 0.15),
      this.materials.get('metalChrome')
    );
    handle.position.set(4.5, 1.05, -0.8);
    this.scene.add(handle);

    // Door Sign Plaque on Door
    const doorSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.35, 0.9),
      this.materials.get('doorSign')
    );
    doorSign.position.set(4.45, 1.6, -1.5);
    this.scene.add(doorSign);

    // Tag the door as interactive
    door.userData = {
      isInteractive: true,
      type: 'door',
      name: 'Executive Boardroom & Meeting Room A',
      details: {
        title: 'Meeting Room Alpha',
        status: 'Available - Next session in 45 mins',
        capacity: '10 people • 4K Display • Polycom Video Conferencing',
        notes: 'Equipped with soundproof glass and high-speed fiber uplink.'
      }
    };
    doorSign.userData = door.userData;
    this.interactiveObjects.push(door);
    this.interactiveObjects.push(doorSign);
  }

  buildLighting() {
    // 1. Ambient Light (Soft natural base illumination)
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(ambient);

    // 2. Main Directional Light (Sunlight through west windows)
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sunLight.position.set(-18, 12, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.bias = -0.001;
    this.scene.add(sunLight);

    // 3. Ceiling Recessed Panel Lights
    const lightPositions = [
      { x: -6, z: -4 },
      { x: -6, z: 4 },
      { x: 0, z: -4 },
      { x: 0, z: 4 },
      { x: 8.5, z: -4 }, // Conference room light
      { x: 8.5, z: 4 }   // Break/Lounge light
    ];

    lightPositions.forEach((pos, idx) => {
      // Visual light panel on ceiling
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.05, 0.8),
        this.materials.get('lightPanel')
      );
      panel.position.set(pos.x, this.roomHeight - 0.02, pos.z);
      this.scene.add(panel);

      // Point Light underneath panel
      const ptLight = new THREE.PointLight(0xffffff, 0.65, 10, 1.2);
      ptLight.position.set(pos.x, this.roomHeight - 0.4, pos.z);
      this.scene.add(ptLight);
      this.lights.push(ptLight);
    });
  }

  /**
   * Builds developer and designer workstation pods
   */
  buildWorkstations() {
    // Create 4 main desks in the open office space
    const deskConfigs = [
      { x: -5.5, z: -3.5, rotY: 0, devName: "Alex Rivera", role: "Principal Systems Architect" },
      { x: -1.5, z: -3.5, rotY: 0, devName: "Elena Rostova", role: "Lead 3D & Graphics Engineer" },
      { x: -5.5, z: 3.0, rotY: Math.PI, devName: "Marcus Vance", role: "Product Strategy & Design" },
      { x: -1.5, z: 3.0, rotY: Math.PI, devName: "Sofia Chen", role: "Full-Stack Web3 Developer" }
    ];

    deskConfigs.forEach(cfg => {
      this.createDeskPod(cfg.x, cfg.z, cfg.rotY, cfg.devName, cfg.role);
    });
  }

  createDeskPod(x, z, rotY, devName, role) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    // Desk Top (1.8m wide, 0.85m deep, 0.04m thick)
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.05, 0.9),
      this.materials.get('woodDesk')
    );
    deskTop.position.set(0, 0.73, 0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    group.add(deskTop);

    // Desk Legs (Modern metal frame)
    const legGeo = new THREE.BoxGeometry(0.06, 0.72, 0.06);
    const legPositions = [
      [-0.82, 0.36, -0.38],
      [0.82, 0.36, -0.38],
      [-0.82, 0.36, 0.38],
      [0.82, 0.36, 0.38]
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, this.materials.get('metalDark'));
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      group.add(leg);
    });

    // Computer Monitor
    const monitorGroup = this.createComputerMonitor(devName, role);
    monitorGroup.position.set(0, 0.755, -0.2);
    group.add(monitorGroup);

    // Ergonomic Keyboard & Mousepad
    const keyboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.015, 0.16),
      this.materials.get('plasticBlack')
    );
    keyboard.position.set(0, 0.76, 0.15);
    group.add(keyboard);

    const mousepad = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.005, 0.22),
      this.materials.get('metalDark')
    );
    mousepad.position.set(0.42, 0.758, 0.15);
    group.add(mousepad);

    const mouse = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.03, 0.11),
      this.materials.get('plasticBlack')
    );
    mouse.position.set(0.42, 0.77, 0.15);
    group.add(mouse);

    // Desk accessories: Coffee mug & desk lamp
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.04, 0.1, 16),
      this.materials.get('chairCushion')
    );
    mug.position.set(-0.6, 0.81, 0.15);
    group.add(mug);

    // Office Chair
    const chair = this.createOfficeChair();
    chair.position.set(0, 0, 0.75);
    chair.rotation.y = Math.PI;
    group.add(chair);

    this.scene.add(group);

    // Add collision for the desk pod
    const deskBox = new THREE.Box3();
    deskBox.setFromCenterAndSize(
      new THREE.Vector3(x, 0.45, z),
      new THREE.Vector3(2.0, 0.9, 1.4)
    );
    this.addCollider(deskBox);
  }

  createComputerMonitor(devName, role) {
    const group = new THREE.Group();

    // Stand base & stem
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.02, 0.2),
      this.materials.get('metalDark')
    );
    base.position.set(0, 0.01, 0);
    group.add(base);

    const stem = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.28, 0.04),
      this.materials.get('metalDark')
    );
    stem.position.set(0, 0.15, 0);
    group.add(stem);

    // Monitor Bezel (27-inch widescreen)
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.44, 0.03),
      this.materials.get('plasticBlack')
    );
    bezel.position.set(0, 0.35, 0);
    group.add(bezel);

    // Monitor Display Screen (Active Glowing Surface)
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.68, 0.40),
      this.materials.get('computerScreen')
    );
    screen.position.set(0, 0.35, 0.016);
    group.add(screen);

    // Tag the screen as interactive object
    screen.userData = {
      isInteractive: true,
      type: 'computer',
      name: `${devName}'s Workstation`,
      details: {
        devName,
        role,
        specs: 'Octa-core 5.2GHz • 64GB DDR5 RAM • RTX 4090 24GB',
        activeTask: 'Compiling real-time Three.js scene shaders & running unit tests.'
      }
    };
    this.interactiveObjects.push(screen);

    return group;
  }

  createOfficeChair() {
    const group = new THREE.Group();

    // Chair 5-star wheeled base
    const baseHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8),
      this.materials.get('metalChrome')
    );
    baseHub.position.set(0, 0.1, 0);
    group.add(baseHub);

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.03, 0.04),
        this.materials.get('metalChrome')
      );
      arm.position.set(Math.cos(angle) * 0.14, 0.08, Math.sin(angle) * 0.14);
      arm.rotation.y = -angle;
      group.add(arm);

      // Caster wheel
      const wheel = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 8, 8),
        this.materials.get('metalDark')
      );
      wheel.position.set(Math.cos(angle) * 0.28, 0.03, Math.sin(angle) * 0.28);
      group.add(wheel);
    }

    // Gas lift cylinder
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.25, 12),
      this.materials.get('metalChrome')
    );
    cylinder.position.set(0, 0.22, 0);
    group.add(cylinder);

    // Seat cushion
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.07, 0.5),
      this.materials.get('chairFabric')
    );
    seat.position.set(0, 0.38, 0);
    group.add(seat);

    // Backrest
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.55, 0.05),
      this.materials.get('chairCushion')
    );
    back.position.set(0, 0.68, -0.22);
    group.add(back);

    // Armrests
    [-0.26, 0.26].forEach(side => {
      const armPillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.2, 0.04),
        this.materials.get('metalDark')
      );
      armPillar.position.set(side, 0.48, 0);
      group.add(armPillar);

      const armPad = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.03, 0.26),
        this.materials.get('plasticBlack')
      );
      armPad.position.set(side, 0.58, 0);
      group.add(armPad);
    });

    return group;
  }

  /**
   * Conference Room in the east section (X ~ 8.5, Z ~ -3.5)
   */
  buildConferenceRoom() {
    const group = new THREE.Group();
    group.position.set(8.5, 0, -3.5);

    // Large Conference Table (4.2m long, 1.4m wide)
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.07, 1.4),
      this.materials.get('woodDark')
    );
    tableTop.position.set(0, 0.74, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    group.add(tableTop);

    // Conference Table Inset Power/AV Box
    const avBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.01, 0.25),
      this.materials.get('metalDark')
    );
    avBox.position.set(0, 0.776, 0);
    group.add(avBox);

    // Heavy Table Base Pedestals
    [-1.3, 1.3].forEach(px => {
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.32, 0.71, 16),
        this.materials.get('metalDark')
      );
      pedestal.position.set(px, 0.355, 0);
      pedestal.castShadow = true;
      group.add(pedestal);
    });

    // Conference Chairs around the table (6 chairs)
    const chairPositions = [
      { x: -1.3, z: -1.0, rotY: 0 },
      { x: 0, z: -1.0, rotY: 0 },
      { x: 1.3, z: -1.0, rotY: 0 },
      { x: -1.3, z: 1.0, rotY: Math.PI },
      { x: 0, z: 1.0, rotY: Math.PI },
      { x: 1.3, z: 1.0, rotY: Math.PI },
      { x: -2.3, z: 0, rotY: Math.PI / 2 },
      { x: 2.3, z: 0, rotY: -Math.PI / 2 }
    ];

    chairPositions.forEach(cp => {
      const chair = this.createOfficeChair();
      chair.position.set(cp.x, 0, cp.z);
      chair.rotation.y = cp.rotY;
      group.add(chair);
    });

    // Wall-mounted Big Presentation TV Display on East Wall (X = 12.8)
    const tvScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 1.2, 2.2),
      this.materials.get('plasticBlack')
    );
    tvScreen.position.set(4.3, 1.9, 0);
    group.add(tvScreen);

    const tvDisplay = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 1.1),
      this.materials.get('computerScreen')
    );
    tvDisplay.rotation.y = -Math.PI / 2;
    tvDisplay.position.set(4.27, 1.9, 0);
    group.add(tvDisplay);

    tvDisplay.userData = {
      isInteractive: true,
      type: 'computer',
      name: 'Conference Room Display 85"',
      details: {
        devName: 'Boardroom Presentation AV',
        role: 'Ultra-HD Smart Screen',
        specs: '85" 4K HDR • AirPlay • Miracast • Zoom Rooms',
        activeTask: 'Sprint Demo & Quarterly Strategic Roadmap presentation.'
      }
    };
    this.interactiveObjects.push(tvDisplay);

    this.scene.add(group);

    // Collision box for conference table & chairs
    const confBox = new THREE.Box3();
    confBox.setFromCenterAndSize(
      new THREE.Vector3(8.5, 0.5, -3.5),
      new THREE.Vector3(4.8, 1.0, 2.4)
    );
    this.addCollider(confBox);
  }

  /**
   * Break Area / Lounge in South-East Section
   */
  buildBreakArea() {
    const group = new THREE.Group();
    group.position.set(8.5, 0, 4.5);

    // Coffee / Refreshment Bar Counter
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.95, 0.8),
      this.materials.get('metalDark')
    );
    bar.position.set(0, 0.475, 0);
    bar.castShadow = true;
    group.add(bar);

    const barTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.3, 0.05, 0.86),
      this.materials.get('woodDark')
    );
    barTop.position.set(0, 0.975, 0);
    group.add(barTop);

    // Espresso Coffee Machine
    const coffeeMachine = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.45, 0.4),
      this.materials.get('metalChrome')
    );
    coffeeMachine.position.set(-0.8, 1.2, 0);
    group.add(coffeeMachine);

    // Tag coffee machine as interactive
    coffeeMachine.userData = {
      isInteractive: true,
      type: 'coffee',
      name: 'Artisan Espresso Machine',
      details: {
        title: 'Italian Double-Boiler Espresso Machine',
        blend: 'Ethiopian Yirgacheffe Roast (Single Origin)',
        status: 'Temperature 93.5°C • Pressure 9 Bar • Freshly ground'
      }
    };
    this.interactiveObjects.push(coffeeMachine);

    // Water cooler
    const cooler = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 1.1, 0.4),
      this.materials.get('wall')
    );
    cooler.position.set(1.0, 0.55, 0);
    group.add(cooler);

    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.45, 16),
      this.materials.get('glass')
    );
    bottle.position.set(1.0, 1.32, 0);
    group.add(bottle);

    // Lounge sofa couch
    const sofa = this.createSofa();
    sofa.position.set(0, 0, 2.2);
    group.add(sofa);

    // Coffee table
    const coffeeTable = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.4, 0.7),
      this.materials.get('woodDesk')
    );
    coffeeTable.position.set(0, 0.2, 1.2);
    group.add(coffeeTable);

    this.scene.add(group);

    // Colliders
    const barBox = new THREE.Box3();
    barBox.setFromCenterAndSize(
      new THREE.Vector3(8.5, 0.5, 4.5),
      new THREE.Vector3(3.5, 1.2, 1.0)
    );
    this.addCollider(barBox);

    const sofaBox = new THREE.Box3();
    sofaBox.setFromCenterAndSize(
      new THREE.Vector3(8.5, 0.5, 6.7),
      new THREE.Vector3(2.4, 0.9, 1.0)
    );
    this.addCollider(sofaBox);
  }

  createSofa() {
    const group = new THREE.Group();

    // Seat base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.35, 0.8),
      this.materials.get('metalDark')
    );
    base.position.set(0, 0.175, 0);
    group.add(base);

    // Cushions
    [-0.55, 0.55].forEach(cx => {
      const cushion = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.18, 0.75),
        this.materials.get('chairCushion')
      );
      cushion.position.set(cx, 0.44, 0.02);
      group.add(cushion);
    });

    // Backrest
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.45, 0.2),
      this.materials.get('chairFabric')
    );
    back.position.set(0, 0.65, 0.3);
    group.add(back);

    // Armrests
    [-1.05, 1.05].forEach(ax => {
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.4, 0.8),
        this.materials.get('chairFabric')
      );
      arm.position.set(ax, 0.45, 0);
      group.add(arm);
    });

    return group;
  }

  /**
   * Modern modular bookshelves against walls
   */
  buildBookshelves() {
    const shelfX = -12.4;
    const shelfZ = 4.5;
    const group = new THREE.Group();
    group.position.set(shelfX, 0, shelfZ);

    const width = 0.5;
    const length = 2.4;
    const height = 2.4;

    // Uprights
    [-length / 2, length / 2].forEach(posZ => {
      const upright = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, 0.04),
        this.materials.get('metalDark')
      );
      upright.position.set(0, height / 2, posZ);
      group.add(upright);
    });

    // 5 Shelf tiers
    const tierCount = 5;
    const bookColors = ['bookRed', 'bookBlue', 'bookGreen', 'bookYellow'];

    for (let t = 0; t < tierCount; t++) {
      const sy = 0.1 + (t * (height - 0.2)) / (tierCount - 1);
      const shelfPlank = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.035, length),
        this.materials.get('woodDesk')
      );
      shelfPlank.position.set(0, sy, 0);
      group.add(shelfPlank);

      // Populate shelf with books
      for (let b = -0.9; b < 0.9; b += 0.08) {
        if (Math.random() > 0.3) {
          const bH = 0.22 + Math.random() * 0.08;
          const bW = 0.04 + Math.random() * 0.03;
          const bD = 0.28;
          const colKey = bookColors[Math.floor(Math.random() * bookColors.length)];

          const book = new THREE.Mesh(
            new THREE.BoxGeometry(bD, bH, bW),
            this.materials.get(colKey)
          );
          book.position.set(0, sy + bH / 2, b);
          group.add(book);
        }
      }
    }

    this.scene.add(group);

    const shelfBox = new THREE.Box3();
    shelfBox.setFromCenterAndSize(
      new THREE.Vector3(shelfX, height / 2, shelfZ),
      new THREE.Vector3(width + 0.2, height, length + 0.2)
    );
    this.addCollider(shelfBox);
  }

  /**
   * Potted office plants & wall art
   */
  buildDecorationsAndPlants() {
    // Plant locations: Corners and beside partitions
    const plantLocations = [
      { x: -11.5, z: -7.5 },
      { x: 3.5, z: -7.5 },
      { x: 3.5, z: 7.5 },
      { x: 11.5, z: 7.5 },
      { x: -11.5, z: 7.5 }
    ];

    plantLocations.forEach(loc => {
      const plant = this.createPottedPlant();
      plant.position.set(loc.x, 0, loc.z);
      this.scene.add(plant);

      const pBox = new THREE.Box3();
      pBox.setFromCenterAndSize(
        new THREE.Vector3(loc.x, 0.6, loc.z),
        new THREE.Vector3(0.8, 1.4, 0.8)
      );
      this.addCollider(pBox);
    });

    // Wall Art Paintings on North and South walls
    const painting1 = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.4, 0.04),
      this.materials.get('painting')
    );
    painting1.position.set(-3.5, 2.0, -8.8);
    this.scene.add(painting1);

    const painting2 = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.4, 0.04),
      this.materials.get('painting')
    );
    painting2.position.set(8.5, 2.0, 8.8);
    painting2.rotation.y = Math.PI;
    this.scene.add(painting2);
  }

  createPottedPlant() {
    const group = new THREE.Group();

    // Ceramic White Pot
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.22, 0.6, 16),
      this.materials.get('plantPot')
    );
    pot.position.set(0, 0.3, 0);
    pot.castShadow = true;
    group.add(pot);

    // Dark soil
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.05, 16),
      this.materials.get('plantSoil')
    );
    soil.position.set(0, 0.58, 0);
    group.add(soil);

    // Green Foliage leaves (Fiddle-leaf fig / Monstera style)
    const leafGeo = new THREE.ConeGeometry(0.18, 0.55, 6);
    for (let i = 0; i < 9; i++) {
      const leaf = new THREE.Mesh(leafGeo, this.materials.get('plantLeaf'));
      const angle = (i / 9) * Math.PI * 2;
      const height = 0.7 + (i % 3) * 0.2;
      leaf.position.set(Math.cos(angle) * 0.12, height, Math.sin(angle) * 0.12);
      leaf.rotation.x = Math.sin(angle) * 0.35 + 0.2;
      leaf.rotation.z = -Math.cos(angle) * 0.35;
      leaf.scale.set(1.2, 1.2, 0.3);
      group.add(leaf);
    }

    // Interactive tag for plant
    pot.userData = {
      isInteractive: true,
      type: 'plant',
      name: 'Fiddle Leaf Fig Plant',
      details: {
        species: 'Ficus Lyrata',
        care: 'Watered weekly • Thrives in bright indirect sunlight',
        status: 'Healthy & Air-Purifying 🌿'
      }
    };
    this.interactiveObjects.push(pot);

    return group;
  }

  /**
   * Interactive Whiteboard on North Wall (Z = -8.8, X = 0)
   */
  buildWhiteboard() {
    const group = new THREE.Group();
    group.position.set(0, 1.85, -8.82);

    // Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 1.8, 0.06),
      this.materials.get('metalDark')
    );
    group.add(frame);

    // Active Whiteboard Surface
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 1.7),
      this.materials.get('whiteboard')
    );
    board.position.set(0, 0, 0.035);
    group.add(board);

    // Marker tray at bottom
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.04, 0.15),
      this.materials.get('metalChrome')
    );
    tray.position.set(0, -0.92, 0.08);
    group.add(tray);

    // Tag the whiteboard as interactive
    board.userData = {
      isInteractive: true,
      type: 'whiteboard',
      name: 'Interactive Agile Sprint Board',
      details: {
        title: 'Q4 Product Roadmap & Architecture',
        lastUpdated: 'Today at 09:15 AM by Elena',
        tasks: [
          { status: 'TODO', text: 'Optimize 3D Rendering & LOD' },
          { status: 'TODO', text: 'Add footstep sound toggle' },
          { status: 'IN_PROGRESS', text: 'First-Person Collision Detection' },
          { status: 'IN_PROGRESS', text: 'Interactive Whiteboard Notes Overlay' },
          { status: 'DONE', text: 'Three.js 3D Office Architecture' },
          { status: 'DONE', text: 'Realistic Procedural Materials' }
        ]
      }
    };
    this.interactiveObjects.push(board);

    this.scene.add(group);
  }
}

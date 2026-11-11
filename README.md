# Virtual 3D Office

An interactive first-person 3D office web application built using **Three.js**, **Vanilla JavaScript**, **HTML5**, and **CSS3**, bundled with **Vite**.

No external 3D models or paid APIs are required — all architectural elements, furniture, electronic hardware, potted plants, lighting, and textures are procedurally generated in code for instant loading and high performance.

---

## Features

### 🏢 3D Office Environment
- **Architecture**: Modern corporate office layout with open workstations, an executive boardroom / meeting room separated by glass partitions and doors, an outdoor scenic window wall with a city skyline, acoustic ceiling grids, and carpeted floors.
- **Office Furniture & Props**:
  - Modular office desks with laminate tops and steel frames.
  - Ergonomic mesh office chairs with wheeled 5-point star casters and armrests.
  - Dual-monitor workstations with code editor screens, computer towers, slim keyboards, mice, and coffee mugs.
  - Executive conference table with conference chairs and an 85" presentation screen.
  - Break room lounge counter with an espresso machine and lounge sofa.
  - Tiered bookshelves packed with colorful randomized books.
  - Potted fiddle-leaf fig plants in ceramic planters.
  - Agile sprint whiteboard with sticky notes and kanban columns.
- **Lighting**:
  - Balanced ambient light for realistic diffuse illumination.
  - Directional sunlight casting shadows through the scenic window wall.
  - Overhead fluorescent / LED recessed ceiling panel point lights with realistic decay.

### 🎮 First-Person Controls & Physics
- **Controls**:
  - **W / A / S / D**: Walk forward, strafe left/right, backward.
  - **Mouse**: Look around (Pointer Lock API).
  - **Shift**: Sprint / Run.
  - **Space**: Jump with gravity physics.
  - **Esc**: Release pointer lock / Open pause menu.
  - **E / Left Click**: Interact with nearby objects.
- **Collision Detection**: Continuous Swept AABB bounding-box collision detection preventing the player from passing through walls, desks, chairs, bookcases, counters, or glass walls. Includes axis sliding for smooth wall gliding.
- **Head Bobbing & Web Audio**: Dynamic sinusoidal head-bobbing with procedurally synthesized walking and sprinting footstep audio (zero external audio files).

### 🖱️ Clickable & Interactive Objects
- **Workstation Computers**: Raycasting detects reticle hover. Clicking opens a terminal overlay with workstation status, hardware specs, and system information.
- **Agile Whiteboard**: Interacting opens the Sprint Dashboard with sticky notes; users can type and pin new custom sticky notes in real time.
- **Boardroom Door**: Shows meeting room schedule, conference equipment, and room capacity.
- **Breakroom Espresso Machine**: Allows brewing virtual coffee with dynamic status updates.
- **Office Plants**: Inspiring biophilic office facts.

### 🗺️ HUD & Minimap Radar
- Real-time 2D Canvas radar HUD located in the upper right.
- Displays office floor plan walls, workstation clusters, boardroom, and lounge areas.
- Visualizes player position (pulsing blue dot) and dynamic field-of-view (FOV) directional cone.
- Displays dynamic room/zone location tags (e.g. *Open Workstation Area*, *Executive Meeting Room Alpha*, *Break Area & Lounge*).

### ⚡ Performance & Responsiveness
- **Procedural Textures**: Custom canvas-generated textures (wood grain, acoustic ceiling tiles, carpet weave, computer monitors, skyline, whiteboard).
- **Material & Geometry Reuse**: Shared geometry instances and PBR materials managed via `MaterialManager` to minimize draw calls and memory footprint.
- **Responsive Layout**: Adjusts viewport, FOV, and UI overlays seamlessly across mobile, tablet, and ultra-wide displays.

---

## Getting Started

### Prerequisites
- Node.js (version 18 or later recommended)
- npm or yarn

### Installation
Clone the repository and install dependencies:
```bash
npm install
```

### Development
Start the local development server with Vite:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Production Build
Create an optimized production bundle:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## Project Structure

```
├── index.html          # Main HTML entry with UI overlay elements, modals & HUD
├── style.css           # Styling for loading screen, HUD radar, crosshair, and modal dialogs
├── package.json        # Project metadata and dependencies (three, vite)
├── vite.config.js      # Vite build configuration
└── src/
    ├── main.js         # Application bootstrap & 60 FPS animation/render loop
    ├── office.js       # 3D office room geometry, furniture, props & collider generator
    ├── controls.js     # First-person PointerLock controls, swept AABB collision & head-bobbing
    ├── interactions.js # Raycasting, hover highlight, and interactive object triggers
    ├── textures.js     # Procedural HTML5 canvas texture generator (screens, wood, carpet, etc.)
    ├── materials.js    # Reusable PBR materials manager
    ├── audio.js        # Web Audio API procedural sound synthesizer (footsteps, clicks)
    └── ui.js           # UI state machine, event listeners, modal managers & 2D Minimap
```

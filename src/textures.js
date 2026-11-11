import * as THREE from 'three';

/**
 * Creates procedural textures dynamically using HTML5 Canvas
 * Reusable across materials without external image downloads
 */

export function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base wood color
  ctx.fillStyle = '#9e6938';
  ctx.fillRect(0, 0, 512, 512);

  // Grain stripes
  for (let y = 0; y < 512; y += 2) {
    const darkness = Math.sin(y * 0.08) * 20 + Math.random() * 15;
    ctx.fillStyle = `rgba(80, 45, 20, ${Math.abs(darkness) / 100})`;
    ctx.fillRect(0, y, 512, 2);
  }

  // Soft wood rings
  ctx.strokeStyle = 'rgba(60, 30, 10, 0.07)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.ellipse(256 + (i * 20 - 70), 256, 180 + i * 15, 380, 0.1, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

export function createFloorTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Modern grey office carpet / acoustic tile pattern
  ctx.fillStyle = '#2d333b';
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 64;
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      // Alternating subtle tint
      const isAlt = (x / tileSize + y / tileSize) % 2 === 0;
      ctx.fillStyle = isAlt ? '#333a44' : '#2b3038';
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

      // Fine carpet noise
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.04})`;
        ctx.fillRect(x + Math.random() * tileSize, y + Math.random() * tileSize, 2, 2);
      }
    }
  }

  // Tile grout lines
  ctx.strokeStyle = '#1b1f24';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

export function createCeilingTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#e8ecf0';
  ctx.fillRect(0, 0, 256, 256);

  // Acoustic perforation dots
  ctx.fillStyle = '#cbd2d9';
  for (let x = 8; x < 256; x += 16) {
    for (let y = 8; y < 256; y += 16) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Grid border
  ctx.strokeStyle = '#9aa5b1';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

export function createComputerScreenTexture(title = "DevStation OS v2.4") {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  // IDE / Dark desktop background
  ctx.fillStyle = '#161b22';
  ctx.fillRect(0, 0, 512, 320);

  // Top header bar
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, 512, 30);
  ctx.fillStyle = '#ff5f56';
  ctx.beginPath(); ctx.arc(15, 15, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffbd2e';
  ctx.beginPath(); ctx.arc(32, 15, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#27c93f';
  ctx.beginPath(); ctx.arc(49, 15, 5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#8b949e';
  ctx.font = '12px monospace';
  ctx.fillText(title + ' - [index.js]', 70, 20);

  // Code editor lines
  ctx.fillStyle = '#58a6ff';
  ctx.font = '13px monospace';
  ctx.fillText('import { Office } from "./workspace";', 20, 60);

  ctx.fillStyle = '#ff7b72';
  ctx.fillText('const', 20, 85);
  ctx.fillStyle = '#d2a8ff';
  ctx.fillText(' userSession', 70, 85);
  ctx.fillStyle = '#c9d1d9';
  ctx.fillText(' = new Session({ active: true });', 165, 85);

  ctx.fillStyle = '#8b949e';
  ctx.fillText('// Click screen to interact', 20, 115);

  ctx.fillStyle = '#7ee787';
  ctx.fillText('console.log("Welcome to the Virtual 3D Office!");', 20, 140);
  ctx.fillText('status: READY', 20, 165);

  // Simulated code blocks
  ctx.fillStyle = '#ff7b72';
  ctx.fillText('function', 20, 200);
  ctx.fillStyle = '#d2a8ff';
  ctx.fillText(' collaborate() {', 90, 200);
  ctx.fillStyle = '#79c0ff';
  ctx.fillText('  return "Productive & Creative";', 35, 225);
  ctx.fillStyle = '#c9d1d9';
  ctx.fillText('}', 20, 250);

  // Bottom dock/taskbar
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 290, 512, 30);
  ctx.fillStyle = '#58a6ff';
  ctx.fillRect(20, 296, 18, 18);
  ctx.fillStyle = '#3fb950';
  ctx.fillRect(45, 296, 18, 18);
  ctx.fillStyle = '#f0883e';
  ctx.fillRect(70, 296, 18, 18);

  ctx.fillStyle = '#8b949e';
  ctx.font = '11px monospace';
  ctx.fillText('10:42 AM | WiFi: Connected', 330, 310);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createWhiteboardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Whiteboard glossy white surface
  ctx.fillStyle = '#fbfcfd';
  ctx.fillRect(0, 0, 1024, 512);

  // Border frame
  ctx.strokeStyle = '#d0d7de';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 1016, 504);

  // Title
  ctx.fillStyle = '#0969da';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText('🚀 Q4 SPRINT GOALS & ARCHITECTURE', 40, 55);

  // Column headers
  ctx.fillStyle = '#24292f';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('TODO', 50, 110);
  ctx.fillText('IN PROGRESS', 370, 110);
  ctx.fillText('DONE', 700, 110);

  // Divider lines
  ctx.strokeStyle = '#e1e4e8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 125);
  ctx.lineTo(984, 125);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(340, 90);
  ctx.lineTo(340, 480);
  ctx.moveTo(670, 90);
  ctx.lineTo(670, 480);
  ctx.stroke();

  // Helper for sticky note drawings
  const drawSticky = (x, y, w, h, bg, textLines) => {
    ctx.fillStyle = bg;
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 6;
    ctx.fillRect(x, y, w, h);
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = '#1f2328';
    ctx.font = '15px sans-serif';
    textLines.forEach((line, idx) => {
      ctx.fillText(line, x + 12, y + 26 + idx * 22);
    });
  };

  drawSticky(50, 145, 250, 95, '#fff066', ['Optimize 3D Rendering', '• Level of Detail (LOD)', '• Reused materials']);
  drawSticky(50, 260, 250, 90, '#ffd8a8', ['Audio Ambience', '• Soft keyboard typing', '• Subtle footsteps']);

  drawSticky(370, 145, 250, 95, '#c3fae8', ['First Person Controls', '• Collision detection', '• Smooth movement']);
  drawSticky(370, 260, 250, 95, '#bbf7d0', ['Interactive Elements', '• Clickable monitors', '• Whiteboard zoom']);

  drawSticky(700, 145, 250, 95, '#e0cffc', ['Three.js Environment', '• Realistic lighting', '• Custom models']);
  drawSticky(700, 260, 250, 95, '#ffc9c9', ['Office Architecture', '• Desks, Chairs, Plants', '• Meeting Room']);

  // Marker doodle
  ctx.strokeStyle = '#cf222e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(825, 395, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#cf222e';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('SHIP IT! 🔥', 785, 400);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createDoorSignTexture(text = "CONFERENCE ROOM A") {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  // Dark brushed metal plaque
  ctx.fillStyle = '#1c2128';
  ctx.fillRect(0, 0, 512, 160);

  ctx.strokeStyle = '#444c56';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 506, 154);

  // Mounting screws
  ctx.fillStyle = '#768390';
  [15, 497].forEach(x => {
    [15, 145].forEach(y => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // Room title
  ctx.fillStyle = '#58a6ff';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 75);

  ctx.fillStyle = '#7ee787';
  ctx.font = '16px monospace';
  ctx.fillText('STATUS: AVAILABLE • TAP TO INSPECT', 256, 115);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createWindowSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Daylight gradient sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0, '#5390d9');
  skyGrad.addColorStop(0.5, '#74c0fc');
  skyGrad.addColorStop(0.85, '#e7f5ff');
  skyGrad.addColorStop(1, '#d0ebff');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Soft sun
  const sunGrad = ctx.createRadialGradient(280, 140, 10, 280, 140, 130);
  sunGrad.addColorStop(0, 'rgba(255, 255, 240, 0.95)');
  sunGrad.addColorStop(0.3, 'rgba(255, 235, 180, 0.5)');
  sunGrad.addColorStop(1, 'rgba(255, 235, 180, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(280, 140, 130, 0, Math.PI * 2);
  ctx.fill();

  // Distant city skyline silhouettes
  ctx.fillStyle = '#868e96';
  const buildings = [
    { x: 20, w: 70, h: 220 },
    { x: 100, w: 90, h: 280 },
    { x: 200, w: 60, h: 200 },
    { x: 270, w: 110, h: 320 },
    { x: 390, w: 80, h: 240 },
    { x: 480, w: 95, h: 300 },
    { x: 590, w: 75, h: 180 },
    { x: 675, w: 105, h: 330 },
    { x: 790, w: 85, h: 250 },
    { x: 890, w: 110, h: 270 }
  ];

  buildings.forEach(b => {
    ctx.fillRect(b.x, 512 - b.h, b.w, b.h);
    // Tiny building window lights
    ctx.fillStyle = 'rgba(255, 255, 220, 0.4)';
    for (let r = 512 - b.h + 15; r < 500; r += 20) {
      for (let c = b.x + 8; c < b.x + b.w - 10; c += 14) {
        if (Math.random() > 0.4) {
          ctx.fillRect(c, r, 7, 10);
        }
      }
    }
    ctx.fillStyle = '#868e96';
  });

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createPaintingTexture(theme = 'abstract') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 340;
  const ctx = canvas.getContext('2d');

  // Modern art painting for office walls
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 340);

  // Gradient waves
  const grad1 = ctx.createLinearGradient(0, 0, 512, 340);
  grad1.addColorStop(0, '#38bdf8');
  grad1.addColorStop(0.5, '#818cf8');
  grad1.addColorStop(1, '#c084fc');

  ctx.fillStyle = grad1;
  ctx.beginPath();
  ctx.moveTo(0, 200);
  ctx.bezierCurveTo(120, 100, 260, 280, 512, 120);
  ctx.lineTo(512, 340);
  ctx.lineTo(0, 340);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(380, 90, 60, 0, Math.PI * 2);
  ctx.fill();

  // Signature
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = 'italic 12px sans-serif';
  ctx.fillText('Minimal Horizons • 2025', 30, 320);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

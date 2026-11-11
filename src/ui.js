/**
 * User Interface & Minimap Controller
 * Renders real-time 2D radar/minimap, modal dialogues, controls guide, and zone indicator
 */
export class UIController {
  constructor(playerControls, soundEffects) {
    this.controls = playerControls;
    this.sounds = soundEffects;

    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    this.zoneIndicator = document.getElementById('zone-indicator');
    this.modalContainer = document.getElementById('modal-container');
    this.modalContent = document.getElementById('modal-content');
    this.startScreen = document.getElementById('start-screen');
    this.instructionsOverlay = document.getElementById('instructions-overlay');
    this.loadingScreen = document.getElementById('loading-screen');

    this.isModalOpen = false;

    this.bindEvents();
  }

  bindEvents() {
    // Start Screen "Enter Office" button
    const enterBtn = document.getElementById('btn-enter');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        if (this.sounds) this.sounds.playClick();
        this.hideStartScreen();
        this.controls.lock();
      });
    }

    // Modal Close Button
    const modalCloseBtn = document.getElementById('modal-close');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Click outside modal to close
    if (this.modalContainer) {
      this.modalContainer.addEventListener('click', (e) => {
        if (e.target === this.modalContainer) {
          this.closeModal();
        }
      });
    }

    // Controls toggle button
    const helpBtn = document.getElementById('btn-help');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        this.toggleInstructions();
      });
    }

    // Audio Mute toggle button
    const audioBtn = document.getElementById('btn-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        if (this.sounds) {
          this.sounds.enabled = !this.sounds.enabled;
          audioBtn.classList.toggle('muted', !this.sounds.enabled);
          audioBtn.textContent = this.sounds.enabled ? '🔊 Audio ON' : '🔇 Audio OFF';
        }
      });
    }

    // ESC to unlock handler & pause screen
    this.controls.onLockChange = (isLocked) => {
      if (!isLocked && !this.isModalOpen) {
        // Show pause resume prompt
        this.showPausePrompt();
      } else if (isLocked) {
        this.hidePausePrompt();
      }
    };

    // Global Key Listener for modal ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        this.closeModal();
      }
    });

    // Resume button
    const resumeBtn = document.getElementById('btn-resume');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        this.hidePausePrompt();
        this.controls.lock();
      });
    }
  }

  hideLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        this.loadingScreen.style.display = 'none';
      }, 500);
    }
  }

  hideStartScreen() {
    if (this.startScreen) {
      this.startScreen.classList.add('hidden');
    }
  }

  showPausePrompt() {
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) pauseMenu.classList.add('active');
  }

  hidePausePrompt() {
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) pauseMenu.classList.remove('active');
  }

  toggleInstructions() {
    if (this.instructionsOverlay) {
      this.instructionsOverlay.classList.toggle('visible');
    }
  }

  openModal(data) {
    if (!this.modalContainer || !this.modalContent) return;

    this.isModalOpen = true;
    this.controls.unlock();
    this.hidePausePrompt();

    let contentHtml = '';

    if (data.type === 'computer') {
      contentHtml = `
        <div class="modal-badge">COMPUTER WORKSTATION</div>
        <h2 class="modal-title">Welcome to the Virtual Office</h2>
        <div class="modal-body">
          <p class="hero-text"><strong>User:</strong> ${data.details.devName} &bull; <span class="accent-text">${data.details.role}</span></p>
          <div class="system-specs">
            <div class="spec-row"><span class="label">System Spec:</span><span>${data.details.specs}</span></div>
            <div class="spec-row"><span class="label">Current Activity:</span><span>${data.details.activeTask}</span></div>
            <div class="spec-row"><span class="label">Network:</span><span class="badge-online">Connected &bull; 1.2 Gbps Fiber</span></div>
          </div>
          <div class="interactive-terminal">
            <div class="term-bar"><span class="term-dot"></span><span class="term-dot"></span><span class="term-dot"></span> terminal — zsh</div>
            <pre class="term-code">$ git status
On branch main
Your branch is up to date with 'origin/main'.
Everything is running smoothly in 3D WebGL!</pre>
          </div>
        </div>
      `;
    } else if (data.type === 'whiteboard') {
      const taskList = (data.details.tasks || []).map(t => `
        <li class="note-card status-${t.status.toLowerCase()}">
          <span class="note-tag">${t.status}</span>
          <p>${t.text}</p>
        </li>
      `).join('');

      contentHtml = `
        <div class="modal-badge">SPRINT DASHBOARD</div>
        <h2 class="modal-title">${data.details.title}</h2>
        <div class="modal-body">
          <p class="timestamp">Last edited: ${data.details.lastUpdated}</p>
          <ul class="whiteboard-notes-grid">
            ${taskList}
          </ul>
          <div class="add-note-box">
            <input type="text" id="new-note-input" placeholder="Type a new sticky note..." />
            <button class="btn-primary" id="btn-add-note">+ Post Note</button>
          </div>
        </div>
      `;
    } else if (data.type === 'door') {
      contentHtml = `
        <div class="modal-badge">CONFERENCE ROOM ACCESS</div>
        <h2 class="modal-title">${data.details.title}</h2>
        <div class="modal-body">
          <div class="room-status-banner">
            <span class="pulse-indicator"></span>
            <strong>${data.details.status}</strong>
          </div>
          <div class="room-details-card">
            <p><strong>Capacity & Tech:</strong> ${data.details.capacity}</p>
            <p><strong>Environment:</strong> ${data.details.notes}</p>
          </div>
          <p class="modal-hint">Walk right through the glass doorway into the meeting area anytime!</p>
        </div>
      `;
    } else if (data.type === 'coffee') {
      contentHtml = `
        <div class="modal-badge">BREAK ROOM & LOUNGE</div>
        <h2 class="modal-title">${data.name}</h2>
        <div class="modal-body">
          <div class="coffee-card">
            <div class="coffee-icon">☕</div>
            <div>
              <h3>${data.details.title}</h3>
              <p><strong>Blend:</strong> ${data.details.blend}</p>
              <p><strong>Telemetry:</strong> ${data.details.status}</p>
            </div>
          </div>
          <button class="btn-primary" id="btn-brew-coffee">Brew Fresh Espresso</button>
          <div id="brew-message" class="brew-msg"></div>
        </div>
      `;
    } else if (data.type === 'plant') {
      contentHtml = `
        <div class="modal-badge">OFFICE GREENERY</div>
        <h2 class="modal-title">${data.name}</h2>
        <div class="modal-body">
          <p><strong>Species:</strong> ${data.details.species}</p>
          <p><strong>Care Schedule:</strong> ${data.details.care}</p>
          <p class="plant-status">${data.details.status}</p>
        </div>
      `;
    }

    this.modalContent.innerHTML = contentHtml;
    this.modalContainer.classList.add('visible');

    // Attach dynamic handlers for whiteboard or coffee
    if (data.type === 'whiteboard') {
      const addBtn = document.getElementById('btn-add-note');
      const input = document.getElementById('new-note-input');
      if (addBtn && input) {
        addBtn.addEventListener('click', () => {
          const val = input.value.trim();
          if (val) {
            const grid = document.querySelector('.whiteboard-notes-grid');
            const li = document.createElement('li');
            li.className = 'note-card status-todo';
            li.innerHTML = `<span class="note-tag">NEW</span><p>${val}</p>`;
            grid.appendChild(li);
            input.value = '';
            if (this.sounds) this.sounds.playInteract();
          }
        });
      }
    }

    if (data.type === 'coffee') {
      const brewBtn = document.getElementById('btn-brew-coffee');
      const msg = document.getElementById('brew-message');
      if (brewBtn && msg) {
        brewBtn.addEventListener('click', () => {
          brewBtn.disabled = true;
          brewBtn.textContent = 'Brewing...';
          if (this.sounds) this.sounds.playInteract();
          setTimeout(() => {
            msg.textContent = '☕ Fresh piping hot espresso is ready! Energy +100%';
            brewBtn.textContent = 'Brew Another Cup';
            brewBtn.disabled = false;
          }, 1000);
        });
      }
    }
  }

  closeModal() {
    if (!this.isModalOpen) return;
    this.isModalOpen = false;
    if (this.modalContainer) {
      this.modalContainer.classList.remove('visible');
    }
    // Re-lock controls after brief pause
    setTimeout(() => {
      this.controls.lock();
    }, 50);
  }

  /**
   * Updates real-time 2D Canvas Minimap and Room Location HUD
   */
  updateMinimap(playerPosition, cameraEuler) {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Office dimensions in 3D: X from -13 to +13 (26m), Z from -9 to +9 (18m)
    // Scale and center into minimap canvas
    const scaleX = (w - 20) / 26;
    const scaleZ = (h - 20) / 18;
    const offsetX = w / 2;
    const offsetZ = h / 2;

    const toMapX = (worldX) => offsetX + worldX * scaleX;
    const toMapY = (worldZ) => offsetZ + worldZ * scaleZ;

    // Outer Room Border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Interior Glass Partition (X = 4.5, Z = -9 to 2)
    ctx.strokeStyle = '#818cf8';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(toMapX(4.5), toMapY(-9));
    ctx.lineTo(toMapX(4.5), toMapY(-2.5));
    ctx.moveTo(toMapX(4.5), toMapY(-0.5));
    ctx.lineTo(toMapX(4.5), toMapY(2.0));
    ctx.stroke();
    ctx.setLineDash([]);

    // Workstation desks
    ctx.fillStyle = '#64748b';
    [
      { x: -5.5, z: -3.5 },
      { x: -1.5, z: -3.5 },
      { x: -5.5, z: 3.0 },
      { x: -1.5, z: 3.0 }
    ].forEach(d => {
      ctx.fillRect(toMapX(d.x) - 10, toMapY(d.z) - 5, 20, 10);
    });

    // Conference Table
    ctx.fillStyle = '#475569';
    ctx.fillRect(toMapX(8.5) - 20, toMapY(-3.5) - 8, 40, 16);

    // Break Area Counter
    ctx.fillRect(toMapX(8.5) - 16, toMapY(4.5) - 5, 32, 10);

    // Zone text labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OPEN DESKS', toMapX(-3.5), toMapY(0));
    ctx.fillText('BOARDROOM', toMapX(8.5), toMapY(-6));
    ctx.fillText('LOUNGE', toMapX(8.5), toMapY(7));

    // Player position dot & direction cone
    const px = toMapX(playerPosition.x);
    const py = toMapY(playerPosition.z);

    // Player Field of View cone
    const yaw = cameraEuler.y;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, 22, -yaw - Math.PI / 2 - 0.5, -yaw - Math.PI / 2 + 0.5);
    ctx.closePath();
    ctx.fill();

    // Player icon
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Determine and display current zone name
    this.updateCurrentZone(playerPosition.x, playerPosition.z);
  }

  updateCurrentZone(x, z) {
    if (!this.zoneIndicator) return;
    let zone = 'Open Workstation Area';

    if (x > 4.5) {
      if (z < 0.5) {
        zone = 'Executive Meeting Room A';
      } else {
        zone = 'Break Area & Lounge';
      }
    } else if (z < -6.0) {
      zone = 'Agile Sprint Whiteboard';
    } else if (x < -10.0) {
      zone = 'Executive Library & Shelves';
    }

    this.zoneIndicator.textContent = `📍 ${zone}`;
  }
}

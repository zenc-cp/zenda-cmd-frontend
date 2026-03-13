/* Zenda CMD V2 — PixiJS 8 Office Renderer */
let pixiApp = null;
let roomContainers = [];
let walkerSprite = null;
let walkerDir = 1;
let rocketSprite = null;
let coinAccessory = null;
let sirenAccessory = null;
let animFrame = 0;

/* Draw a Kairosoft-style pixel character */
function drawPixelCharacter(g, cx, cy, color, highlight) {
  const c = parseInt(color.replace('#', ''), 16);
  const h = highlight || 0xffffff;
  const skin = 0xf5c6a0;
  const skinShadow = 0xd4a070;
  const hair = c;
  const shirt = c;
  const pants = 0x2d333b;
  const shoes = 0x1c2128;

  // Hair/hat
  g.rect(cx - 7, cy - 2, 14, 6);
  g.fill(hair);
  g.rect(cx - 8, cy + 2, 16, 2);
  g.fill(hair);

  // Face
  g.rect(cx - 6, cy + 4, 12, 10);
  g.fill(skin);
  // Eyes
  g.rect(cx - 4, cy + 7, 2, 2);
  g.fill(0x1a1a2e);
  g.rect(cx + 2, cy + 7, 2, 2);
  g.fill(0x1a1a2e);
  // Mouth
  g.rect(cx - 2, cy + 11, 4, 1);
  g.fill(skinShadow);

  // Body/shirt
  g.rect(cx - 8, cy + 14, 16, 12);
  g.fill(shirt);
  // Shirt detail
  g.rect(cx - 1, cy + 14, 2, 12);
  g.fill({ color: 0x000000, alpha: 0.15 });

  // Arms
  g.rect(cx - 12, cy + 14, 4, 10);
  g.fill(shirt);
  g.rect(cx + 8, cy + 14, 4, 10);
  g.fill(shirt);
  // Hands
  g.rect(cx - 12, cy + 24, 4, 3);
  g.fill(skin);
  g.rect(cx + 8, cy + 24, 4, 3);
  g.fill(skin);

  // Pants
  g.rect(cx - 7, cy + 26, 6, 8);
  g.fill(pants);
  g.rect(cx + 1, cy + 26, 6, 8);
  g.fill(pants);

  // Shoes
  g.rect(cx - 8, cy + 34, 7, 3);
  g.fill(shoes);
  g.rect(cx + 1, cy + 34, 7, 3);
  g.fill(shoes);
}

async function initPixiOffice() {
  const container = document.getElementById('pixi-container');
  if (!container) return;

  const { Application, Container, Graphics, Text, TextStyle, Sprite, Texture, Assets } = await import('https://cdn.jsdelivr.net/npm/pixi.js@8.9.2/dist/pixi.min.mjs');

  window._PIXI = { Container, Graphics, Text, TextStyle, Sprite, Texture, Assets };

  const cw = container.clientWidth;
  const ch = container.clientHeight;

  const app = new Application();
  await app.init({
    width: cw,
    height: ch,
    backgroundColor: 0x0a0e14,
    antialias: false,
    resolution: 1,
    autoDensity: true
  });
  container.appendChild(app.canvas);
  app.canvas.style.imageRendering = 'pixelated';
  pixiApp = app;

  const desks = window.DESKS;

  // Calculate layout
  const padding = 6;
  const cols4 = 4;
  const cols3 = 3;
  const roomW = Math.floor((cw - padding * 5) / cols4);
  const totalH = ch - 4; // leave space for footer overlap
  const topRowH = Math.floor((totalH - padding * 4) / 3);
  const roomH = topRowH;

  // Row 1: CEO office (centered, wider)
  const ceoW = roomW * 1.6;
  const ceoX = (cw - ceoW) / 2;
  const ceoY = padding;

  // Row 2: 4 rooms
  const row2Y = ceoY + roomH + padding;

  // Row 3: 3 rooms
  const row3Y = row2Y + roomH + padding;
  const roomW3 = Math.floor((cw - padding * 4) / cols3);

  // Draw checkered floor background
  const floor = new Graphics();
  const tileSize = 16;
  for (let x = 0; x < cw; x += tileSize) {
    for (let y = 0; y < ch; y += tileSize) {
      const isDark = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      floor.rect(x, y, tileSize, tileSize);
      floor.fill(isDark ? 0x0c1018 : 0x0e1420);
    }
  }
  app.stage.addChild(floor);

  // Room positions
  const positions = [
    { x: ceoX, y: ceoY, w: ceoW, h: roomH, isCeo: true },
    { x: padding, y: row2Y, w: roomW, h: roomH },
    { x: padding + roomW + padding, y: row2Y, w: roomW, h: roomH },
    { x: padding + (roomW + padding) * 2, y: row2Y, w: roomW, h: roomH },
    { x: padding + (roomW + padding) * 3, y: row2Y, w: roomW, h: roomH },
    { x: padding, y: row3Y, w: roomW3, h: roomH },
    { x: padding + roomW3 + padding, y: row3Y, w: roomW3, h: roomH },
    { x: padding + (roomW3 + padding) * 2, y: row3Y, w: roomW3, h: roomH }
  ];

  roomContainers = [];

  desks.forEach((desk, i) => {
    const pos = positions[i];
    const roomCont = new Container();
    roomCont.x = pos.x;
    roomCont.y = pos.y;
    roomCont.eventMode = 'static';
    roomCont.cursor = 'pointer';
    roomCont.on('pointerdown', () => {
      if (window.ZendaApp && window.ZendaApp.openModal) {
        window.ZendaApp.openModal(desk);
      }
    });

    // Room background
    const bg = new Graphics();
    const col = parseInt(desk.color.replace('#', ''), 16);
    bg.rect(0, 0, pos.w, pos.h);
    bg.fill({ color: col, alpha: 0.10 });
    bg.rect(0, 0, pos.w, pos.h);
    bg.stroke({ color: col, alpha: 0.6, width: pos.isCeo ? 3 : 2 });
    roomCont.addChild(bg);

    // Gold border glow for CEO
    if (pos.isCeo) {
      const goldBorder = new Graphics();
      goldBorder.rect(-2, -2, pos.w + 4, pos.h + 4);
      goldBorder.stroke({ color: 0xe6c04a, width: 3, alpha: 0.7 });
      roomCont.addChild(goldBorder);
    }

    // Room floor (darker area under desk)
    const roomFloor = new Graphics();
    const floorY = pos.h * 0.55;
    for (let fx = 8; fx < pos.w - 8; fx += 8) {
      for (let fy = floorY; fy < pos.h - 4; fy += 8) {
        const isDark = ((fx / 8) + (fy / 8)) % 2 === 0;
        roomFloor.rect(fx, fy, 8, 8);
        roomFloor.fill({ color: isDark ? 0x1a1f28 : 0x161b22, alpha: 0.6 });
      }
    }
    roomCont.addChild(roomFloor);

    // Room title
    const titleStyle = new TextStyle({
      fontFamily: '"Press Start 2P", monospace',
      fontSize: pos.isCeo ? 9 : 7,
      fill: desk.color,
      align: 'center'
    });
    const title = new Text({ text: desk.dept, style: titleStyle });
    title.x = 8;
    title.y = 6;
    roomCont.addChild(title);

    // Role subtitle
    const roleStyle = new TextStyle({
      fontFamily: '"Press Start 2P", monospace',
      fontSize: 5,
      fill: 0x8b949e,
    });
    const role = new Text({ text: desk.role, style: roleStyle });
    role.x = 8;
    role.y = 18;
    roomCont.addChild(role);

    // Desk furniture
    const deskGfx = new Graphics();
    const deskW = Math.min(56, pos.w * 0.35);
    const deskH = 14;
    const deskX = pos.w / 2 - deskW / 2;
    const deskY = pos.h - 42;
    // Desk top
    deskGfx.rect(deskX, deskY, deskW, deskH);
    deskGfx.fill(0x5c3d2e);
    deskGfx.rect(deskX + 1, deskY + 1, deskW - 2, 2);
    deskGfx.fill(0x7a5540);
    // Desk legs
    deskGfx.rect(deskX + 3, deskY + deskH, 4, 10);
    deskGfx.fill(0x4a2e1f);
    deskGfx.rect(deskX + deskW - 7, deskY + deskH, 4, 10);
    deskGfx.fill(0x4a2e1f);
    roomCont.addChild(deskGfx);

    // Computer on desk
    const monitor = new Graphics();
    const monX = pos.w / 2 - 10;
    const monY = deskY - 14;
    // Monitor body
    monitor.rect(monX, monY, 20, 14);
    monitor.fill(0x2d333b);
    monitor.rect(monX + 1, monY + 1, 18, 1);
    monitor.fill(0x444c56);
    // Screen
    monitor.rect(monX + 2, monY + 3, 16, 9);
    monitor.fill(col);
    // Screen content (little lines)
    monitor.rect(monX + 4, monY + 5, 8, 1);
    monitor.fill({ color: 0xffffff, alpha: 0.5 });
    monitor.rect(monX + 4, monY + 7, 6, 1);
    monitor.fill({ color: 0xffffff, alpha: 0.3 });
    monitor.rect(monX + 4, monY + 9, 10, 1);
    monitor.fill({ color: 0xffffff, alpha: 0.4 });
    // Monitor stand
    monitor.rect(monX + 7, monY + 14, 6, 2);
    monitor.fill(0x444c56);
    monitor.rect(monX + 5, monY + 16, 10, 2);
    monitor.fill(0x3d444d);
    roomCont.addChild(monitor);

    // Character (Kairosoft-style pixel person)
    const charGfx = new Graphics();
    const charX = pos.w / 2;
    const charY = pos.h - 80;
    drawPixelCharacter(charGfx, charX, charY, desk.color);
    roomCont.addChild(charGfx);

    // Status dot with glow
    const statusDot = new Graphics();
    const statusColor = i < 5 ? 0x3fb950 : (i === 5 ? 0xd29922 : 0x3fb950);
    statusDot.circle(pos.w - 14, 12, 5);
    statusDot.fill({ color: statusColor, alpha: 0.3 });
    statusDot.circle(pos.w - 14, 12, 3);
    statusDot.fill(statusColor);
    roomCont.addChild(statusDot);
    roomCont._statusDot = statusDot;

    // Server rack
    const rack = new Graphics();
    const rackX = pos.w - 26;
    const rackY = pos.h - 40;
    rack.rect(rackX, rackY, 14, 28);
    rack.fill(0x2d333b);
    rack.rect(rackX, rackY, 14, 28);
    rack.stroke({ color: 0x444c56, width: 1 });
    // Rack slots
    for (let j = 0; j < 4; j++) {
      rack.rect(rackX + 2, rackY + 3 + j * 7, 10, 5);
      rack.fill(0x1c2128);
      // LED
      rack.circle(rackX + 4, rackY + 5.5 + j * 7, 1.5);
      rack.fill(j % 3 === 0 ? 0x3fb950 : (j % 3 === 1 ? 0x60a5fa : 0xe6c04a));
    }
    roomCont.addChild(rack);

    // Plant
    const plant = new Graphics();
    const plantX = 8;
    const plantY = pos.h - 26;
    // Pot
    plant.rect(plantX, plantY + 6, 12, 10);
    plant.fill(0xa0522d);
    plant.rect(plantX - 1, plantY + 5, 14, 3);
    plant.fill(0xb5651d);
    // Leaves
    plant.circle(plantX + 6, plantY, 5);
    plant.fill(0x2ea043);
    plant.circle(plantX + 2, plantY - 3, 4);
    plant.fill(0x3fb950);
    plant.circle(plantX + 10, plantY - 3, 4);
    plant.fill(0x238636);
    plant.circle(plantX + 6, plantY - 5, 3);
    plant.fill(0x3fb950);
    roomCont.addChild(plant);

    // Chair (pixel office chair)
    const chair = new Graphics();
    const chairX = pos.w / 2 - 8;
    const chairY = pos.h - 20;
    // Seat
    chair.rect(chairX, chairY, 16, 4);
    chair.fill(0x444c56);
    // Back
    chair.rect(chairX + 2, chairY - 10, 12, 10);
    chair.fill(0x555e68);
    chair.rect(chairX + 2, chairY - 10, 12, 10);
    chair.stroke({ color: 0x3d444d, width: 1 });
    // Wheels
    chair.circle(chairX + 3, chairY + 6, 2);
    chair.fill(0x2d333b);
    chair.circle(chairX + 13, chairY + 6, 2);
    chair.fill(0x2d333b);
    roomCont.addChild(chair);

    // Draw accessory
    drawAccessory(roomCont, desk, pos, { Graphics, TextStyle, Text });

    app.stage.addChild(roomCont);
    roomContainers.push({ container: roomCont, desk, pos });
  });

  // Walker sprite
  const walkerCont = new Container();
  const walkerGfx = new Graphics();
  drawPixelCharacter(walkerGfx, 0, 0, '#e6c04a');
  walkerGfx.x = 40;
  walkerGfx.y = ch - 52;
  walkerCont.addChild(walkerGfx);
  app.stage.addChild(walkerCont);
  walkerSprite = walkerGfx;

  // Rocket at bottom center
  const rocketCont = new Container();
  rocketCont.x = cw / 2 - 12;
  rocketCont.y = ch - 50;
  rocketCont.eventMode = 'static';
  rocketCont.cursor = 'pointer';
  rocketCont.on('pointerdown', () => { showRocketPopup(); });

  const rocket = new Graphics();
  // Rocket body
  rocket.rect(4, 8, 16, 22);
  rocket.fill(0xd0d0d0);
  rocket.rect(6, 10, 12, 18);
  rocket.fill(0xe0e0e0);
  // Nose cone
  rocket.moveTo(12, 0);
  rocket.lineTo(20, 8);
  rocket.lineTo(4, 8);
  rocket.closePath();
  rocket.fill(0xf85149);
  // Window
  rocket.circle(12, 18, 4);
  rocket.fill(0x0d1117);
  rocket.circle(12, 18, 3);
  rocket.fill(0x60a5fa);
  // Fins
  rocket.moveTo(4, 26);
  rocket.lineTo(-2, 34);
  rocket.lineTo(4, 30);
  rocket.closePath();
  rocket.fill(0xf85149);
  rocket.moveTo(20, 26);
  rocket.lineTo(26, 34);
  rocket.lineTo(20, 30);
  rocket.closePath();
  rocket.fill(0xf85149);
  // Flame animation layers
  rocket.moveTo(6, 30);
  rocket.lineTo(12, 42);
  rocket.lineTo(18, 30);
  rocket.closePath();
  rocket.fill(0xe6c04a);
  rocket.moveTo(8, 30);
  rocket.lineTo(12, 38);
  rocket.lineTo(16, 30);
  rocket.closePath();
  rocket.fill(0xf08030);
  rocketCont.addChild(rocket);

  const rocketLabel = new Text({
    text: 'MISSION CTRL',
    style: new TextStyle({
      fontFamily: '"Press Start 2P", monospace',
      fontSize: 5,
      fill: 0x8b949e,
      align: 'center'
    })
  });
  rocketLabel.x = -16;
  rocketLabel.y = 44;
  rocketCont.addChild(rocketLabel);
  app.stage.addChild(rocketCont);
  rocketSprite = rocketCont;

  // CRT scanline overlay
  const scanlines = new Graphics();
  for (let y = 0; y < ch; y += 3) {
    scanlines.rect(0, y, cw, 1);
    scanlines.fill({ color: 0x000000, alpha: 0.05 });
  }
  scanlines.alpha = 0.5;
  app.stage.addChild(scanlines);

  // Animation loop
  app.ticker.add(() => {
    animFrame++;

    // Walker movement
    if (walkerSprite) {
      walkerSprite.x += walkerDir * 0.4;
      if (walkerSprite.x > cw - 60) walkerDir = -1;
      if (walkerSprite.x < 40) walkerDir = 1;
    }

    // Coin bob
    if (coinAccessory) {
      coinAccessory.y = coinAccessory._baseY + Math.sin(animFrame * 0.06) * 3;
    }

    // Siren pulse
    if (sirenAccessory) {
      sirenAccessory.alpha = 0.5 + Math.sin(animFrame * 0.1) * 0.5;
    }

    // Rocket flame flicker
    if (rocketSprite) {
      rocketSprite.children[0].alpha = 0.9 + Math.sin(animFrame * 0.15) * 0.1;
    }

    // Scanline drift
    scanlines.y = (animFrame * 0.15) % 3;
  });

  // Resize handler
  const resizeObserver = new ResizeObserver(() => {
    const newW = container.clientWidth;
    const newH = container.clientHeight;
    app.renderer.resize(newW, newH);
  });
  resizeObserver.observe(container);
}

function drawAccessory(roomCont, desk, pos, pixi) {
  const { Graphics, TextStyle, Text } = pixi;
  const ax = pos.w / 2 + 30;
  const ay = pos.h - 76;

  switch (desk.accessory) {
    case 'crown': {
      const g = new Graphics();
      g.rect(ax - 9, ay + 6, 18, 4);
      g.fill(0xe6c04a);
      g.moveTo(ax - 9, ay + 6);
      g.lineTo(ax - 7, ay - 1);
      g.lineTo(ax - 3, ay + 3);
      g.lineTo(ax, ay - 3);
      g.lineTo(ax + 3, ay + 3);
      g.lineTo(ax + 7, ay - 1);
      g.lineTo(ax + 9, ay + 6);
      g.closePath();
      g.fill(0xe6c04a);
      g.circle(ax - 4, ay + 3, 2);
      g.fill(0xf85149);
      g.circle(ax, ay + 1, 2);
      g.fill(0x60a5fa);
      g.circle(ax + 4, ay + 3, 2);
      g.fill(0x3fb950);
      roomCont.addChild(g);
      break;
    }
    case 'clipboard': {
      const g = new Graphics();
      g.rect(ax - 6, ay, 12, 16);
      g.fill(0x8b6f47);
      g.rect(ax - 6, ay, 12, 16);
      g.stroke({ color: 0x6b5030, width: 1 });
      g.rect(ax - 4, ay + 4, 8, 10);
      g.fill(0xf0f0f0);
      g.rect(ax - 3, ay + 6, 6, 1);
      g.fill(0x888888);
      g.rect(ax - 3, ay + 8, 6, 1);
      g.fill(0x888888);
      g.rect(ax - 3, ay + 10, 4, 1);
      g.fill(0x888888);
      g.rect(ax - 3, ay - 2, 6, 4);
      g.fill(0x777777);
      roomCont.addChild(g);
      break;
    }
    case 'magnifier': {
      const g = new Graphics();
      g.circle(ax, ay + 3, 7);
      g.stroke({ color: 0xdddddd, width: 2 });
      g.circle(ax, ay + 3, 5);
      g.fill({ color: 0x88bbff, alpha: 0.3 });
      g.moveTo(ax + 5, ay + 8);
      g.lineTo(ax + 12, ay + 15);
      g.stroke({ color: 0xaaaaaa, width: 2.5 });
      roomCont.addChild(g);
      break;
    }
    case 'checkmark': {
      const g = new Graphics();
      g.circle(ax, ay + 5, 8);
      g.fill(0x3fb950);
      g.circle(ax, ay + 5, 8);
      g.stroke({ color: 0x2ea043, width: 1 });
      g.moveTo(ax - 4, ay + 5);
      g.lineTo(ax - 1, ay + 9);
      g.lineTo(ax + 5, ay + 1);
      g.stroke({ color: 0xffffff, width: 2.5 });
      roomCont.addChild(g);
      break;
    }
    case 'coin': {
      const g = new Graphics();
      g.circle(0, 0, 7);
      g.fill(0xe6c04a);
      g.circle(0, 0, 7);
      g.stroke({ color: 0xd4a017, width: 1.5 });
      g.circle(0, 0, 5);
      g.stroke({ color: 0xf0d060, width: 0.5 });
      const ds = new TextStyle({ fontFamily: '"Press Start 2P", monospace', fontSize: 7, fill: 0x8b6f00 });
      const dollar = new Text({ text: '$', style: ds });
      dollar.x = -4;
      dollar.y = -5;
      g.addChild(dollar);
      g.x = ax;
      g.y = ay + 5;
      g._baseY = ay + 5;
      coinAccessory = g;
      roomCont.addChild(g);
      break;
    }
    case 'siren': {
      const g = new Graphics();
      g.rect(ax - 6, ay + 7, 12, 5);
      g.fill(0x555555);
      g.circle(ax, ay + 3, 6);
      g.fill(0xf85149);
      g.circle(ax, ay + 3, 9);
      g.fill({ color: 0xf85149, alpha: 0.15 });
      g.circle(ax, ay + 3, 12);
      g.fill({ color: 0xf85149, alpha: 0.08 });
      sirenAccessory = g;
      roomCont.addChild(g);
      break;
    }
    case 'chat': {
      const g = new Graphics();
      g.roundRect(ax - 9, ay - 2, 18, 14, 3);
      g.fill(0xbc8cff);
      g.moveTo(ax - 4, ay + 12);
      g.lineTo(ax - 8, ay + 18);
      g.lineTo(ax, ay + 12);
      g.closePath();
      g.fill(0xbc8cff);
      g.circle(ax - 4, ay + 5, 1.5);
      g.fill(0xffffff);
      g.circle(ax, ay + 5, 1.5);
      g.fill(0xffffff);
      g.circle(ax + 4, ay + 5, 1.5);
      g.fill(0xffffff);
      roomCont.addChild(g);
      break;
    }
    case 'scroll': {
      const g = new Graphics();
      g.rect(ax - 6, ay + 2, 12, 14);
      g.fill(0xd4b896);
      g.roundRect(ax - 8, ay, 16, 4, 2);
      g.fill(0xc4a876);
      g.roundRect(ax - 8, ay + 14, 16, 4, 2);
      g.fill(0xc4a876);
      g.rect(ax - 4, ay + 5, 8, 1);
      g.fill(0x8b6f47);
      g.rect(ax - 4, ay + 7, 8, 1);
      g.fill(0x8b6f47);
      g.rect(ax - 4, ay + 9, 6, 1);
      g.fill(0x8b6f47);
      g.rect(ax - 4, ay + 11, 7, 1);
      g.fill(0x8b6f47);
      roomCont.addChild(g);
      break;
    }
  }
}

function showRocketPopup() {
  const overlay = document.getElementById('modal-overlay');
  const box = overlay.querySelector('.modal-box');
  box.innerHTML = `
    <button class="modal-close" onclick="window.ZendaApp.closeModal()">X</button>
    <div class="modal-agent-name" style="color: var(--accent-gold);">MISSION CONTROL</div>
    <div class="modal-agent-role">Zenda Command Center Operations</div>
    <div class="modal-status-badge connected">OPERATIONAL</div>
    <div style="margin-top: 10px; font-size: 7px; color: var(--text-dim); line-height: 2;">
      <div>Active Agents: <span style="color: var(--accent-green);">6/8</span></div>
      <div>Uptime: <span style="color: var(--text);">99.7%</span></div>
      <div>Last Deploy: <span style="color: var(--text);">2h ago</span></div>
      <div>Version: <span style="color: var(--accent-gold);">${window.ZENDA_CONFIG.VERSION}</span></div>
    </div>
    <div class="modal-actions" style="margin-top: 12px;">
      <button class="modal-action-btn" onclick="window.ZendaApp.callAction('/api/agents/health')">Full Health Check</button>
      <button class="modal-action-btn" onclick="window.ZendaApp.callAction('/api/zenda/deploy', 'POST')">Deploy All</button>
    </div>
    <div class="modal-response" id="modal-response"></div>
  `;
  overlay.classList.add('show');
}

function updateRoomStatus(agentId, status) {
  const idx = window.DESKS.findIndex(d => d.id === agentId);
  if (idx >= 0 && roomContainers[idx]) {
    const dot = roomContainers[idx].container._statusDot;
    if (dot) {
      dot.clear();
      const pos = roomContainers[idx].pos;
      let color = 0x3fb950;
      if (status === 'offline') color = 0xf85149;
      if (status === 'not_wired') color = 0xd29922;
      dot.circle(pos.w - 14, 12, 5);
      dot.fill({ color: color, alpha: 0.3 });
      dot.circle(pos.w - 14, 12, 3);
      dot.fill(color);
    }
  }
}

window.PixiOffice = {
  init: initPixiOffice,
  updateRoomStatus
};

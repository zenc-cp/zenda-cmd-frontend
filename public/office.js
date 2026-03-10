a// Zenda CMD Pixel Office - Claw Empire Style (S9) v2
// PixiJS 8 canvas with REAL Claw Empire sprites, tiled rooms, furniture, animations
const SPRITE_BASE = 'https://raw.githubusercontent.com/GreenSheep01201/claw-empire/main/public/sprites/';

const AGENTS = [
  { id: 'zenda', name: 'Zenda', spriteId: 1, role: 'CEO', roomColor: 0x2a1f4e, labelColor: '#e6c04a', desk: 0, isCEO: true },
  { id: 'scout', name: 'Scout', spriteId: 2, role: 'Intake', roomColor: 0x1a3a5c, labelColor: '#60a5fa', desk: 1 },
  { id: 'scanner', name: 'Scanner', spriteId: 3, role: 'Security', roomColor: 0x5a1a3a, labelColor: '#f85149', desk: 2 },
  { id: 'reporter', name: 'Reporter', spriteId: 4, role: 'Results', roomColor: 0x1a5c3a, labelColor: '#3fb950', desk: 3 },
  { id: 'earner', name: 'Earner', spriteId: 5, role: 'Revenue', roomColor: 0x5c4a1a, labelColor: '#d29922', desk: 4 },
  { id: 'incident', name: 'Incident', spriteId: 6, role: 'Response', roomColor: 0x5c1a3a, labelColor: '#f85149', desk: 5 },
  { id: 'messenger', name: 'Messenger', spriteId: 7, role: 'Comms', roomColor: 0x1a4a5c, labelColor: '#bc8cff', desk: 6 },
  { id: 'logger', name: 'Logger', spriteId: 8, role: 'Logs', roomColor: 0x3a3a3a, labelColor: '#8b949e', desk: 7 }
];

let pixiApp = null;
const spriteData = {};
const statusDots = {};
let animFrame = 0;
const spriteCache = {};
// Load sprite image via HTML Image element (bypasses PIXI CORS issues)
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed: ' + url));
    img.src = url;
  });
}

// Preload all sprite frames for an agent
async function preloadSprite(spriteId) {
  if (spriteCache[spriteId]) return spriteCache[spriteId];
  const frames = [];
  for (let f = 1; f <= 3; f++) {
    try {
      const url = SPRITE_BASE + spriteId + '-D-' + f + '.png';
      const img = await loadImage(url);
      frames.push(PIXI.Texture.from(img));
    } catch(e) { /* skip frame */ }
  }
  spriteCache[spriteId] = frames;
  return frames;
}

// Draw tiled floor pattern (Kairosoft style)
function drawTiledFloor(g, x, y, w, h, baseColor, tileSize) {
  tileSize = tileSize || 16;
  const dark = baseColor;
  const light = (baseColor & 0xfefefe) + 0x0a0a0a;
  for (let ty = 0; ty < h; ty += tileSize) {
    for (let tx = 0; tx < w; tx += tileSize) {
      const isAlt = ((tx / tileSize) + (ty / tileSize)) % 2 === 0;
      g.rect(x + tx, y + ty, tileSize, tileSize);
      g.fill({ color: isAlt ? dark : light });
    }
  }
}

// Draw desk with monitor, keyboard, chair
function drawDesk(x, y, w, h, color, isCEO) {
  const desk = new PIXI.Graphics();
  // Desk surface
  desk.rect(x, y, w, h);
  desk.fill({ color: isCEO ? 0x3d2e1a : 0x21262d });
  desk.stroke({ color: color, width: isCEO ? 2 : 1 });
  // Monitor
  const mx = x + w/2 - (isCEO ? 9 : 6);
  const my = y + 3;
  const mw = isCEO ? 18 : 12;
  const mh = isCEO ? 12 : 8;
  desk.rect(mx, my, mw, mh);
  desk.fill({ color: 0x0d1117 });
  desk.stroke({ color: 0x58a6ff, width: 1 });
  // Screen glow
  desk.rect(mx + 2, my + 2, mw - 4, mh - 4);
  desk.fill({ color: 0x1a3a2a });
  // Monitor stand
  desk.rect(mx + mw/2 - 2, my + mh, 4, 3);
  desk.fill({ color: 0x484f58 });
  // Keyboard
  desk.rect(mx + mw/2 - 5, my + mh + 4, 10, 3);
  desk.fill({ color: 0x30363d });
  // Chair (below desk)
  desk.circle(x + w/2, y + h + 8, 5);
  desk.fill({ color: 0x1a1a2e });
  desk.stroke({ color: 0x30363d, width: 1 });
  pixiApp.stage.addChild(desk);
}

// Draw decorative items in rooms
function drawRoomDecor(rx, ry, roomW, roomH, agentColor) {
  const decor = new PIXI.Graphics();
  // Bookshelf on right wall
  decor.rect(rx + roomW - 14, ry + 18, 10, 20);
  decor.fill({ color: 0x2d1810 });
  decor.rect(rx + roomW - 13, ry + 20, 8, 3);
  decor.fill({ color: agentColor });
  decor.rect(rx + roomW - 13, ry + 25, 8, 3);
  decor.fill({ color: 0x58a6ff });
  decor.rect(rx + roomW - 13, ry + 30, 8, 3);
  decor.fill({ color: 0x3fb950 });
  // Plant on left
  decor.circle(rx + 10, ry + roomH - 14, 5);
  decor.fill({ color: 0x2ea043 });
  decor.rect(rx + 8, ry + roomH - 9, 4, 6);
  decor.fill({ color: 0x6e4b2a });
  pixiApp.stage.addChild(decor);
}

// Place agent sprite on canvas with animation frames
async function placeAgent(agent, cx, cy) {
  const frames = await preloadSprite(agent.spriteId);
  if (frames.length > 0) {
    const sprite = new PIXI.Sprite(frames[0]);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = cx;
    sprite.y = cy;
    const scale = agent.isCEO ? 0.06 : 0.04;
    sprite.scale.set(scale, scale);
    pixiApp.stage.addChild(sprite);
    spriteData[agent.id] = { sprite, frames, currentFrame: 0, baseY: cy };
  } else {
    // Fallback: pixel character with more detail
    const fb = new PIXI.Graphics();
    const c = parseInt(agent.labelColor.replace('#',''), 16);
    // Hair
    fb.rect(cx - 5, cy - 14, 10, 3);
    fb.fill({ color: c });
    // Head
    fb.circle(cx, cy - 8, 6);
    fb.fill({ color: 0xf0c8a0 });
    // Eyes
    fb.circle(cx - 2, cy - 9, 1);
    fb.fill({ color: 0x000000 });
    fb.circle(cx + 2, cy - 9, 1);
    fb.fill({ color: 0x000000 });
    // Body
    fb.rect(cx - 4, cy - 2, 8, 10);
    fb.fill({ color: c });
    // Legs
    fb.rect(cx - 4, cy + 8, 3, 5);
    fb.fill({ color: 0x1a1a2e });
    fb.rect(cx + 1, cy + 8, 3, 5);
    fb.fill({ color: 0x1a1a2e });
    pixiApp.stage.addChild(fb);
    spriteData[agent.id] = { sprite: fb, frames: [], currentFrame: 0, baseY: cy };
  }
  // Name tag
  const tag = new PIXI.Text({ text: agent.name, style: { fontFamily: 'monospace', fontSize: 8, fill: '#c9d1d9' }});
  tag.anchor = { x: 0.5, y: 0 };
  tag.x = cx; tag.y = cy + 16;
  pixiApp.stage.addChild(tag);
}

async function initPixelOffice() {
  const container = document.getElementById('pixel-office');
  if (!container) return;
  container.innerHTML = '';

  pixiApp = new PIXI.Application();
  await pixiApp.init({
    width: container.clientWidth,
    height: 380,
    backgroundColor: 0x0d1117,
    antialias: false,
    resolution: 1
  });
  container.appendChild(pixiApp.canvas);

  const W = pixiApp.screen.width;
  const H = pixiApp.screen.height;

  // === CEO Office (top row, full width, gold border, tiled floor) ===
  const ceoFloor = new PIXI.Graphics();
  drawTiledFloor(ceoFloor, 4, 4, W - 8, 100, 0x2a1f4e, 12);
  pixiApp.stage.addChild(ceoFloor);
  const ceoBorder = new PIXI.Graphics();
  ceoBorder.rect(4, 4, W - 8, 100);
  ceoBorder.stroke({ color: 0xe6c04a, width: 2 });
  pixiApp.stage.addChild(ceoBorder);

  // CEO label with gold badge
  const ceoLabel = new PIXI.Text({ text: '\u2605 CEO OFFICE', style: { fontFamily: 'monospace', fontSize: 11, fill: '#e6c04a', fontWeight: 'bold' }});
  ceoLabel.x = 12; ceoLabel.y = 8;
  pixiApp.stage.addChild(ceoLabel);

  // HUD counters top-right
  const hudBg = new PIXI.Graphics();
  hudBg.rect(W - 280, 8, 270, 22);
  hudBg.fill({ color: 0x161b22 });
  hudBg.stroke({ color: 0xe6c04a, width: 1 });
  pixiApp.stage.addChild(hudBg);
  const hudText = new PIXI.Text({ text: 'Staff: 8 | Working: 0 | Tasks: 0', style: { fontFamily: 'monospace', fontSize: 9, fill: '#e6c04a' }});
  hudText.x = W - 275; hudText.y = 12;
  pixiApp.stage.addChild(hudText);
  window._hudText = hudText;

  // CEO desk + agent
  drawDesk(W/2 - 45, 35, 90, 35, 0xe6c04a, true);
  await placeAgent(AGENTS[0], W/2, 60);

  // === Department rooms (2 rows of 4) ===
  const roomW = (W - 28) / 4;
  const roomH = 110;
  const startY1 = 112;
  const startY2 = 230;

  for (let i = 1; i < AGENTS.length; i++) {
    const agent = AGENTS[i];
    const row = i <= 4 ? 0 : 1;
    const col = row === 0 ? (i - 1) : (i - 5);
    const rx = 4 + col * (roomW + 4);
    const ry = row === 0 ? startY1 : startY2;

    // Tiled floor
    const floor = new PIXI.Graphics();
    drawTiledFloor(floor, rx, ry, roomW, roomH, agent.roomColor, 10);
    pixiApp.stage.addChild(floor);

    // Room border
    const border = new PIXI.Graphics();
    border.rect(rx, ry, roomW, roomH);
    border.stroke({ color: 0x30363d, width: 1 });
    pixiApp.stage.addChild(border);

    // Room label
    const label = new PIXI.Text({ text: agent.name + ' - ' + agent.role, style: { fontFamily: 'monospace', fontSize: 9, fill: agent.labelColor }});
    label.x = rx + 6; label.y = ry + 4;
    pixiApp.stage.addChild(label);

    // Status dot
    const dot = new PIXI.Graphics();
    dot.circle(rx + roomW - 12, ry + 10, 5);
    dot.fill({ color: 0x484f58 });
    pixiApp.stage.addChild(dot);
    statusDots[agent.id] = { dot, x: rx + roomW - 12, y: ry + 10 };

    // Room decor (bookshelf + plant)
    const agentC = parseInt(agent.labelColor.replace('#',''), 16);
    drawRoomDecor(rx, ry, roomW, roomH, agentC);

    // Desk
    drawDesk(rx + roomW/2 - 22, ry + 30, 44, 28, agentC, false);

    // Agent sprite
    await placeAgent(agent, rx + roomW/2, ry + 65);
  }

  // Animation loop: sprite frame cycling + idle bob
  pixiApp.ticker.add(() => {
    animFrame++;
    if (animFrame % 15 === 0) {
      Object.values(spriteData).forEach(s => {
        if (s.frames.length > 1) {
          s.currentFrame = (s.currentFrame + 1) % s.frames.length;
          s.sprite.texture = s.frames[s.currentFrame];
        }
      });
    }
    Object.values(spriteData).forEach(s => {
      if (s.sprite) s.sprite.y = s.baseY + Math.sin(animFrame * 0.04) * 0.8;
    });
  });
}

function updateOfficeStatus(data) {
  if (!pixiApp) return;
  let working = 0;
  let tasks = 0;
  AGENTS.forEach(agent => {
    const info = data && data[agent.id];
    const isActive = info && info.status === 'active';
    if (isActive) working++;
    if (info && info.tasks) tasks += info.tasks;
    const dotInfo = statusDots[agent.id];
    if (dotInfo) {
      dotInfo.dot.clear();
      dotInfo.dot.circle(dotInfo.x, dotInfo.y, 5);
      dotInfo.dot.fill({ color: isActive ? 0x3fb950 : 0x484f58 });
      // Pulse effect for active agents
      if (isActive) {
        dotInfo.dot.circle(dotInfo.x, dotInfo.y, 7);
        dotInfo.dot.stroke({ color: 0x3fb950, width: 1 });
      }
    }
    // Tint sprite red if offline
    const sd = spriteData[agent.id];
    if (sd && sd.sprite) {
      if (sd.frames.length > 0) {
        sd.sprite.tint = isActive ? 0xffffff : 0x666666;
      }
    }
  });
  if (window._hudText) {
    window._hudText.text = 'Staff: ' + AGENTS.length + ' | Working: ' + working + ' | Tasks: ' + tasks;
  }
}

window.initPixelOffice = initPixelOffice;
window.updateOfficeStatus = updateOfficeStatus;

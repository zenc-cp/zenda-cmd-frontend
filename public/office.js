// Zenda CMD Pixel Office - Claw Empire Style (S9)
// PixiJS 8 canvas with animated pixel sprites, department rooms, status glow
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
const sprites = {};
const statusDots = {};
let animFrame = 0;

async function initPixelOffice() {
  const container = document.getElementById('pixel-office');
  if (!container) return;
  container.innerHTML = '';

  pixiApp = new PIXI.Application();
  await pixiApp.init({
    width: container.clientWidth,
    height: 340,
    backgroundColor: 0x0d1117,
    antialias: false,
    resolution: 1
  });
  container.appendChild(pixiApp.canvas);

  const W = pixiApp.screen.width;
  const H = pixiApp.screen.height;

  // CEO Office (top row, full width, gold border)
  const ceoRoom = new PIXI.Graphics();
  ceoRoom.rect(4, 4, W - 8, 100);
  ceoRoom.fill({ color: 0x2a1f4e });
  ceoRoom.stroke({ color: 0xe6c04a, width: 2 });
  pixiApp.stage.addChild(ceoRoom);

  // CEO label
  const ceoLabel = new PIXI.Text({ text: 'CEO OFFICE', style: { fontFamily: 'monospace', fontSize: 11, fill: '#e6c04a', fontWeight: 'bold' }});
  ceoLabel.x = 12; ceoLabel.y = 8;
  pixiApp.stage.addChild(ceoLabel);

  // CEO desk (oversized)
  drawDesk(W/2 - 40, 40, 80, 35, 0xe6c04a, true);

  // HUD counters top-right
  const hudBg = new PIXI.Graphics();
  hudBg.rect(W - 260, 8, 250, 22);
  hudBg.fill({ color: 0x161b22 });
  hudBg.stroke({ color: 0x30363d, width: 1 });
  pixiApp.stage.addChild(hudBg);
  const hudText = new PIXI.Text({ text: 'Staff: 8 | Working: 0 | Tasks: 0', style: { fontFamily: 'monospace', fontSize: 9, fill: '#8b949e' }});
  hudText.x = W - 255; hudText.y = 12;
  pixiApp.stage.addChild(hudText);
  window._hudText = hudText;

  // Department rooms (2 rows of 4, below CEO)
  const roomW = (W - 20) / 4;
  const roomH = 100;
  const startY1 = 112;
  const startY2 = 220;

  AGENTS.forEach((agent, i) => {
    if (i === 0) {
      // CEO sprite in CEO room
      loadAgentSprite(agent, W/2, 55);
      return;
    }
    const row = i <= 4 ? 0 : 1;
    const col = row === 0 ? (i - 1) : (i - 5);
    const rx = 4 + col * (roomW + 4);
    const ry = row === 0 ? startY1 : startY2;

    // Room background
    const room = new PIXI.Graphics();
    room.rect(rx, ry, roomW, roomH);
    room.fill({ color: agent.roomColor });
    room.stroke({ color: 0x30363d, width: 1 });
    pixiApp.stage.addChild(room);

    // Room label
    const label = new PIXI.Text({ text: `${agent.name} - ${agent.role}`, style: { fontFamily: 'monospace', fontSize: 9, fill: agent.labelColor }});
    label.x = rx + 6; label.y = ry + 4;
    pixiApp.stage.addChild(label);

    // Desk
    drawDesk(rx + roomW/2 - 20, ry + 35, 40, 25, parseInt(agent.labelColor.replace('#',''), 16));

    // Status dot
    const dot = new PIXI.Graphics();
    dot.circle(rx + roomW - 12, ry + 10, 4);
    dot.fill({ color: 0x484f58 });
    pixiApp.stage.addChild(dot);
    statusDots[agent.id] = { dot, x: rx + roomW - 12, y: ry + 10 };

    // Agent sprite
    loadAgentSprite(agent, rx + roomW/2, ry + 55);
  });

  // Start animation loop
  pixiApp.ticker.add(() => {
    animFrame++;
    Object.values(sprites).forEach(s => {
      if (s.sprite) s.sprite.y += Math.sin(animFrame * 0.05 + s.offset) * 0.15;
    });
  });
}

function drawDesk(x, y, w, h, color, isCEO) {
  const desk = new PIXI.Graphics();
  desk.rect(x, y, w, h);
  desk.fill({ color: 0x21262d });
  desk.stroke({ color: color, width: isCEO ? 2 : 1 });
  pixiApp.stage.addChild(desk);
  // Monitor on desk
  const mx = x + w/2 - 6;
  const my = y + 4;
  const mon = new PIXI.Graphics();
  mon.rect(mx, my, 12, 8);
  mon.fill({ color: 0x0d1117 });
  mon.stroke({ color: 0x58a6ff, width: 1 });
  mon.rect(mx + 4, my + 8, 4, 3);
  mon.fill({ color: 0x484f58 });
  pixiApp.stage.addChild(mon);
}

function loadAgentSprite(agent, cx, cy) {
  const g = new PIXI.Graphics();
  // Head
  g.circle(cx, cy - 8, 6);
  g.fill({ color: parseInt(agent.labelColor.replace('#',''), 16) });
  // Body
  g.rect(cx - 4, cy - 2, 8, 12);
  g.fill({ color: parseInt(agent.labelColor.replace('#',''), 16) });
  // Name tag
  const tag = new PIXI.Text({ text: agent.name, style: { fontFamily: 'monospace', fontSize: 7, fill: '#c9d1d9' }});
  tag.anchor = { x: 0.5, y: 0 };
  tag.x = cx; tag.y = cy + 12;
  pixiApp.stage.addChild(g);
  pixiApp.stage.addChild(tag);
  sprites[agent.id] = { sprite: g, offset: Math.random() * Math.PI * 2 };
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
    const dotData = statusDots[agent.id];
    if (dotData) {
      dotData.dot.clear();
      dotData.dot.circle(dotData.x, dotData.y, 4);
      dotData.dot.fill({ color: isActive ? 0x3fb950 : 0x484f58 });
    }
  });
  if (window._hudText) {
    window._hudText.text = `Staff: ${AGENTS.length} | Working: ${working} | Tasks: ${tasks}`;
  }
}

window.initPixelOffice = initPixelOffice;
window.updateOfficeStatus = updateOfficeStatus;

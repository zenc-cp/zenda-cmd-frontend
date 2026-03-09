// Zenda CMD Pixel Office - PixiJS 8 (Runbook 4)
// Kairosoft-style 14px pixel characters for 8 agent desks

const AGENTS = [
  { id: 'zenda', name: 'Zenda', color: 0x58a6ff, desk: 0 },
  { id: 'scout', name: 'Scout', color: 0x60a5fa, desk: 1 },
  { id: 'scanner', name: 'Scanner', color: 0xf85149, desk: 2 },
  { id: 'reporter', name: 'Reporter', color: 0x3fb950, desk: 3 },
  { id: 'earner', name: 'Earner', color: 0xd29922, desk: 4 },
  { id: 'incident', name: 'Incident', color: 0xf85149, desk: 5 },
  { id: 'messenger', name: 'Messenger', color: 0xbc8cff, desk: 6 },
  { id: 'logger', name: 'Logger', color: 0x8b949e, desk: 7 }
];

let pixiApp = null;
const sprites = {};

async function initPixelOffice() {
  const container = document.getElementById('pixel-office');
  if (!container) return;
  
  pixiApp = new PIXI.Application();
  await pixiApp.init({
    width: container.clientWidth,
    height: 200,
    backgroundColor: 0x1a1e2e,
    antialias: false,
    resolution: 1
  });
  container.appendChild(pixiApp.canvas);

  // Draw desk grid and characters
  const deskWidth = pixiApp.screen.width / 8;
  AGENTS.forEach((agent, i) => {
    // Desk background
    const desk = new PIXI.Graphics();
    desk.rect(i * deskWidth + 4, 80, deskWidth - 8, 60);
    desk.fill({ color: 0x21262d });
    desk.stroke({ color: 0x30363d, width: 1 });
    pixiApp.stage.addChild(desk);

    // Character (simple pixel figure)
    const char = new PIXI.Graphics();
    const cx = i * deskWidth + deskWidth / 2;
    // Head
    char.circle(cx, 50, 6);
    char.fill({ color: agent.color });
    // Body
    char.rect(cx - 4, 56, 8, 12);
    char.fill({ color: agent.color });
    pixiApp.stage.addChild(char);

    // Name label
    const label = new PIXI.Text({
      text: agent.name,
      style: { fontSize: 10, fill: 0xc9d1d9, fontFamily: 'Courier New' }
    });
    label.x = cx - label.width / 2;
    label.y = 150;
    pixiApp.stage.addChild(label);

    // Status indicator
    const status = new PIXI.Graphics();
    status.circle(cx, 170, 3);
    status.fill({ color: 0x8b949e }); // grey = unknown
    pixiApp.stage.addChild(status);
    sprites[agent.id] = { char, status, label, desk };
  });

  // Idle animation
  let tick = 0;
  pixiApp.ticker.add(() => {
    tick++;
    AGENTS.forEach((agent) => {
      const s = sprites[agent.id];
      if (s && s.char) {
        // Gentle bob
        s.char.y = Math.sin(tick * 0.03 + agent.desk) * 1.5;
      }
    });
  });

  // Click handler
  pixiApp.canvas.addEventListener('click', (e) => {
    const rect = pixiApp.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const deskIdx = Math.floor(x / deskWidth);
    if (deskIdx >= 0 && deskIdx < 8) {
      const deskIds = ['zenda','intake','scanner','results','earn','incident','msg','logs'];
      const drawer = document.getElementById('desk-' + deskIds[deskIdx]);
      if (drawer) {
        document.querySelectorAll('.desk-drawer').forEach(d => d.classList.remove('active'));
        drawer.classList.add('active');
        drawer.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}

function updateAgentStatus(agentId, online) {
  const s = sprites[agentId];
  if (!s) return;
  s.status.clear();
  const cx = s.label.x + s.label.width / 2;
  s.status.circle(cx, 170, 3);
  s.status.fill({ color: online ? 0x3fb950 : 0xf85149 });
}

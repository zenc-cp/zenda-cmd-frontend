/* Zenda CMD V2 — PixiJS 8 Office Renderer (Beautified) */
let pixiApp = null;
let roomContainers = [];
let walkerSprite = null;
let walkerDir = 1;
let rocketSprite = null;
let coinAccessory = null;
let sirenAccessory = null;
let animFrame = 0;

/* ── Character Design System ── */
/* Each agent gets a unique look: hair style, body proportions, outfit details */
const AGENT_LOOKS = {
  zenda:    { hair: 'slick',    hat: 'crown',   outfit: 'suit',      glasses: false, scarf: false },
  scout:    { hair: 'spiky',    hat: null,       outfit: 'vest',      glasses: true,  scarf: false },
  scanner:  { hair: 'mohawk',   hat: null,       outfit: 'hoodie',    glasses: false, scarf: false },
  reporter: { hair: 'bob',      hat: null,       outfit: 'shirt',     glasses: true,  scarf: false },
  earner:   { hair: 'topknot',  hat: null,       outfit: 'blazer',    glasses: false, scarf: false },
  incident: { hair: 'buzz',     hat: 'helmet',   outfit: 'armor',     glasses: false, scarf: false },
  messenger:{ hair: 'long',     hat: null,       outfit: 'tee',       glasses: false, scarf: true  },
  logger:   { hair: 'beanie',   hat: 'beanie',   outfit: 'lab',       glasses: true,  scarf: false }
};

function drawPixelCharacter(g, cx, cy, color, agentId) {
  const c = parseInt(color.replace('#', ''), 16);
  const skin = 0xf5c6a0;
  const skinShadow = 0xd4a070;
  const pants = 0x2d333b;
  const shoes = 0x1c2128;
  const look = AGENT_LOOKS[agentId] || AGENT_LOOKS.zenda;

  // ── Hair / Hat ──
  switch (look.hair) {
    case 'slick':
      g.rect(cx - 7, cy - 3, 14, 7); g.fill(0x2a1a0a);
      g.rect(cx - 8, cy + 2, 16, 2); g.fill(0x2a1a0a);
      g.rect(cx - 6, cy - 5, 12, 3); g.fill(0x2a1a0a);
      break;
    case 'spiky':
      g.rect(cx - 7, cy + 0, 14, 4); g.fill(0x3a2a1a);
      // Spikes
      g.rect(cx - 6, cy - 5, 3, 5); g.fill(0x3a2a1a);
      g.rect(cx - 2, cy - 7, 3, 7); g.fill(0x3a2a1a);
      g.rect(cx + 2, cy - 6, 3, 6); g.fill(0x3a2a1a);
      g.rect(cx + 5, cy - 3, 3, 3); g.fill(0x3a2a1a);
      break;
    case 'mohawk':
      g.rect(cx - 7, cy + 0, 14, 4); g.fill(c);
      g.rect(cx - 2, cy - 8, 4, 8); g.fill(c);
      g.rect(cx - 3, cy - 6, 6, 3); g.fill(c);
      break;
    case 'bob':
      g.rect(cx - 8, cy - 3, 16, 8); g.fill(0x5a3020);
      g.rect(cx - 9, cy + 3, 18, 6); g.fill(0x5a3020);
      g.rect(cx - 7, cy - 5, 14, 3); g.fill(0x5a3020);
      break;
    case 'topknot':
      g.rect(cx - 7, cy + 0, 14, 4); g.fill(0x1a1a2e);
      g.rect(cx - 2, cy - 6, 4, 6); g.fill(0x1a1a2e);
      g.circle(cx, cy - 7, 4); g.fill(0x1a1a2e);
      break;
    case 'buzz':
      g.rect(cx - 7, cy - 1, 14, 5); g.fill(0x444444);
      g.rect(cx - 6, cy - 3, 12, 3); g.fill(0x444444);
      break;
    case 'long':
      g.rect(cx - 8, cy - 3, 16, 8); g.fill(0x9b59b6);
      g.rect(cx - 9, cy + 3, 3, 16); g.fill(0x9b59b6);
      g.rect(cx + 6, cy + 3, 3, 16); g.fill(0x9b59b6);
      g.rect(cx - 7, cy - 5, 14, 3); g.fill(0x9b59b6);
      break;
    case 'beanie':
      g.rect(cx - 8, cy - 1, 16, 5); g.fill(0x666666);
      g.rect(cx - 7, cy - 5, 14, 5); g.fill(0x888888);
      g.rect(cx - 6, cy - 7, 12, 3); g.fill(0x888888);
      // Beanie top pom
      g.circle(cx, cy - 8, 3); g.fill(c);
      break;
  }

  // ── Face ──
  g.rect(cx - 6, cy + 4, 12, 10); g.fill(skin);
  // Cheeks
  g.rect(cx - 6, cy + 9, 3, 2); g.fill({ color: 0xff9999, alpha: 0.3 });
  g.rect(cx + 3, cy + 9, 3, 2); g.fill({ color: 0xff9999, alpha: 0.3 });
  // Eyes
  g.rect(cx - 4, cy + 7, 2, 2); g.fill(0x1a1a2e);
  g.rect(cx + 2, cy + 7, 2, 2); g.fill(0x1a1a2e);
  // Eye shine
  g.rect(cx - 4, cy + 7, 1, 1); g.fill(0xffffff);
  g.rect(cx + 2, cy + 7, 1, 1); g.fill(0xffffff);
  // Mouth
  g.rect(cx - 2, cy + 11, 4, 1); g.fill(skinShadow);

  // ── Glasses ──
  if (look.glasses) {
    g.rect(cx - 5, cy + 6, 4, 4); g.stroke({ color: 0xcccccc, width: 0.8 });
    g.rect(cx + 1, cy + 6, 4, 4); g.stroke({ color: 0xcccccc, width: 0.8 });
    g.rect(cx - 1, cy + 7, 2, 1); g.fill(0xcccccc);
    g.rect(cx - 5, cy + 6, 4, 4); g.fill({ color: 0x88bbff, alpha: 0.15 });
    g.rect(cx + 1, cy + 6, 4, 4); g.fill({ color: 0x88bbff, alpha: 0.15 });
  }

  // ── Body / Outfit ──
  const bodyY = cy + 14;
  switch (look.outfit) {
    case 'suit':
      // Suit jacket
      g.rect(cx - 8, bodyY, 16, 12); g.fill(0x2d333b);
      g.rect(cx - 1, bodyY, 2, 12); g.fill({ color: 0x000000, alpha: 0.2 });
      // Lapels
      g.moveTo(cx - 1, bodyY); g.lineTo(cx - 5, bodyY + 6); g.lineTo(cx - 1, bodyY + 6); g.closePath(); g.fill(0x3d444d);
      g.moveTo(cx + 1, bodyY); g.lineTo(cx + 5, bodyY + 6); g.lineTo(cx + 1, bodyY + 6); g.closePath(); g.fill(0x3d444d);
      // Tie
      g.rect(cx - 1, bodyY + 1, 2, 8); g.fill(c);
      g.moveTo(cx - 2, bodyY + 9); g.lineTo(cx, bodyY + 12); g.lineTo(cx + 2, bodyY + 9); g.closePath(); g.fill(c);
      break;
    case 'vest':
      g.rect(cx - 8, bodyY, 16, 12); g.fill(0x60a5fa);
      g.rect(cx - 4, bodyY, 8, 12); g.fill(0xf0f0f0);
      // Vest overlay
      g.rect(cx - 8, bodyY, 4, 12); g.fill({ color: 0x3080d0, alpha: 0.8 });
      g.rect(cx + 4, bodyY, 4, 12); g.fill({ color: 0x3080d0, alpha: 0.8 });
      // Pockets
      g.rect(cx - 7, bodyY + 6, 3, 3); g.stroke({ color: 0x2060a0, width: 0.5 });
      break;
    case 'hoodie':
      g.rect(cx - 8, bodyY, 16, 12); g.fill(c);
      // Hood shadow
      g.rect(cx - 6, bodyY - 2, 12, 4); g.fill({ color: c, alpha: 0.5 });
      // Pocket
      g.rect(cx - 5, bodyY + 6, 10, 4); g.fill({ color: 0x000000, alpha: 0.15 });
      g.rect(cx - 5, bodyY + 6, 10, 4); g.stroke({ color: 0x000000, alpha: 0.1, width: 0.5 });
      // Drawstrings
      g.rect(cx - 2, bodyY, 1, 5); g.fill({ color: 0xffffff, alpha: 0.3 });
      g.rect(cx + 1, bodyY, 1, 5); g.fill({ color: 0xffffff, alpha: 0.3 });
      break;
    case 'shirt':
      g.rect(cx - 8, bodyY, 16, 12); g.fill(0xf0f0f0);
      g.rect(cx - 1, bodyY, 2, 12); g.fill({ color: 0x000000, alpha: 0.08 });
      // Collar
      g.moveTo(cx - 4, bodyY); g.lineTo(cx, bodyY + 3); g.lineTo(cx + 4, bodyY); g.closePath(); g.fill(0xe0e0e0);
      // Green name badge
      g.rect(cx + 2, bodyY + 4, 5, 3); g.fill(0x3fb950);
      break;
    case 'blazer':
      g.rect(cx - 8, bodyY, 16, 12); g.fill(0x8b6f47);
      g.rect(cx - 1, bodyY, 2, 12); g.fill({ color: 0x000000, alpha: 0.15 });
      // Gold buttons
      g.circle(cx, bodyY + 4, 1); g.fill(0xe6c04a);
      g.circle(cx, bodyY + 8, 1); g.fill(0xe6c04a);
      // Pocket square
      g.rect(cx + 3, bodyY + 2, 3, 3); g.fill(c);
      break;
    case 'armor':
      g.rect(cx - 8, bodyY, 16, 12); g.fill(0x555555);
      // Chest plate
      g.rect(cx - 6, bodyY + 1, 12, 8); g.fill(0x666666);
      g.rect(cx - 6, bodyY + 1, 12, 8); g.stroke({ color: 0x777777, width: 0.5 });
      // Red cross
      g.rect(cx - 1, bodyY + 2, 2, 6); g.fill(c);
      g.rect(cx - 3, bodyY + 4, 6, 2); g.fill(c);
      break;
    case 'tee':
      g.rect(cx - 8, bodyY, 16, 12); g.fill(c);
      // Graphic tee design - chat icon
      g.rect(cx - 3, bodyY + 3, 6, 4); g.fill({ color: 0xffffff, alpha: 0.3 });
      g.rect(cx - 1, bodyY + 7, 2, 2); g.fill({ color: 0xffffff, alpha: 0.3 });
      break;
    case 'lab':
      g.rect(cx - 8, bodyY, 16, 12); g.fill(0xeeeeee);
      g.rect(cx - 1, bodyY, 2, 12); g.fill({ color: 0x000000, alpha: 0.05 });
      // Lab coat lapels
      g.rect(cx - 8, bodyY, 4, 12); g.stroke({ color: 0xcccccc, width: 0.5 });
      // ID badge
      g.rect(cx - 7, bodyY + 3, 4, 5); g.fill(0xdddddd);
      g.rect(cx - 7, bodyY + 3, 4, 2); g.fill(c);
      break;
  }

  // ── Arms ──
  const armColor = look.outfit === 'suit' ? 0x2d333b : look.outfit === 'blazer' ? 0x8b6f47 : look.outfit === 'armor' ? 0x555555 : look.outfit === 'lab' ? 0xeeeeee : look.outfit === 'shirt' ? 0xf0f0f0 : c;
  g.rect(cx - 12, bodyY, 4, 10); g.fill(armColor);
  g.rect(cx + 8, bodyY, 4, 10); g.fill(armColor);
  // Hands
  g.rect(cx - 12, bodyY + 10, 4, 3); g.fill(skin);
  g.rect(cx + 8, bodyY + 10, 4, 3); g.fill(skin);

  // ── Scarf ──
  if (look.scarf) {
    g.rect(cx - 7, cy + 13, 14, 3); g.fill(0xe6c04a);
    g.rect(cx - 4, cy + 15, 3, 5); g.fill(0xe6c04a);
  }

  // ── Pants ──
  g.rect(cx - 7, cy + 26, 6, 8); g.fill(pants);
  g.rect(cx + 1, cy + 26, 6, 8); g.fill(pants);
  // Belt
  g.rect(cx - 7, cy + 26, 14, 2); g.fill(0x444444);
  if (look.outfit === 'suit' || look.outfit === 'blazer') {
    g.rect(cx - 1, cy + 26, 2, 2); g.fill(0x888888); // Belt buckle
  }

  // ── Shoes ──
  const shoeColor = look.outfit === 'suit' ? 0x111111 : look.outfit === 'armor' ? 0x444444 : shoes;
  g.rect(cx - 8, cy + 34, 7, 3); g.fill(shoeColor);
  g.rect(cx + 1, cy + 34, 7, 3); g.fill(shoeColor);
  // Shoe detail
  g.rect(cx - 8, cy + 34, 7, 1); g.fill({ color: 0xffffff, alpha: 0.1 });
  g.rect(cx + 1, cy + 34, 7, 1); g.fill({ color: 0xffffff, alpha: 0.1 });
}

/* ── Draw Accessory ── */
function drawAccessory(roomCont, desk, pos, pixi) {
  const { Graphics, TextStyle, Text } = pixi;
  const ax = pos.w / 2 + 30;
  const ay = pos.h - 76;

  switch (desk.accessory) {
    case 'crown': {
      const g = new Graphics();
      // Crown base
      g.rect(ax - 9, ay + 6, 18, 4); g.fill(0xe6c04a);
      // Crown points
      g.moveTo(ax - 9, ay + 6); g.lineTo(ax - 7, ay - 2); g.lineTo(ax - 3, ay + 3);
      g.lineTo(ax, ay - 4); g.lineTo(ax + 3, ay + 3); g.lineTo(ax + 7, ay - 2);
      g.lineTo(ax + 9, ay + 6); g.closePath(); g.fill(0xe6c04a);
      // Gems
      g.circle(ax - 4, ay + 2, 2); g.fill(0xf85149);
      g.circle(ax, ay, 2); g.fill(0x60a5fa);
      g.circle(ax + 4, ay + 2, 2); g.fill(0x3fb950);
      // Crown shine
      g.rect(ax - 8, ay + 6, 16, 1); g.fill({ color: 0xffffff, alpha: 0.3 });
      roomCont.addChild(g);
      break;
    }
    case 'clipboard': {
      const g = new Graphics();
      g.rect(ax - 6, ay, 12, 16); g.fill(0x8b6f47);
      g.rect(ax - 6, ay, 12, 16); g.stroke({ color: 0x6b5030, width: 1 });
      g.rect(ax - 4, ay + 4, 8, 10); g.fill(0xf0f0f0);
      // Lines of text
      g.rect(ax - 3, ay + 6, 6, 1); g.fill(0x888888);
      g.rect(ax - 3, ay + 8, 6, 1); g.fill(0x888888);
      g.rect(ax - 3, ay + 10, 4, 1); g.fill(0x888888);
      // Clip
      g.rect(ax - 3, ay - 2, 6, 4); g.fill(0x777777);
      // Checkmarks
      g.rect(ax + 2, ay + 6, 1, 1); g.fill(0x3fb950);
      g.rect(ax + 2, ay + 8, 1, 1); g.fill(0x3fb950);
      roomCont.addChild(g);
      break;
    }
    case 'magnifier': {
      const g = new Graphics();
      g.circle(ax, ay + 3, 7); g.stroke({ color: 0xdddddd, width: 2 });
      g.circle(ax, ay + 3, 5); g.fill({ color: 0x88bbff, alpha: 0.3 });
      // Lens flare
      g.circle(ax - 2, ay + 1, 1.5); g.fill({ color: 0xffffff, alpha: 0.4 });
      // Handle
      g.moveTo(ax + 5, ay + 8); g.lineTo(ax + 12, ay + 15);
      g.stroke({ color: 0xaaaaaa, width: 2.5 });
      // Handle grip
      g.rect(ax + 10, ay + 13, 4, 2); g.fill(0x8b6f47);
      roomCont.addChild(g);
      break;
    }
    case 'checkmark': {
      const g = new Graphics();
      g.circle(ax, ay + 5, 8); g.fill(0x3fb950);
      g.circle(ax, ay + 5, 8); g.stroke({ color: 0x2ea043, width: 1 });
      g.moveTo(ax - 4, ay + 5); g.lineTo(ax - 1, ay + 9); g.lineTo(ax + 5, ay + 1);
      g.stroke({ color: 0xffffff, width: 2.5 });
      // Shine
      g.circle(ax - 3, ay + 2, 2); g.fill({ color: 0xffffff, alpha: 0.15 });
      roomCont.addChild(g);
      break;
    }
    case 'coin': {
      const g = new Graphics();
      g.circle(0, 0, 8); g.fill(0xe6c04a);
      g.circle(0, 0, 8); g.stroke({ color: 0xd4a017, width: 1.5 });
      g.circle(0, 0, 6); g.stroke({ color: 0xf0d060, width: 0.5 });
      // Inner ring detail
      g.circle(0, 0, 4.5); g.stroke({ color: 0xd4a017, width: 0.3 });
      const ds = new TextStyle({ fontFamily: '"Press Start 2P", monospace', fontSize: 7, fill: 0x8b6f00 });
      const dollar = new Text({ text: '$', style: ds });
      dollar.x = -4; dollar.y = -5;
      g.addChild(dollar);
      g.x = ax; g.y = ay + 5; g._baseY = ay + 5;
      coinAccessory = g;
      roomCont.addChild(g);
      break;
    }
    case 'siren': {
      const g = new Graphics();
      // Base
      g.rect(ax - 6, ay + 7, 12, 5); g.fill(0x555555);
      g.rect(ax - 7, ay + 11, 14, 2); g.fill(0x444444);
      // Light
      g.circle(ax, ay + 3, 6); g.fill(0xf85149);
      // Glow rings
      g.circle(ax, ay + 3, 9); g.fill({ color: 0xf85149, alpha: 0.15 });
      g.circle(ax, ay + 3, 12); g.fill({ color: 0xf85149, alpha: 0.08 });
      // Light shine
      g.circle(ax - 2, ay + 1, 2); g.fill({ color: 0xffffff, alpha: 0.3 });
      sirenAccessory = g;
      roomCont.addChild(g);
      break;
    }
    case 'chat': {
      const g = new Graphics();
      g.roundRect(ax - 9, ay - 2, 18, 14, 3); g.fill(0xbc8cff);
      g.moveTo(ax - 4, ay + 12); g.lineTo(ax - 8, ay + 18); g.lineTo(ax, ay + 12);
      g.closePath(); g.fill(0xbc8cff);
      // Dots
      g.circle(ax - 4, ay + 5, 1.5); g.fill(0xffffff);
      g.circle(ax, ay + 5, 1.5); g.fill(0xffffff);
      g.circle(ax + 4, ay + 5, 1.5); g.fill(0xffffff);
      // Shadow
      g.roundRect(ax - 8, ay + 8, 16, 2, 1); g.fill({ color: 0x000000, alpha: 0.1 });
      roomCont.addChild(g);
      break;
    }
    case 'scroll': {
      const g = new Graphics();
      g.rect(ax - 6, ay + 2, 12, 14); g.fill(0xd4b896);
      g.roundRect(ax - 8, ay, 16, 4, 2); g.fill(0xc4a876);
      g.roundRect(ax - 8, ay + 14, 16, 4, 2); g.fill(0xc4a876);
      // Text lines
      g.rect(ax - 4, ay + 5, 8, 1); g.fill(0x8b6f47);
      g.rect(ax - 4, ay + 7, 8, 1); g.fill(0x8b6f47);
      g.rect(ax - 4, ay + 9, 6, 1); g.fill(0x8b6f47);
      g.rect(ax - 4, ay + 11, 7, 1); g.fill(0x8b6f47);
      // Seal
      g.circle(ax + 3, ay + 12, 2); g.fill(0xf85149);
      roomCont.addChild(g);
      break;
    }
  }
}

/* ── Room furniture helper ── */
function drawRoomFurniture(roomCont, desk, pos, pixi) {
  const { Graphics, TextStyle, Text } = pixi;
  const col = parseInt(desk.color.replace('#', ''), 16);

  // Desk furniture
  const deskGfx = new Graphics();
  const deskW = Math.min(56, pos.w * 0.35);
  const deskH = 14;
  const deskX = pos.w / 2 - deskW / 2;
  const deskY = pos.h - 42;
  deskGfx.rect(deskX, deskY, deskW, deskH); deskGfx.fill(0x5c3d2e);
  deskGfx.rect(deskX + 1, deskY + 1, deskW - 2, 2); deskGfx.fill(0x7a5540);
  deskGfx.rect(deskX + 3, deskY + deskH, 4, 10); deskGfx.fill(0x4a2e1f);
  deskGfx.rect(deskX + deskW - 7, deskY + deskH, 4, 10); deskGfx.fill(0x4a2e1f);
  roomCont.addChild(deskGfx);

  // Monitor
  const monitor = new Graphics();
  const monX = pos.w / 2 - 10;
  const monY = deskY - 14;
  monitor.rect(monX, monY, 20, 14); monitor.fill(0x2d333b);
  monitor.rect(monX + 1, monY + 1, 18, 1); monitor.fill(0x444c56);
  monitor.rect(monX + 2, monY + 3, 16, 9); monitor.fill(col);
  // Animated screen content
  monitor.rect(monX + 4, monY + 5, 8, 1); monitor.fill({ color: 0xffffff, alpha: 0.5 });
  monitor.rect(monX + 4, monY + 7, 6, 1); monitor.fill({ color: 0xffffff, alpha: 0.3 });
  monitor.rect(monX + 4, monY + 9, 10, 1); monitor.fill({ color: 0xffffff, alpha: 0.4 });
  monitor.rect(monX + 7, monY + 14, 6, 2); monitor.fill(0x444c56);
  monitor.rect(monX + 5, monY + 16, 10, 2); monitor.fill(0x3d444d);
  roomCont.addChild(monitor);

  // Coffee mug (small detail)
  const mug = new Graphics();
  const mugX = deskX + deskW - 10;
  const mugY = deskY - 6;
  mug.rect(mugX, mugY, 6, 6); mug.fill(0xeeeeee);
  mug.rect(mugX + 6, mugY + 1, 2, 3); mug.stroke({ color: 0xeeeeee, width: 1 });
  // Coffee inside
  mug.rect(mugX + 1, mugY + 1, 4, 3); mug.fill(0x6b3a1f);
  // Steam
  mug.rect(mugX + 1, mugY - 3, 1, 2); mug.fill({ color: 0xffffff, alpha: 0.2 });
  mug.rect(mugX + 3, mugY - 4, 1, 2); mug.fill({ color: 0xffffff, alpha: 0.15 });
  roomCont.addChild(mug);

  // Server rack
  const rack = new Graphics();
  const rackX = pos.w - 26;
  const rackY = pos.h - 40;
  rack.rect(rackX, rackY, 14, 28); rack.fill(0x2d333b);
  rack.rect(rackX, rackY, 14, 28); rack.stroke({ color: 0x444c56, width: 1 });
  for (let j = 0; j < 4; j++) {
    rack.rect(rackX + 2, rackY + 3 + j * 7, 10, 5); rack.fill(0x1c2128);
    rack.circle(rackX + 4, rackY + 5.5 + j * 7, 1.5);
    rack.fill(j % 3 === 0 ? 0x3fb950 : (j % 3 === 1 ? 0x60a5fa : 0xe6c04a));
  }
  roomCont.addChild(rack);

  // Plant
  const plant = new Graphics();
  const plantX = 8;
  const plantY = pos.h - 26;
  plant.rect(plantX, plantY + 6, 12, 10); plant.fill(0xa0522d);
  plant.rect(plantX - 1, plantY + 5, 14, 3); plant.fill(0xb5651d);
  plant.circle(plantX + 6, plantY, 5); plant.fill(0x2ea043);
  plant.circle(plantX + 2, plantY - 3, 4); plant.fill(0x3fb950);
  plant.circle(plantX + 10, plantY - 3, 4); plant.fill(0x238636);
  plant.circle(plantX + 6, plantY - 5, 3); plant.fill(0x3fb950);
  roomCont.addChild(plant);

  // Chair
  const chair = new Graphics();
  const chairX = pos.w / 2 - 8;
  const chairY = pos.h - 20;
  chair.rect(chairX, chairY, 16, 4); chair.fill(0x444c56);
  chair.rect(chairX + 2, chairY - 10, 12, 10); chair.fill(0x555e68);
  chair.rect(chairX + 2, chairY - 10, 12, 10); chair.stroke({ color: 0x3d444d, width: 1 });
  chair.circle(chairX + 3, chairY + 6, 2); chair.fill(0x2d333b);
  chair.circle(chairX + 13, chairY + 6, 2); chair.fill(0x2d333b);
  roomCont.addChild(chair);
}

async function initPixiOffice() {
  const container = document.getElementById('pixi-container');
  if (!container) return;

  const { Application, Container, Graphics, Text, TextStyle, Sprite, Texture, Assets } = await import('https://cdn.jsdelivr.net/npm/pixi.js@8.9.2/dist/pixi.min.mjs');
  window._PIXI = { Container, Graphics, Text, TextStyle, Sprite, Texture, Assets };

  const cw = container.clientWidth;
  const ch = container.clientHeight;

  const app = new Application();
  await app.init({ width: cw, height: ch, backgroundColor: 0x0a0e14, antialias: false, resolution: 1, autoDensity: true });
  container.appendChild(app.canvas);
  app.canvas.style.imageRendering = 'pixelated';
  pixiApp = app;

  const desks = window.DESKS;
  const padding = 6;
  const cols4 = 4;
  const cols3 = 3;
  const roomW = Math.floor((cw - padding * 5) / cols4);
  const totalH = ch - 4;
  const topRowH = Math.floor((totalH - padding * 4) / 3);
  const roomH = topRowH;

  const ceoW = roomW * 1.6;
  const ceoX = (cw - ceoW) / 2;
  const ceoY = padding;
  const row2Y = ceoY + roomH + padding;
  const row3Y = row2Y + roomH + padding;
  const roomW3 = Math.floor((cw - padding * 4) / cols3);

  // Checkered floor
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
    bg.rect(0, 0, pos.w, pos.h); bg.fill({ color: col, alpha: 0.10 });
    bg.rect(0, 0, pos.w, pos.h); bg.stroke({ color: col, alpha: 0.6, width: pos.isCeo ? 3 : 2 });
    roomCont.addChild(bg);

    if (pos.isCeo) {
      const goldBorder = new Graphics();
      goldBorder.rect(-2, -2, pos.w + 4, pos.h + 4);
      goldBorder.stroke({ color: 0xe6c04a, width: 3, alpha: 0.7 });
      roomCont.addChild(goldBorder);
    }

    // Room floor tiles
    const roomFloor = new Graphics();
    const floorY = pos.h * 0.55;
    for (let fx = 8; fx < pos.w - 8; fx += 8) {
      for (let fy = floorY; fy < pos.h - 4; fy += 8) {
        const isDark = ((fx / 8) + (fy / 8)) % 2 === 0;
        roomFloor.rect(fx, fy, 8, 8); roomFloor.fill({ color: isDark ? 0x1a1f28 : 0x161b22, alpha: 0.6 });
      }
    }
    roomCont.addChild(roomFloor);

    // Room title
    const titleStyle = new TextStyle({ fontFamily: '"Press Start 2P", monospace', fontSize: pos.isCeo ? 9 : 7, fill: desk.color, align: 'center' });
    const title = new Text({ text: desk.dept, style: titleStyle });
    title.x = 8; title.y = 6;
    roomCont.addChild(title);

    // Role subtitle
    const roleStyle = new TextStyle({ fontFamily: '"Press Start 2P", monospace', fontSize: 5, fill: 0x8b949e });
    const role = new Text({ text: desk.role, style: roleStyle });
    role.x = 8; role.y = 18;
    roomCont.addChild(role);

    // Furniture
    drawRoomFurniture(roomCont, desk, pos, { Graphics, TextStyle, Text });

    // Character — unique per agent
    const charGfx = new Graphics();
    const charX = pos.w / 2;
    const charY = pos.h - 80;
    drawPixelCharacter(charGfx, charX, charY, desk.color, desk.id);
    roomCont.addChild(charGfx);

    // Status dot with glow
    const statusDot = new Graphics();
    const statusColor = i < 5 ? 0x3fb950 : (i === 5 ? 0xd29922 : 0x3fb950);
    statusDot.circle(pos.w - 14, 12, 5); statusDot.fill({ color: statusColor, alpha: 0.3 });
    statusDot.circle(pos.w - 14, 12, 3); statusDot.fill(statusColor);
    roomCont.addChild(statusDot);
    roomCont._statusDot = statusDot;

    // Accessory
    drawAccessory(roomCont, desk, pos, { Graphics, TextStyle, Text });

    app.stage.addChild(roomCont);
    roomContainers.push({ container: roomCont, desk, pos });
  });

  // Walker sprite (CEO patrol)
  const walkerCont = new Container();
  const walkerGfx = new Graphics();
  drawPixelCharacter(walkerGfx, 0, 0, '#e6c04a', 'zenda');
  walkerGfx.x = 40;
  walkerGfx.y = ch - 52;
  walkerCont.addChild(walkerGfx);
  app.stage.addChild(walkerCont);
  walkerSprite = walkerGfx;

  // Rocket
  const rocketCont = new Container();
  rocketCont.x = cw / 2 - 12;
  rocketCont.y = ch - 50;
  rocketCont.eventMode = 'static';
  rocketCont.cursor = 'pointer';
  rocketCont.on('pointerdown', () => { showRocketPopup(); });

  const rocket = new Graphics();
  rocket.rect(4, 8, 16, 22); rocket.fill(0xd0d0d0);
  rocket.rect(6, 10, 12, 18); rocket.fill(0xe0e0e0);
  rocket.moveTo(12, 0); rocket.lineTo(20, 8); rocket.lineTo(4, 8); rocket.closePath(); rocket.fill(0xf85149);
  rocket.circle(12, 18, 4); rocket.fill(0x0d1117);
  rocket.circle(12, 18, 3); rocket.fill(0x60a5fa);
  rocket.moveTo(4, 26); rocket.lineTo(-2, 34); rocket.lineTo(4, 30); rocket.closePath(); rocket.fill(0xf85149);
  rocket.moveTo(20, 26); rocket.lineTo(26, 34); rocket.lineTo(20, 30); rocket.closePath(); rocket.fill(0xf85149);
  rocket.moveTo(6, 30); rocket.lineTo(12, 42); rocket.lineTo(18, 30); rocket.closePath(); rocket.fill(0xe6c04a);
  rocket.moveTo(8, 30); rocket.lineTo(12, 38); rocket.lineTo(16, 30); rocket.closePath(); rocket.fill(0xf08030);
  rocketCont.addChild(rocket);

  const rocketLabel = new Text({
    text: 'MISSION CTRL',
    style: new TextStyle({ fontFamily: '"Press Start 2P", monospace', fontSize: 5, fill: 0x8b949e, align: 'center' })
  });
  rocketLabel.x = -16; rocketLabel.y = 44;
  rocketCont.addChild(rocketLabel);
  app.stage.addChild(rocketCont);
  rocketSprite = rocketCont;

  // CRT scanline overlay
  const scanlines = new Graphics();
  for (let y = 0; y < ch; y += 3) {
    scanlines.rect(0, y, cw, 1); scanlines.fill({ color: 0x000000, alpha: 0.05 });
  }
  scanlines.alpha = 0.5;
  app.stage.addChild(scanlines);

  // Animation loop
  app.ticker.add(() => {
    animFrame++;
    if (walkerSprite) {
      walkerSprite.x += walkerDir * 0.4;
      if (walkerSprite.x > cw - 60) walkerDir = -1;
      if (walkerSprite.x < 40) walkerDir = 1;
    }
    if (coinAccessory) { coinAccessory.y = coinAccessory._baseY + Math.sin(animFrame * 0.06) * 3; }
    if (sirenAccessory) { sirenAccessory.alpha = 0.5 + Math.sin(animFrame * 0.1) * 0.5; }
    if (rocketSprite) { rocketSprite.children[0].alpha = 0.9 + Math.sin(animFrame * 0.15) * 0.1; }
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
      dot.circle(pos.w - 14, 12, 5); dot.fill({ color: color, alpha: 0.3 });
      dot.circle(pos.w - 14, 12, 3); dot.fill(color);
    }
  }
}

window.PixiOffice = {
  init: initPixiOffice,
  updateRoomStatus
};

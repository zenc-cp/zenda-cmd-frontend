/* Zenda CMD V2 — Runtime Configuration */
window.ZENDA_CONFIG = {
  API_BASE: '',
  API_KEY: 'zenda-cmd-key-2026',
  WS_URL: '',  // Auto-detect: uses wss://<current-host>/ws via Render proxy
  VERSION: 'v2.0-pixeloffice',
  SPRITE_BASE: 'https://raw.githubusercontent.com/GreenSheep01201/claw-empire/main/public/sprites/',
  DESKS: null // populated below
};

window.DESKS = [
  { id: 'zenda',     spriteId: 1, role: 'CEO / Commander',  color: '#e6c04a', dept: 'ZENDA',   endpoint: '/api/agents/health',     accessory: 'crown',     letter: 'Z' },
  { id: 'scout',     spriteId: 2, role: 'Intake & Triage',  color: '#60a5fa', dept: 'INTAKE',   endpoint: '/api/audit/queue',       accessory: 'clipboard', letter: 'S' },
  { id: 'scanner',   spriteId: 3, role: 'Security Scan',    color: '#f85149', dept: 'SCANNER',  endpoint: '/api/scan/latest',       accessory: 'magnifier', letter: 'S' },
  { id: 'reporter',  spriteId: 4, role: 'Results',          color: '#3fb950', dept: 'RESULTS',  endpoint: '/api/scan/latest',       accessory: 'checkmark', letter: 'R' },
  { id: 'earner',    spriteId: 5, role: 'Revenue',          color: '#d29922', dept: 'EARN',     endpoint: '/api/zenda/earnings',    accessory: 'coin',      letter: 'E' },
  { id: 'incident',  spriteId: 6, role: 'Response',         color: '#f85149', dept: 'INCIDENT', endpoint: '/api/zenda/incidents',   accessory: 'siren',     letter: 'I' },
  { id: 'messenger', spriteId: 7, role: 'Comms',            color: '#bc8cff', dept: 'MSG',      endpoint: '/api/messenger/status',  accessory: 'chat',      letter: 'M' },
  { id: 'logger',    spriteId: 8, role: 'System Logs',      color: '#8b949e', dept: 'LOGS',     endpoint: '/api/logs/system',       accessory: 'scroll',    letter: 'L' }
];

window.AGENT_ACTIONS = {
  zenda:     [{ label: 'System Health', endpoint: '/api/agents/health' },    { label: 'Restart Services', endpoint: '/api/agents/restart', method: 'POST' }],
  scout:     [{ label: 'View Queue',    endpoint: '/api/audit/queue' },      { label: 'New Intake',       endpoint: '/api/audit/intake', method: 'POST' }],
  scanner:   [{ label: 'Run Scan',      endpoint: '/api/scan/run', method: 'POST' }, { label: 'View Config', endpoint: '/api/scan/config' }],
  reporter:  [{ label: 'Generate Report', endpoint: '/api/report/generate', method: 'POST' }, { label: 'Send Report', endpoint: '/api/report/send', method: 'POST' }],
  earner:    [{ label: 'New Stream',    endpoint: '/api/zenda/earnings/new', method: 'POST' }, { label: 'View Payouts', endpoint: '/api/zenda/earnings' }],
  incident:  [{ label: 'Resolve All',   endpoint: '/api/zenda/incidents/resolve', method: 'POST' }, { label: 'View Incidents', endpoint: '/api/zenda/incidents' }],
  messenger: [{ label: 'Send Message',  endpoint: '/api/messenger/send', method: 'POST' }, { label: 'View Status', endpoint: '/api/messenger/status' }],
  logger:    [{ label: 'Recent Logs',   endpoint: '/api/logs/system' },    { label: 'Rotate Logs',     endpoint: '/api/logs/rotate', method: 'POST' }]
};

// Wire DESKS into ZENDA_CONFIG
window.ZENDA_CONFIG.DESKS = window.DESKS;

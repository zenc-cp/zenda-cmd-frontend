// Zenda CMD API Client - Runbook 3
const API = window.ZENDA_CONFIG.API_BASE;
const KEY = window.ZENDA_CONFIG.API_KEY;

async function zendaFetch(path) {
  try {
    const res = await fetch(API + path, {
      headers: { 'X-Zenda-Key': KEY }
    });
    if (!res.ok) throw new Error('API ' + res.status);
    return res.json();
  } catch (e) {
    console.error('API Error:', path, e);
    return { error: e.message, offline: true };
  }
}

// Desk data fetchers
const getAgentStatus = () => zendaFetch('/api/agents/health');
const getAuditQueue = () => zendaFetch('/api/audit/queue');
const getEarnings = () => zendaFetch('/api/zenda/earnings');
const getScanResults = () => zendaFetch('/api/scan/latest');
const getIncidents = () => zendaFetch('/api/zenda/incidents');
const getMemoryStatus = () => zendaFetch('/api/zenda/memory/status');
const getSystemStatus = () => zendaFetch('/api/agents/health');
const getMessengerStatus = () => zendaFetch('/api/messenger/status');
const getLoggerStatus = () => zendaFetch('/api/logs/system');

// WebSocket for live status
let ws = null;
function connectWS(onMessage) {
  const wsUrl = window.ZENDA_CONFIG.WS_URL || ((location.protocol==='https:' ? 'wss://' : 'ws://') + location.host + '/ws');
  ws = new WebSocket(wsUrl);
  ws.onopen = () => {
    document.getElementById('ws-status').className = 'status-dot online';
    document.getElementById('status-text').textContent = 'Connected';
  };
  ws.onmessage = (e) => { if (onMessage) onMessage(JSON.parse(e.data)); };
  ws.onclose = () => {
    document.getElementById('ws-status').className = 'status-dot offline';
    document.getElementById('status-text').textContent = 'Disconnected';
    setTimeout(() => connectWS(onMessage), 5000);
  };
  ws.onerror = () => {
    document.getElementById('ws-status').className = 'status-dot offline';
    document.getElementById('status-text').textContent = 'Error';
  };
}

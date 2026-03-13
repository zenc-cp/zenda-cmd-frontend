/* Zenda CMD V2 — API & WebSocket */
(function () {
  const cfg = () => window.ZENDA_CONFIG;

  /* ── HTTP helpers ── */
  async function apiFetch(endpoint, method = 'GET', body = null) {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Zenda-Key': cfg().API_KEY
      }
    };
    if (body) opts.body = JSON.stringify(body);
    try {
      const res = await fetch(cfg().API_BASE + endpoint, opts);
      return await res.json();
    } catch (e) {
      return { error: e.message, _offline: true };
    }
  }

  /* ── WebSocket ── */
  let ws = null;
  let wsReconnectTimer = null;
  const wsListeners = [];

  function onWsMessage(fn) { wsListeners.push(fn); }

  function connectWs() {
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) return;
    try {
      const wsUrl = cfg().WS_URL || `wss://${location.host}/ws`;
      ws = new WebSocket(wsUrl);
    } catch (e) {
      setConnectionStatus('offline');
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      setConnectionStatus('connected');
      if (wsReconnectTimer) { clearTimeout(wsReconnectTimer); wsReconnectTimer = null; }
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        wsListeners.forEach(fn => fn(data));
      } catch (_) { /* ignore non-JSON */ }
    };

    ws.onerror = () => {
      setConnectionStatus('offline');
    };

    ws.onclose = () => {
      setConnectionStatus('offline');
      scheduleReconnect();
    };
  }

  function scheduleReconnect() {
    if (wsReconnectTimer) return;
    wsReconnectTimer = setTimeout(() => {
      wsReconnectTimer = null;
      connectWs();
    }, 5000);
  }

  function setConnectionStatus(status) {
    const dot = document.getElementById('conn-dot');
    const label = document.getElementById('conn-label');
    if (!dot || !label) return;
    if (status === 'connected') {
      dot.className = 'conn-dot connected';
      label.textContent = 'Connected';
    } else {
      dot.className = 'conn-dot offline';
      label.textContent = 'Connecting...';
    }
  }

  /* ── Mock data for demo ── */
  function getMockAgents() {
    return window.DESKS.map((d, i) => ({
      id: d.id,
      name: d.id.toUpperCase(),
      role: d.role,
      dept: d.dept,
      color: d.color,
      status: i < 5 ? 'connected' : (i === 5 ? 'not_wired' : 'connected'),
      port: 8000 + i,
      latency: Math.floor(Math.random() * 80) + 10 + 'ms',
      lastAction: getRandomAction(d.id),
      letter: d.letter
    }));
  }

  function getRandomAction(id) {
    const actions = {
      zenda: 'Health check OK',
      scout: 'Triaged 3 items',
      scanner: 'Scan completed',
      reporter: 'Report sent',
      earner: 'Revenue updated',
      incident: 'No incidents',
      messenger: 'Message delivered',
      logger: 'Logs rotated'
    };
    return actions[id] || 'Idle';
  }

  function getMockRevenue() {
    return {
      streams: [
        { name: 'Discord Bot',  status: 'active',  monthly: 420 },
        { name: 'Newsletter',   status: 'active',  monthly: 280 },
        { name: 'Fiverr',       status: 'active',  monthly: 650 },
        { name: 'HF Spaces',    status: 'paused',  monthly: 180 },
        { name: 'Bounty Farm',  status: 'active',  monthly: 340 }
      ],
      total: 1870,
      target: 3000
    };
  }

  function getMockLogs() {
    const types = ['info', 'warn', 'error', 'success'];
    const msgs = [
      { type: 'info',    msg: '[SCOUT] Intake queue polled — 3 new items' },
      { type: 'success', msg: '[SCANNER] Scan #4821 completed — no critical findings' },
      { type: 'warn',    msg: '[EARNER] Fiverr API rate limit approaching (80%)' },
      { type: 'info',    msg: '[MESSENGER] WhatsApp session refreshed' },
      { type: 'error',   msg: '[INCIDENT] Failed to reach HF Spaces endpoint' },
      { type: 'success', msg: '[REPORTER] Daily report generated and sent' },
      { type: 'info',    msg: '[LOGGER] Log rotation scheduled for 03:00 HKT' },
      { type: 'warn',    msg: '[ZENDA] CPU usage at 72% — monitoring' },
      { type: 'info',    msg: '[SCOUT] Exa crawl completed — 12 results' },
      { type: 'success', msg: '[EARNER] Discord bot subscription renewed ($35)' },
      { type: 'info',    msg: '[SCANNER] Config updated — deep scan enabled' },
      { type: 'error',   msg: '[MESSENGER] WhatsApp delivery failed — retry queued' },
      { type: 'info',    msg: '[ZENDA] All agents reporting healthy' },
      { type: 'warn',    msg: '[LOGGER] Disk usage at 68% — cleanup recommended' },
      { type: 'success', msg: '[INCIDENT] Incident #302 auto-resolved' }
    ];
    return msgs;
  }

  function getMockSystemInfo() {
    return {
      vm: {
        ip: '34.150.104.118',
        model: 'e2-medium',
        provider: 'GCP',
        ram: '4 GB',
        disk: '50 GB SSD'
      },
      metrics: {
        ram: { used: 2.8, total: 4, pct: 70 },
        disk: { used: 34, total: 50, pct: 68 },
        cpu: { pct: 45 },
        services: { up: 6, total: 8 }
      },
      services: [
        { name: 'zenda-core',    status: 'running', port: 8000 },
        { name: 'scout-intake',  status: 'running', port: 8001 },
        { name: 'scanner-srv',   status: 'running', port: 8002 },
        { name: 'reporter-srv',  status: 'running', port: 8003 },
        { name: 'earner-srv',    status: 'running', port: 8004 },
        { name: 'incident-srv',  status: 'stopped', port: 8005 },
        { name: 'messenger-srv', status: 'running', port: 8006 },
        { name: 'logger-srv',    status: 'stopped', port: 8007 }
      ]
    };
  }

  /* ── Export ── */
  window.ZendaAPI = {
    fetch: apiFetch,
    apiFetch,
    connectWs,
    onWsMessage,
    getMockAgents,
    getMockRevenue,
    getMockLogs,
    getMockSystemInfo,
    setConnectionStatus
  };
})();

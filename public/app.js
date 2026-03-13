/* Zenda CMD V2 — Application Controller */
(function () {
  let currentTab = 'office';
  let clockInterval = null;
  let refreshInterval = null;

  /* ── Tab Switching ── */
  function switchTab(tabId) {
    currentTab = tabId;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId + '-panel');
    });

    // Load tab data
    switch (tabId) {
      case 'agents':  renderAgents(); break;
      case 'revenue': renderRevenue(); break;
      case 'logs':    renderLogs(); break;
      case 'config':  renderConfig(); break;
    }
  }

  /* ── Agents Tab ── */
  async function renderAgents() {
    const panel = document.getElementById('agents-panel');
    const desks = window.ZENDA_CONFIG.DESKS;
    // Try real API per desk, fall back to mock
    const agents = [];
    for (const desk of desks) {
      try {
        const data = await window.ZendaAPI.apiFetch(desk.endpoint);
        const status = data._offline ? 'offline' : (data.status === 'connected' || data.status === 'ok' || data.status === 'healthy') ? 'connected' : data.status === 'not_wired' ? 'not_wired' : 'offline';
        agents.push({ id: desk.id, name: desk.id.toUpperCase(), role: desk.role, color: desk.color, status, port: desk.endpoint, latency: data.uptime ? Math.round(data.uptime) + 's' : '—', lastAction: data.message || data.status || '—' });
      } catch (_) {
        agents.push({ id: desk.id, name: desk.id.toUpperCase(), role: desk.role, color: desk.color, status: 'offline', port: '—', latency: '—', lastAction: '—' });
      }
    }
    if (!agents.length) { const mock = window.ZendaAPI.getMockAgents(); agents.push(...mock); }
    panel.innerHTML = agents.map(a => `
      <div class="agent-card" style="border-top: 3px solid ${a.color};">
        <div class="agent-card-name" style="color: ${a.color};">${a.name}</div>
        <div class="agent-card-role">${a.role}</div>
        <div class="agent-card-status ${a.status}">${a.status.replace('_', ' ').toUpperCase()}</div>
        <div class="agent-card-meta">
          <span>Port: ${a.port}</span>
          <span>Latency: ${a.latency}</span>
          <span>Last: ${a.lastAction}</span>
        </div>
      </div>
    `).join('');
  }

  /* ── Revenue Tab ── */
  function renderRevenue() {
    const panel = document.getElementById('revenue-panel');
    const data = window.ZendaAPI.getMockRevenue();
    panel.innerHTML = `
      <table class="revenue-table">
        <thead>
          <tr>
            <th>Stream</th>
            <th>Status</th>
            <th>Monthly</th>
          </tr>
        </thead>
        <tbody>
          ${data.streams.map(s => `
            <tr>
              <td>${s.name}</td>
              <td class="status-${s.status}">${s.status.toUpperCase()}</td>
              <td>$${s.monthly}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="revenue-total-row">
        <span class="revenue-total-label">TOTAL MONTHLY</span>
        <span class="revenue-total-amount">$${data.total}</span>
      </div>
      <div style="margin-top: 12px;">
        <div style="font-size: 7px; color: var(--text-dim); margin-bottom: 4px;">
          Progress to $${data.target.toLocaleString()} target
        </div>
        <div class="revenue-bar-outer">
          <div class="revenue-bar-inner" style="width: ${(data.total / data.target * 100).toFixed(1)}%;"></div>
        </div>
        <div style="font-size: 6px; color: var(--accent-gold); margin-top: 4px; text-align: right;">
          ${(data.total / data.target * 100).toFixed(1)}%
        </div>
      </div>
    `;
  }

  /* ── Logs Tab ── */
  function renderLogs() {
    const panel = document.getElementById('logs-panel');
    const logs = window.ZendaAPI.getMockLogs();
    const now = new Date();
    panel.innerHTML = `
      <div class="log-feed">
        ${logs.map((l, i) => {
          const t = new Date(now - (logs.length - i) * 120000);
          const ts = t.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Hong_Kong' });
          return `<div class="log-entry">
            <span class="log-time">${ts}</span>
            <span class="log-msg ${l.type}">${l.msg}</span>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  /* ── Config Tab ── */
  function renderConfig() {
    const panel = document.getElementById('config-panel');
    const data = window.ZendaAPI.getMockSystemInfo();
    panel.innerHTML = `
      <div class="config-section">
        <div class="config-section-title">VM INFORMATION</div>
        <div class="config-row"><span class="config-key">IP Address</span><span class="config-val">${data.vm.ip}</span></div>
        <div class="config-row"><span class="config-key">Model</span><span class="config-val">${data.vm.model}</span></div>
        <div class="config-row"><span class="config-key">Provider</span><span class="config-val">${data.vm.provider}</span></div>
        <div class="config-row"><span class="config-key">RAM</span><span class="config-val">${data.vm.ram}</span></div>
        <div class="config-row"><span class="config-key">Disk</span><span class="config-val">${data.vm.disk}</span></div>
      </div>
      <div class="config-section">
        <div class="config-section-title">SERVICES</div>
        ${data.services.map(s => `
          <div class="service-row">
            <span>${s.name} <span style="color: var(--text-dim);">:${s.port}</span></span>
            <span class="service-status ${s.status}">${s.status.toUpperCase()}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ── Sidebar Clock ── */
  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour12: false,
      timeZone: 'Asia/Hong_Kong',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const date = now.toLocaleDateString('en-US', {
      timeZone: 'Asia/Hong_Kong',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    if (timeEl) timeEl.textContent = time;
    if (dateEl) dateEl.textContent = date;
  }

  /* ── Sidebar Metrics ── */
  async function updateSidebarMetrics() {
    let data;
    try {
      const health = await window.ZendaAPI.apiFetch('/api/agents/health');
      if (health && !health._offline && !health.error) {
        data = { metrics: { ram: { used: parseFloat(health.ram) || 2.8, total: 4, pct: (parseFloat(health.ram) || 2.8) / 4 * 100 }, disk: { used: parseFloat(health.disk) || 34, total: 50, pct: (parseFloat(health.disk) || 34) / 50 * 100 }, cpu: { pct: parseFloat(health.cpu) || 45 }, services: { up: health.services_count || 6, total: 8 } } };
      }
    } catch (_) {}
    if (!data) data = window.ZendaAPI.getMockSystemInfo();
    const m = data.metrics;

    setMetric('ram', `${m.ram.used}/${m.ram.total} GB`, m.ram.pct);
    setMetric('disk', `${m.disk.used}/${m.disk.total} GB`, m.disk.pct);
    setMetric('cpu', `${m.cpu.pct}%`, m.cpu.pct);
    setMetric('services', `${m.services.up}/${m.services.total}`, (m.services.up / m.services.total) * 100);
  }

  function setMetric(id, valueText, pct) {
    const valEl = document.getElementById(`metric-${id}-val`);
    const barEl = document.getElementById(`metric-${id}-bar`);
    if (valEl) valEl.textContent = valueText;
    if (barEl) {
      barEl.style.width = pct + '%';
      barEl.className = 'metric-bar-inner';
      if (pct > 80) barEl.classList.add('danger');
      else if (pct > 60) barEl.classList.add('warn');
    }
  }

  /* ── Sidebar Revenue ── */
  async function updateSidebarRevenue() {
    let data;
    try {
      const earnings = await window.ZendaAPI.apiFetch('/api/zenda/earnings');
      if (earnings && !earnings._offline && !earnings.error) {
        data = { total: earnings.total || earnings.monthly || earnings.earnings || 0, target: 3000, streams: [] };
      }
    } catch (_) {}
    if (!data) data = window.ZendaAPI.getMockRevenue();
    const amountEl = document.getElementById('sidebar-revenue-amount');
    const barEl = document.getElementById('sidebar-revenue-bar');
    const targetEl = document.getElementById('sidebar-revenue-target');
    if (amountEl) amountEl.textContent = '$' + data.total.toLocaleString();
    if (targetEl) targetEl.textContent = `/ $${data.target.toLocaleString()} target`;
    if (barEl) barEl.style.width = (data.total / data.target * 100).toFixed(1) + '%';
  }

  /* ── Sidebar Agent Dots ── */
  async function updateAgentDots() {
    const desks = window.ZENDA_CONFIG.DESKS;
    for (const desk of desks) {
      try {
        const d = await window.ZendaAPI.apiFetch(desk.endpoint);
        const s = d._offline ? 'offline' : (d.status === 'connected' || d.status === 'ok' || d.status === 'healthy') ? 'connected' : d.status === 'not_wired' ? 'not_wired' : 'offline';
        const dot = document.getElementById(`dot-${desk.id}`);
        if (dot) { dot.className = 'agent-dot'; dot.classList.add(s === 'connected' ? 'green' : s === 'not_wired' ? 'yellow' : 'red'); }
      } catch (_) {
        const dot = document.getElementById(`dot-${desk.id}`);
        if (dot) { dot.className = 'agent-dot red'; }
      }
    }
    /* legacy mock path */
    if (false) {
    const agents = window.ZendaAPI.getMockAgents();
    agents.forEach(a => {
      const dot = document.getElementById(`dot-${a.id}`);
      if (dot) {
        dot.className = 'agent-dot';
        if (a.status === 'connected') dot.classList.add('green');
        else if (a.status === 'offline') dot.classList.add('red');
        else dot.classList.add('yellow');
      }
    });
  }

  }

  /* ── Modal ── */
  async function openModal(desk) {
    let agent = {};
    try {
      const d = await window.ZendaAPI.apiFetch(desk.endpoint);
      const s = d._offline ? 'offline' : (d.status === 'connected' || d.status === 'ok' || d.status === 'healthy') ? 'connected' : d.status === 'not_wired' ? 'not_wired' : 'offline';
      agent = { id: desk.id, status: s };
    } catch (_) {
      agent = { id: desk.id, status: 'offline' };
    }
    const actions = window.AGENT_ACTIONS[desk.id] || [];

    const overlay = document.getElementById('modal-overlay');
    const box = overlay.querySelector('.modal-box');
    const statusClass = agent.status || 'connected';

    box.innerHTML = `
      <button class="modal-close" onclick="window.ZendaApp.closeModal()">X</button>
      <div class="modal-agent-name" style="color: ${desk.color};">${desk.id.toUpperCase()}</div>
      <div class="modal-agent-role">${desk.role} · ${desk.dept}</div>
      <div class="modal-status-badge ${statusClass}">${(statusClass).replace('_', ' ').toUpperCase()}</div>
      <div class="modal-actions">
        ${actions.map(a => `
          <button class="modal-action-btn" onclick="window.ZendaApp.callAction('${a.endpoint}', '${a.method || 'GET'}')">${a.label}</button>
        `).join('')}
      </div>
      <div class="modal-response" id="modal-response"></div>
    `;

    overlay.classList.add('show');
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('show');
  }

  async function callAction(endpoint, method = 'GET') {
    const respEl = document.getElementById('modal-response');
    if (!respEl) return;
    respEl.style.display = 'block';
    respEl.textContent = 'Loading...';

    const result = await window.ZendaAPI.fetch(endpoint, method);
    if (result.status === "not_wired") { respEl.innerHTML = "<span style=\"color:#ffcc00\">26a0 Service pending setup</span>"; } else if (result.error || result._offline) { respEl.innerHTML = "<span style=\"color:#ff4444\">274c " + (result.error || "Offline") + "</span>"; } else { if (result.status === 'not_wired') { respEl.innerHTML = '<span style="color:#ffcc00">⚠ Service pending setup</span>'; } else if (result.error || result._offline) { respEl.innerHTML = '<span style="color:#ff4444">❌ ' + (result.error || 'Offline') + '</span>'; } else { respEl.textContent = JSON.stringify(result, null, 2); } }
  }

  /* ── WebSocket Handlers ── */
  function handleWsMessage(data) {
    if (data.type === 'status_update' && data.agent) {
      // Update room status
      if (window.PixiOffice) {
        window.PixiOffice.updateRoomStatus(data.agent, data.status);
      }
      updateAgentDots();
    }
    if (data.type === 'hud_update') {
      updateSidebarMetrics();
      updateSidebarRevenue();
    }
  }

  /* ── Init ── */
  function init() {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Close modal on overlay click
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    // Start clock
    updateClock();
    clockInterval = setInterval(updateClock, 1000);

    // Initial sidebar data
    updateSidebarMetrics();
    updateSidebarRevenue();
    updateAgentDots();

    // Init Pixi (with retry — PixiJS dynamic import can race)
    window.PixiOffice.init().catch(function() {
      setTimeout(function() { window.PixiOffice.init().catch(function(){}); }, 2000);
    });

    // Connect WebSocket
    window.ZendaAPI.onWsMessage(handleWsMessage);
    window.ZendaAPI.connectWs();

    // Periodic refresh
    refreshInterval = setInterval(() => {
      updateSidebarMetrics();
      updateSidebarRevenue();
      updateAgentDots();
      if (currentTab === 'agents') renderAgents();
    }, 30000);
  }

  // Export
  window.ZendaApp = {
    init,
    switchTab,
    openModal,
    closeModal,
    callAction
  };

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

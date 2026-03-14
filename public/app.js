/* Zenda CMD V2 — Application Controller */
(function () {
  let currentTab = 'office';
  let clockInterval = null;
  let refreshInterval = null;

  /* ── Status Detection Helper ── */
  /* Each API endpoint returns different shapes. This normalizes them to:
     'connected' | 'not_wired' | 'offline' */
  function detectStatus(data, endpoint) {
    if (!data || data._offline || data.error) return 'offline';
    if (data.status === 'not_wired') return 'not_wired';
    // Explicit status fields
    if (data.status === 'connected' || data.status === 'ok' || data.status === 'healthy' || data.status === 'idle' || data.status === 'ready') return 'connected';
    // Earnings endpoint: has "total" key = it's alive
    if (endpoint && endpoint.includes('earnings') && 'total' in data) return 'connected';
    // Incidents endpoint: has "active" or "resolved" key = it's alive
    if (endpoint && endpoint.includes('incidents') && ('active' in data || 'resolved' in data)) return 'connected';
    // Logs endpoint: has "entries" key = it's alive
    if (endpoint && endpoint.includes('logs') && 'entries' in data) return 'connected';
    // Scan latest: has "findings" key = it's alive
    if (endpoint && endpoint.includes('scan') && ('findings' in data || 'lastScan' in data)) return 'connected';
    // Audit queue: has "pending" or "completed" = it's alive
    if (endpoint && endpoint.includes('audit') && ('pending' in data || 'completed' in data)) return 'connected';
    // Messenger status: has "queueLength" = it's alive
    if (endpoint && endpoint.includes('messenger') && 'queueLength' in data) return 'connected';
    // Health endpoint: has "uptime" = it's alive
    if ('uptime' in data) return 'connected';
    // If we got valid JSON back with no error, likely connected
    if (typeof data === 'object' && Object.keys(data).length > 0) return 'connected';
    return 'offline';
  }

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
    const agents = [];
    for (const desk of desks) {
      try {
        const data = await window.ZendaAPI.apiFetch(desk.endpoint);
        const status = detectStatus(data, desk.endpoint);
        agents.push({ id: desk.id, name: desk.id.toUpperCase(), role: desk.role, color: desk.color, status, port: desk.endpoint, latency: data.uptime ? Math.round(data.uptime) + 's' : '—', lastAction: summarizeData(data, desk.id) });
      } catch (_) {
        agents.push({ id: desk.id, name: desk.id.toUpperCase(), role: desk.role, color: desk.color, status: 'offline', port: '—', latency: '—', lastAction: '—' });
      }
    }
    panel.innerHTML = agents.map((a, idx) => `
      <div class="agent-card" style="border-top: 3px solid ${a.color}; cursor: pointer;" onclick="window.ZendaApp.openModal(window.DESKS[${idx}])">
        <div class="agent-card-name" style="color: ${a.color};">${a.name}</div>
        <div class="agent-card-role">${a.role}</div>
        <div class="agent-card-status ${a.status}">${a.status === 'not_wired' ? 'PENDING SETUP' : a.status === 'connected' ? 'ONLINE' : 'OFFLINE'}</div>
        <div class="agent-card-meta">
          <span>Port: ${a.port}</span>
          <span>Latency: ${a.latency}</span>
          <span>Last: ${a.lastAction}</span>
        </div>
        <div class="agent-card-actions">
          ${(window.AGENT_ACTIONS[a.id] || []).map(act => 
            `<button class="agent-card-btn" onclick="event.stopPropagation(); window.ZendaApp.openModal(window.DESKS[${idx}])">${act.label}</button>`
          ).join('')}
        </div>
      </div>
    `).join('');
  }

  /* ── Summarize API response for "Last" field ── */
  function summarizeData(data, agentId) {
    if (!data || data._offline) return '—';
    if (data.status === 'not_wired') return 'Pending setup';
    switch (agentId) {
      case 'zenda':    return data.uptime ? `Uptime ${Math.round(data.uptime)}s` : data.status || '—';
      case 'scout':    return `${data.pending || 0} pending, ${data.completed || 0} done`;
      case 'scanner':  return data.lastScan ? `Last scan: ${new Date(data.lastScan).toLocaleDateString()}` : `${data.findings || 0} findings`;
      case 'reporter': return data.lastScan ? `Latest: ${new Date(data.lastScan).toLocaleDateString()}` : 'Ready';
      case 'earner':   return `$${data.total || 0} earned`;
      case 'incident': return `${data.active || 0} active, ${data.resolved || 0} resolved`;
      case 'messenger': return data.queueLength !== undefined ? `Queue: ${data.queueLength}` : data.status || '—';
      case 'logger':   return `${(data.entries || []).length} entries`;
      default:         return data.status || data.message || '—';
    }
  }

  /* ── Revenue Tab ── */
  async function renderRevenue() {
    const panel = document.getElementById('revenue-panel');
    let data;
    try {
      const earnings = await window.ZendaAPI.apiFetch('/api/zenda/earnings');
      if (earnings && !earnings._offline && !earnings.error) {
        data = {
          total: earnings.total || 0,
          target: earnings.target || 3000,
          streams: (earnings.streams || []).map(s => ({
            name: s.name || s.stream || 'Unknown',
            status: s.status || (s.monthly > 0 ? 'active' : 'paused'),
            monthly: s.monthly || s.amount || 0
          }))
        };
      }
    } catch (_) {}
    if (!data) data = window.ZendaAPI.getMockRevenue();

    if (data.streams.length === 0) {
      panel.innerHTML = `
        <div style="text-align: center; padding: 16px 0; color: var(--text-dim);">
          <div style="font-size: 9px; margin-bottom: 4px;">NO REVENUE STREAMS YET</div>
          <div style="font-size: 7px;">Revenue streams will appear here once configured.</div>
        </div>
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
      return;
    }

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
  async function renderLogs() {
    const panel = document.getElementById('logs-panel');
    let logs;
    try {
      const data = await window.ZendaAPI.apiFetch('/api/logs/system');
      if (data && !data._offline && data.entries && data.entries.length > 0) {
        logs = data.entries.map(e => ({
          type: e.level || e.type || 'info',
          msg: e.message || e.msg || JSON.stringify(e),
          time: e.timestamp || e.time || null
        }));
      }
    } catch (_) {}
    if (!logs || logs.length === 0) {
      logs = window.ZendaAPI.getMockLogs();
    }

    const now = new Date();
    panel.innerHTML = `
      <div class="log-feed">
        ${logs.map((l, i) => {
          const ts = l.time ? new Date(l.time).toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Hong_Kong' })
            : new Date(now - (logs.length - i) * 120000).toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Hong_Kong' });
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
        data = { total: earnings.total || earnings.monthly || earnings.earnings || 0, target: earnings.target || 3000, streams: [] };
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
        const s = detectStatus(d, desk.endpoint);
        const dot = document.getElementById(`dot-${desk.id}`);
        if (dot) { dot.className = 'agent-dot'; dot.classList.add(s === 'connected' ? 'green' : s === 'not_wired' ? 'yellow' : 'red'); }
      } catch (_) {
        const dot = document.getElementById(`dot-${desk.id}`);
        if (dot) { dot.className = 'agent-dot red'; }
      }
    }
  }

  /* ── Action Button Definitions ── */
  const ACTION_META = {
    // GET actions — just fetch and display data
    '/api/agents/health':       { type: 'get', label: 'System Health' },
    '/api/audit/queue':         { type: 'get', label: 'Audit Queue' },
    '/api/scan/config':         { type: 'get', label: 'Scan Config' },
    '/api/scan/latest':         { type: 'get', label: 'Latest Scan' },
    '/api/zenda/earnings':      { type: 'get', label: 'Earnings' },
    '/api/zenda/incidents':     { type: 'get', label: 'Incidents' },
    '/api/messenger/status':    { type: 'get', label: 'Messenger Status' },
    '/api/logs/system':         { type: 'get', label: 'System Logs' },

    // POST actions — fire-and-forget (no user input needed)
    '/api/agents/restart':           { type: 'action', label: 'Restart Services', confirm: 'Restart all services?' },
    '/api/scan/run':                 { type: 'action', label: 'Run Security Scan', confirm: 'Start a new scan?' },
    '/api/report/generate':          { type: 'action', label: 'Generate Report' },
    '/api/report/send':              { type: 'action', label: 'Send Report', confirm: 'Send the latest report?' },
    '/api/zenda/incidents/resolve':  { type: 'action', label: 'Resolve All Incidents', confirm: 'Mark all incidents as resolved?' },
    '/api/zenda/earnings/new':       { type: 'action', label: 'Add Revenue Stream' },
    '/api/audit/intake':             { type: 'action', label: 'New Intake' },
    '/api/logs/rotate':              { type: 'action', label: 'Rotate Logs', confirm: 'Rotate system logs?' },

    // POST actions that require user input — show a form
    '/api/messenger/send':  {
      type: 'form',
      label: 'Send Message',
      fields: [
        { key: 'chatId', label: 'Chat ID', placeholder: '85291378357@s.whatsapp.net' },
        { key: 'message', label: 'Message', placeholder: 'Enter message...', textarea: true }
      ]
    }
  };

  /* ── Modal ── */
  async function openModal(desk) {
    let agent = {};
    let apiData = {};
    try {
      const d = await window.ZendaAPI.apiFetch(desk.endpoint);
      apiData = d;
      const s = detectStatus(d, desk.endpoint);
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
      <div class="modal-status-badge ${statusClass}">${statusClass === 'not_wired' ? 'PENDING SETUP' : statusClass === 'connected' ? 'ONLINE' : 'OFFLINE'}</div>
      <div style="font-size:7px; color:#8b949e; margin: 4px 0 8px; text-align:center;">${summarizeData(apiData, desk.id)}</div>
      <div class="modal-actions">
        ${actions.map(a => {
          const meta = ACTION_META[a.endpoint];
          if (meta && meta.type === 'form') {
            return `<button class="modal-action-btn" onclick="window.ZendaApp.showForm('${a.endpoint}')">${a.label}</button>`;
          }
          return `<button class="modal-action-btn" onclick="window.ZendaApp.callAction('${a.endpoint}', '${a.method || 'GET'}')">${a.label}</button>`;
        }).join('')}
      </div>
      <div class="modal-response" id="modal-response"></div>
    `;

    overlay.classList.add('show');
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('show');
  }

  function formatApiResponse(data) {
    const rows = Object.entries(data).map(([k, v]) => {
      let val = v;
      if (typeof v === 'object' && v !== null) val = Array.isArray(v) ? (v.length ? v.map(i => typeof i === 'object' ? JSON.stringify(i) : i).join(', ') : '(empty)') : JSON.stringify(v);
      const key = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, s => s.toUpperCase());
      let color = '#c9d1d9';
      if (v === 'connected' || v === 'ok' || v === 'healthy') color = '#3fb950';
      if (v === 'offline' || v === 'error') color = '#f85149';
      if (v === 'idle' || v === 'not_wired' || v === 'ready') color = '#d29922';
      if (typeof v === 'number') color = '#79c0ff';
      return `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #21262d;"><span style="color:#8b949e;">${key}</span><span style="color:${color};">${val}</span></div>`;
    }).join('');
    return `<div style="font-size:7px;line-height:1.8;">${rows}</div>`;
  }

  /* ── Show Form for POST actions needing input ── */
  function showForm(endpoint) {
    const respEl = document.getElementById('modal-response');
    if (!respEl) return;
    const meta = ACTION_META[endpoint];
    if (!meta || meta.type !== 'form') return;

    respEl.style.display = 'block';
    respEl.innerHTML = `
      <div style="font-size:7px; padding: 6px 0;">
        ${meta.fields.map(f => `
          <div style="margin-bottom: 6px;">
            <label style="color:#8b949e; display:block; margin-bottom:2px;">${f.label}</label>
            ${f.textarea
              ? `<textarea id="form-${f.key}" placeholder="${f.placeholder || ''}" style="width:100%;min-height:40px;background:#0d1117;border:1px solid #30363d;color:#c9d1d9;padding:4px;font-size:7px;border-radius:3px;resize:vertical;"></textarea>`
              : `<input id="form-${f.key}" placeholder="${f.placeholder || ''}" style="width:100%;background:#0d1117;border:1px solid #30363d;color:#c9d1d9;padding:4px;font-size:7px;border-radius:3px;" />`
            }
          </div>
        `).join('')}
        <button class="modal-action-btn" style="margin-top:4px;" onclick="window.ZendaApp.submitForm('${endpoint}')">Send</button>
      </div>
    `;
  }

  /* ── Submit Form ── */
  async function submitForm(endpoint) {
    const meta = ACTION_META[endpoint];
    if (!meta || meta.type !== 'form') return;

    const body = {};
    let hasEmpty = false;
    for (const f of meta.fields) {
      const el = document.getElementById(`form-${f.key}`);
      const val = el ? el.value.trim() : '';
      if (!val) { hasEmpty = true; }
      body[f.key] = val;
    }

    const respEl = document.getElementById('modal-response');
    if (hasEmpty) {
      respEl.innerHTML = '<span style="color:#ffcc00">Please fill in all fields</span>';
      return;
    }

    respEl.innerHTML = '<span style="color:#8b949e">Sending...</span>';
    const result = await window.ZendaAPI.apiFetch(endpoint, 'POST', body);

    if (result.error || result._offline) {
      respEl.innerHTML = '<span style="color:#ff4444">' + (result.error || 'Service offline') + '</span>';
    } else if (result.status === 'not_wired') {
      respEl.innerHTML = '<span style="color:#ffcc00">This service is not yet connected to a backend. It will work once wired up.</span>';
    } else {
      respEl.innerHTML = '<span style="color:#3fb950">Sent successfully</span>' + formatApiResponse(result);
    }
  }

  /* ── Call Action (GET or fire-and-forget POST) ── */
  async function callAction(endpoint, method = 'GET') {
    const respEl = document.getElementById('modal-response');
    if (!respEl) return;

    const meta = ACTION_META[endpoint];

    // If this action has a confirmation prompt, ask first
    if (meta && meta.confirm && method === 'POST') {
      respEl.style.display = 'block';
      respEl.innerHTML = `
        <div style="font-size:7px;padding:4px 0;">
          <div style="color:#d29922;margin-bottom:6px;">${meta.confirm}</div>
          <button class="modal-action-btn" style="margin-right:6px;" onclick="window.ZendaApp.executeAction('${endpoint}', '${method}')">Confirm</button>
          <button class="modal-action-btn" onclick="document.getElementById('modal-response').style.display='none'">Cancel</button>
        </div>
      `;
      return;
    }

    await executeAction(endpoint, method);
  }

  async function executeAction(endpoint, method = 'GET') {
    const respEl = document.getElementById('modal-response');
    if (!respEl) return;
    respEl.style.display = 'block';
    respEl.innerHTML = '<span style="color:#8b949e">Loading...</span>';

    const result = await window.ZendaAPI.apiFetch(endpoint, method, method === 'POST' ? {} : null);

    if (result.status === 'not_wired') {
      respEl.innerHTML = '<span style="color:#ffcc00">This service is not yet connected to a backend. It will be available once the backend is wired up.</span>';
    } else if (result.error && result.error.includes('required')) {
      respEl.innerHTML = '<span style="color:#ffcc00">This action requires additional input. Use the form button above.</span>';
    } else if (result.error || result._offline) {
      respEl.innerHTML = '<span style="color:#ff4444">' + (result.error || 'Service offline — check VM connection') + '</span>';
    } else {
      respEl.innerHTML = formatApiResponse(result);
    }
  }

  /* ── WebSocket Handlers ── */
  function handleWsMessage(data) {
    if (data.type === 'status_update' && data.agent) {
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
    callAction,
    executeAction,
    showForm,
    submitForm
  };

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

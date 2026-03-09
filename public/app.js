// Zenda CMD Main App - Runbook 3

// Pack switching
function initPackSwitcher() {
  document.querySelectorAll('.pack-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pack-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyPack(btn.dataset.pack);
    });
  });
}

function applyPack(packName) {
  const pack = window.ZENDA_CONFIG.PACKS[packName];
  if (!pack) return;
  document.querySelectorAll('.desk-drawer').forEach(d => {
    const dept = d.dataset.dept;
    if (pack.hidden.includes(dept)) {
      d.classList.add('hidden');
    } else {
      d.classList.remove('hidden');
    }
  });
}

// Render desk content
function renderDesk(deskId, data) {
  const el = document.querySelector('#desk-' + deskId + ' .drawer-content');
  if (!el) return;
  el.classList.remove('loading');
  if (data.offline || data.error) {
    el.innerHTML = '<span class="offline-badge">OFFLINE</span><br>' + (data.error || 'Service unavailable');
    return;
  }
  // Render metrics
  let html = '';
  if (typeof data === 'object') {
    Object.entries(data).forEach(([k, v]) => {
      if (k !== 'error' && k !== 'offline') {
        html += '<div class="metric"><span>' + k + '</span><span class="metric-value">' + v + '</span></div>';
      }
    });
  }
  el.innerHTML = html || JSON.stringify(data, null, 2);
}

// Load all desk data
async function loadAllDesks() {
  const [agents, earnings, scans, incidents] = await Promise.all([
    getAgentStatus(),
    getEarnings(),
    getScanResults(),
    getIncidents()
  ]);
  renderDesk('zenda', agents);
  renderDesk('intake', agents);
  renderDesk('scanner', scans);
  renderDesk('results', scans);
  renderDesk('earn', earnings);
  renderDesk('incident', incidents);
  renderDesk('msg', { status: 'WhatsApp gateway check pending' });
  renderDesk('logs', { status: 'Systemd logs check pending' });

  // Update pixel office status
  const online = !agents.offline;
  ['zenda','scout','scanner','reporter','earner','incident','messenger','logger'].forEach(id => {
    updateAgentStatus(id, online);
  });
}

// Report viewer
function initReportViewer() {
  document.querySelector('.close-report')?.addEventListener('click', () => {
    document.getElementById('report-viewer').classList.add('hidden');
  });
}

// Init
window.addEventListener('DOMContentLoaded', async () => {
  initPackSwitcher();
  initReportViewer();
  await initPixelOffice();
  await loadAllDesks();
  connectWS((msg) => {
    if (msg.type === 'status') loadAllDesks();
  });
  // Refresh every 30s
  setInterval(loadAllDesks, 30000);
});

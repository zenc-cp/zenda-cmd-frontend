const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');
const PORT = process.env.PORT || 3000;
const GW = 'https://34.150.104.118:8443';
const API_KEY = 'zenda-cmd-key-2026';
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Proxy /api/* to GCP gateway
app.use('/api', (req, res) => {
  const url = GW + req.originalUrl;
  const opts = new URL(url);
  const options = {
    hostname: opts.hostname,
    port: opts.port,
    path: opts.pathname + opts.search,
    method: req.method,
    headers: { 'X-Zenda-Key': API_KEY },
    rejectUnauthorized: false
  };
  const proxy = https.request(options, (upstream) => {
    res.writeHead(upstream.statusCode, upstream.headers);
    upstream.pipe(res);
  });
  proxy.on('error', (e) => {
    res.status(502).json({ error: e.message });
  });
  req.pipe(proxy);
});

const server = http.createServer(app);

// WebSocket proxy: client -> Render /ws -> GCP gateway wss://....:8443/ws
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (clientWs) => {
  console.log('[WS] Client connected, proxying to GCP gateway');
  const gwWs = new WebSocket(GW.replace('https','wss') + '/ws', {
    rejectUnauthorized: false
  });
  gwWs.on('open', () => console.log('[WS] Connected to GCP gateway'));
  gwWs.on('message', (data) => {
    if (clientWs.readyState === 1) clientWs.send(data.toString());
  });
  gwWs.on('close', () => { console.log('[WS] GCP gateway closed'); clientWs.close(); });
  gwWs.on('error', (e) => console.error('[WS] GCP error:', e.message));
  clientWs.on('message', (data) => {
    if (gwWs.readyState === 1) gwWs.send(data.toString());
  });
  clientWs.on('close', () => { console.log('[WS] Client closed'); gwWs.close(); });
});

server.listen(PORT, () => console.log('Dashboard on port ' + PORT));

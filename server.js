const express = require('express');
const https = require('https');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const GW = 'https://34.150.104.118:8443';
const API_KEY = 'zenda-cmd-key-2026';

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

app.listen(PORT, () => console.log('Dashboard on port ' + PORT));

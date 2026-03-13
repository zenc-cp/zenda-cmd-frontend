/* Zenda CMD V2 — WebMCP Tool Definitions */
(function() {
  const tools = [
    {
      name: 'run_security_scan',
      description: 'Trigger a security scan on a target URL or domain',
      parameters: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'URL or domain to scan' },
          depth: { type: 'string', enum: ['quick','standard','deep'], description: 'Scan depth' }
        },
        required: ['target']
      },
      execute: async (params) => {
        const res = await fetch('/api/scan/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Zenda-Key': window.ZENDA_CONFIG.API_KEY },
          body: JSON.stringify(params)
        });
        return res.json();
      }
    },
    {
      name: 'send_whatsapp',
      description: 'Send a WhatsApp message via the Zenda messenger',
      parameters: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Message to send' }
        },
        required: ['message']
      },
      execute: async (params) => {
        const res = await fetch('/api/messenger/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Zenda-Key': window.ZENDA_CONFIG.API_KEY },
          body: JSON.stringify(params)
        });
        return res.json();
      }
    },
    {
      name: 'check_system_health',
      description: 'Get overall system health status of all Zenda agents',
      parameters: { type: 'object', properties: {} },
      execute: async () => {
        const res = await fetch('/api/agents/health', {
          headers: { 'X-Zenda-Key': window.ZENDA_CONFIG.API_KEY }
        });
        return res.json();
      }
    }
  ];
  if (typeof window !== 'undefined') {
    window.__WEBMCP_TOOLS__ = tools;
  }
})();

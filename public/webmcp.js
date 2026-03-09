// WebMCP tool registration - Pillar 2 (Runbook 7D)
if ('modelContext' in navigator) {
  navigator.modelContext.registerTool({
    name: 'get_system_status',
    description: 'Get real-time status of all Hermes services uptime, health, agent activity.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const resp = await fetch(window.ZENDA_CONFIG.API_BASE + '/api/agents/health', {
        headers: { 'X-Zenda-Key': window.ZENDA_CONFIG.API_KEY }
      });
      return await resp.json();
    }
  });

  navigator.modelContext.registerTool({
    name: 'get_service_catalog',
    description: 'List consulting services: pentesting, WebMCP integration, AI hardening. Returns pricing and availability.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => ([
      { name: 'WebMCP Integration', price: '$8,000-20,000', status: 'Accepting' },
      { name: 'Security Audit', price: '$5,000-15,000', status: 'Accepting' },
      { name: 'Penetration Testing', price: '$10,000-30,000', status: 'Accepting' },
      { name: 'AI Agent Hardening', price: '$5,000-15,000', status: 'Accepting' }
    ])
  });

  navigator.modelContext.registerTool({
    name: 'query_memory',
    description: 'Ask the Hermes knowledge base a question. Returns synthesized answer from stored memories.',
    inputSchema: {
      type: 'object',
      properties: { question: { type: 'string', description: 'Natural language question' } },
      required: ['question']
    },
    annotations: { readOnlyHint: true },
    execute: async ({ question }) => {
      const resp = await fetch(
        window.ZENDA_CONFIG.API_BASE + '/api/zenda/memory/query?q=' + encodeURIComponent(question),
        { headers: { 'X-Zenda-Key': window.ZENDA_CONFIG.API_KEY } }
      );
      return await resp.json();
    }
  });

  console.log('WebMCP: 3 tools registered');
}

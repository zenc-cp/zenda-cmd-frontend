// Zenda CMD Runtime Config - Points to GCP VM API Gateway
window.ZENDA_CONFIG = {
    API_BASE: 'https://34.150.104.118:8443',
    API_KEY: 'zenda-cmd-key-2026',
    WS_URL: 'wss://34.150.104.118:8443/ws',
    VERSION: 'v3.0-split',
    PACKS: {
        full: {
            name: 'Full Office',
            departments: ['ZENDA','INTAKE','SCANNER','RESULTS','EARN','INCIDENT','MSG','LOGS'],
            hidden: [],
            routing: 'balanced'
        },
        audit: {
            name: 'Audit Mode',
            departments: ['INTAKE','SCANNER','RESULTS','INCIDENT'],
            hidden: ['EARN','MSG','LOGS'],
            routing: 'security-first'
        },
        earn: {
            name: 'Earn Mode',
            departments: ['EARN','INTAKE','RESULTS','MSG'],
            hidden: ['SCANNER','INCIDENT','LOGS'],
            routing: 'revenue-first'
        }
    }
};

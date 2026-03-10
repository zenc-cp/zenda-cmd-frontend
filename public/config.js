// Zenda CMD Runtime Config - Proxied via Express server
window.ZENDA_CONFIG = {
    API_BASE: '',
    API_KEY: 'zenda-cmd-key-2026',
    WS_URL: '',
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

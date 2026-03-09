// Zenda CMD Runtime Config - Points to GCP VM API Gateway
window.ZENDA_CONFIG = {
  API_BASE: 'https://34.96.223.181:8443',
  API_KEY: 'WILL_BE_SET_AS_ENV_VAR',
  WS_URL: 'wss://34.96.223.181:8443/ws',
  VERSION: '3.0-split',
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

/**
 * Integration Configuration Module
 * Centralizes all configuration settings for Kommo + N8N + Facebook integration
 */

const fs = require('fs');
const path = require('path');

// Load configuration files
const kommoFieldsMapping = require('./kommo_fields_mapping.json');
const facebookEventsConfig = require('./facebook_events_config.json');

/**
 * Environment-based configuration
 */
const config = {
  // Server settings
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development'
  },

  // Kommo CRM configuration
  kommo: {
    accountDomain: process.env.KOMMO_ACCOUNT_DOMAIN,
    apiToken: process.env.KOMMO_API_TOKEN,
    clientId: process.env.KOMMO_CLIENT_ID,
    clientSecret: process.env.KOMMO_CLIENT_SECRET,
    refreshToken: process.env.KOMMO_REFRESH_TOKEN,
    
    // UTM field IDs
    utmFields: {
      source: process.env.KOMMO_UTM_SOURCE_FIELD_ID,
      medium: process.env.KOMMO_UTM_MEDIUM_FIELD_ID,
      campaign: process.env.KOMMO_UTM_CAMPAIGN_FIELD_ID,
      content: process.env.KOMMO_UTM_CONTENT_FIELD_ID,
      term: process.env.KOMMO_UTM_TERM_FIELD_ID
    },

    // API endpoints
    baseUrl: process.env.KOMMO_ACCOUNT_DOMAIN ? `https://${process.env.KOMMO_ACCOUNT_DOMAIN}/api/v4` : null,
    
    // Configuration from JSON
    fieldsMapping: kommoFieldsMapping
  },

  // Facebook API configuration
  facebook: {
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    adAccountId: process.env.FACEBOOK_AD_ACCOUNT_ID,
    pixelId: process.env.FACEBOOK_PIXEL_ID,
    datasetId: process.env.FACEBOOK_DATASET_ID,
    testEventCode: process.env.TEST_EVENT_CODE,
    
    // API settings
    baseUrl: 'https://graph.facebook.com/v19.0',
    apiVersion: 'v19.0',
    
    // Configuration from JSON
    eventsConfig: facebookEventsConfig
  },

  // N8N configuration
  n8n: {
    webhookUrl: process.env.N8N_WEBHOOK_URL,
    apiKey: process.env.N8N_API_KEY,
    
    // Webhook paths
    webhookPaths: {
      utmCapture: {
        mazi: process.env.N8N_WEBHOOK_PATH_UTM_CAPTURE_MAZI || 'utm_capture_mazi',
        dicasa: process.env.N8N_WEBHOOK_PATH_UTM_CAPTURE_DICASA || 'utm_capture_dicasa'
      },
      facebookEvents: {
        atendimento: 'facebook_event_atendimento',
        visita: 'facebook_event_visita',
        leadGanho: 'facebook_event_lead_ganho',
        leadPerdido: 'facebook_event_lead_perdido'
      }
    }
  },

  // Slack configuration
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN,
    channelId: process.env.SLACK_CHANNEL_ID,
    username: process.env.SLACK_USERNAME || 'Integration Bot',
    iconEmoji: process.env.SLACK_ICON_EMOJI || ':robot_face:'
  },

  // Email configuration (optional)
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    alerts: {
      from: process.env.ALERT_EMAIL_FROM,
      to: process.env.ALERT_EMAIL_TO
    }
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    files: {
      utmCapture: process.env.LOG_FILE_UTM_CAPTURE || 'logs/utm_capture.log',
      offlineEvents: process.env.LOG_FILE_OFFLINE_EVENTS || 'logs/offline_events.log',
      errors: process.env.LOG_FILE_ERRORS || 'logs/errors.log'
    }
  },

  // Application settings
  app: {
    environment: process.env.APP_ENVIRONMENT || 'production',
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY) || 1000,
    apiTimeout: parseInt(process.env.API_TIMEOUT) || 30000
  }
};

/**
 * Configuration validation
 */
function validateConfig() {
  const errors = [];
  const warnings = [];

  // Check required Kommo settings
  if (!config.kommo.accountDomain) {
    errors.push('KOMMO_ACCOUNT_DOMAIN is required');
  }
  if (!config.kommo.apiToken) {
    errors.push('KOMMO_API_TOKEN is required');
  }

  // Check UTM field IDs
  Object.entries(config.kommo.utmFields).forEach(([field, value]) => {
    if (!value) {
      warnings.push(`KOMMO_UTM_${field.toUpperCase()}_FIELD_ID is not configured`);
    }
  });

  // Check Facebook settings
  if (!config.facebook.accessToken) {
    errors.push('FACEBOOK_ACCESS_TOKEN is required');
  }
  if (!config.facebook.adAccountId) {
    errors.push('FACEBOOK_AD_ACCOUNT_ID is required');
  }

  // Check optional Slack settings
  if (config.slack.botToken && !config.slack.channelId) {
    warnings.push('SLACK_BOT_TOKEN is configured but SLACK_CHANNEL_ID is missing');
  }

  return { errors, warnings, isValid: errors.length === 0 };
}

/**
 * Get configuration for specific service
 */
function getServiceConfig(service) {
  const serviceConfigs = {
    kommo: config.kommo,
    facebook: config.facebook,
    slack: config.slack,
    n8n: config.n8n,
    app: config.app
  };

  return serviceConfigs[service] || null;
}

/**
 * Get webhook URL for specific endpoint
 */
function getWebhookUrl(type, system = null) {
  const baseUrl = config.n8n.webhookUrl;
  if (!baseUrl) return null;

  let path = '';
  
  if (type === 'utm' && system) {
    path = config.n8n.webhookPaths.utmCapture[system];
  } else if (type === 'facebook') {
    path = config.n8n.webhookPaths.facebookEvents[system];
  }

  return path ? `${baseUrl}/${path}` : null;
}

/**
 * Get Facebook event configuration
 */
function getFacebookEventConfig(eventType) {
  return config.facebook.eventsConfig.event_mappings[eventType] || null;
}

/**
 * Get Kommo field mapping
 */
function getKommoFieldMapping(fieldType) {
  if (fieldType === 'utm') {
    return config.kommo.fieldsMapping.utm_fields;
  } else if (fieldType === 'lead') {
    return config.kommo.fieldsMapping.lead_fields;
  } else if (fieldType === 'deal') {
    return config.kommo.fieldsMapping.deal_fields;
  }
  
  return null;
}

/**
 * Create Kommo API URL
 */
function createKommoApiUrl(endpoint, leadId = null) {
  if (!config.kommo.baseUrl) return null;
  
  let url = config.kommo.baseUrl + endpoint;
  if (leadId) {
    url = url.replace('{lead_id}', leadId);
  }
  
  return url;
}

/**
 * Create Facebook API URL
 */
function createFacebookApiUrl(endpoint) {
  if (!config.facebook.adAccountId) return null;
  
  return `${config.facebook.baseUrl}/${config.facebook.adAccountId}${endpoint}`;
}

/**
 * Export configuration and utilities
 */
module.exports = {
  config,
  validateConfig,
  getServiceConfig,
  getWebhookUrl,
  getFacebookEventConfig,
  getKommoFieldMapping,
  createKommoApiUrl,
  createFacebookApiUrl,
  
  // Direct access to specific configs
  kommo: config.kommo,
  facebook: config.facebook,
  slack: config.slack,
  n8n: config.n8n,
  app: config.app
};
/**
 * Logging utility for the integration system
 * Handles structured logging with different levels and outputs
 */

const fs = require('fs');
const path = require('path');
const { config } = require('./integration_config');

// Ensure logs directory exists
const logsDir = path.dirname(config.logging.files.errors);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log levels
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

/**
 * Get current log level from config
 */
function getCurrentLogLevel() {
  const levelName = config.logging.level.toUpperCase();
  return LOG_LEVELS[levelName] !== undefined ? LOG_LEVELS[levelName] : LOG_LEVELS.INFO;
}

/**
 * Format log entry
 */
function formatLogEntry(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  return JSON.stringify(logEntry) + '\n';
}

/**
 * Write log to file
 */
function writeToFile(filename, entry) {
  try {
    fs.appendFileSync(filename, entry, 'utf8');
  } catch (error) {
    console.error(`Failed to write to log file ${filename}:`, error.message);
  }
}

/**
 * Main logging function
 */
function log(level, message, meta = {}, logFile = null) {
  const currentLevel = getCurrentLogLevel();
  const levelValue = LOG_LEVELS[level.toUpperCase()];
  
  // Check if this log level should be output
  if (levelValue > currentLevel) {
    return;
  }
  
  const entry = formatLogEntry(level, message, meta);
  
  // Always log to console in development
  if (config.app.environment === 'development') {
    console.log(`[${level}] ${message}`, meta);
  }
  
  // Write to specific log file if provided
  if (logFile && config.logging.files[logFile]) {
    writeToFile(config.logging.files[logFile], entry);
  }
  
  // Write errors to errors log
  if (level === 'ERROR') {
    writeToFile(config.logging.files.errors, entry);
  }
}

/**
 * Specific logging methods
 */
const logger = {
  error: (message, meta = {}) => log('ERROR', message, meta),
  warn: (message, meta = {}) => log('WARN', message, meta),
  info: (message, meta = {}) => log('INFO', message, meta),
  debug: (message, meta = {}) => log('DEBUG', message, meta),
  
  // Specific integration logs
  utmCapture: (message, meta = {}) => log('INFO', message, meta, 'utmCapture'),
  offlineEvents: (message, meta = {}) => log('INFO', message, meta, 'offlineEvents'),
  
  // System events
  systemStart: (port) => {
    logger.info('Integration server started', { port, environment: config.app.environment });
  },
  
  configValidation: (validation) => {
    if (validation.errors.length > 0) {
      logger.error('Configuration validation failed', { errors: validation.errors });
    }
    if (validation.warnings.length > 0) {
      logger.warn('Configuration warnings detected', { warnings: validation.warnings });
    }
  },
  
  // UTM capture events
  utmSuccess: (system, leadId, utmData) => {
    logger.utmCapture('UTM parameters captured successfully', {
      system,
      leadId,
      utmData,
      eventType: 'utm_capture_success'
    });
  },
  
  utmError: (system, leadId, error) => {
    logger.error('UTM capture failed', {
      system,
      leadId,
      error: error.message,
      eventType: 'utm_capture_error'
    });
  },
  
  // Facebook events
  facebookSuccess: (eventType, leadId, facebookResponse) => {
    logger.offlineEvents('Facebook event sent successfully', {
      eventType,
      leadId,
      facebookResponse,
      eventType: 'facebook_event_success'
    });
  },
  
  facebookError: (eventType, leadId, error) => {
    logger.error('Facebook event failed', {
      eventType,
      leadId,
      error: error.message,
      eventType: 'facebook_event_error'
    });
  },
  
  // Slack notifications
  slackSuccess: (messageType, channel) => {
    logger.info('Slack notification sent', {
      messageType,
      channel,
      eventType: 'slack_notification_success'
    });
  },
  
  slackError: (messageType, error) => {
    logger.error('Slack notification failed', {
      messageType,
      error: error.message,
      eventType: 'slack_notification_error'
    });
  },
  
  // API requests
  apiRequest: (service, endpoint, method, success, duration = null) => {
    const logData = {
      service,
      endpoint,
      method,
      success,
      eventType: 'api_request'
    };
    
    if (duration !== null) {
      logData.duration = duration;
    }
    
    if (success) {
      logger.info(`${service} API request successful`, logData);
    } else {
      logger.error(`${service} API request failed`, logData);
    }
  }
};

module.exports = logger;
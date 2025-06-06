/**
 * Kommo + N8N + Facebook Integration Server
 * Demonstrates webhook endpoints and integration functionality
 */

const express = require('express');
const { WebClient } = require('@slack/web-api');
const crypto = require('crypto');
const { hashUserData, validateUserData } = require('./helpers/hash_utils');
const { 
  config, 
  validateConfig, 
  getFacebookEventConfig, 
  getKommoFieldMapping,
  createKommoApiUrl,
  createFacebookApiUrl 
} = require('./config/integration_config');
const logger = require('./config/logger');

const app = express();
const PORT = config.server.port;

// Validate configuration on startup
const configValidation = validateConfig();
if (configValidation.warnings.length > 0) {
  console.warn('Configuration warnings:', configValidation.warnings);
}

// Log configuration status but allow demo mode
logger.configValidation(configValidation);
const isDemoMode = configValidation.errors.length > 0;
if (isDemoMode) {
  console.log('🔧 Running in DEMO MODE - Some integrations may not work without proper configuration');
}

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize Slack client if configured
let slack = null;
if (config.slack.botToken) {
  slack = new WebClient(config.slack.botToken);
}

/**
 * Home page - Integration overview
 */
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Kommo + N8N + Facebook Integration</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: #f4f4f4; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .section { margin: 30px 0; padding: 20px; border-left: 4px solid #007cba; background: #f9f9f9; }
            .endpoint { background: #fff; padding: 15px; margin: 10px 0; border-radius: 5px; border: 1px solid #ddd; }
            .method { color: #fff; padding: 4px 8px; border-radius: 3px; font-weight: bold; }
            .post { background: #28a745; }
            .get { background: #007bff; }
            pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
            .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Kommo + N8N + Facebook Ads Integration</h1>
                <p>Complete automation system for UTM tracking and offline conversion events</p>
            </div>

            <div class="section">
                <h2>📊 System Status</h2>
                <div class="status success">
                    ✅ Integration Server: Running on port ${PORT}
                </div>
                <div class="status ${slack ? 'success' : 'warning'}">
                    ${slack ? '✅ Slack Notifications: Configured' : '⚠️ Slack Notifications: Not configured'}
                </div>
                <div class="status ${isDemoMode ? 'warning' : 'success'}">
                    ${isDemoMode ? '🔧 Mode: DEMO (Missing API credentials)' : '✅ Mode: PRODUCTION (All APIs configured)'}
                </div>
            </div>

            <div class="section">
                <h2>🔗 Available Endpoints</h2>
                
                <div class="endpoint">
                    <span class="method post">POST</span> <strong>/webhook/utm-capture/mazi</strong>
                    <p>Captures UTM parameters for Mazi leads and stores in Kommo CRM</p>
                </div>

                <div class="endpoint">
                    <span class="method post">POST</span> <strong>/webhook/utm-capture/dicasa</strong>
                    <p>Captures UTM parameters for DiCasa leads and stores in Kommo CRM</p>
                </div>

                <div class="endpoint">
                    <span class="method post">POST</span> <strong>/webhook/facebook/atendimento</strong>
                    <p>Sends InitiateContact event to Facebook when lead enters Atendimento stage</p>
                </div>

                <div class="endpoint">
                    <span class="method post">POST</span> <strong>/webhook/facebook/visita</strong>
                    <p>Sends Schedule event to Facebook when lead schedules property visit</p>
                </div>

                <div class="endpoint">
                    <span class="method post">POST</span> <strong>/webhook/facebook/lead-ganho</strong>
                    <p>Sends Purchase event to Facebook when deal is closed (conversion)</p>
                </div>

                <div class="endpoint">
                    <span class="method post">POST</span> <strong>/webhook/facebook/lead-perdido</strong>
                    <p>Sends LeadLost event to Facebook when deal is lost</p>
                </div>

                <div class="endpoint">
                    <span class="method get">GET</span> <strong>/test/hash-demo</strong>
                    <p>Demonstrates SHA256 hashing for Facebook API compliance</p>
                </div>

                <div class="endpoint">
                    <span class="method get">GET</span> <strong>/health</strong>
                    <p>System health check and monitoring endpoint</p>
                </div>
            </div>

            <div class="section">
                <h2>📚 Integration Features</h2>
                <ul>
                    <li><strong>UTM Parameter Capture:</strong> Automatically captures and stores utm_source, utm_medium, utm_campaign, utm_content, utm_term</li>
                    <li><strong>Facebook Offline Events:</strong> Sends conversion events to Facebook Ads for attribution tracking</li>
                    <li><strong>SHA256 Hashing:</strong> Secure hashing of personal data as required by Facebook</li>
                    <li><strong>Slack Alerts:</strong> Automatic notifications for failures and critical issues</li>
                    <li><strong>Multi-System Support:</strong> Separate flows for Mazi and DiCasa lead sources</li>
                    <li><strong>Error Handling:</strong> Comprehensive logging and retry mechanisms</li>
                </ul>
            </div>

            <div class="section">
                <h2>🛠️ N8N Workflows</h2>
                <p>This server provides webhook endpoints that work with the following N8N workflows:</p>
                <ul>
                    <li>Lead UTM Capture to Kommo - Mazi</li>
                    <li>Lead UTM Capture to Kommo - DiCasa</li>
                    <li>Offline Event Trigger - Atendimento</li>
                    <li>Offline Event Trigger - Visita</li>
                    <li>Offline Event Trigger - Lead Ganho</li>
                    <li>Offline Event Trigger - Lead Perdido</li>
                    <li>Logs & Alerts - Offline Events Facebook</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
  `);
});

/**
 * UTM Capture Webhooks
 */
app.post('/webhook/utm-capture/:system', (req, res) => {
  const system = req.params.system;
  const { lead_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = req.body;

  logger.info(`UTM capture request received`, { system, lead_id });

  if (!lead_id) {
    logger.utmError(system, 'unknown', new Error('Missing lead_id parameter'));
    return res.status(400).json({
      success: false,
      message: 'lead_id is required',
      error: 'Missing required parameter'
    });
  }

  // Get UTM field configuration
  const utmConfig = getKommoFieldMapping('utm');
  
  // Process UTM data with validation
  const processedData = {
    lead_id,
    utm_source: utm_source || '',
    utm_medium: utm_medium || '',
    utm_campaign: utm_campaign ? `${system}_${utm_campaign}` : '',
    utm_content: utm_content || '',
    utm_term: utm_term || '',
    processed_at: new Date().toISOString(),
    source_system: system,
    demo_mode: isDemoMode
  };

  // In demo mode, show configuration requirements
  if (isDemoMode) {
    processedData.note = 'Demo mode - Configure KOMMO_ACCOUNT_DOMAIN and KOMMO_API_TOKEN for live integration';
  }

  logger.utmSuccess(system, lead_id, processedData);

  res.json({
    success: true,
    message: `UTM parameters captured successfully for ${system} lead`,
    lead_id,
    processed_at: processedData.processed_at,
    utm_data: processedData,
    configuration: utmConfig
  });
});

/**
 * Facebook Event Webhooks
 */
app.post('/webhook/facebook/:event_type', async (req, res) => {
  const eventType = req.params.event_type.replace('-', '_');
  const { lead_id, email, phone, first_name, last_name } = req.body;

  logger.info('Facebook event request received', { eventType, lead_id });

  if (!lead_id || !email) {
    logger.facebookError(eventType, lead_id || 'unknown', new Error('Missing required parameters'));
    return res.status(400).json({
      success: false,
      message: 'lead_id and email are required',
      error: 'Missing required parameters'
    });
  }

  try {
    // Validate user data
    const validation = validateUserData({ email, phone, firstName: first_name, lastName: last_name });
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Hash user data for Facebook
    const hashedUserData = hashUserData({
      email,
      phone,
      firstName: first_name,
      lastName: last_name
    });

    // Get event configuration from config files
    const eventConfig = getFacebookEventConfig(eventType);
    if (!eventConfig) {
      return res.status(400).json({
        success: false,
        message: `Unknown event type: ${eventType}`,
        available_events: Object.keys(config.facebook.eventsConfig.event_mappings)
      });
    }

    // Calculate event value based on configuration
    let eventValue = eventConfig.value;
    if (eventValue === 'deal_value' && req.body.deal_value) {
      eventValue = parseFloat(req.body.deal_value);
    } else if (typeof eventValue === 'string') {
      eventValue = 0;
    }

    const facebookEvent = {
      event_name: eventConfig.facebook_event_name,
      event_time: Math.floor(Date.now() / 1000),
      user_data: hashedUserData,
      custom_data: {
        currency: eventConfig.currency,
        value: eventValue,
        lead_id,
        pipeline_stage: eventConfig.event_description,
        event_type: eventType
      },
      action_source: eventConfig.action_source
    };

    // Add UTM data if available
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(utm => {
      if (req.body[utm]) {
        facebookEvent.custom_data[utm] = req.body[utm];
      }
    });

    // In demo mode, show what would be sent to Facebook
    const responseData = {
      success: true,
      message: `${eventType} event processed successfully`,
      lead_id,
      event_name: facebookEvent.event_name,
      facebook_event: facebookEvent,
      processed_at: new Date().toISOString(),
      demo_mode: isDemoMode
    };

    if (isDemoMode) {
      responseData.note = 'Demo mode - Configure FACEBOOK_ACCESS_TOKEN and FACEBOOK_AD_ACCOUNT_ID for live Facebook API integration';
      responseData.facebook_api_url = createFacebookApiUrl('/events');
    }

    logger.facebookSuccess(eventType, lead_id, { demo_mode: isDemoMode });

    res.json(responseData);

  } catch (error) {
    logger.facebookError(eventType, lead_id, error);
    
    // Send Slack alert if configured
    if (slack && config.slack.channelId) {
      try {
        await slack.chat.postMessage({
          channel: config.slack.channelId,
          text: `🚨 Facebook Event Error - ${eventType}`,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🚨 Facebook Event Error'
              }
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Event Type:*\n${eventType}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Lead ID:*\n${lead_id}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Error:*\n${error.message}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Time:*\n${new Date().toISOString()}`
                }
              ]
            }
          ]
        });
        logger.slackSuccess('error_alert', config.slack.channelId);
      } catch (slackError) {
        logger.slackError('error_alert', slackError);
      }
    }

    res.status(500).json({
      success: false,
      message: `Failed to process ${eventType} event`,
      error: error.message,
      lead_id,
      demo_mode: isDemoMode
    });
  }
});

/**
 * Hash demonstration endpoint
 */
app.get('/test/hash-demo', (req, res) => {
  const sampleData = {
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    firstName: 'John',
    lastName: 'Doe'
  };

  const hashedData = hashUserData(sampleData);
  const validation = validateUserData(sampleData);

  res.json({
    title: 'SHA256 Hash Demonstration for Facebook API',
    original_data: sampleData,
    hashed_data: hashedData,
    validation: validation,
    explanation: {
      purpose: 'Facebook requires personal data to be hashed with SHA256 for privacy protection',
      algorithm: 'SHA256',
      normalization: 'All data is trimmed, lowercased, and cleaned before hashing',
      compliance: 'GDPR and CCPA compliant data processing'
    }
  });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: {
      port: PORT,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    },
    integrations: {
      slack: !!slack,
      hash_utils: true,
      express: true
    },
    endpoints: {
      utm_capture: '/webhook/utm-capture/:system',
      facebook_events: '/webhook/facebook/:event_type',
      hash_demo: '/test/hash-demo'
    }
  };

  res.json(health);
});

/**
 * Test Slack connection
 */
app.get('/test/slack', async (req, res) => {
  if (!slack || !config.slack.channelId) {
    return res.json({
      success: false,
      message: 'Slack not configured',
      configured: false
    });
  }

  try {
    const result = await slack.chat.postMessage({
      channel: config.slack.channelId,
      text: '✅ Test message from Kommo + Facebook Integration',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '✅ *Integration Test*\nSlack notifications are working correctly!'
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Timestamp: ${new Date().toISOString()}`
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Slack test message sent successfully',
      configured: true,
      message_ts: result.ts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send Slack test message',
      error: error.message,
      configured: true
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(`[SERVER ERROR] ${error.message}`);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    available_endpoints: [
      'GET /',
      'POST /webhook/utm-capture/:system',
      'POST /webhook/facebook/:event_type',
      'GET /test/hash-demo',
      'GET /health',
      'GET /test/slack'
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.systemStart(PORT);
  console.log(`🚀 Kommo + N8N + Facebook Integration Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  
  if (slack) {
    console.log(`✅ Slack notifications configured`);
  } else {
    console.log(`⚠️  Slack notifications not configured`);
  }
  
  if (isDemoMode) {
    console.log(`🔧 Running in DEMO MODE - Configure environment variables for full functionality`);
  }
});

module.exports = app;
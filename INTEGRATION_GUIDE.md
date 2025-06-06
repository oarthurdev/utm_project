# Kommo + N8N + Facebook Ads Integration - Complete Setup Guide

## Overview

This is a production-ready integration system that automatically captures UTM parameters in Kommo CRM and sends offline conversion events to Facebook Ads API. The system includes complete configuration management, structured logging, Slack notifications, and comprehensive error handling.

## Key Features

- **Automated UTM Capture**: Captures all UTM parameters (source, medium, campaign, content, term) for both Mazi and DiCasa lead sources
- **Facebook Offline Events**: Sends conversion events (InitiateContact, Schedule, Purchase, LeadLost) to Facebook Ads API
- **SHA256 Security**: All personal data is hashed according to Facebook's privacy requirements
- **Configuration Management**: Centralized configuration with validation and environment-based settings
- **Structured Logging**: Comprehensive logging system with different log levels and file outputs
- **Slack Integration**: Automatic notifications for errors and system alerts
- **Demo Mode**: Runs without API credentials for testing and demonstration
- **Interactive Testing**: Web-based interface for testing all endpoints

## Project Structure

```
kommo-n8n-facebook-integration/
├── server.js                             # Main integration server
├── config/
│   ├── integration_config.js             # Centralized configuration management
│   ├── logger.js                         # Structured logging system
│   ├── kommo_fields_mapping.json         # Kommo CRM field mappings
│   └── facebook_events_config.json       # Facebook API event configurations
├── helpers/
│   └── hash_utils.js                     # SHA256 hashing utilities
├── n8n-flows/                           # N8N workflow definitions
│   ├── lead_utm_capture_mazi.json
│   ├── lead_utm_capture_dicasa.json
│   ├── offline_event_trigger_atendimento.json
│   ├── offline_event_trigger_visita.json
│   ├── offline_event_trigger_lead_ganho.json
│   ├── offline_event_trigger_lead_perdido.json
│   └── logs_alerts_offline_events.json
├── public/
│   └── test-interface.html              # Interactive testing interface
├── docs/                                # Technical documentation
├── logs/                                # System logs (auto-created)
├── .env.example                         # Environment template
└── README.md                            # Project documentation
```

## Configuration Integration

The system now uses a centralized configuration module (`config/integration_config.js`) that:

1. **Loads all JSON configurations** from the config folder
2. **Validates environment variables** on startup
3. **Provides helper functions** for creating API URLs and retrieving configurations
4. **Supports demo mode** when API credentials are missing
5. **Centralizes all service configurations** (Kommo, Facebook, Slack, N8N)

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Kommo CRM Configuration
KOMMO_ACCOUNT_DOMAIN=your-account.kommo.com
KOMMO_API_TOKEN=your_kommo_api_token
KOMMO_UTM_SOURCE_FIELD_ID=123456
KOMMO_UTM_MEDIUM_FIELD_ID=123457
KOMMO_UTM_CAMPAIGN_FIELD_ID=123458
KOMMO_UTM_CONTENT_FIELD_ID=123459
KOMMO_UTM_TERM_FIELD_ID=123460

# Facebook API Configuration
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
FACEBOOK_AD_ACCOUNT_ID=act_1234567890
TEST_EVENT_CODE=TEST12345

# Slack Configuration (Optional)
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL_ID=C1234567890

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_UTM_CAPTURE=logs/utm_capture.log
LOG_FILE_OFFLINE_EVENTS=logs/offline_events.log
LOG_FILE_ERRORS=logs/errors.log
```

## Integrated Logging System

The new logging system (`config/logger.js`) provides:

- **Structured JSON logging** with timestamps and metadata
- **Multiple log levels** (ERROR, WARN, INFO, DEBUG)
- **Service-specific logging** for UTM capture and Facebook events
- **File-based logging** with automatic directory creation
- **Integration event tracking** for monitoring and debugging

### Log Examples

```javascript
// UTM capture success
logger.utmSuccess('mazi', '12345', { utm_source: 'google', utm_campaign: 'spring_2024' });

// Facebook event error
logger.facebookError('lead_ganho', '12345', new Error('Invalid access token'));

// Slack notification
logger.slackSuccess('error_alert', 'C1234567890');
```

## Demo Mode Features

When API credentials are missing, the system runs in demo mode:

1. **Shows configuration requirements** in API responses
2. **Demonstrates data processing** without making external API calls
3. **Displays sample configurations** from JSON files
4. **Validates and processes data** according to specifications
5. **Provides mock Facebook API URLs** for reference

## Testing the Integration

### 1. Start the Server
```bash
npm install
npm start
```

### 2. Access Testing Interface
Visit `http://localhost:5000/test-interface.html` for interactive testing of:
- UTM parameter capture (Mazi/DiCasa)
- Facebook offline events (all event types)
- SHA256 hashing demonstration
- System health checks
- Slack notifications

### 3. API Endpoints

**UTM Capture:**
```bash
curl -X POST http://localhost:5000/webhook/utm-capture/mazi \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "12345",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "spring_sale_2024"
  }'
```

**Facebook Events:**
```bash
curl -X POST http://localhost:5000/webhook/facebook/lead-ganho \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "12345",
    "email": "cliente@email.com",
    "deal_value": 350000,
    "utm_source": "facebook"
  }'
```

## Configuration File Integration

### Kommo Fields Mapping (`config/kommo_fields_mapping.json`)
- Defines UTM field configurations with validation rules
- Maps lead and deal fields for Facebook events
- Includes pipeline stage configurations
- Provides API endpoint templates

### Facebook Events Configuration (`config/facebook_events_config.json`)
- Event type mappings (Atendimento → InitiateContact, etc.)
- User data requirements and hashing specifications
- Rate limiting and error handling configurations
- Testing and compliance settings

## N8N Workflow Integration

The N8N workflows are designed to work with the configuration files:

1. **Use environment variables** from the configuration
2. **Reference field mappings** for data processing
3. **Follow event configurations** for Facebook API calls
4. **Implement error handling** as specified in configs
5. **Support logging and monitoring** requirements

### Importing Workflows

1. Copy workflow JSON files from `n8n-flows/` folder
2. Import each workflow into your N8N instance
3. Configure environment variables in N8N settings
4. Update webhook URLs in the workflows
5. Test each workflow individually before activation

## Production Deployment

### 1. Configure Environment Variables
Ensure all required environment variables are set according to `.env.example`

### 2. Validate Configuration
The server validates configuration on startup and logs warnings/errors

### 3. Monitor Logs
Check log files in the `logs/` directory:
- `utm_capture.log` - UTM parameter processing
- `offline_events.log` - Facebook event submissions
- `errors.log` - All system errors

### 4. Set Up Slack Alerts
Configure Slack bot token and channel ID for automatic error notifications

### 5. Health Monitoring
Use `/health` endpoint for system monitoring and uptime checks

## Security and Compliance

### Data Protection
- **SHA256 hashing** of all personal data before sending to Facebook
- **No storage** of sensitive data in logs
- **GDPR/CCPA compliance** through data minimization
- **Secure API communication** using HTTPS endpoints

### Access Control
- **Environment-based configuration** keeps secrets secure
- **API token validation** before processing requests
- **Input validation** prevents malicious data injection
- **Error handling** prevents information disclosure

## Troubleshooting

### Common Configuration Issues

1. **"Running in DEMO MODE"**
   - Configure required environment variables
   - Check `.env` file formatting
   - Verify API token permissions

2. **"Slack notifications not configured"**
   - Set `SLACK_BOT_TOKEN` and `SLACK_CHANNEL_ID`
   - Verify bot permissions in Slack workspace

3. **UTM field warnings**
   - Configure Kommo custom field IDs
   - Create UTM fields in Kommo CRM interface

### Log Analysis
```bash
# Monitor real-time logs
tail -f logs/offline_events.log

# Search for errors
grep "ERROR" logs/errors.log

# Check UTM capture success rate
grep "utm_capture_success" logs/utm_capture.log | wc -l
```

## Support and Maintenance

### Configuration Updates
- Modify JSON files in `config/` folder for system behavior changes
- Update environment variables for credential rotation
- Restart server after configuration changes

### Monitoring
- Check `/health` endpoint regularly
- Monitor log file growth and rotation
- Review Slack alerts for system issues

### Scaling
- Configure multiple N8N workers for high-volume processing
- Implement database logging for large-scale deployments
- Set up load balancing for multiple server instances

---

This integration provides a complete, production-ready solution for automated UTM tracking and Facebook conversion event management with comprehensive configuration management and monitoring capabilities.
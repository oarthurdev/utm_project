# N8N Flows Description

## Overview

This document provides detailed descriptions of all N8N workflows used in the Kommo + Facebook integration system. Each workflow has a specific purpose and handles different aspects of the automation process.

## Workflow List

1. **Lead UTM Capture to Kommo (Mazi)**
2. **Lead UTM Capture to Kommo (DiCasa)**  
3. **Offline Event Trigger - Atendimento**
4. **Offline Event Trigger - Visita**
5. **Offline Event Trigger - Lead Ganho**
6. **Offline Event Trigger - Lead Perdido**
7. **Logs & Alerts - Offline Events Facebook**

---

## 1. Lead UTM Capture to Kommo (Mazi)

### Purpose
Captures UTM parameters from Mazi leads and stores them in Kommo CRM custom fields.

### Trigger
- **Type**: Webhook
- **Path**: `/utm_capture_mazi`
- **Method**: POST

### Flow Steps
1. **Webhook Receiver**: Receives lead data with UTM parameters
2. **Data Validation**: Validates required fields (lead_id, UTM params)
3. **Data Transformation**: Formats data for Kommo API
4. **Kommo API Call**: Updates lead with UTM custom fields
5. **Success Logging**: Records successful UTM capture
6. **Error Handling**: Catches and logs any failures

### Expected Input
```json
{
  "lead_id": "12345",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "mazi_spring_2024",
  "utm_content": "ad_variant_a",
  "utm_term": "real+estate+mazi"
}

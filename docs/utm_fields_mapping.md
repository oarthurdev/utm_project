# UTM Fields Mapping

## Overview

This document describes the mapping between UTM parameters captured from lead sources and their corresponding custom fields in Kommo CRM.

## UTM Parameters Standard

### 1. utm_source
- **Description**: Identifies the source that sent the traffic
- **Examples**: 
  - `google` (Google Ads)
  - `facebook` (Facebook Ads)
  - `instagram` (Instagram Ads)
  - `linkedin` (LinkedIn Ads)
  - `email` (Email campaigns)
  - `direct` (Direct traffic)

### 2. utm_medium  
- **Description**: Identifies the marketing medium
- **Examples**:
  - `cpc` (Cost Per Click)
  - `social` (Social media)
  - `email` (Email marketing)
  - `organic` (Organic search)
  - `referral` (Referral traffic)
  - `display` (Display advertising)

### 3. utm_campaign
- **Description**: Identifies the specific campaign name
- **Examples**:
  - `spring_sale_2024`
  - `black_friday`
  - `lead_generation_q1`
  - `brand_awareness`
  - `product_launch`

### 4. utm_content
- **Description**: Identifies specific content or ad variation
- **Examples**:
  - `ad_variant_a`
  - `banner_top`
  - `text_ad`
  - `video_ad`
  - `carousel_ad`

### 5. utm_term
- **Description**: Identifies paid search keywords
- **Examples**:
  - `real+estate+miami`
  - `buy+house+florida`
  - `property+investment`
  - `mortgage+rates`

## Kommo CRM Field Mapping

### Required Custom Fields in Kommo

Create the following custom fields in your Kommo CRM:

```json
{
  "utm_fields": [
    {
      "field_name": "UTM Source",
      "field_type": "text",
      "field_code": "utm_source",
      "required": false,
      "description": "Traffic source identifier"
    },
    {
      "field_name": "UTM Medium", 
      "field_type": "text",
      "field_code": "utm_medium",
      "required": false,
      "description": "Marketing medium identifier"
    },
    {
      "field_name": "UTM Campaign",
      "field_type": "text", 
      "field_code": "utm_campaign",
      "required": false,
      "description": "Campaign name identifier"
    },
    {
      "field_name": "UTM Content",
      "field_type": "text",
      "field_code": "utm_content", 
      "required": false,
      "description": "Content/ad variation identifier"
    },
    {
      "field_name": "UTM Term",
      "field_type": "text",
      "field_code": "utm_term",
      "required": false,
      "description": "Keyword term identifier"
    }
  ]
}

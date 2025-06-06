/**
 * Database schema for Kommo + N8N + Facebook Integration
 * Stores UTM captures, Facebook events, and system logs
 */

import { pgTable, serial, text, timestamp, jsonb, integer, boolean, decimal, index, varchar, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Leads table - Central lead information
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  kommoLeadId: varchar('kommo_lead_id', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  sourceSystem: varchar('source_system', { length: 20 }).notNull(), // 'mazi' or 'dicasa'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  kommoLeadIdIdx: index('leads_kommo_lead_id_idx').on(table.kommoLeadId),
  emailIdx: index('leads_email_idx').on(table.email),
  sourceSystemIdx: index('leads_source_system_idx').on(table.sourceSystem),
}));

// UTM captures table - Track all UTM parameter captures
export const utmCaptures = pgTable('utm_captures', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  utmSource: varchar('utm_source', { length: 255 }),
  utmMedium: varchar('utm_medium', { length: 255 }),
  utmCampaign: varchar('utm_campaign', { length: 255 }),
  utmContent: varchar('utm_content', { length: 255 }),
  utmTerm: varchar('utm_term', { length: 255 }),
  rawData: jsonb('raw_data'), // Store original request data
  processedAt: timestamp('processed_at').defaultNow().notNull(),
  sourceSystem: varchar('source_system', { length: 20 }).notNull(),
  success: boolean('success').default(true).notNull(),
  errorMessage: text('error_message'),
}, (table) => ({
  leadIdIdx: index('utm_captures_lead_id_idx').on(table.leadId),
  processedAtIdx: index('utm_captures_processed_at_idx').on(table.processedAt),
  sourceSystemIdx: index('utm_captures_source_system_idx').on(table.sourceSystem),
  utmSourceIdx: index('utm_captures_utm_source_idx').on(table.utmSource),
}));

// Facebook events table - Track all Facebook API submissions
export const facebookEvents = pgTable('facebook_events', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'atendimento', 'visita', 'lead_ganho', 'lead_perdido'
  facebookEventName: varchar('facebook_event_name', { length: 50 }).notNull(), // 'InitiateContact', 'Schedule', 'Purchase', 'LeadLost'
  eventValue: decimal('event_value', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  hashedUserData: jsonb('hashed_user_data').notNull(), // SHA256 hashed data sent to Facebook
  customData: jsonb('custom_data'), // UTM and other custom data
  facebookResponse: jsonb('facebook_response'), // Facebook API response
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  success: boolean('success').default(true).notNull(),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0).notNull(),
}, (table) => ({
  leadIdIdx: index('facebook_events_lead_id_idx').on(table.leadId),
  eventTypeIdx: index('facebook_events_event_type_idx').on(table.eventType),
  sentAtIdx: index('facebook_events_sent_at_idx').on(table.sentAt),
  successIdx: index('facebook_events_success_idx').on(table.success),
}));

// System logs table - Store structured application logs
export const systemLogs = pgTable('system_logs', {
  id: serial('id').primaryKey(),
  level: varchar('level', { length: 10 }).notNull(), // 'ERROR', 'WARN', 'INFO', 'DEBUG'
  message: text('message').notNull(),
  metadata: jsonb('metadata'), // Additional log data
  service: varchar('service', { length: 50 }), // 'utm_capture', 'facebook_events', 'slack', etc.
  leadId: integer('lead_id').references(() => leads.id),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
  levelIdx: index('system_logs_level_idx').on(table.level),
  serviceIdx: index('system_logs_service_idx').on(table.service),
  timestampIdx: index('system_logs_timestamp_idx').on(table.timestamp),
  leadIdIdx: index('system_logs_lead_id_idx').on(table.leadId),
}));

// Slack notifications table - Track Slack alert history
export const slackNotifications = pgTable('slack_notifications', {
  id: serial('id').primaryKey(),
  messageType: varchar('message_type', { length: 50 }).notNull(), // 'error_alert', 'daily_summary', etc.
  channel: varchar('channel', { length: 50 }).notNull(),
  messageText: text('message_text').notNull(),
  slackResponse: jsonb('slack_response'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  success: boolean('success').default(true).notNull(),
  errorMessage: text('error_message'),
}, (table) => ({
  messageTypeIdx: index('slack_notifications_message_type_idx').on(table.messageType),
  sentAtIdx: index('slack_notifications_sent_at_idx').on(table.sentAt),
  successIdx: index('slack_notifications_success_idx').on(table.success),
}));

// Configuration audit table - Track configuration changes
export const configurationAudit = pgTable('configuration_audit', {
  id: serial('id').primaryKey(),
  configType: varchar('config_type', { length: 50 }).notNull(), // 'kommo_fields', 'facebook_events', 'environment'
  configKey: varchar('config_key', { length: 100 }).notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  changedBy: varchar('changed_by', { length: 100 }),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
  reason: text('reason'),
}, (table) => ({
  configTypeIdx: index('config_audit_config_type_idx').on(table.configType),
  changedAtIdx: index('config_audit_changed_at_idx').on(table.changedAt),
}));

// Performance metrics table - Store system performance data
export const performanceMetrics = pgTable('performance_metrics', {
  id: serial('id').primaryKey(),
  metricType: varchar('metric_type', { length: 50 }).notNull(), // 'utm_capture_rate', 'facebook_success_rate', 'response_time'
  metricValue: decimal('metric_value', { precision: 10, scale: 4 }).notNull(),
  timeWindow: varchar('time_window', { length: 20 }).notNull(), // '15min', '1hour', '1day'
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
}, (table) => ({
  metricTypeIdx: index('performance_metrics_metric_type_idx').on(table.metricType),
  recordedAtIdx: index('performance_metrics_recorded_at_idx').on(table.recordedAt),
  timeWindowIdx: index('performance_metrics_time_window_idx').on(table.timeWindow),
}));

// Define relationships
export const leadsRelations = relations(leads, ({ many }) => ({
  utmCaptures: many(utmCaptures),
  facebookEvents: many(facebookEvents),
  systemLogs: many(systemLogs),
}));

export const utmCapturesRelations = relations(utmCaptures, ({ one }) => ({
  lead: one(leads, {
    fields: [utmCaptures.leadId],
    references: [leads.id],
  }),
}));

export const facebookEventsRelations = relations(facebookEvents, ({ one }) => ({
  lead: one(leads, {
    fields: [facebookEvents.leadId],
    references: [leads.id],
  }),
}));

export const systemLogsRelations = relations(systemLogs, ({ one }) => ({
  lead: one(leads, {
    fields: [systemLogs.leadId],
    references: [leads.id],
  }),
}));

// Type exports for TypeScript
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

export type UtmCapture = typeof utmCaptures.$inferSelect;
export type InsertUtmCapture = typeof utmCaptures.$inferInsert;

export type FacebookEvent = typeof facebookEvents.$inferSelect;
export type InsertFacebookEvent = typeof facebookEvents.$inferInsert;

export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = typeof systemLogs.$inferInsert;

export type SlackNotification = typeof slackNotifications.$inferSelect;
export type InsertSlackNotification = typeof slackNotifications.$inferInsert;

export type ConfigurationAudit = typeof configurationAudit.$inferSelect;
export type InsertConfigurationAudit = typeof configurationAudit.$inferInsert;

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;
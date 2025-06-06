import { leads, utmCaptures, facebookEvents, systemLogs, slackNotifications, type Lead, type InsertLead, type UtmCapture, type InsertUtmCapture, type FacebookEvent, type InsertFacebookEvent, type SystemLog, type InsertSystemLog, type SlackNotification, type InsertSlackNotification } from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // Lead management
  getLeadByKommoId(kommoLeadId: string): Promise<Lead | undefined>;
  createLead(insertLead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead>;
  
  // UTM capture management
  createUtmCapture(insertUtmCapture: InsertUtmCapture): Promise<UtmCapture>;
  getUtmCapturesByLead(leadId: number): Promise<UtmCapture[]>;
  getUtmCapturesBySystem(system: string, limit?: number): Promise<UtmCapture[]>;
  
  // Facebook events management
  createFacebookEvent(insertFacebookEvent: InsertFacebookEvent): Promise<FacebookEvent>;
  getFacebookEventsByLead(leadId: number): Promise<FacebookEvent[]>;
  getFacebookEventsByType(eventType: string, limit?: number): Promise<FacebookEvent[]>;
  updateFacebookEventResponse(id: number, response: any, success: boolean): Promise<void>;
  
  // System logging
  createSystemLog(insertSystemLog: InsertSystemLog): Promise<SystemLog>;
  getSystemLogsByLevel(level: string, limit?: number): Promise<SystemLog[]>;
  getSystemLogsByService(service: string, limit?: number): Promise<SystemLog[]>;
  
  // Slack notifications
  createSlackNotification(insertSlackNotification: InsertSlackNotification): Promise<SlackNotification>;
  getSlackNotificationHistory(limit?: number): Promise<SlackNotification[]>;
  
  // Analytics and reporting
  getUtmCaptureStats(startDate: Date, endDate: Date): Promise<any>;
  getFacebookEventStats(startDate: Date, endDate: Date): Promise<any>;
  getSystemHealthMetrics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Lead management
  async getLeadByKommoId(kommoLeadId: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.kommoLeadId, kommoLeadId));
    return lead || undefined;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values({
        ...insertLead,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return lead;
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  // UTM capture management
  async createUtmCapture(insertUtmCapture: InsertUtmCapture): Promise<UtmCapture> {
    const [utmCapture] = await db
      .insert(utmCaptures)
      .values({
        ...insertUtmCapture,
        processedAt: new Date()
      })
      .returning();
    return utmCapture;
  }

  async getUtmCapturesByLead(leadId: number): Promise<UtmCapture[]> {
    return await db
      .select()
      .from(utmCaptures)
      .where(eq(utmCaptures.leadId, leadId))
      .orderBy(desc(utmCaptures.processedAt));
  }

  async getUtmCapturesBySystem(system: string, limit: number = 100): Promise<UtmCapture[]> {
    return await db
      .select()
      .from(utmCaptures)
      .where(eq(utmCaptures.sourceSystem, system))
      .orderBy(desc(utmCaptures.processedAt))
      .limit(limit);
  }

  // Facebook events management
  async createFacebookEvent(insertFacebookEvent: InsertFacebookEvent): Promise<FacebookEvent> {
    const [facebookEvent] = await db
      .insert(facebookEvents)
      .values({
        ...insertFacebookEvent,
        sentAt: new Date()
      })
      .returning();
    return facebookEvent;
  }

  async getFacebookEventsByLead(leadId: number): Promise<FacebookEvent[]> {
    return await db
      .select()
      .from(facebookEvents)
      .where(eq(facebookEvents.leadId, leadId))
      .orderBy(desc(facebookEvents.sentAt));
  }

  async getFacebookEventsByType(eventType: string, limit: number = 100): Promise<FacebookEvent[]> {
    return await db
      .select()
      .from(facebookEvents)
      .where(eq(facebookEvents.eventType, eventType))
      .orderBy(desc(facebookEvents.sentAt))
      .limit(limit);
  }

  async updateFacebookEventResponse(id: number, response: any, success: boolean): Promise<void> {
    await db
      .update(facebookEvents)
      .set({
        facebookResponse: response,
        success: success
      })
      .where(eq(facebookEvents.id, id));
  }

  // System logging
  async createSystemLog(insertSystemLog: InsertSystemLog): Promise<SystemLog> {
    const [systemLog] = await db
      .insert(systemLogs)
      .values({
        ...insertSystemLog,
        timestamp: new Date()
      })
      .returning();
    return systemLog;
  }

  async getSystemLogsByLevel(level: string, limit: number = 100): Promise<SystemLog[]> {
    return await db
      .select()
      .from(systemLogs)
      .where(eq(systemLogs.level, level))
      .orderBy(desc(systemLogs.timestamp))
      .limit(limit);
  }

  async getSystemLogsByService(service: string, limit: number = 100): Promise<SystemLog[]> {
    return await db
      .select()
      .from(systemLogs)
      .where(eq(systemLogs.service, service))
      .orderBy(desc(systemLogs.timestamp))
      .limit(limit);
  }

  // Slack notifications
  async createSlackNotification(insertSlackNotification: InsertSlackNotification): Promise<SlackNotification> {
    const [slackNotification] = await db
      .insert(slackNotifications)
      .values({
        ...insertSlackNotification,
        sentAt: new Date()
      })
      .returning();
    return slackNotification;
  }

  async getSlackNotificationHistory(limit: number = 50): Promise<SlackNotification[]> {
    return await db
      .select()
      .from(slackNotifications)
      .orderBy(desc(slackNotifications.sentAt))
      .limit(limit);
  }

  // Analytics and reporting
  async getUtmCaptureStats(startDate: Date, endDate: Date): Promise<any> {
    const stats = await db
      .select({
        sourceSystem: utmCaptures.sourceSystem,
        totalCaptures: count(),
        successfulCaptures: sql<number>`count(*) filter (where success = true)`,
        failedCaptures: sql<number>`count(*) filter (where success = false)`
      })
      .from(utmCaptures)
      .where(
        and(
          gte(utmCaptures.processedAt, startDate),
          lte(utmCaptures.processedAt, endDate)
        )
      )
      .groupBy(utmCaptures.sourceSystem);

    return stats;
  }

  async getFacebookEventStats(startDate: Date, endDate: Date): Promise<any> {
    const stats = await db
      .select({
        eventType: facebookEvents.eventType,
        totalEvents: count(),
        successfulEvents: sql<number>`count(*) filter (where success = true)`,
        failedEvents: sql<number>`count(*) filter (where success = false)`,
        totalValue: sql<number>`sum(event_value)`
      })
      .from(facebookEvents)
      .where(
        and(
          gte(facebookEvents.sentAt, startDate),
          lte(facebookEvents.sentAt, endDate)
        )
      )
      .groupBy(facebookEvents.eventType);

    return stats;
  }

  async getSystemHealthMetrics(): Promise<any> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get error count in last hour
    const [recentErrors] = await db
      .select({ count: count() })
      .from(systemLogs)
      .where(
        and(
          eq(systemLogs.level, 'ERROR'),
          gte(systemLogs.timestamp, oneHourAgo)
        )
      );

    // Get UTM capture success rate in last 24 hours
    const [utmStats] = await db
      .select({
        total: count(),
        successful: sql<number>`count(*) filter (where success = true)`
      })
      .from(utmCaptures)
      .where(gte(utmCaptures.processedAt, oneDayAgo));

    // Get Facebook event success rate in last 24 hours
    const [fbStats] = await db
      .select({
        total: count(),
        successful: sql<number>`count(*) filter (where success = true)`
      })
      .from(facebookEvents)
      .where(gte(facebookEvents.sentAt, oneDayAgo));

    return {
      recentErrors: recentErrors?.count || 0,
      utmCaptureSuccessRate: utmStats?.total ? (utmStats.successful / utmStats.total) * 100 : 100,
      facebookEventSuccessRate: fbStats?.total ? (fbStats.successful / fbStats.total) * 100 : 100,
      totalUtmCaptures24h: utmStats?.total || 0,
      totalFacebookEvents24h: fbStats?.total || 0
    };
  }
}

export const storage = new DatabaseStorage();
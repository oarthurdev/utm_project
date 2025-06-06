CREATE TABLE "configuration_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_type" varchar(50) NOT NULL,
	"config_key" varchar(100) NOT NULL,
	"old_value" text,
	"new_value" text,
	"changed_by" varchar(100),
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "facebook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"facebook_event_name" varchar(50) NOT NULL,
	"event_value" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"hashed_user_data" jsonb NOT NULL,
	"custom_data" jsonb,
	"facebook_response" jsonb,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"kommo_lead_id" varchar(50) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"source_system" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "leads_kommo_lead_id_unique" UNIQUE("kommo_lead_id")
);
--> statement-breakpoint
CREATE TABLE "performance_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric_type" varchar(50) NOT NULL,
	"metric_value" numeric(10, 4) NOT NULL,
	"time_window" varchar(20) NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "slack_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_type" varchar(50) NOT NULL,
	"channel" varchar(50) NOT NULL,
	"message_text" text NOT NULL,
	"slack_response" jsonb,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" varchar(10) NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"service" varchar(50),
	"lead_id" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utm_captures" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"utm_source" varchar(255),
	"utm_medium" varchar(255),
	"utm_campaign" varchar(255),
	"utm_content" varchar(255),
	"utm_term" varchar(255),
	"raw_data" jsonb,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	"source_system" varchar(20) NOT NULL,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text
);
--> statement-breakpoint
ALTER TABLE "facebook_events" ADD CONSTRAINT "facebook_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utm_captures" ADD CONSTRAINT "utm_captures_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "config_audit_config_type_idx" ON "configuration_audit" USING btree ("config_type");--> statement-breakpoint
CREATE INDEX "config_audit_changed_at_idx" ON "configuration_audit" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "facebook_events_lead_id_idx" ON "facebook_events" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "facebook_events_event_type_idx" ON "facebook_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "facebook_events_sent_at_idx" ON "facebook_events" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "facebook_events_success_idx" ON "facebook_events" USING btree ("success");--> statement-breakpoint
CREATE INDEX "leads_kommo_lead_id_idx" ON "leads" USING btree ("kommo_lead_id");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_source_system_idx" ON "leads" USING btree ("source_system");--> statement-breakpoint
CREATE INDEX "performance_metrics_metric_type_idx" ON "performance_metrics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "performance_metrics_recorded_at_idx" ON "performance_metrics" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "performance_metrics_time_window_idx" ON "performance_metrics" USING btree ("time_window");--> statement-breakpoint
CREATE INDEX "slack_notifications_message_type_idx" ON "slack_notifications" USING btree ("message_type");--> statement-breakpoint
CREATE INDEX "slack_notifications_sent_at_idx" ON "slack_notifications" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "slack_notifications_success_idx" ON "slack_notifications" USING btree ("success");--> statement-breakpoint
CREATE INDEX "system_logs_level_idx" ON "system_logs" USING btree ("level");--> statement-breakpoint
CREATE INDEX "system_logs_service_idx" ON "system_logs" USING btree ("service");--> statement-breakpoint
CREATE INDEX "system_logs_timestamp_idx" ON "system_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "system_logs_lead_id_idx" ON "system_logs" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "utm_captures_lead_id_idx" ON "utm_captures" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "utm_captures_processed_at_idx" ON "utm_captures" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "utm_captures_source_system_idx" ON "utm_captures" USING btree ("source_system");--> statement-breakpoint
CREATE INDEX "utm_captures_utm_source_idx" ON "utm_captures" USING btree ("utm_source");
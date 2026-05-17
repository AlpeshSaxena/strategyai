import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analysesTable = pgTable("analyses", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  competitorUrl: text("competitor_url"),
  status: text("status").notNull().default("pending"),
  title: text("title"),
  metaDescription: text("meta_description"),
  overallScore: integer("overall_score"),
  seoScore: integer("seo_score"),
  uxScore: integer("ux_score"),
  contentScore: integer("content_score"),
  growthScore: integer("growth_score"),
  // Detailed module data stored as JSONB
  scoresData: jsonb("scores_data"),
  keywordsData: jsonb("keywords_data"),
  competitorsData: jsonb("competitors_data"),
  contentData: jsonb("content_data"),
  userFlowData: jsonb("user_flow_data"),
  recommendationsData: jsonb("recommendations_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;

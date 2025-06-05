import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  type: text("type").notNull(), // 'pme' | 'group'
  status: text("status").notNull().default('active'), // 'active' | 'inactive'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull(), // 'admin' | 'manager' | 'user'
  companyId: integer("company_id").references(() => companies.id),
  language: text("language").notNull().default('fr'), // 'fr' | 'en'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Carriers table
export const carriers = pgTable("carriers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quote requests table
export const quoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  goodsType: text("goods_type").notNull(),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  volume: decimal("volume", { precision: 10, scale: 2 }),
  transportMode: text("transport_mode").default('multimodal'), // 'air' | 'mer' | 'route' | 'multimodal'
  requestedDate: timestamp("requested_date").notNull(),
  status: text("status").notNull().default('pending'), // 'pending' | 'quoted' | 'accepted' | 'rejected'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quotes table
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id).notNull(),
  carrierId: integer("carrier_id").references(() => carriers.id).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  estimatedDays: integer("estimated_days").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  status: text("status").notNull().default('pending'), // 'pending' | 'accepted' | 'rejected' | 'expired'
  conditions: text("conditions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shipments table
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  quoteId: integer("quote_id").references(() => quotes.id).notNull(),
  status: text("status").notNull().default('created'), // 'created' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'
  trackingNumber: text("tracking_number"),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  trackingData: jsonb("tracking_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  filename: text("filename").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  category: text("category").notNull(), // 'invoice' | 'contract' | 'cmr' | 'report' | 'other'
  companyId: integer("company_id").references(() => companies.id).notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  shipmentId: integer("shipment_id").references(() => shipments.id),
  s3Key: text("s3_key").notNull(),
  ocrData: jsonb("ocr_data"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat conversations table
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  shipmentId: integer("shipment_id").references(() => shipments.id),
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => chatConversations.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  messageType: text("message_type").notNull().default('text'), // 'text' | 'file'
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activities table for audit trail
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(), // 'quote' | 'shipment' | 'document' | 'user'
  entityId: integer("entity_id").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  quoteRequests: many(quoteRequests),
  documents: many(documents),
  chatConversations: many(chatConversations),
  activities: many(activities),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  quoteRequests: many(quoteRequests),
  uploadedDocuments: many(documents),
  sentMessages: many(chatMessages),
  activities: many(activities),
}));

export const carriersRelations = relations(carriers, ({ many }) => ({
  quotes: many(quotes),
}));

export const quoteRequestsRelations = relations(quoteRequests, ({ one, many }) => ({
  company: one(companies, {
    fields: [quoteRequests.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [quoteRequests.userId],
    references: [users.id],
  }),
  quotes: many(quotes),
  chatConversations: many(chatConversations),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  quoteRequest: one(quoteRequests, {
    fields: [quotes.quoteRequestId],
    references: [quoteRequests.id],
  }),
  carrier: one(carriers, {
    fields: [quotes.carrierId],
    references: [carriers.id],
  }),
  shipments: many(shipments),
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
  quote: one(quotes, {
    fields: [shipments.quoteId],
    references: [quotes.id],
  }),
  documents: many(documents),
  chatConversations: many(chatConversations),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  company: one(companies, {
    fields: [documents.companyId],
    references: [companies.id],
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
  shipment: one(shipments, {
    fields: [documents.shipmentId],
    references: [shipments.id],
  }),
}));

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  company: one(companies, {
    fields: [chatConversations.companyId],
    references: [companies.id],
  }),
  shipment: one(shipments, {
    fields: [chatConversations.shipmentId],
    references: [shipments.id],
  }),
  quoteRequest: one(quoteRequests, {
    fields: [chatConversations.quoteRequestId],
    references: [quoteRequests.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  company: one(companies, {
    fields: [activities.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCarrierSchema = createInsertSchema(carriers).omit({ id: true, createdAt: true });
export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({ id: true, createdAt: true, reference: true }).extend({
  weight: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? val : val.toString()),
  volume: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? val : val.toString()),
  requestedDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val)
});
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true });
export const insertShipmentSchema = createInsertSchema(shipments).omit({ id: true, createdAt: true, reference: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Carrier = typeof carriers.$inferSelect;
export type InsertCarrier = z.infer<typeof insertCarrierSchema>;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

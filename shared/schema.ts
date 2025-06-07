import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, real, varchar, uuid } from "drizzle-orm/pg-core";
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

// Fleet Management Tables
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  vin: text("vin").notNull().unique(),
  licensePlate: text("license_plate").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  type: text("type").notNull(), // 'truck' | 'van' | 'trailer' | 'drone'
  capacity: decimal("capacity", { precision: 10, scale: 2 }),
  status: text("status").notNull().default('active'), // 'active' | 'maintenance' | 'retired'
  fuelType: text("fuel_type"), // 'diesel' | 'electric' | 'hybrid'
  iotDeviceId: text("iot_device_id"),
  lastLocation: jsonb("last_location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  licenseNumber: text("license_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  status: text("status").notNull().default('available'), // 'available' | 'driving' | 'off_duty'
  rating: decimal("rating", { precision: 3, scale: 2 }).default('5.00'),
  currentVehicleId: integer("current_vehicle_id").references(() => vehicles.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Carbon Footprint Tracking
export const carbonFootprints = pgTable("carbon_footprints", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").references(() => shipments.id).notNull(),
  co2Emissions: decimal("co2_emissions", { precision: 10, scale: 3 }).notNull(), // kg CO2
  distance: decimal("distance", { precision: 10, scale: 2 }).notNull(), // km
  fuelConsumption: decimal("fuel_consumption", { precision: 10, scale: 3 }), // liters
  transportMode: text("transport_mode").notNull(),
  emissionFactor: decimal("emission_factor", { precision: 10, scale: 6 }).notNull(),
  offsetCredits: decimal("offset_credits", { precision: 10, scale: 3 }).default('0'),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

// IoT Sensors and Telemetry
export const iotDevices = pgTable("iot_devices", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull().unique(),
  type: text("type").notNull(), // 'gps' | 'temperature' | 'humidity' | 'shock' | 'door'
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  shipmentId: integer("shipment_id").references(() => shipments.id),
  status: text("status").notNull().default('active'),
  lastReading: jsonb("last_reading"),
  batteryLevel: integer("battery_level"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const telemetryData = pgTable("telemetry_data", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").references(() => iotDevices.deviceId).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  location: jsonb("location"), // {lat, lng, altitude}
  speed: decimal("speed", { precision: 5, scale: 2 }),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  humidity: decimal("humidity", { precision: 5, scale: 2 }),
  shock: decimal("shock", { precision: 5, scale: 2 }),
  doorStatus: boolean("door_status"),
  customData: jsonb("custom_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Risk Assessment
export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").references(() => shipments.id).notNull(),
  riskScore: integer("risk_score").notNull(), // 0-100
  weatherRisk: integer("weather_risk").notNull(),
  geopoliticalRisk: integer("geopolitical_risk").notNull(),
  routeRisk: integer("route_risk").notNull(),
  cargoRisk: integer("cargo_risk").notNull(),
  riskFactors: jsonb("risk_factors").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  mitigationActions: jsonb("mitigation_actions"),
  assessedAt: timestamp("assessed_at").defaultNow().notNull(),
});

// Smart Inventory Management
export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  capacity: decimal("capacity", { precision: 12, scale: 2 }).notNull(),
  currentUtilization: decimal("current_utilization", { precision: 5, scale: 2 }).default('0'),
  coordinates: jsonb("coordinates"), // {lat, lng}
  digitalTwinData: jsonb("digital_twin_data"),
  iotSensors: jsonb("iot_sensors"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id).notNull(),
  sku: text("sku").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  minStock: integer("min_stock").default(0),
  maxStock: integer("max_stock"),
  value: decimal("value", { precision: 10, scale: 2 }),
  location: text("location"), // warehouse zone/aisle
  lastMovement: timestamp("last_movement"),
  predictedDemand: integer("predicted_demand"),
  restockDate: timestamp("restock_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Customs and Compliance
export const customsDocuments = pgTable("customs_documents", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").references(() => shipments.id).notNull(),
  documentType: text("document_type").notNull(), // 'invoice' | 'packing_list' | 'certificate' | 'permit'
  documentNumber: text("document_number").notNull(),
  issuingCountry: text("issuing_country").notNull(),
  validUntil: timestamp("valid_until"),
  status: text("status").notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  digitalSignature: text("digital_signature"),
  blockchainHash: text("blockchain_hash"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complianceRules = pgTable("compliance_rules", {
  id: serial("id").primaryKey(),
  ruleType: text("rule_type").notNull(), // 'customs' | 'safety' | 'environmental'
  countryCode: text("country_code").notNull(),
  commodityCode: text("commodity_code"),
  regulation: text("regulation").notNull(),
  requirements: jsonb("requirements").notNull(),
  penalties: jsonb("penalties"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// ESG Reporting
export const esgMetrics = pgTable("esg_metrics", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  reportingPeriod: text("reporting_period").notNull(), // 'Q1-2024'
  environmentalScore: decimal("environmental_score", { precision: 5, scale: 2 }),
  socialScore: decimal("social_score", { precision: 5, scale: 2 }),
  governanceScore: decimal("governance_score", { precision: 5, scale: 2 }),
  totalEmissions: decimal("total_emissions", { precision: 12, scale: 3 }),
  wasteReduction: decimal("waste_reduction", { precision: 5, scale: 2 }),
  employeeSatisfaction: decimal("employee_satisfaction", { precision: 5, scale: 2 }),
  supplierCompliance: decimal("supplier_compliance", { precision: 5, scale: 2 }),
  dataQuality: integer("data_quality"), // 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Market Intelligence
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  dataType: text("data_type").notNull(), // 'competitor_pricing' | 'capacity' | 'fuel_prices' | 'demand'
  region: text("region").notNull(),
  commodity: text("commodity"),
  value: decimal("value", { precision: 15, scale: 6 }).notNull(),
  unit: text("unit").notNull(),
  source: text("source").notNull(),
  confidence: integer("confidence"), // 0-100
  metadata: jsonb("metadata"),
  collectedAt: timestamp("collected_at").defaultNow().notNull(),
});

// Dynamic Pricing
export const pricingRules = pgTable("pricing_rules", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  ruleName: text("rule_name").notNull(),
  conditions: jsonb("conditions").notNull(), // distance, weight, urgency, etc.
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  adjustmentFactors: jsonb("adjustment_factors").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Partner Portal
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  partnerType: text("partner_type").notNull(), // 'carrier' | 'supplier' | 'customer' | 'vendor'
  name: text("name").notNull(),
  contactEmail: text("contact_email").notNull(),
  apiKey: text("api_key").unique(),
  accessLevel: text("access_level").notNull().default('basic'), // 'basic' | 'premium' | 'enterprise'
  status: text("status").notNull().default('pending'), // 'pending' | 'active' | 'suspended'
  onboardingProgress: integer("onboarding_progress").default(0), // 0-100
  integrationData: jsonb("integration_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// API Marketplace
export const apiIntegrations = pgTable("api_integrations", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  integrationName: text("integration_name").notNull(),
  provider: text("provider").notNull(),
  category: text("category").notNull(), // 'tracking' | 'payment' | 'customs' | 'weather'
  endpoint: text("endpoint").notNull(),
  apiKey: text("api_key"),
  configuration: jsonb("configuration"),
  status: text("status").notNull().default('active'),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
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

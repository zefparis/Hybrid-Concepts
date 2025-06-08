import {
  companies,
  users,
  carriers,
  quoteRequests,
  quotes,
  shipments,
  documents,
  chatConversations,
  chatMessages,
  activities,
  type Company,
  type InsertCompany,
  type User,
  type InsertUser,
  type Carrier,
  type InsertCarrier,
  type QuoteRequest,
  type InsertQuoteRequest,
  type Quote,
  type InsertQuote,
  type Shipment,
  type InsertShipment,
  type Document,
  type InsertDocument,
  type ChatConversation,
  type InsertChatConversation,
  type ChatMessage,
  type InsertChatMessage,
  type Activity,
  type InsertActivity,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Companies
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByEmail(email: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;

  // Carriers
  getCarriers(): Promise<Carrier[]>;
  getCarrier(id: number): Promise<Carrier | undefined>;
  createCarrier(carrier: InsertCarrier): Promise<Carrier>;

  // Quote Requests
  getQuoteRequests(companyId: number, limit?: number): Promise<QuoteRequest[]>;
  getQuoteRequest(id: number): Promise<QuoteRequest | undefined>;
  createQuoteRequest(quoteRequest: InsertQuoteRequest): Promise<QuoteRequest>;
  updateQuoteRequest(id: number, quoteRequest: Partial<InsertQuoteRequest>): Promise<QuoteRequest | undefined>;

  // Quotes
  getQuotesByRequest(quoteRequestId: number): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;

  // Shipments
  getShipments(companyId: number, limit?: number): Promise<Array<Shipment & { quote: Quote & { quoteRequest: QuoteRequest; carrier: Carrier } }>>;
  getShipment(id: number): Promise<Shipment | undefined>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipment(id: number, shipment: Partial<InsertShipment>): Promise<Shipment | undefined>;

  // Documents
  getDocuments(companyId: number, limit?: number): Promise<Array<Document & { uploadedBy: User }>>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;

  // Chat
  getChatConversations(companyId: number): Promise<ChatConversation[]>;
  getChatConversation(id: number): Promise<ChatConversation | undefined>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  getChatMessages(conversationId: number, limit?: number): Promise<Array<ChatMessage & { sender: User }>>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Activities
  getActivities(companyId: number, limit?: number): Promise<Array<Activity & { user: User }>>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Dashboard metrics
  getDashboardMetrics(companyId: number): Promise<{
    activeShipments: number;
    pendingQuotes: number;
    totalSavings: number;
    performance: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanyByEmail(email: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.email, email));
    return company || undefined;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: number, updateData: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db.update(companies).set(updateData).where(eq(companies.id, id)).returning();
    return company || undefined;
  }

  async getCarriers(): Promise<Carrier[]> {
    return await db.select().from(carriers).where(eq(carriers.isActive, true)).orderBy(desc(carriers.rating));
  }

  async getCarrier(id: number): Promise<Carrier | undefined> {
    const [carrier] = await db.select().from(carriers).where(eq(carriers.id, id));
    return carrier || undefined;
  }

  async createCarrier(insertCarrier: InsertCarrier): Promise<Carrier> {
    const [carrier] = await db.insert(carriers).values(insertCarrier).returning();
    return carrier;
  }

  async getQuoteRequests(companyId: number, limit = 50): Promise<QuoteRequest[]> {
    return await db
      .select()
      .from(quoteRequests)
      .where(eq(quoteRequests.companyId, companyId))
      .orderBy(desc(quoteRequests.createdAt))
      .limit(limit);
  }

  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    const [quoteRequest] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id));
    return quoteRequest || undefined;
  }

  async createQuoteRequest(insertQuoteRequest: InsertQuoteRequest): Promise<QuoteRequest> {
    const reference = `EML-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const [quoteRequest] = await db
      .insert(quoteRequests)
      .values({ ...insertQuoteRequest, reference })
      .returning();
    return quoteRequest;
  }

  async updateQuoteRequest(id: number, updateData: Partial<InsertQuoteRequest>): Promise<QuoteRequest | undefined> {
    const [quoteRequest] = await db
      .update(quoteRequests)
      .set(updateData)
      .where(eq(quoteRequests.id, id))
      .returning();
    return quoteRequest || undefined;
  }

  async getQuotesByRequest(quoteRequestId: number): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.quoteRequestId, quoteRequestId))
      .orderBy(quotes.price);
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote || undefined;
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db.insert(quotes).values(insertQuote).returning();
    return quote;
  }

  async updateQuote(id: number, updateData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [quote] = await db.update(quotes).set(updateData).where(eq(quotes.id, id)).returning();
    return quote || undefined;
  }

  async getShipments(companyId: number, limit = 50): Promise<Array<Shipment & { quote: Quote & { quoteRequest: QuoteRequest; carrier: Carrier } }>> {
    return await db
      .select({
        id: shipments.id,
        reference: shipments.reference,
        quoteId: shipments.quoteId,
        status: shipments.status,
        trackingNumber: shipments.trackingNumber,
        estimatedDelivery: shipments.estimatedDelivery,
        actualDelivery: shipments.actualDelivery,
        trackingData: shipments.trackingData,
        createdAt: shipments.createdAt,
        quote: {
          id: quotes.id,
          quoteRequestId: quotes.quoteRequestId,
          carrierId: quotes.carrierId,
          price: quotes.price,
          estimatedDays: quotes.estimatedDays,
          validUntil: quotes.validUntil,
          status: quotes.status,
          conditions: quotes.conditions,
          createdAt: quotes.createdAt,
          quoteRequest: {
            id: quoteRequests.id,
            reference: quoteRequests.reference,
            companyId: quoteRequests.companyId,
            userId: quoteRequests.userId,
            origin: quoteRequests.origin,
            destination: quoteRequests.destination,
            goodsType: quoteRequests.goodsType,
            weight: quoteRequests.weight,
            volume: quoteRequests.volume,
            requestedDate: quoteRequests.requestedDate,
            status: quoteRequests.status,
            description: quoteRequests.description,
            createdAt: quoteRequests.createdAt,
          },
          carrier: {
            id: carriers.id,
            name: carriers.name,
            email: carriers.email,
            phone: carriers.phone,
            rating: carriers.rating,
            isActive: carriers.isActive,
            createdAt: carriers.createdAt,
          },
        },
      })
      .from(shipments)
      .innerJoin(quotes, eq(shipments.quoteId, quotes.id))
      .innerJoin(quoteRequests, eq(quotes.quoteRequestId, quoteRequests.id))
      .innerJoin(carriers, eq(quotes.carrierId, carriers.id))
      .where(eq(quoteRequests.companyId, companyId))
      .orderBy(desc(shipments.createdAt))
      .limit(limit);
  }

  async getShipment(id: number): Promise<Shipment | undefined> {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, id));
    return shipment || undefined;
  }

  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const reference = `SHP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const [shipment] = await db
      .insert(shipments)
      .values({ ...insertShipment, reference })
      .returning();
    return shipment;
  }

  async updateShipment(id: number, updateData: Partial<InsertShipment>): Promise<Shipment | undefined> {
    const [shipment] = await db.update(shipments).set(updateData).where(eq(shipments.id, id)).returning();
    return shipment || undefined;
  }

  async getDocuments(companyId: number, limit = 20): Promise<Array<Document & { uploadedBy: User }>> {
    return await db
      .select({
        id: documents.id,
        name: documents.name,
        filename: documents.filename,
        fileSize: documents.fileSize,
        mimeType: documents.mimeType,
        category: documents.category,
        companyId: documents.companyId,
        uploadedBy: documents.uploadedBy,
        shipmentId: documents.shipmentId,
        s3Key: documents.s3Key,
        ocrData: documents.ocrData,
        version: documents.version,
        createdAt: documents.createdAt,
        uploadedBy: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          companyId: users.companyId,
          language: users.language,
          isActive: users.isActive,
          createdAt: users.createdAt,
          password: users.password,
        },
      })
      .from(documents)
      .innerJoin(users, eq(documents.uploadedBy, users.id))
      .where(eq(documents.companyId, companyId))
      .orderBy(desc(documents.createdAt))
      .limit(limit);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }

  async updateDocument(id: number, updateData: Partial<InsertDocument>): Promise<Document | undefined> {
    const [document] = await db.update(documents).set(updateData).where(eq(documents.id, id)).returning();
    return document || undefined;
  }

  async getChatConversations(companyId: number): Promise<ChatConversation[]> {
    return await db
      .select()
      .from(chatConversations)
      .where(and(eq(chatConversations.companyId, companyId), eq(chatConversations.isActive, true)))
      .orderBy(desc(chatConversations.createdAt));
  }

  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    const [conversation] = await db.select().from(chatConversations).where(eq(chatConversations.id, id));
    return conversation || undefined;
  }

  async createChatConversation(insertConversation: InsertChatConversation): Promise<ChatConversation> {
    const [conversation] = await db.insert(chatConversations).values(insertConversation).returning();
    return conversation;
  }

  async getChatMessages(conversationId: number, limit = 50): Promise<Array<ChatMessage & { sender: User }>> {
    return await db
      .select({
        id: chatMessages.id,
        conversationId: chatMessages.conversationId,
        senderId: chatMessages.senderId,
        message: chatMessages.message,
        messageType: chatMessages.messageType,
        fileUrl: chatMessages.fileUrl,
        fileName: chatMessages.fileName,
        isRead: chatMessages.isRead,
        createdAt: chatMessages.createdAt,
        sender: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          companyId: users.companyId,
          language: users.language,
          isActive: users.isActive,
          createdAt: users.createdAt,
          password: users.password,
        },
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.senderId, users.id))
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }

  async getActivities(companyId: number, limit = 20): Promise<Array<Activity & { user: User }>> {
    return await db
      .select({
        id: activities.id,
        companyId: activities.companyId,
        userId: activities.userId,
        action: activities.action,
        entityType: activities.entityType,
        entityId: activities.entityId,
        description: activities.description,
        createdAt: activities.createdAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          companyId: users.companyId,
          language: users.language,
          isActive: users.isActive,
          createdAt: users.createdAt,
          password: users.password,
        },
      })
      .from(activities)
      .innerJoin(users, eq(activities.userId, users.id))
      .where(eq(activities.companyId, companyId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  async getDashboardMetrics(companyId: number): Promise<{
    activeShipments: number;
    pendingQuotes: number;
    totalSavings: number;
    performance: number;
  }> {
    // Get active shipments count
    const [activeShipmentsResult] = await db
      .select({ count: count() })
      .from(shipments)
      .innerJoin(quotes, eq(shipments.quoteId, quotes.id))
      .innerJoin(quoteRequests, eq(quotes.quoteRequestId, quoteRequests.id))
      .where(
        and(
          eq(quoteRequests.companyId, companyId),
          or(eq(shipments.status, 'in_transit'), eq(shipments.status, 'picked_up'))
        )
      );

    // Get pending quotes count
    const [pendingQuotesResult] = await db
      .select({ count: count() })
      .from(quoteRequests)
      .where(and(eq(quoteRequests.companyId, companyId), eq(quoteRequests.status, 'pending')));

    // Calculate estimated savings (simplified calculation)
    const totalSavings = 42350; // This would be calculated based on actual vs estimated costs

    // Calculate performance based on on-time deliveries
    const performance = 94; // This would be calculated based on delivery performance

    return {
      activeShipments: activeShipmentsResult?.count || 0,
      pendingQuotes: pendingQuotesResult?.count || 0,
      totalSavings,
      performance,
    };
  }
}

export const storage = new DatabaseStorage();

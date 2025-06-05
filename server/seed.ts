import { db } from "./db";
import { companies, users, carriers, quoteRequests, quotes, shipments, documents, chatConversations, chatMessages, activities } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Create demo company
    const [demoCompany] = await db.insert(companies).values({
      name: "Transport Demo SA",
      email: "demo@emulog.fr",
      phone: "+33 1 23 45 67 89",
      address: "123 Rue de la Logistique, 75001 Paris",
      type: "pme"
    }).returning();

    // Create demo user
    const hashedPassword = await bcrypt.hash("demo123", 10);
    const [demoUser] = await db.insert(users).values({
      username: "demo",
      email: "demo@emulog.fr",
      password: hashedPassword,
      firstName: "Jean",
      lastName: "Dupont",
      role: "admin",
      companyId: demoCompany.id,
      language: "fr"
    }).returning();

    // Create carriers
    const carriersData = [
      {
        name: "Transport Express SA",
        email: "contact@transport-express.fr",
        phone: "+33 1 23 45 67 90",
        rating: "4.8"
      },
      {
        name: "Logis Rapid",
        email: "info@logis-rapid.fr",
        phone: "+33 1 23 45 67 91",
        rating: "4.5"
      },
      {
        name: "Fret Sécurisé",
        email: "contact@fret-securise.fr",
        phone: "+33 1 23 45 67 92",
        rating: "4.2"
      }
    ];

    const createdCarriers = await db.insert(carriers).values(carriersData).returning();

    // Create quote requests
    const quoteRequestsData = [
      {
        reference: "QR-2024-001",
        companyId: demoCompany.id,
        userId: demoUser.id,
        origin: "Paris, France",
        destination: "Lyon, France",
        goodsType: "Electronics",
        weight: "150.5",
        volume: "2.5",
        requestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "pending",
        description: "Transport d'équipements électroniques fragiles"
      },
      {
        reference: "QR-2024-002",
        companyId: demoCompany.id,
        userId: demoUser.id,
        origin: "Marseille, France",
        destination: "Bordeaux, France",
        goodsType: "Furniture",
        weight: "500.0",
        volume: "8.0",
        requestedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "quoted",
        description: "Mobilier de bureau"
      }
    ];

    const createdQuoteRequests = await db.insert(quoteRequests).values(quoteRequestsData).returning();

    // Create quotes
    const quotesData = [
      {
        quoteRequestId: createdQuoteRequests[0].id,
        carrierId: createdCarriers[0].id,
        price: "450.00",
        estimatedDays: 2,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "pending",
        conditions: "Livraison standard avec assurance incluse"
      },
      {
        quoteRequestId: createdQuoteRequests[0].id,
        carrierId: createdCarriers[1].id,
        price: "420.00",
        estimatedDays: 3,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "pending",
        conditions: "Livraison express possible"
      },
      {
        quoteRequestId: createdQuoteRequests[1].id,
        carrierId: createdCarriers[2].id,
        price: "850.00",
        estimatedDays: 4,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "accepted",
        conditions: "Transport spécialisé mobilier"
      }
    ];

    const createdQuotes = await db.insert(quotes).values(quotesData).returning();

    // Create shipments
    const shipmentsData = [
      {
        quoteId: createdQuotes[2].id,
        status: "in_transit",
        trackingNumber: "TRK123456789",
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        trackingData: {
          currentLocation: "En transit vers Bordeaux",
          lastUpdate: new Date().toISOString(),
          events: [
            { date: new Date().toISOString(), location: "Marseille", status: "Pris en charge" },
            { date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), location: "Avignon", status: "En transit" }
          ]
        }
      }
    ];

    const createdShipments = await db.insert(shipments).values(shipmentsData).returning();

    // Create documents
    const documentsData = [
      {
        name: "Facture_Transport_001.pdf",
        filename: "facture_001.pdf",
        fileSize: 245760,
        mimeType: "application/pdf",
        category: "invoice",
        companyId: demoCompany.id,
        uploadedBy: demoUser.id,
        shipmentId: createdShipments[0].id,
        s3Key: "documents/facture_001.pdf",
        version: 1
      },
      {
        name: "Bon_de_livraison_001.pdf",
        filename: "bon_livraison_001.pdf",
        fileSize: 180240,
        mimeType: "application/pdf",
        category: "cmr",
        companyId: demoCompany.id,
        uploadedBy: demoUser.id,
        shipmentId: createdShipments[0].id,
        s3Key: "documents/bon_livraison_001.pdf",
        version: 1
      }
    ];

    await db.insert(documents).values(documentsData);

    // Create activities
    const activitiesData = [
      {
        companyId: demoCompany.id,
        userId: demoUser.id,
        action: "create",
        entityType: "quote",
        entityId: createdQuoteRequests[0].id,
        description: "Nouvelle demande de cotation créée: Paris → Lyon"
      },
      {
        companyId: demoCompany.id,
        userId: demoUser.id,
        action: "update",
        entityType: "shipment",
        entityId: createdShipments[0].id,
        description: "Mise à jour tracking: En transit"
      },
      {
        companyId: demoCompany.id,
        userId: demoUser.id,
        action: "create",
        entityType: "document",
        entityId: 1,
        description: "Nouveau document ajouté: Facture_Transport_001.pdf"
      }
    ];

    await db.insert(activities).values(activitiesData);

    console.log("✅ Database seeded successfully!");
    console.log("📧 Demo login: demo@emulog.fr");
    console.log("🔑 Demo password: demo123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

export { seed };
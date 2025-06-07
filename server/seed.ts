import { db } from "./db";
import { companies, users, carriers, quoteRequests, quotes, shipments, documents, chatConversations, chatMessages, activities } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Create demo company
    const [demoCompany] = await db.insert(companies).values({
      name: "Transport Demo SA",
      email: "demo@ia-solution.fr",
      phone: "+33 1 23 45 67 89",
      address: "123 Rue de la Logistique, 75001 Paris",
      type: "pme"
    }).returning();

    // Create demo user
    const hashedPassword = await bcrypt.hash("demo123", 10);
    const [demoUser] = await db.insert(users).values({
      username: "demo",
      email: "demo@ia-solution.fr",
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
        name: "DHL Express",
        email: "contact@dhl.fr",
        phone: "+33 1 55 95 95 95",
        rating: "4.8"
      },
      {
        name: "UPS France",
        email: "info@ups.fr",
        phone: "+33 1 49 00 00 00",
        rating: "4.6"
      },
      {
        name: "FedEx France",
        email: "contact@fedex.fr",
        phone: "+33 1 40 85 85 85",
        rating: "4.7"
      },
      {
        name: "Chronopost",
        email: "pro@chronopost.fr",
        phone: "+33 1 44 82 58 58",
        rating: "4.3"
      },
      {
        name: "Geodis",
        email: "contact@geodis.fr",
        phone: "+33 1 56 76 26 00",
        rating: "4.4"
      },
      {
        name: "CMA CGM",
        email: "contact@cma-cgm.fr",
        phone: "+33 4 88 91 90 00",
        rating: "4.5"
      },
      {
        name: "MSC France",
        email: "info@msc.fr",
        phone: "+33 1 49 03 49 03",
        rating: "4.2"
      },
      {
        name: "Air France Cargo",
        email: "cargo@airfrance.fr",
        phone: "+33 1 41 56 78 00",
        rating: "4.6"
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
        transportMode: "terre",
        requestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "pending",
        description: "Transport d'équipements électroniques fragiles"
      },
      {
        reference: "QR-2024-002",
        companyId: demoCompany.id,
        userId: demoUser.id,
        origin: "Port de Marseille, France",
        destination: "Port de Barcelone, Espagne",
        goodsType: "Furniture",
        weight: "2500.0",
        volume: "15.0",
        transportMode: "mer",
        requestedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "quoted",
        description: "Container de mobilier export"
      },
      {
        reference: "QR-2024-003",
        companyId: demoCompany.id,
        userId: demoUser.id,
        origin: "CDG - Charles de Gaulle",
        destination: "BCN - Barcelone",
        goodsType: "Electronics",
        weight: "45.0",
        volume: "0.8",
        transportMode: "air",
        requestedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: "quoted",
        description: "Envoi urgent composants électroniques"
      }
    ];

    const createdQuoteRequests = await db.insert(quoteRequests).values(quoteRequestsData).returning();

    // Create quotes
    const quotesData = [
      // Quotes for terrestrial transport (QR-2024-001)
      {
        quoteRequestId: createdQuoteRequests[0].id,
        carrierId: createdCarriers[0].id, // DHL Express
        price: "285.00",
        estimatedDays: 1,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "pending",
        conditions: "Express 24h, assurance incluse"
      },
      {
        quoteRequestId: createdQuoteRequests[0].id,
        carrierId: createdCarriers[1].id, // UPS France
        price: "245.00",
        estimatedDays: 2,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "pending",
        conditions: "Standard, livraison signature requise"
      },
      {
        quoteRequestId: createdQuoteRequests[0].id,
        carrierId: createdCarriers[4].id, // Geodis
        price: "198.00",
        estimatedDays: 3,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "pending",
        conditions: "Économique, emballage renforcé inclus"
      },
      // Quotes for maritime transport (QR-2024-002)
      {
        quoteRequestId: createdQuoteRequests[1].id,
        carrierId: createdCarriers[5].id, // CMA CGM
        price: "1850.00",
        estimatedDays: 7,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "pending",
        conditions: "Container 20 pieds, départ hebdomadaire"
      },
      {
        quoteRequestId: createdQuoteRequests[1].id,
        carrierId: createdCarriers[6].id, // MSC France
        price: "1750.00",
        estimatedDays: 9,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "accepted",
        conditions: "Container partagé, prix incluant manutention"
      },
      // Quotes for air transport (QR-2024-003)
      {
        quoteRequestId: createdQuoteRequests[2].id,
        carrierId: createdCarriers[7].id, // Air France Cargo
        price: "850.00",
        estimatedDays: 1,
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: "pending",
        conditions: "Vol direct, suivi temps réel"
      },
      {
        quoteRequestId: createdQuoteRequests[2].id,
        carrierId: createdCarriers[2].id, // FedEx France
        price: "920.00",
        estimatedDays: 1,
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: "pending",
        conditions: "Express international, dédouanement inclus"
      }
    ];

    const createdQuotes = await db.insert(quotes).values(quotesData).returning();

    // Create shipments
    const shipmentsData = [
      {
        reference: "SHP-2024-001",
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
    console.log("📧 Demo login: demo@ia-solution.fr");
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
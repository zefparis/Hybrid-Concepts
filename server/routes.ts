import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { trackingService } from "./tracking-service";
import { vizionService } from "./vizion-tracking";
import { aviationTrackingService } from "./aviation-tracking";
import { marineTrafficService } from "./marine-traffic-service";
import { insertUserSchema, insertCompanySchema, insertQuoteRequestSchema, insertDocumentSchema, insertChatMessageSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerPublicApiRoutes } from "./api-routes";
import { notificationService } from "./notification-service";
import { paymentService } from "./payment-service";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthRequest extends Request {
  user?: any;
}

// Authentication middleware disabled - direct access
const authenticateToken = (req: any, res: any, next: any) => {
  // Skip authentication - allow direct access
  req.user = { id: 1, email: "demo@hybridconc.com", role: "admin" }; // Demo user
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Register Public API routes
  registerPublicApiRoutes(app);

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { company, user } = req.body;
      
      // Validate company data
      const validatedCompany = insertCompanySchema.parse(company);
      
      // Create company first
      const newCompany = await storage.createCompany(validatedCompany);
      
      // Hash password and create user
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const validatedUser = insertUserSchema.parse({
        ...user,
        password: hashedPassword,
        companyId: newCompany.id,
        role: 'admin' // First user is admin
      });
      
      const newUser = await storage.createUser(validatedUser);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, companyId: newCompany.id, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({ 
        token, 
        user: { ...newUser, password: undefined },
        company: newCompany 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Registration failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const company = await storage.getCompany(user.companyId!);
      
      const token = jwt.sign(
        { userId: user.id, companyId: user.companyId, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ 
        token, 
        user: { ...user, password: undefined },
        company 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", authenticateToken, async (req: any, res) => {
    try {
      const metrics = await storage.getDashboardMetrics(req.user.companyId);
      res.json(metrics);
    } catch (error) {
      console.error('Metrics error:', error);
      res.status(500).json({ message: 'Failed to fetch metrics' });
    }
  });

  // Quote requests routes
  app.get("/api/quote-requests", authenticateToken, async (req: any, res) => {
    try {
      const quoteRequests = await storage.getQuoteRequests(req.user.companyId);
      
      // Enhanced quote requests with quotes and carrier information
      const enrichedQuotes = await Promise.all(quoteRequests.map(async (quote) => {
        const isPort = (location: string) => {
          const portKeywords = ['port du', 'port de', 'port of', 'port d\'', 'harbour', 'harbor'];
          return portKeywords.some(keyword => location.toLowerCase().includes(keyword.toLowerCase()));
        };
        
        const isAirport = (location: string) => {
          const airportKeywords = ['aéroport', 'airport', 'cdg', 'heathrow', 'changi', 'tambo', 'jfk', 'lax'];
          return airportKeywords.some(keyword => location.toLowerCase().includes(keyword));
        };
        
        let correctMode = quote.transportMode;
        if (isPort(quote.origin) || isPort(quote.destination)) {
          correctMode = 'mer';
        } else if (isAirport(quote.origin) || isAirport(quote.destination)) {
          correctMode = 'air';
        }
        
        // Récupérer les cotations pour cette demande
        const quotes = await storage.getQuotesByRequest(quote.id);
        
        // Enrichir chaque cotation avec les informations du transporteur
        const enrichedQuotes = await Promise.all(quotes.map(async (q) => {
          const carrier = await storage.getCarrier(q.carrierId);
          return {
            ...q,
            carrier
          };
        }));
        
        return {
          ...quote,
          transportMode: correctMode,
          quotes: enrichedQuotes
        };
      }));
      
      res.json(enrichedQuotes);
    } catch (error) {
      console.error('Quote requests error:', error);
      res.status(500).json({ message: 'Failed to fetch quote requests' });
    }
  });

  // Simulate carrier quotes generation
  const generateSimulatedQuotes = async (quoteRequest: any) => {
    const carriers = await storage.getCarriers();
    const transportMode = quoteRequest.transportMode?.toLowerCase() || 'terre';
    
    // Filter carriers based on transport mode (simplified simulation)
    const availableCarriers = carriers.filter((carrier: any) => {
      if (transportMode === 'air') {
        return carrier.name.includes('Air') || carrier.name.includes('DHL') || carrier.name.includes('FedEx');
      } else if (transportMode === 'mer') {
        return carrier.name.includes('CMA') || carrier.name.includes('MSC');
      } else {
        return !carrier.name.includes('Air') && !carrier.name.includes('CMA') && !carrier.name.includes('MSC');
      }
    }).slice(0, 3); // Max 3 quotes per request
    
    const weight = parseFloat(quoteRequest.weight) || 100;
    const basePrice = transportMode === 'air' ? weight * 15 : 
                     transportMode === 'mer' ? weight * 2.5 : 
                     weight * 1.8;
    
    for (let index = 0; index < availableCarriers.length; index++) {
      const carrier = availableCarriers[index];
      const priceVariation = 0.8 + (Math.random() * 0.4); // ±20% variation
      const price = (basePrice * priceVariation).toFixed(2);
      const estimatedDays = transportMode === 'air' ? 1 + index : 
                           transportMode === 'mer' ? 7 + index * 2 : 
                           1 + index;
      
      const conditions = transportMode === 'air' ? 'Express international, dédouanement inclus' :
                        transportMode === 'mer' ? 'Container partagé, départ hebdomadaire' :
                        'Livraison standard, assurance incluse';
      
      await storage.createQuote({
        quoteRequestId: quoteRequest.id,
        carrierId: carrier.id,
        price,
        estimatedDays,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'pending',
        conditions
      });
    }
  };

  app.post("/api/quote-requests", authenticateToken, async (req: any, res) => {
    try {
      // Auto-detect transport mode based on locations and geography
      const detectTransportMode = (origin: string, destination: string) => {
        const isAirport = (location: string) => {
          const airportKeywords = ['aéroport', 'airport', 'cdg', 'heathrow', 'changi', 'tambo', 'jfk', 'lax', 'orly', 'roissy'];
          return airportKeywords.some(keyword => location.toLowerCase().includes(keyword));
        };
        
        const isPort = (location: string) => {
          const portKeywords = ['port du', 'port de', 'port of', 'port d\'', 'harbour', 'harbor', 'terminal maritime', 'terminal portuaire', 'quai', 'wharf'];
          return portKeywords.some(keyword => location.toLowerCase().includes(keyword.toLowerCase()));
        };
        
        const isEuropean = (location: string) => {
          return ['france', 'allemagne', 'italie', 'espagne', 'angleterre', 'royaume-uni', 'pays-bas', 'belgique', 'suisse', 'autriche', 'suède', 'norvège', 'danemark', 'pologne'].some(country => location.toLowerCase().includes(country));
        };
        
        const isAsian = (location: string) => {
          return ['chine', 'japon', 'corée', 'inde', 'thaïlande', 'vietnam', 'singapour', 'malaisie', 'indonésie', 'philippines', 'jakarta', 'bangkok', 'manila', 'kuala lumpur'].some(keyword => location.toLowerCase().includes(keyword));
        };
        
        const isAfrican = (location: string) => {
          return ['afrique', 'maroc', 'algérie', 'tunisie', 'egypte', 'nigeria', 'kenya', 'ghana', 'johannesburg', 'cape town', 'casablanca', 'lagos'].some(keyword => location.toLowerCase().includes(keyword));
        };
        
        const isAmerican = (location: string) => {
          return ['états-unis', 'canada', 'mexique', 'brésil', 'argentine', 'chili', 'colombie', 'new york', 'los angeles', 'toronto', 'montreal'].some(keyword => location.toLowerCase().includes(keyword));
        };
        
        console.log(`Detecting transport mode for: "${origin}" → "${destination}"`);
        console.log(`Origin is port: ${isPort(origin)}, Destination is port: ${isPort(destination)}`);
        
        // Check for airports first
        if (isAirport(origin) || isAirport(destination)) {
          console.log('Mode détecté: aérien (aéroport détecté)');
          return 'air';
        }
        
        // Check for ports
        if (isPort(origin) || isPort(destination)) {
          console.log('Mode détecté: maritime (port détecté)');
          return 'mer';
        }
        
        // Intelligent geographic detection
        const originEU = isEuropean(origin);
        const destEU = isEuropean(destination);
        const originAS = isAsian(origin);
        const destAS = isAsian(destination);
        const originAF = isAfrican(origin);
        const destAF = isAfrican(destination);
        const originAM = isAmerican(origin);
        const destAM = isAmerican(destination);
        
        // Intercontinental = air or sea
        if ((originEU && (destAS || destAF || destAM)) || 
            (originAS && (destEU || destAF || destAM)) ||
            (originAF && (destEU || destAS || destAM)) ||
            (originAM && (destEU || destAS || destAF))) {
          // For heavy cargo or budget shipping, prefer sea
          const weight = parseFloat(req.body.weight) || 0;
          if (weight > 500) {
            console.log('Mode détecté: maritime (intercontinental, cargo lourd)');
            return 'mer';
          } else {
            console.log('Mode détecté: aérien (intercontinental, cargo léger)');
            return 'air';
          }
        }
        
        // Same continent = road or rail
        if ((originEU && destEU) || (originAS && destAS) || (originAF && destAF) || (originAM && destAM)) {
          console.log('Mode détecté: routier (même continent)');
          return 'terre';
        }
        
        console.log('Mode détecté: multimodal (par défaut)');
        return req.body.transportMode || 'multimodal';
      };
      
      const autoDetectedMode = detectTransportMode(req.body.origin || '', req.body.destination || '');
      
      const validatedData = insertQuoteRequestSchema.parse({
        ...req.body,
        transportMode: autoDetectedMode,
        companyId: req.user.companyId,
        userId: req.user.userId
      });
      
      const quoteRequest = await storage.createQuoteRequest(validatedData);
      
      // Generate simulated carrier responses
      setTimeout(async () => {
        try {
          await generateSimulatedQuotes(quoteRequest);
          // Update status to 'quoted' after quotes are generated
          await storage.updateQuoteRequest(quoteRequest.id, { status: 'quoted' });
        } catch (error) {
          console.error('Error generating simulated quotes:', error);
        }
      }, 2000); // Simulate 2 second delay for carrier responses
      
      // Create activity log
      await storage.createActivity({
        companyId: req.user.companyId,
        userId: req.user.userId,
        action: 'create',
        entityType: 'quote',
        entityId: quoteRequest.id,
        description: `Nouvelle demande de cotation créée: ${quoteRequest.reference}`
      });
      
      res.status(201).json(quoteRequest);
    } catch (error) {
      console.error('Create quote request error:', error);
      res.status(400).json({ message: 'Failed to create quote request', error: (error as Error).message });
    }
  });

  app.patch("/api/quote-requests/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertQuoteRequestSchema.partial().parse(req.body);
      
      const quoteRequest = await storage.updateQuoteRequest(id, validatedData);
      if (!quoteRequest) {
        return res.status(404).json({ message: 'Quote request not found' });
      }
      
      res.json(quoteRequest);
    } catch (error) {
      console.error('Update quote request error:', error);
      res.status(400).json({ message: 'Failed to update quote request', error: (error as Error).message });
    }
  });

  app.delete("/api/quote-requests/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const quoteRequest = await storage.getQuoteRequest(id);
      if (!quoteRequest) {
        return res.status(404).json({ message: 'Quote request not found' });
      }
      
      const updatedQuoteRequest = await storage.updateQuoteRequest(id, { status: 'cancelled' });
      res.json({ message: 'Quote request cancelled successfully', quoteRequest: updatedQuoteRequest });
    } catch (error) {
      console.error('Delete quote request error:', error);
      res.status(500).json({ message: 'Failed to cancel quote request' });
    }
  });

  // Shipments routes
  app.get("/api/shipments", authenticateToken, async (req: any, res) => {
    try {
      const shipments = await storage.getShipments(req.user.companyId);
      res.json(shipments);
    } catch (error) {
      console.error('Shipments error:', error);
      res.status(500).json({ message: 'Failed to fetch shipments' });
    }
  });

  app.put("/api/shipments/:id/tracking", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, trackingData } = req.body;
      
      const shipment = await storage.updateShipment(parseInt(id), {
        status,
        trackingData
      });
      
      if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found' });
      }
      
      // Create activity log
      await storage.createActivity({
        companyId: req.user.companyId,
        userId: req.user.userId,
        action: 'update',
        entityType: 'shipment',
        entityId: shipment.id,
        description: `Mise à jour tracking: ${status}`
      });
      
      res.json(shipment);
    } catch (error) {
      console.error('Update tracking error:', error);
      res.status(500).json({ message: 'Failed to update tracking' });
    }
  });

  // Documents routes
  app.get("/api/documents", authenticateToken, async (req: any, res) => {
    try {
      const documents = await storage.getDocuments(req.user.companyId);
      res.json(documents);
    } catch (error) {
      console.error('Documents error:', error);
      res.status(500).json({ message: 'Failed to fetch documents' });
    }
  });

  app.post("/api/documents", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        companyId: req.user.companyId,
        uploadedBy: req.user.userId
      });
      
      const document = await storage.createDocument(validatedData);
      
      // Create activity log
      await storage.createActivity({
        companyId: req.user.companyId,
        userId: req.user.userId,
        action: 'create',
        entityType: 'document',
        entityId: document.id,
        description: `Nouveau document ajouté: ${document.name}`
      });
      
      res.status(201).json(document);
    } catch (error) {
      console.error('Create document error:', error);
      res.status(400).json({ message: 'Failed to create document', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Chat routes
  app.get("/api/chat/conversations", authenticateToken, async (req: any, res) => {
    try {
      const conversations = await storage.getChatConversations(req.user.companyId);
      res.json(conversations);
    } catch (error) {
      console.error('Conversations error:', error);
      res.status(500).json({ message: 'Failed to fetch conversations' });
    }
  });

  app.get("/api/chat/conversations/:id/messages", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getChatMessages(parseInt(id));
      res.json(messages);
    } catch (error) {
      console.error('Messages error:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.post("/api/chat/conversations/:id/messages", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertChatMessageSchema.parse({
        ...req.body,
        conversationId: parseInt(id),
        senderId: req.user.userId
      });
      
      const message = await storage.createChatMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error('Create message error:', error);
      res.status(400).json({ message: 'Failed to send message', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Activities routes
  app.get("/api/activities", authenticateToken, async (req: any, res) => {
    try {
      const activities = await storage.getActivities(req.user.companyId);
      res.json(activities);
    } catch (error) {
      console.error('Activities error:', error);
      res.status(500).json({ message: 'Failed to fetch activities' });
    }
  });

  // Routes API de tracking avancé multi-transporteurs
  app.post("/api/tracking/real-time", authenticateToken, async (req, res) => {
    try {
      const { trackingNumber, provider } = req.body;
      
      if (!trackingNumber) {
        return res.status(400).json({ error: "Numéro de tracking requis" });
      }

      const result = await trackingService.trackShipment(trackingNumber, provider);
      res.json(result);
    } catch (error) {
      console.error("Erreur tracking:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/tracking/active-shipments", authenticateToken, async (req: any, res) => {
    try {
      const shipments = await storage.getShipments(req.user.companyId || 1);
      const activeShipments = shipments.filter(s => s.status !== "Livré" && s.trackingNumber);
      
      // Enrichir avec les données de tracking en temps réel Vizion et autres APIs
      const enrichedShipments = await Promise.all(
        activeShipments.map(async (shipment) => {
          try {
            if (shipment.trackingNumber) {
              // Essayer d'abord Vizion pour les conteneurs
              if (shipment.trackingNumber.match(/^[A-Z]{4}\d{7}$/)) {
                const vizionData = await vizionService.trackContainer(shipment.trackingNumber);
                if (vizionData) {
                  const currentLocation = vizionData.locations[vizionData.locations.length - 1];
                  return {
                    ...shipment,
                    type: 'container',
                    currentLocation: {
                      name: currentLocation?.location.name || 'Position inconnue',
                      lat: currentLocation?.location.coordinates?.lat || 48.8566,
                      lng: currentLocation?.location.coordinates?.lng || 2.3522
                    },
                    vessel: vizionData.vessel,
                    lastUpdate: currentLocation?.timestamp || new Date().toISOString(),
                    progress: calculateProgress(vizionData.locations),
                    eta: vizionData.estimatedArrival
                  };
                }
              }
              const trackingData = await trackingService.trackShipment(shipment.trackingNumber);
              return { ...shipment, trackingData };
            }
            return shipment;
          } catch (error) {
            return shipment;
          }
        })
      );
      
      res.json(enrichedShipments);
    } catch (error) {
      console.error("Erreur expéditions actives:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des expéditions" });
    }
  });

  app.get("/api/tracking/history/:trackingNumber", authenticateToken, async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      const history = await trackingService.getTrackingHistory(trackingNumber);
      res.json(history);
    } catch (error) {
      console.error("Erreur historique tracking:", error);
      res.status(500).json({ error: "Erreur lors de la récupération de l'historique" });
    }
  });

  app.get("/api/tracking/api-status", authenticateToken, async (req, res) => {
    try {
      const status = await trackingService.checkAPIStatus();
      res.json(status);
    } catch (error) {
      console.error("Erreur statut API:", error);
      res.status(500).json({ error: "Erreur lors de la vérification du statut des APIs" });
    }
  });

  // Routes API Aviation Tracking
  app.post("/api/tracking/aviation/flight", authenticateToken, async (req, res) => {
    try {
      const { flightNumber, date } = req.body;
      
      if (!flightNumber) {
        return res.status(400).json({ error: "Numéro de vol requis" });
      }

      const flightData = await aviationTrackingService.trackFlight(flightNumber, date);
      res.json(flightData);
    } catch (error) {
      console.error("Erreur tracking aviation:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/tracking/aviation/airport/:iataCode", authenticateToken, async (req, res) => {
    try {
      const { iataCode } = req.params;
      const airportInfo = await aviationTrackingService.getAirportInfo(iataCode);
      res.json(airportInfo);
    } catch (error) {
      console.error("Erreur info aéroport:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/tracking/aviation/routes/:airlineIata", authenticateToken, async (req, res) => {
    try {
      const { airlineIata } = req.params;
      const routes = await aviationTrackingService.getAirlineRoutes(airlineIata);
      res.json(routes);
    } catch (error) {
      console.error("Erreur routes compagnie:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Routes API Maritime Tracking (MarineTraffic)
  app.post("/api/tracking/maritime/vessel", authenticateToken, async (req, res) => {
    try {
      const { mmsi } = req.body;
      
      if (!mmsi) {
        return res.status(400).json({ error: "MMSI requis" });
      }

      const vesselData = await marineTrafficService.getVesselByMMSI(mmsi);
      res.json(vesselData);
    } catch (error) {
      console.error("Erreur tracking maritime:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/tracking/maritime/port/:portId", authenticateToken, async (req, res) => {
    try {
      const { portId } = req.params;
      const portInfo = await marineTrafficService.getPortInfo(portId);
      res.json(portInfo);
    } catch (error) {
      console.error("Erreur info port:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/tracking/maritime/port/:portId/vessels", authenticateToken, async (req, res) => {
    try {
      const { portId } = req.params;
      const vessels = await marineTrafficService.getVesselsByPort(portId);
      res.json(vessels);
    } catch (error) {
      console.error("Erreur navires du port:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/tracking/maritime/vessel/route", authenticateToken, async (req, res) => {
    try {
      const { mmsi, fromDate, toDate } = req.body;
      
      if (!mmsi || !fromDate || !toDate) {
        return res.status(400).json({ error: "MMSI, date de début et date de fin requis" });
      }

      const route = await marineTrafficService.getVesselRoute(mmsi, fromDate, toDate);
      res.json(route);
    } catch (error) {
      console.error("Erreur route navire:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Routes API Vizion Maritime Tracking (existing)
  app.post("/api/tracking/vizion/container", authenticateToken, async (req, res) => {
    try {
      const { containerNumber } = req.body;
      
      if (!containerNumber) {
        return res.status(400).json({ error: "Numéro de conteneur requis" });
      }

      const trackingData = await vizionService.trackContainer(containerNumber);
      if (!trackingData) {
        const demoData = vizionService.getDemoData().find(d => d.containerNumber === containerNumber);
        return res.json(demoData || { error: "Conteneur non trouvé" });
      }

      res.json(trackingData);
    } catch (error) {
      console.error("Erreur Vizion tracking:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Route API unifiée multimodale
  app.post("/api/tracking/unified", authenticateToken, async (req, res) => {
    try {
      const { identifier, mode } = req.body;
      
      if (!identifier) {
        return res.status(400).json({ error: "Identifiant requis" });
      }

      let result;
      
      // Détection automatique du mode de transport
      if (!mode || mode === 'auto') {
        if (/^[A-Z]{2,3}\d{1,4}[A-Z]?$/i.test(identifier)) {
          // Format numéro de vol
          result = await aviationTrackingService.trackFlight(identifier);
        } else if (/^\d{9}$/.test(identifier)) {
          // Format MMSI
          result = await marineTrafficService.getVesselByMMSI(identifier);
        } else {
          // Format tracking terrestre
          result = await trackingService.trackShipment(identifier);
        }
      } else if (mode === 'aviation') {
        result = await aviationTrackingService.trackFlight(identifier);
      } else if (mode === 'maritime') {
        result = await marineTrafficService.getVesselByMMSI(identifier);
      } else {
        result = await trackingService.trackShipment(identifier);
      }

      res.json(result);
    } catch (error) {
      console.error("Erreur tracking unifié:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/tracking/vizion/booking", authenticateToken, async (req, res) => {
    try {
      const { bookingNumber, scacCode } = req.body;
      
      if (!bookingNumber) {
        return res.status(400).json({ error: "Numéro de booking requis" });
      }

      const trackingData = await vizionService.trackByBooking(bookingNumber, scacCode);
      if (!trackingData) {
        return res.status(404).json({ error: "Booking non trouvé" });
      }

      res.json(trackingData);
    } catch (error) {
      console.error("Erreur Vizion booking tracking:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/tracking/vizion/demo", authenticateToken, async (req, res) => {
    try {
      const demoData = vizionService.getDemoData();
      res.json(demoData);
    } catch (error) {
      console.error("Erreur demo data:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/tracking/vessel/:imo", authenticateToken, async (req, res) => {
    try {
      const { imo } = req.params;
      const vesselData = await vizionService.getVesselPosition(imo);
      
      if (!vesselData) {
        return res.status(404).json({ error: "Navire non trouvé" });
      }

      res.json(vesselData);
    } catch (error) {
      console.error("Erreur vessel tracking:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Fonctions utilitaires pour l'optimisation IA
  const calculateOptimizedDuration = (currentDuration: string, transportMode: string): string => {
    const days = parseInt(currentDuration.replace(/[^\d]/g, ''));
    let optimizedDays = days;
    
    switch(transportMode) {
      case 'maritime':
        optimizedDays = Math.max(1, Math.floor(days * 0.88)); // 12% reduction
        break;
      case 'terrestre':
        optimizedDays = Math.max(1, Math.floor(days * 0.85)); // 15% reduction
        break;
      case 'aerienne':
        optimizedDays = Math.max(1, Math.floor(days * 0.92)); // 8% reduction
        break;
    }
    
    return `${optimizedDays} jour${optimizedDays > 1 ? 's' : ''}`;
  };

  const calculateOptimizedCost = (currentCost: string, transportMode: string): string => {
    const cost = parseFloat(currentCost.replace(/[^\d.,]/g, '').replace(',', '.'));
    let optimizedCost = cost;
    
    switch(transportMode) {
      case 'maritime':
        optimizedCost = cost * 0.85; // 15% reduction
        break;
      case 'terrestre':
        optimizedCost = cost * 0.82; // 18% reduction
        break;
      case 'aerienne':
        optimizedCost = cost * 0.88; // 12% reduction
        break;
    }
    
    return `${Math.round(optimizedCost).toLocaleString()}€`;
  };

  const calculateOptimizedCO2 = (currentCO2: string, transportMode: string): string => {
    const co2Value = parseFloat(currentCO2.replace(/[^\d.,]/g, '').replace(',', '.'));
    let optimizedCO2 = co2Value;
    
    switch(transportMode) {
      case 'maritime':
        optimizedCO2 = co2Value * 0.85; // 15% reduction
        break;
      case 'terrestre':
        optimizedCO2 = co2Value * 0.78; // 22% reduction
        break;
      case 'aerienne':
        optimizedCO2 = co2Value * 0.90; // 10% reduction
        break;
    }
    
    const unit = currentCO2.includes('kg/TEU') ? ' kg/TEU' : 
                 currentCO2.includes('kg/T') ? ' kg/T' : ' kg';
    return `${Math.round(optimizedCO2)}${unit}`;
  };

  // Routes AI pour l'optimisation et l'analyse de routes
  app.post("/api/ai/optimize-route", async (req: any, res) => {
    try {
      const { routeId, origin, destination, transportMode, currentMetrics } = req.body;
      
      // Simulation d'optimisation IA avancée
      const optimizationResult = {
        routeId,
        optimizedMetrics: {
          duration: calculateOptimizedDuration(currentMetrics.duration, transportMode),
          cost: calculateOptimizedCost(currentMetrics.cost, transportMode),
          efficiency: Math.min(100, currentMetrics.efficiency + 8),
          co2: calculateOptimizedCO2(currentMetrics.co2, transportMode)
        },
        improvements: {
          durationReduction: "12%",
          costSaving: "850€",
          efficiencyGain: "8%",
          co2Reduction: "15%"
        },
        recommendations: [
          "Utiliser le corridor maritime optimisé via Suez",
          "Consolider avec 2 autres expéditions similaires",
          "Programmer le départ pendant les heures creuses",
          "Négocier un contrat volume avec MSC"
        ],
        alternativeRoutes: [
          {
            name: "Route Alternative 1",
            duration: "12 jours",
            cost: "2,150€",
            efficiency: 94,
            description: "Via Rotterdam avec transbordement"
          },
          {
            name: "Route Alternative 2", 
            duration: "16 jours",
            cost: "1,950€",
            efficiency: 89,
            description: "Route directe économique"
          }
        ],
        aiInsights: "L'IA recommande une consolidation de cargo pour optimiser les coûts et réduire l'empreinte carbone de 15%.",
        implementation: {
          priority: "Haute",
          timeframe: "48h",
          requiredActions: ["Négociation transporteur", "Consolidation cargo", "Mise à jour planning"]
        }
      };

      res.json(optimizationResult);
    } catch (error) {
      console.error("Erreur optimisation route:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/ai/analyze-route", async (req: any, res) => {
    try {
      const { routeId, origin, destination, transportMode, metrics } = req.body;
      
      // Simulation d'analyse IA complète
      const analysisResult = {
        routeId,
        performanceAnalysis: {
          overall: "Très bon",
          score: 87,
          strengths: [
            "Efficacité énergétique élevée",
            "Réseau de transporteurs fiable", 
            "Fréquence optimale"
          ],
          weaknesses: [
            "Coût légèrement au-dessus de la moyenne",
            "Vulnérabilité aux conditions météo",
            "Délais de dédouanement variables"
          ]
        },
        marketComparison: {
          positionVsCompetitors: "Top 25%",
          costBenchmark: "108% de la moyenne marché",
          speedBenchmark: "115% plus rapide",
          reliabilityScore: "92%"
        },
        riskAssessment: {
          overallRisk: "Moyen",
          factors: [
            { type: "Géopolitique", level: "Faible", impact: "Minimal" },
            { type: "Météorologique", level: "Moyen", impact: "Délais possibles" },
            { type: "Économique", level: "Faible", impact: "Fluctuation carburant" },
            { type: "Opérationnel", level: "Faible", impact: "Congestion portuaire" }
          ]
        },
        sustainability: {
          carbonScore: "B+",
          complianceLevel: "100%",
          greenAlternatives: 2,
          futureRegulations: "Conforme aux standards 2025"
        },
        predictions: {
          demandForecast: "+12% sur 6 mois",
          priceEvolution: "Stable avec légère hausse Q3",
          capacityTrends: "Augmentation prévue",
          newTechnologies: ["Navires hybrides disponibles 2024", "IA tracking avancé"]
        },
        aiRecommendations: [
          "Négocier des contrats annuels pour stabiliser les coûts",
          "Intégrer des alternatives vertes dans 6 mois",
          "Surveiller les développements du canal de Suez",
          "Planifier une diversification vers l'aérien pour urgences"
        ]
      };

      res.json(analysisResult);
    } catch (error) {
      console.error("Erreur analyse route:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // AI Agent Automation endpoints
  app.post("/api/ai/process-logistics", authenticateToken, async (req: any, res) => {
    try {
      const { aiAgent } = await import('./ai-agent');
      
      const logisticsRequest = req.body;
      const result = await aiAgent.processLogisticsRequest(
        logisticsRequest,
        req.user.companyId,
        req.user.userId
      );
      
      res.json(result);
    } catch (error) {
      console.error('AI processing error:', error);
      res.status(500).json({ message: 'Failed to process logistics request automatically' });
    }
  });

  app.post("/api/ai/optimize-quote", authenticateToken, async (req: any, res) => {
    try {
      const { aiAgent } = await import('./ai-agent');
      
      const { quoteRequestId } = req.body;
      const quoteRequest = await storage.getQuoteRequest(quoteRequestId);
      
      if (!quoteRequest) {
        return res.status(404).json({ message: 'Quote request not found' });
      }
      
      // Re-process with AI optimization
      const optimization = await aiAgent.optimizeExistingQuote(quoteRequest);
      
      res.json(optimization);
    } catch (error) {
      console.error('AI optimization error:', error);
      res.status(500).json({ message: 'Failed to optimize quote' });
    }
  });

  // AI Automation process endpoint
  app.post("/api/ai/process", authenticateToken, async (req: any, res) => {
    try {
      const { aiAgent } = await import('./ai-agent');
      
      const logisticsRequest = req.body;
      const result = await aiAgent.processLogisticsRequest(
        logisticsRequest,
        req.user.companyId,
        req.user.userId
      );
      
      res.json(result);
    } catch (error) {
      console.error('AI processing error:', error);
      res.status(500).json({ message: 'Failed to process logistics request automatically' });
    }
  });

  // Routes pour les outils d'optimisation intelligente
  app.post("/api/ai/predictive-analysis", async (req: any, res) => {
    try {
      const { transportMode } = req.body;
      
      const predictiveData = {
        transportMode,
        predictions: {
          demandForecast: {
            next30Days: "+18%",
            next90Days: "+25%",
            yearEnd: "+35%",
            peakSeasons: ["Q4 2024", "Q1 2025"]
          },
          priceEvolution: {
            shortTerm: "Stabilité avec hausse 3-5%",
            mediumTerm: "Hausse modérée 8-12%",
            longTerm: "Croissance soutenue 15-20%",
            volatilityRisk: "Moyen"
          },
          capacityTrends: {
            currentUtilization: "87%",
            projectedCapacity: "+12% d'ici 6 mois",
            bottlenecks: ["Port de Shanghai", "Canal de Suez"],
            newInfrastructure: ["Terminal Hamburg 2025", "Rail Silk Road expansion"]
          },
          marketDisruptions: [
            {
              event: "Nouvelles réglementations CO₂",
              probability: "Élevée",
              impact: "Hausse coûts 10-15%",
              timeline: "Q2 2024"
            },
            {
              event: "Tension géopolitique Mer Rouge",
              probability: "Moyenne",
              impact: "Détours +7 jours",
              timeline: "Monitoring continu"
            }
          ]
        },
        recommendations: [
          "Sécuriser capacités Q4 2024 dès maintenant",
          "Diversifier routes pour réduire dépendance Suez",
          "Investir dans solutions low-carbon avant nouvelles réglementations",
          "Négocier contrats longs terme avant hausse tarifaire"
        ],
        aiConfidence: "94%"
      };

      res.json(predictiveData);
    } catch (error) {
      console.error("Erreur analyse prédictive:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/ai/global-optimization", async (req: any, res) => {
    try {
      const { transportMode } = req.body;
      
      const globalOptimization = {
        transportMode,
        strategy: {
          overallApproach: "Optimisation multi-corridor intelligente",
          primaryObjective: "Réduction coûts 22% • Amélioration délais 18%",
          secondaryObjectives: ["Durabilité +30%", "Fiabilité 99.5%", "Flexibilité maximisée"]
        },
        corridorOptimization: [
          {
            corridor: "Asie-Europe",
            currentPerformance: "78%",
            optimizedPerformance: "94%",
            improvements: [
              "Consolidation 3 hubs majeurs",
              "Routage dynamique IA",
              "Partenariats stratégiques MSC/CMA CGM"
            ],
            savings: "1.2M€/an"
          },
          {
            corridor: "Transatlantique",
            currentPerformance: "82%",
            optimizedPerformance: "96%",
            improvements: [
              "Optimisation temps escales",
              "Négociation volumes groupés",
              "Intégration rail-mer intelligente"
            ],
            savings: "850K€/an"
          }
        ],
        networkEffects: {
          synergies: "Économies échelle +15%",
          riskDiversification: "Exposition réduite 35%",
          capacityUtilization: "Optimisation 91% → 97%",
          carbonFootprint: "Réduction 28% via consolidation"
        },
        implementation: {
          phase1: "Migration hub principal (2 mois)",
          phase2: "Déploiement corridors secondaires (4 mois)",
          phase3: "Optimisation fine IA continue",
          totalROI: "320% sur 24 mois"
        },
        aiRecommendations: [
          "Prioriser corridor Asie-Europe pour impact maximum",
          "Négocier exclusivités avec top carriers",
          "Déployer tracking IoT sur routes critiques",
          "Automatiser 85% décisions routage"
        ]
      };

      res.json(globalOptimization);
    } catch (error) {
      console.error("Erreur optimisation globale:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/ai/risk-management", async (req: any, res) => {
    try {
      const { transportMode } = req.body;
      
      const riskManagement = {
        transportMode,
        riskProfile: {
          overallRisk: "Modéré",
          riskScore: 68,
          trend: "Stable avec vigilance géopolitique",
          lastUpdate: new Date().toISOString()
        },
        riskCategories: [
          {
            category: "Géopolitique",
            level: "Élevé",
            score: 78,
            factors: [
              "Tensions Mer Rouge/Canal Suez",
              "Sanctions commerciales évolutives",
              "Instabilité régionale Moyen-Orient"
            ],
            mitigation: [
              "Routes alternatives activées",
              "Monitoring intelligence géopolitique",
              "Assurance cargo renforcée"
            ],
            impact: "Délais +5-15 jours, Coûts +12-25%"
          },
          {
            category: "Opérationnel",
            level: "Moyen",
            score: 55,
            factors: [
              "Congestion portuaire Shanghai/Rotterdam",
              "Pénurie main d'œuvre logistique",
              "Maintenance flottes vieillissantes"
            ],
            mitigation: [
              "Diversification ports d'escale",
              "Partenariats renforcés",
              "Monitoring prédictif équipements"
            ],
            impact: "Délais +2-7 jours, Coûts +5-12%"
          },
          {
            category: "Environnemental",
            level: "Moyen",
            score: 62,
            factors: [
              "Conditions météo extrêmes",
              "Nouvelles réglementations carbones",
              "Zones d'émissions contrôlées"
            ],
            mitigation: [
              "Routage météo intelligent",
              "Flotte low-carbon privilégiée",
              "Compliance proactive"
            ],
            impact: "Délais +1-5 jours, Coûts +8-18%"
          }
        ],
        contingencyPlans: [
          {
            scenario: "Fermeture Canal Suez",
            probability: "15%",
            alternativeRoute: "Cap de Bonne Espérance",
            additionalTime: "+12-15 jours",
            additionalCost: "+35-45%",
            activation: "Automatique via IA"
          },
          {
            scenario: "Grève portuaire majeure",
            probability: "25%",
            alternativeRoute: "Ports secondaires + transport terrestre",
            additionalTime: "+3-8 jours",
            additionalCost: "+15-25%",
            activation: "Manuel avec validation"
          }
        ],
        monitoring: {
          realTimeAlerts: "Actif 24/7",
          predictiveIndicators: [
            "Indices géopolitiques",
            "Données météo avancées",
            "Capacités portuaires temps réel",
            "Prix carburants et change"
          ],
          responseTime: "< 15 minutes",
          escalationMatrix: "Automatisée selon criticité"
        },
        insurance: {
          coverage: "Cargo + Délais + Force majeure",
          premium: "0.12% valeur marchandise",
          claims: "98.5% traitement automatisé",
          partnerships: ["Allianz Marine", "AXA XL", "Zurich"]
        }
      };

      res.json(riskManagement);
    } catch (error) {
      console.error("Erreur gestion des risques:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Comprehensive global geocoding endpoint with dual API coverage
  app.get('/api/geocoding/search', async (req, res) => {
    try {
      const { query, types = 'geocode', limit = 8 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const searchQuery = String(query).trim();
      console.log(`Global geocoding search for: "${searchQuery}"`);

      let suggestions: any[] = [];

      // Try Google Places API (New) first for comprehensive logistics coverage
      const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (googleApiKey) {
        try {
          console.log("Using Google Places API (New) for comprehensive coverage...");
          
          const googleResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': googleApiKey,
              'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.id,places.types'
            },
            body: JSON.stringify({
              textQuery: searchQuery,
              languageCode: 'fr',
              maxResultCount: 5
            })
          });
          
          if (googleResponse.ok) {
            const googleData = await googleResponse.json();
            
            if (googleData.places?.length > 0) {
              // Process Google Places API (New) results directly
              suggestions = googleData.places.map((place: any) => {
                let locationType = "city";
                
                // Determine type based on Google place types
                if (place.types?.some((t: string) => t.includes('airport'))) {
                  locationType = "airport";
                } else if (place.types?.some((t: string) => ['establishment', 'point_of_interest'].includes(t)) &&
                           (place.displayName?.text?.toLowerCase().includes('port') || 
                            place.formattedAddress?.toLowerCase().includes('port'))) {
                  locationType = "port";
                } else if (place.types?.some((t: string) => ['locality', 'administrative_area_level_1', 'country'].includes(t))) {
                  locationType = "city";
                }
                
                return {
                  text: place.formattedAddress || place.displayName?.text,
                  value: place.formattedAddress || place.displayName?.text,
                  coordinates: [
                    place.location?.longitude || 0,
                    place.location?.latitude || 0
                  ],
                  type: locationType,
                  source: "google_places_new"
                };
              });
              
              console.log(`Google Maps returned ${suggestions.length} results for "${searchQuery}"`);
            }
          }
        } catch (googleError) {
          console.error("Google Maps API error:", googleError);
        }
      }

      // If Google didn't return enough results, try Mapbox as backup
      if (suggestions.length < 3) {
        const mapboxToken = process.env.MAPBOX_API_KEY;
        if (mapboxToken) {
          try {
            console.log("Supplementing with Mapbox API...");
            
            const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json`;
            const mapboxParams = new URLSearchParams({
              access_token: mapboxToken,
              limit: (parseInt(limit as string) - suggestions.length).toString(),
              language: 'fr',
              types: 'place,locality,address,poi'
            });

            const mapboxResponse = await fetch(`${mapboxUrl}?${mapboxParams}`);
            
            if (mapboxResponse.ok) {
              const mapboxData = await mapboxResponse.json();
              
              if (mapboxData.features?.length > 0) {
                const mapboxSuggestions = mapboxData.features.map((feature: any) => {
                  let locationType = "city";
                  
                  if (feature.properties?.category?.includes("airport") || 
                      feature.place_name?.toLowerCase().includes("airport") ||
                      feature.place_name?.toLowerCase().includes("aéroport")) {
                    locationType = "airport";
                  } else if (feature.properties?.category?.includes("port") || 
                             feature.place_name?.toLowerCase().includes("port")) {
                    locationType = "port";
                  }

                  return {
                    text: feature.place_name,
                    value: feature.place_name,
                    coordinates: feature.geometry?.coordinates || [0, 0],
                    type: locationType,
                    source: "mapbox"
                  };
                });
                
                suggestions.push(...mapboxSuggestions);
                console.log(`Mapbox added ${mapboxSuggestions.length} additional results`);
              }
            }
          } catch (mapboxError) {
            console.error("Mapbox API error:", mapboxError);
          }
        }
      }

      // Always supplement with comprehensive logistics database for complete coverage
      console.log("Supplementing with comprehensive internal logistics database...");
      
      // Import comprehensive global database
      const { comprehensiveLocations } = await import('./comprehensive-locations');
      
      const searchLower = searchQuery.toLowerCase();
      const internalResults = comprehensiveLocations
          .filter(location => {
            return location.name.toLowerCase().includes(searchLower) ||
                   location.aliases.some(alias => alias.toLowerCase().includes(searchLower) || searchLower.includes(alias.toLowerCase()));
          })
          .sort((a, b) => {
            // Prioritize exact matches and relevant types
            const aExactMatch = a.name.toLowerCase().startsWith(searchLower) || 
                               a.aliases.some(alias => alias.toLowerCase().startsWith(searchLower));
            const bExactMatch = b.name.toLowerCase().startsWith(searchLower) || 
                               b.aliases.some(alias => alias.toLowerCase().startsWith(searchLower));
            
            if (aExactMatch && !bExactMatch) return -1;
            if (!aExactMatch && bExactMatch) return 1;
            
            // Prioritize ports and airports for logistics
            const typeOrder = { port: 1, airport: 2, city: 3 };
            return (typeOrder[a.type as keyof typeof typeOrder] || 4) - (typeOrder[b.type as keyof typeof typeOrder] || 4);
          })
          .slice(0, Math.max(3, parseInt(limit as string) - suggestions.length))
          .map(location => ({
            text: location.name,
            value: location.name,
            coordinates: location.coordinates,
            type: location.type,
            source: "comprehensive_database"
          }));
      
      // Merge external API results with internal comprehensive database
      const combinedResults = [...suggestions, ...internalResults];
      
      // Remove duplicates and limit results
      const uniqueResults = combinedResults
        .filter((item, index, array) => 
          array.findIndex(t => t.text.toLowerCase() === item.text.toLowerCase()) === index
        )
        .slice(0, parseInt(limit as string));
      
      console.log(`Combined results: ${uniqueResults.length} total (${suggestions.length} external + ${internalResults.length} internal)`);
      
      res.json({ suggestions: uniqueResults });
    } catch (error: any) {
      console.error("Geocoding search error:", error);
      res.status(500).json({ error: "Geocoding service error", message: error.message });
    }
  });

  // Carriers routes
  app.get("/api/carriers", authenticateToken, async (req: any, res) => {
    try {
      const carriers = await storage.getCarriers();
      res.json(carriers);
    } catch (error) {
      console.error('Carriers error:', error);
      res.status(500).json({ message: 'Failed to fetch carriers' });
    }
  });

  // API de test pour générer des cotations automatiques
  app.post("/api/quotes/generate", authenticateToken, async (req: any, res) => {
    try {
      const { quoteRequestId } = req.body;
      
      if (!quoteRequestId) {
        return res.status(400).json({ error: 'Quote request ID is required' });
      }

      console.log(`Génération de cotations pour la demande ${quoteRequestId}`);

      // Récupérer la demande de cotation
      const quoteRequest = await storage.getQuoteRequest(quoteRequestId);
      if (!quoteRequest) {
        return res.status(404).json({ error: 'Quote request not found' });
      }

      // Récupérer tous les transporteurs disponibles
      const carriers = await storage.getCarriers();
      
      // Générer des cotations réalistes basées sur la demande
      const generatedQuotes = [];
      
      for (const carrier of carriers.slice(0, 3)) { // Limiter à 3 transporteurs
        // Calculer un prix de base basé sur le poids et la distance estimée
        const basePrice = calculateRealisticPrice(quoteRequest, carrier);
        const deliveryDays = calculateDeliveryTime(quoteRequest, carrier);
        
        const quote = {
          quoteRequestId: quoteRequestId,
          carrierId: carrier.id,
          price: basePrice.toString(),
          estimatedDays: deliveryDays,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          conditions: generateRealisticTerms(carrier, quoteRequest),
          status: 'pending' as const
        };

        const createdQuote = await storage.createQuote(quote);
        generatedQuotes.push(createdQuote);
        
        console.log(`Cotation générée: ${carrier.name} - ${basePrice}€ - ${deliveryDays} jours`);
      }

      // Mettre à jour le statut de la demande
      await storage.updateQuoteRequest(quoteRequestId, {
        status: 'quoted'
      });

      // Créer une activité
      await storage.createActivity({
        companyId: quoteRequest.companyId,
        userId: quoteRequest.userId, // Utiliser l'utilisateur de la demande
        action: 'quotes_generated',
        description: `${generatedQuotes.length} cotations générées pour ${quoteRequest.reference}`,
        entityType: 'quote_request',
        entityId: quoteRequestId
      });

      res.json({
        success: true,
        quotes: generatedQuotes,
        message: `${generatedQuotes.length} cotations générées avec succès`
      });

    } catch (error) {
      console.error('Erreur génération cotations:', error);
      res.status(500).json({ message: 'Erreur lors de la génération des cotations' });
    }
  });

  // Fonction pour calculer un prix réaliste
  function calculateRealisticPrice(quoteRequest: any, carrier: any): number {
    const { weight, dimensions } = quoteRequest;
    
    // Prix de base selon le mode de transport
    let basePricePerKg = 2.5; // Route par défaut
    
    if (quoteRequest.transportMode === 'maritime') {
      basePricePerKg = 1.2;
    } else if (quoteRequest.transportMode === 'aerien') {
      basePricePerKg = 4.8;
    }
    
    // Calcul du prix de base
    let basePrice = weight * basePricePerKg;
    
    // Ajustements selon le transporteur
    const carrierMultipliers: { [key: string]: number } = {
      'DHL Express': 1.3,
      'FedEx International': 1.25,
      'UPS Worldwide': 1.2,
      'Maersk Line': 0.9,
      'MSC Mediterranean': 0.85,
      'CMA CGM': 0.88,
      'Air France Cargo': 1.15,
      'Lufthansa Cargo': 1.18,
      'Emirates SkyCargo': 1.1
    };
    
    const multiplier = carrierMultipliers[carrier.name] || 1.0;
    basePrice *= multiplier;
    
    // Ajustement volumétrique si dimensions fournies
    if (dimensions) {
      const volume = parseFloat(dimensions.split('x')[0] || '1') * 
                    parseFloat(dimensions.split('x')[1] || '1') * 
                    parseFloat(dimensions.split('x')[2] || '1');
      
      if (volume > weight * 0.0067) { // Ratio volumétrique standard
        basePrice *= 1.2;
      }
    }
    
    // Frais fixes selon le mode
    let fixedFees = 50; // Route
    if (quoteRequest.transportMode === 'maritime') {
      fixedFees = 150;
    } else if (quoteRequest.transportMode === 'aerien') {
      fixedFees = 200;
    }
    
    basePrice += fixedFees;
    
    // Arrondir à l'euro près
    return Math.round(basePrice);
  }



  // Fonction pour calculer la progression du voyage
  function calculateProgress(locations: any[]): number {
    if (!locations || locations.length === 0) return 0;
    
    // Simple progress calculation based on journey stages
    const stages = ['loaded', 'departure', 'transit', 'arrival', 'delivery'];
    const latestEvent = locations[locations.length - 1]?.event?.toLowerCase() || '';
    
    for (let i = 0; i < stages.length; i++) {
      if (latestEvent.includes(stages[i])) {
        return Math.min(90, (i + 1) * 20);
      }
    }
    return 25; // Default progress
  }

  function calculateDeliveryTime(quoteRequest: any, carrier: any): number {
    let baseDays = 5; // Route par défaut
    
    if (quoteRequest.transportMode === 'maritime') {
      baseDays = 25;
    } else if (quoteRequest.transportMode === 'aerien') {
      baseDays = 3;
    }
    
    // Ajustements selon le transporteur
    const carrierAdjustments: { [key: string]: number } = {
      'DHL Express': -1,
      'FedEx International': -1,
      'UPS Worldwide': 0,
      'Maersk Line': 2,
      'MSC Mediterranean': 3,
      'CMA CGM': 1,
      'Air France Cargo': 0,
      'Lufthansa Cargo': -1,
      'Emirates SkyCargo': 0
    };
    
    const adjustment = carrierAdjustments[carrier.name] || 0;
    return Math.max(1, baseDays + adjustment);
  }

  // Fonction pour générer des conditions réalistes
  function generateRealisticTerms(carrier: any, quoteRequest: any): string {
    const baseTerms = [
      "Prix valable 30 jours",
      "Assurance comprise jusqu'à 1000€",
      "Enlèvement et livraison inclus"
    ];
    
    if (quoteRequest.transportMode === 'maritime') {
      baseTerms.push("Frais de port inclus");
      baseTerms.push("Dédouanement export/import en sus");
    } else if (quoteRequest.transportMode === 'aerien') {
      baseTerms.push("Frais de carburant inclus");
      baseTerms.push("Surtaxe sécurité comprise");
    }
    
    return baseTerms.join(' • ');
  }

  // Fonction pour générer des notes de transporteur
  function generateCarrierNotes(carrier: any, quoteRequest: any): string {
    const notes = [];
    
    if (quoteRequest.transportMode === 'maritime') {
      notes.push(`Service maritime régulier ${quoteRequest.origin} → ${quoteRequest.destination}`);
      notes.push("Départ hebdomadaire, documentation complète requise");
    } else if (quoteRequest.transportMode === 'aerien') {
      notes.push(`Vol direct disponible via ${carrier.name}`);
      notes.push("Enlèvement J+1, livraison express possible");
    } else {
      notes.push(`Transport routier sécurisé par ${carrier.name}`);
      notes.push("Suivi temps réel, livraison sur rendez-vous");
    }
    
    return notes.join(' | ');
  }

  const httpServer = createServer(app);

  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Broadcast message to all connected clients
        // In a real implementation, you'd filter by company/conversation
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Notification API endpoints
  app.get("/api/notifications", authenticateToken, async (req: any, res) => {
    try {
      const notifications = notificationService.getNotifications(req.user.companyId, 50, false);
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  app.post("/api/notifications/mark-read", authenticateToken, async (req: any, res) => {
    try {
      const { notificationId } = req.body;
      const success = notificationService.markAsRead(notificationId, req.user.companyId);
      res.json({ success });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  app.post("/api/notifications/mark-all-read", authenticateToken, async (req: any, res) => {
    try {
      const count = notificationService.markAllAsRead(req.user.companyId);
      res.json({ markedCount: count });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
  });

  // Payment and invoice API endpoints
  app.get("/api/invoices", authenticateToken, async (req: any, res) => {
    try {
      const invoices = paymentService.getCompanyInvoices(req.user.companyId);
      res.json(invoices);
    } catch (error) {
      console.error('Get invoices error:', error);
      res.status(500).json({ message: 'Failed to fetch invoices' });
    }
  });

  app.post("/api/payments/create-intent", authenticateToken, async (req: any, res) => {
    try {
      const { shipmentId, amount, description } = req.body;
      const paymentIntent = await paymentService.createShipmentPayment(
        req.user.companyId,
        req.user.userId,
        shipmentId,
        amount,
        description
      );
      res.json(paymentIntent);
    } catch (error) {
      console.error('Create payment intent error:', error);
      res.status(500).json({ message: 'Failed to create payment intent' });
    }
  });

  app.post("/api/payments/process", authenticateToken, async (req: any, res) => {
    try {
      const { paymentIntentId, paymentMethodId } = req.body;
      const result = await paymentService.processPayment(paymentIntentId, paymentMethodId);
      res.json(result);
    } catch (error) {
      console.error('Process payment error:', error);
      res.status(500).json({ message: 'Failed to process payment' });
    }
  });

  app.get("/api/subscription/plans", async (req, res) => {
    try {
      const plans = paymentService.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error('Get subscription plans error:', error);
      res.status(500).json({ message: 'Failed to fetch subscription plans' });
    }
  });

  app.post("/api/subscription/create", authenticateToken, async (req: any, res) => {
    try {
      const { planId } = req.body;
      const result = await paymentService.createSubscription(req.user.companyId, planId);
      res.json(result);
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({ message: 'Failed to create subscription' });
    }
  });

  app.get("/api/subscription", authenticateToken, async (req: any, res) => {
    try {
      const subscription = paymentService.getCompanySubscription(req.user.companyId);
      res.json(subscription);
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({ message: 'Failed to fetch subscription' });
    }
  });

  return httpServer;
}

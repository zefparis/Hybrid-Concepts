import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertCompanySchema, insertQuoteRequestSchema, insertDocumentSchema, insertChatMessageSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthRequest extends Request {
  user?: any;
}

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
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
      res.status(400).json({ message: 'Registration failed', error: error.message });
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
    
    for (const [index, carrier] of availableCarriers.entries()) {
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
      // Auto-detect transport mode based on locations
      const detectTransportMode = (origin: string, destination: string) => {
        const isAirport = (location: string) => {
          const airportKeywords = ['aéroport', 'airport', 'cdg', 'heathrow', 'changi', 'tambo', 'jfk', 'lax', 'orly', 'roissy'];
          return airportKeywords.some(keyword => location.toLowerCase().includes(keyword));
        };
        
        const isPort = (location: string) => {
          const portKeywords = ['port du', 'port de', 'port of', 'port d\'', 'harbour', 'harbor', 'terminal maritime', 'terminal portuaire', 'quai', 'wharf'];
          return portKeywords.some(keyword => location.toLowerCase().includes(keyword.toLowerCase()));
        };
        
        console.log(`Detecting transport mode for: "${origin}" → "${destination}"`);
        console.log(`Origin is port: ${isPort(origin)}, Destination is port: ${isPort(destination)}`);
        
        if (isAirport(origin) || isAirport(destination)) {
          console.log('Mode détecté: aérien');
          return 'air';
        } else if (isPort(origin) || isPort(destination)) {
          console.log('Mode détecté: maritime');
          return 'mer';
        } else {
          console.log('Mode détecté: routier (par défaut)');
          return req.body.transportMode || 'terre';
        }
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
      res.status(400).json({ message: 'Failed to create document', error: error.message });
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
      res.status(400).json({ message: 'Failed to send message', error: error.message });
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

  // Global geocoding search endpoint using Mapbox API
  app.get('/api/geocoding/search', async (req, res) => {
    try {
      const { query, types = 'geocode', limit = 8 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const searchQuery = String(query).trim();
      console.log(`Mapbox geocoding search for: "${searchQuery}"`);

      const mapboxToken = process.env.MAPBOX_API_KEY;
      if (!mapboxToken) {
        return res.status(500).json({ error: 'Mapbox API key not configured' });
      }

      // Use Mapbox Geocoding API for worldwide coverage
      const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json`;
      const mapboxParams = new URLSearchParams({
        access_token: mapboxToken,
        limit: limit.toString(),
        language: 'fr',
        types: 'place,locality,address,poi'
      });

      const response = await fetch(`${mapboxUrl}?${mapboxParams}`);
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        return res.json({ suggestions: [] });
      }

      // Transform Mapbox results to our format
      const suggestions = data.features.map((feature: any) => {
        // Determine location type based on Mapbox properties
        let locationType = "city";
        
        if (feature.properties?.category?.includes("airport") || 
            feature.place_name?.toLowerCase().includes("airport") ||
            feature.place_name?.toLowerCase().includes("aéroport") ||
            feature.place_type?.includes("airport")) {
          locationType = "airport";
        } else if (feature.properties?.category?.includes("port") || 
                   feature.place_name?.toLowerCase().includes("port") ||
                   feature.place_type?.includes("poi") && 
                   feature.text?.toLowerCase().includes("port")) {
          locationType = "port";
        } else if (feature.place_type?.includes("place") || 
                   feature.place_type?.includes("locality")) {
          locationType = "city";
        }

        return {
          text: feature.place_name,
          value: feature.place_name,
          coordinates: feature.geometry?.coordinates || [0, 0],
          type: locationType,
          source: "mapbox"
        };
      });
      
      console.log(`Mapbox returned ${suggestions.length} results for "${searchQuery}"`);
      
      res.json({ suggestions });
    } catch (error) {
      console.error("Mapbox geocoding error:", error);
      
      // Fallback to internal database if Mapbox fails
      console.log("Falling back to internal database...");
      
      try {
        const searchQuery = String(query).toLowerCase().trim();
        
        // Basic internal database for fallback
        const fallbackLocations = [
          { name: "Paris, France", coordinates: [2.3522, 48.8566], type: "city" },
          { name: "Londres, Royaume-Uni", coordinates: [-0.1276, 51.5074], type: "city" },
          { name: "New York, États-Unis", coordinates: [-74.0060, 40.7128], type: "city" },
          { name: "Tokyo, Japon", coordinates: [139.6917, 35.6895], type: "city" },
          { name: "Shanghai, Chine", coordinates: [121.4737, 31.2304], type: "city" },
          { name: "Singapour", coordinates: [103.8198, 1.3521], type: "city" },
          { name: "Dubaï, Émirats Arabes Unis", coordinates: [55.2708, 25.2048], type: "city" },
          { name: "Sydney, Australie", coordinates: [151.2093, -33.8688], type: "city" },
          { name: "Le Cap, Afrique du Sud", coordinates: [18.4241, -33.9249], type: "city" },
          { name: "São Paulo, Brésil", coordinates: [-46.6333, -23.5505], type: "city" },
          
          // Major airports
          { name: "Aéroport Charles de Gaulle, Paris", coordinates: [2.5500, 49.0097], type: "airport" },
          { name: "Aéroport Heathrow, Londres", coordinates: [-0.4543, 51.4700], type: "airport" },
          { name: "Aéroport JFK, New York", coordinates: [-73.7781, 40.6413], type: "airport" },
          { name: "Aéroport Narita, Tokyo", coordinates: [140.3929, 35.7719], type: "airport" },
          { name: "Aéroport Changi, Singapour", coordinates: [103.9915, 1.3644], type: "airport" },
          
          // Major ports
          { name: "Port de Shanghai, Chine", coordinates: [121.5000, 31.2000], type: "port" },
          { name: "Port de Rotterdam, Pays-Bas", coordinates: [4.1427, 51.9244], type: "port" },
          { name: "Port de Los Angeles, États-Unis", coordinates: [-118.2437, 33.7405], type: "port" },
          { name: "Port de Singapour", coordinates: [103.8198, 1.3521], type: "port" },
          { name: "Port de Dubaï, Émirats Arabes Unis", coordinates: [55.2708, 25.2048], type: "port" }
        ];
        
        const fallbackResults = fallbackLocations
          .filter(location => location.name.toLowerCase().includes(searchQuery))
          .slice(0, parseInt(limit as string))
          .map(location => ({
            text: location.name,
            value: location.name,
            coordinates: location.coordinates,
            type: location.type,
            source: "fallback"
          }));
          
        console.log(`Fallback returned ${fallbackResults.length} results for "${searchQuery}"`);
        res.json({ suggestions: fallbackResults });
        
      } catch (fallbackError) {
        console.error("Fallback geocoding error:", fallbackError);
        res.status(500).json({ error: "Geocoding service unavailable", message: error.message });
      }
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

  // Fonction pour calculer le délai de livraison
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

  return httpServer;
}

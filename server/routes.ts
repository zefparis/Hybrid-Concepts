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

      // Try Google Maps API first for comprehensive logistics coverage
      const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (googleApiKey) {
        try {
          console.log("Using Google Maps API for comprehensive coverage...");
          
          const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json`;
          const googleParams = new URLSearchParams({
            input: searchQuery,
            key: googleApiKey,
            language: 'fr',
            types: 'establishment|geocode',
            fields: 'place_id,name,geometry'
          });

          const googleResponse = await fetch(`${googleUrl}?${googleParams}`);
          
          if (googleResponse.ok) {
            const googleData = await googleResponse.json();
            
            if (googleData.status === 'OK' && googleData.predictions?.length > 0) {
              // Get place details for coordinates
              const detailPromises = googleData.predictions.slice(0, parseInt(limit as string)).map(async (prediction: any) => {
                try {
                  const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json`;
                  const detailParams = new URLSearchParams({
                    place_id: prediction.place_id,
                    key: googleApiKey,
                    fields: 'name,geometry,type,formatted_address'
                  });
                  
                  const detailResponse = await fetch(`${detailUrl}?${detailParams}`);
                  const detailData = await detailResponse.json();
                  
                  if (detailData.status === 'OK' && detailData.result) {
                    const result = detailData.result;
                    let locationType = "city";
                    
                    // Determine type based on Google place types
                    if (result.types?.some((t: string) => t.includes('airport'))) {
                      locationType = "airport";
                    } else if (result.types?.some((t: string) => ['seaport', 'port'].includes(t)) ||
                               result.name?.toLowerCase().includes('port')) {
                      locationType = "port";
                    } else if (result.types?.some((t: string) => ['locality', 'administrative_area', 'country'].includes(t))) {
                      locationType = "city";
                    }
                    
                    return {
                      text: result.formatted_address || result.name,
                      value: result.formatted_address || result.name,
                      coordinates: [
                        result.geometry?.location?.lng || 0,
                        result.geometry?.location?.lat || 0
                      ],
                      type: locationType,
                      source: "google_maps"
                    };
                  }
                  return null;
                } catch (error) {
                  console.error("Google Places detail error:", error);
                  return null;
                }
              });
              
              const detailResults = await Promise.all(detailPromises);
              suggestions = detailResults.filter(result => result !== null);
              
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
      
      const comprehensiveLocations = [
          // Major Global Ports
          { name: "Port de Shanghai, Chine", coordinates: [121.5000, 31.2000], type: "port", aliases: ["shanghai port", "port shanghai", "yangshan"] },
          { name: "Port de Singapour", coordinates: [103.8198, 1.3521], type: "port", aliases: ["singapore port", "port singapore", "psa"] },
          { name: "Port de Rotterdam, Pays-Bas", coordinates: [4.1427, 51.9244], type: "port", aliases: ["rotterdam port", "port rotterdam", "europoort"] },
          { name: "Port de Los Angeles, États-Unis", coordinates: [-118.2437, 33.7405], type: "port", aliases: ["la port", "los angeles port", "port los angeles"] },
          { name: "Port de Durban, Afrique du Sud", coordinates: [31.0218, -29.8587], type: "port", aliases: ["durban port", "port durban"] },
          { name: "Port du Cap, Afrique du Sud", coordinates: [18.4265, -33.9058], type: "port", aliases: ["cape town port", "port cape town"] },
          { name: "Port de Casablanca, Maroc", coordinates: [-7.6164, 33.6022], type: "port", aliases: ["casablanca port", "port casablanca"] },
          { name: "Port de Matadi, République Démocratique du Congo", coordinates: [13.4667, -5.8167], type: "port", aliases: ["matadi port", "port matadi"] },
          { name: "Port de Dakar, Sénégal", coordinates: [-17.4441, 14.7167], type: "port", aliases: ["dakar port", "port dakar"] },
          { name: "Port d'Abidjan, Côte d'Ivoire", coordinates: [-4.0435, 5.3599], type: "port", aliases: ["abidjan port", "port abidjan"] },
          { name: "Port de Lagos, Nigéria", coordinates: [3.3792, 6.5244], type: "port", aliases: ["lagos port", "port lagos", "apapa"] },
          { name: "Port de Mombasa, Kenya", coordinates: [39.6682, -4.0435], type: "port", aliases: ["mombasa port", "port mombasa"] },
          { name: "Port de Djibouti", coordinates: [43.1456, 11.5883], type: "port", aliases: ["djibouti port", "port djibouti"] },
          { name: "Port Saïd, Égypte", coordinates: [32.3019, 31.2653], type: "port", aliases: ["port said", "suez canal"] },
          { name: "Port de Tanger Med, Maroc", coordinates: [-5.4972, 35.9167], type: "port", aliases: ["tanger med", "tangier med"] },
          
          // Major Global Airports
          { name: "Aéroport Jomo Kenyatta, Nairobi", coordinates: [36.9278, -1.3192], type: "airport", aliases: ["nairobi airport", "jomo kenyatta", "nbo"] },
          { name: "Aéroport O.R. Tambo, Johannesburg", coordinates: [28.2460, -26.1392], type: "airport", aliases: ["johannesburg airport", "or tambo", "jnb"] },
          { name: "Aéroport du Cap", coordinates: [18.6017, -33.9648], type: "airport", aliases: ["cape town airport", "cpt"] },
          { name: "Aéroport Mohammed V, Casablanca", coordinates: [-7.5895, 33.3675], type: "airport", aliases: ["casablanca airport", "cmn", "mohammed v"] },
          { name: "Aéroport du Caire", coordinates: [31.4056, 30.1219], type: "airport", aliases: ["cairo airport", "cai"] },
          { name: "Aéroport de Lagos", coordinates: [3.3211, 6.5772], type: "airport", aliases: ["lagos airport", "los", "murtala mohammed"] },
          { name: "Aéroport de Dakar", coordinates: [-17.0732, 14.7397], type: "airport", aliases: ["dakar airport", "dss", "leopold sedar senghor"] },
          { name: "Aéroport d'Abidjan", coordinates: [-3.9263, 5.2614], type: "airport", aliases: ["abidjan airport", "abj", "felix houphouet boigny"] },
          
          // Major Cities
          { name: "Nairobi, Kenya", coordinates: [36.8219, -1.2921], type: "city", aliases: ["nairobi"] },
          { name: "Johannesburg, Afrique du Sud", coordinates: [28.0473, -26.2041], type: "city", aliases: ["johannesburg", "joburg"] },
          { name: "Le Cap, Afrique du Sud", coordinates: [18.4241, -33.9249], type: "city", aliases: ["cape town", "le cap"] },
          { name: "Casablanca, Maroc", coordinates: [-7.5898, 33.5731], type: "city", aliases: ["casablanca"] },
          { name: "Lagos, Nigéria", coordinates: [3.3792, 6.5244], type: "city", aliases: ["lagos"] },
          { name: "Dakar, Sénégal", coordinates: [-17.4441, 14.7167], type: "city", aliases: ["dakar"] },
          { name: "Abidjan, Côte d'Ivoire", coordinates: [-4.0435, 5.3599], type: "city", aliases: ["abidjan"] },
          { name: "Accra, Ghana", coordinates: [-0.1969, 5.6037], type: "city", aliases: ["accra"] },
          { name: "Kinshasa, République Démocratique du Congo", coordinates: [15.2663, -4.4419], type: "city", aliases: ["kinshasa"] }
        ];
      
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

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

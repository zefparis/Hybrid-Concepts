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
      
      // Fix transport mode for existing quotes based on locations
      const fixedQuotes = quoteRequests.map(quote => {
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
        
        return {
          ...quote,
          transportMode: correctMode
        };
      });
      
      res.json(fixedQuotes);
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

  // Hybrid geocoding search endpoint with extensive global database
  app.get('/api/geocoding/search', async (req, res) => {
    try {
      const { query, types = 'geocode', limit = 8 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const searchQuery = String(query).toLowerCase().trim();
      console.log(`Global geocoding search for: "${searchQuery}"`);

      // Comprehensive global location database for logistics
      const globalLocations = [
        // Major Global Cities - Europe
        { name: "Paris, France", aliases: ["paris", "france", "fr"], coordinates: [2.3522, 48.8566], type: "city" },
        { name: "Londres, Royaume-Uni", aliases: ["london", "londres", "uk", "england", "royaume-uni"], coordinates: [-0.1276, 51.5074], type: "city" },
        { name: "Berlin, Allemagne", aliases: ["berlin", "germany", "deutschland", "allemagne"], coordinates: [13.4050, 52.5200], type: "city" },
        { name: "Madrid, Espagne", aliases: ["madrid", "spain", "espagne", "españa"], coordinates: [-3.7038, 40.4168], type: "city" },
        { name: "Rome, Italie", aliases: ["rome", "roma", "italy", "italie", "italia"], coordinates: [12.4964, 41.9028], type: "city" },
        { name: "Amsterdam, Pays-Bas", aliases: ["amsterdam", "netherlands", "holland", "pays-bas"], coordinates: [4.9041, 52.3676], type: "city" },
        { name: "Bruxelles, Belgique", aliases: ["brussels", "bruxelles", "belgium", "belgique"], coordinates: [4.3517, 50.8503], type: "city" },
        { name: "Zurich, Suisse", aliases: ["zurich", "switzerland", "suisse", "schweiz"], coordinates: [8.5417, 47.3769], type: "city" },
        { name: "Vienne, Autriche", aliases: ["vienna", "wien", "austria", "autriche"], coordinates: [16.3738, 48.2082], type: "city" },
        { name: "Barcelone, Espagne", aliases: ["barcelona", "barcelone", "spain", "espagne"], coordinates: [2.1734, 41.3851], type: "city" },
        { name: "Milan, Italie", aliases: ["milan", "milano", "italy", "italie"], coordinates: [9.1900, 45.4642], type: "city" },
        { name: "Stockholm, Suède", aliases: ["stockholm", "sweden", "suède"], coordinates: [18.0686, 59.3293], type: "city" },
        { name: "Copenhague, Danemark", aliases: ["copenhagen", "denmark", "danemark"], coordinates: [12.5683, 55.6761], type: "city" },
        { name: "Helsinki, Finlande", aliases: ["helsinki", "finland", "finlande"], coordinates: [24.9384, 60.1699], type: "city" },
        { name: "Oslo, Norvège", aliases: ["oslo", "norway", "norvège"], coordinates: [10.7522, 59.9139], type: "city" },
        { name: "Varsovie, Pologne", aliases: ["warsaw", "varsovie", "poland", "pologne"], coordinates: [21.0122, 52.2297], type: "city" },
        { name: "Prague, République Tchèque", aliases: ["prague", "czech republic", "tchèque"], coordinates: [14.4378, 50.0755], type: "city" },
        { name: "Budapest, Hongrie", aliases: ["budapest", "hungary", "hongrie"], coordinates: [19.0402, 47.4979], type: "city" },
        { name: "Athènes, Grèce", aliases: ["athens", "athènes", "greece", "grèce"], coordinates: [23.7275, 37.9838], type: "city" },
        { name: "Lisbonne, Portugal", aliases: ["lisbon", "lisbonne", "portugal"], coordinates: [-9.1393, 38.7223], type: "city" },
        { name: "Dublin, Irlande", aliases: ["dublin", "ireland", "irlande"], coordinates: [-6.2603, 53.3498], type: "city" },
        
        // Major Global Cities - North America
        { name: "New York, États-Unis", aliases: ["new york", "nyc", "usa", "états-unis", "america"], coordinates: [-74.0060, 40.7128], type: "city" },
        { name: "Los Angeles, États-Unis", aliases: ["los angeles", "la", "california", "usa"], coordinates: [-118.2437, 34.0522], type: "city" },
        { name: "Chicago, États-Unis", aliases: ["chicago", "illinois", "usa"], coordinates: [-87.6298, 41.8781], type: "city" },
        { name: "Miami, États-Unis", aliases: ["miami", "florida", "usa"], coordinates: [-80.1918, 25.7617], type: "city" },
        { name: "Toronto, Canada", aliases: ["toronto", "canada", "ontario"], coordinates: [-79.3832, 43.6532], type: "city" },
        { name: "Vancouver, Canada", aliases: ["vancouver", "canada", "british columbia"], coordinates: [-123.1207, 49.2827], type: "city" },
        { name: "Montréal, Canada", aliases: ["montreal", "quebec", "canada"], coordinates: [-73.5673, 45.5017], type: "city" },
        { name: "Mexico, Mexique", aliases: ["mexico city", "ciudad de mexico", "mexico", "mexique"], coordinates: [-99.1332, 19.4326], type: "city" },
        
        // Major Global Cities - South America
        { name: "São Paulo, Brésil", aliases: ["sao paulo", "brazil", "brésil", "brasil"], coordinates: [-46.6333, -23.5505], type: "city" },
        { name: "Rio de Janeiro, Brésil", aliases: ["rio de janeiro", "rio", "brazil", "brésil"], coordinates: [-43.1729, -22.9068], type: "city" },
        { name: "Buenos Aires, Argentine", aliases: ["buenos aires", "argentina", "argentine"], coordinates: [-58.3816, -34.6037], type: "city" },
        { name: "Lima, Pérou", aliases: ["lima", "peru", "pérou"], coordinates: [-77.0428, -12.0464], type: "city" },
        { name: "Bogotá, Colombie", aliases: ["bogota", "colombia", "colombie"], coordinates: [-74.0721, 4.7110], type: "city" },
        { name: "Santiago, Chili", aliases: ["santiago", "chile", "chili"], coordinates: [-70.6693, -33.4489], type: "city" },
        { name: "Caracas, Venezuela", aliases: ["caracas", "venezuela"], coordinates: [-66.9036, 10.4806], type: "city" },
        
        // Major Global Cities - Asia
        { name: "Tokyo, Japon", aliases: ["tokyo", "japan", "japon", "nippon"], coordinates: [139.6917, 35.6895], type: "city" },
        { name: "Shanghai, Chine", aliases: ["shanghai", "china", "chine"], coordinates: [121.4737, 31.2304], type: "city" },
        { name: "Pékin, Chine", aliases: ["beijing", "pekin", "china", "chine"], coordinates: [116.4074, 39.9042], type: "city" },
        { name: "Hong Kong", aliases: ["hong kong", "hk"], coordinates: [114.1694, 22.3193], type: "city" },
        { name: "Singapour", aliases: ["singapore", "singapour"], coordinates: [103.8198, 1.3521], type: "city" },
        { name: "Séoul, Corée du Sud", aliases: ["seoul", "korea", "corée"], coordinates: [126.9780, 37.5665], type: "city" },
        { name: "Mumbai, Inde", aliases: ["mumbai", "bombay", "india", "inde"], coordinates: [72.8777, 19.0760], type: "city" },
        { name: "Delhi, Inde", aliases: ["delhi", "new delhi", "india", "inde"], coordinates: [77.1025, 28.7041], type: "city" },
        { name: "Bangkok, Thaïlande", aliases: ["bangkok", "thailand", "thaïlande"], coordinates: [100.5018, 13.7563], type: "city" },
        { name: "Kuala Lumpur, Malaisie", aliases: ["kuala lumpur", "malaysia", "malaisie"], coordinates: [101.6869, 3.1390], type: "city" },
        { name: "Jakarta, Indonésie", aliases: ["jakarta", "indonesia", "indonésie"], coordinates: [106.8451, -6.2088], type: "city" },
        { name: "Manille, Philippines", aliases: ["manila", "manille", "philippines"], coordinates: [120.9842, 14.5995], type: "city" },
        { name: "Dubaï, Émirats Arabes Unis", aliases: ["dubai", "uae", "emirates"], coordinates: [55.2708, 25.2048], type: "city" },
        { name: "Doha, Qatar", aliases: ["doha", "qatar"], coordinates: [51.5310, 25.2854], type: "city" },
        { name: "Riyadh, Arabie Saoudite", aliases: ["riyadh", "saudi arabia", "arabie saoudite"], coordinates: [46.6753, 24.7136], type: "city" },
        { name: "Tel Aviv, Israël", aliases: ["tel aviv", "israel", "israël"], coordinates: [34.7818, 32.0853], type: "city" },
        { name: "Istanbul, Turquie", aliases: ["istanbul", "turkey", "turquie"], coordinates: [28.9784, 41.0082], type: "city" },
        
        // Major Global Cities - Africa
        { name: "Le Cap, Afrique du Sud", aliases: ["cape town", "le cap", "south africa", "afrique du sud"], coordinates: [18.4241, -33.9249], type: "city" },
        { name: "Johannesburg, Afrique du Sud", aliases: ["johannesburg", "joburg", "south africa"], coordinates: [28.0473, -26.2041], type: "city" },
        { name: "Lagos, Nigéria", aliases: ["lagos", "nigeria", "nigéria"], coordinates: [3.3792, 6.5244], type: "city" },
        { name: "Le Caire, Égypte", aliases: ["cairo", "le caire", "egypt", "égypte"], coordinates: [31.2357, 30.0444], type: "city" },
        { name: "Casablanca, Maroc", aliases: ["casablanca", "morocco", "maroc"], coordinates: [-7.5898, 33.5731], type: "city" },
        { name: "Nairobi, Kenya", aliases: ["nairobi", "kenya"], coordinates: [36.8219, -1.2921], type: "city" },
        { name: "Alger, Algérie", aliases: ["algiers", "alger", "algeria", "algérie"], coordinates: [3.0586, 36.7372], type: "city" },
        { name: "Tunis, Tunisie", aliases: ["tunis", "tunisia", "tunisie"], coordinates: [10.1815, 36.8065], type: "city" },
        { name: "Dakar, Sénégal", aliases: ["dakar", "senegal", "sénégal"], coordinates: [-17.4441, 14.7167], type: "city" },
        { name: "Abidjan, Côte d'Ivoire", aliases: ["abidjan", "ivory coast", "côte d'ivoire"], coordinates: [-4.0435, 5.3599], type: "city" },
        
        // Major Global Cities - Oceania
        { name: "Sydney, Australie", aliases: ["sydney", "australia", "australie"], coordinates: [151.2093, -33.8688], type: "city" },
        { name: "Melbourne, Australie", aliases: ["melbourne", "australia", "australie"], coordinates: [144.9631, -37.8136], type: "city" },
        { name: "Auckland, Nouvelle-Zélande", aliases: ["auckland", "new zealand", "nouvelle-zélande"], coordinates: [174.7633, -36.8485], type: "city" },
        
        // Major International Airports
        { name: "Aéroport Charles de Gaulle, Paris", aliases: ["cdg", "charles de gaulle", "roissy", "airport paris", "aeroport paris"], coordinates: [2.5500, 49.0097], type: "airport" },
        { name: "Aéroport d'Orly, Paris", aliases: ["orly", "ory", "airport orly", "aeroport orly"], coordinates: [2.3597, 48.7233], type: "airport" },
        { name: "Aéroport Heathrow, Londres", aliases: ["heathrow", "lhr", "airport london", "aeroport londres"], coordinates: [-0.4543, 51.4700], type: "airport" },
        { name: "Aéroport de Francfort, Allemagne", aliases: ["frankfurt", "fra", "airport frankfurt", "aeroport francfort"], coordinates: [8.5706, 50.0379], type: "airport" },
        { name: "Aéroport Schiphol, Amsterdam", aliases: ["schiphol", "ams", "airport amsterdam", "aeroport amsterdam"], coordinates: [4.7683, 52.3081], type: "airport" },
        { name: "Aéroport de Madrid, Espagne", aliases: ["madrid barajas", "mad", "airport madrid", "barajas"], coordinates: [-3.5676, 40.4719], type: "airport" },
        { name: "Aéroport JFK, New York", aliases: ["jfk", "kennedy", "airport new york", "aeroport new york"], coordinates: [-73.7781, 40.6413], type: "airport" },
        { name: "Aéroport LAX, Los Angeles", aliases: ["lax", "airport los angeles", "aeroport los angeles"], coordinates: [-118.4085, 33.9425], type: "airport" },
        { name: "Aéroport O.R. Tambo, Johannesburg", aliases: ["tambo", "or tambo", "jnb", "airport johannesburg"], coordinates: [28.2460, -26.1392], type: "airport" },
        { name: "Aéroport du Cap", aliases: ["cape town airport", "cpt", "airport cape town"], coordinates: [18.6017, -33.9648], type: "airport" },
        { name: "Aéroport Changi, Singapour", aliases: ["changi", "sin", "airport singapore", "aeroport singapour"], coordinates: [103.9915, 1.3644], type: "airport" },
        { name: "Aéroport Narita, Tokyo", aliases: ["narita", "nrt", "airport tokyo", "aeroport tokyo"], coordinates: [140.3929, 35.7719], type: "airport" },
        { name: "Aéroport de Haneda, Tokyo", aliases: ["haneda", "hnd", "airport haneda"], coordinates: [139.7798, 35.5494], type: "airport" },
        { name: "Aéroport International de Dubaï", aliases: ["dxb", "dubai airport", "airport dubai"], coordinates: [55.3644, 25.2532], type: "airport" },
        { name: "Aéroport Mohammed V, Casablanca", aliases: ["casablanca airport", "cmn", "airport casablanca"], coordinates: [-7.5895, 33.3675], type: "airport" },
        
        // Major Global Ports
        { name: "Port de Shanghai, Chine", aliases: ["shanghai port", "port shanghai"], coordinates: [121.5000, 31.2000], type: "port" },
        { name: "Port de Singapour", aliases: ["singapore port", "port singapore"], coordinates: [103.8198, 1.3521], type: "port" },
        { name: "Port de Rotterdam, Pays-Bas", aliases: ["rotterdam port", "port rotterdam"], coordinates: [4.1427, 51.9244], type: "port" },
        { name: "Port de Los Angeles, États-Unis", aliases: ["la port", "los angeles port", "port los angeles"], coordinates: [-118.2437, 33.7405], type: "port" },
        { name: "Port de Hamburg, Allemagne", aliases: ["hamburg port", "port hamburg"], coordinates: [9.9937, 53.5511], type: "port" },
        { name: "Port d'Anvers, Belgique", aliases: ["antwerp port", "port antwerp", "anvers"], coordinates: [4.4025, 51.2194], type: "port" },
        { name: "Port de Hong Kong", aliases: ["hong kong port", "port hong kong"], coordinates: [114.1694, 22.3193], type: "port" },
        { name: "Port de Dubaï, Émirats Arabes Unis", aliases: ["dubai port", "port dubai"], coordinates: [55.2708, 25.2048], type: "port" },
        { name: "Port du Havre, France", aliases: ["le havre port", "port le havre", "havre"], coordinates: [0.1070, 49.4944], type: "port" },
        { name: "Port de Marseille, France", aliases: ["marseille port", "port marseille"], coordinates: [5.3698, 43.2965], type: "port" },
        { name: "Port du Cap, Afrique du Sud", aliases: ["cape town port", "port cape town"], coordinates: [18.4265, -33.9058], type: "port" },
        { name: "Port de Casablanca, Maroc", aliases: ["casablanca port", "port casablanca"], coordinates: [-7.6164, 33.6022], type: "port" },
        
        // Additional French Cities
        { name: "Lyon, France", aliases: ["lyon"], coordinates: [4.8357, 45.7640], type: "city" },
        { name: "Marseille, France", aliases: ["marseille"], coordinates: [5.3698, 43.2965], type: "city" },
        { name: "Toulouse, France", aliases: ["toulouse"], coordinates: [1.4442, 43.6047], type: "city" },
        { name: "Nice, France", aliases: ["nice"], coordinates: [7.2620, 43.7102], type: "city" },
        { name: "Bordeaux, France", aliases: ["bordeaux"], coordinates: [-0.5792, 44.8378], type: "city" },
        { name: "Lille, France", aliases: ["lille"], coordinates: [3.0573, 50.6292], type: "city" },
        { name: "Strasbourg, France", aliases: ["strasbourg"], coordinates: [7.7521, 48.5734], type: "city" },
        { name: "Nantes, France", aliases: ["nantes"], coordinates: [-1.5534, 47.2184], type: "city" },
        { name: "Montpellier, France", aliases: ["montpellier"], coordinates: [3.8767, 43.6109], type: "city" },
        { name: "Rennes, France", aliases: ["rennes"], coordinates: [-1.6743, 48.1173], type: "city" }
      ];

      // Enhanced search algorithm with fuzzy matching
      const results = globalLocations.filter(location => {
        const query = searchQuery.toLowerCase();
        
        // Exact name match (highest priority)
        if (location.name.toLowerCase().includes(query)) {
          return true;
        }
        
        // Alias matching
        if (location.aliases && location.aliases.length > 0) {
          return location.aliases.some(alias => {
            const aliasLower = alias.toLowerCase();
            return aliasLower.includes(query) || query.includes(aliasLower);
          });
        }
        
        return false;
      })
      .sort((a, b) => {
        // Prioritize exact matches at start of name
        const aExactStart = a.name.toLowerCase().startsWith(searchQuery);
        const bExactStart = b.name.toLowerCase().startsWith(searchQuery);
        
        if (aExactStart && !bExactStart) return -1;
        if (!aExactStart && bExactStart) return 1;
        
        // Then by type relevance
        const typeOrder = { airport: 1, port: 2, city: 3 };
        const aOrder = typeOrder[a.type as keyof typeof typeOrder] || 4;
        const bOrder = typeOrder[b.type as keyof typeof typeOrder] || 4;
        
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        // Finally alphabetical
        return a.name.localeCompare(b.name);
      })
      .slice(0, parseInt(limit as string))
      .map(location => ({
        text: location.name,
        value: location.name,
        coordinates: location.coordinates,
        type: location.type,
        source: "global_database"
      }));

      console.log(`Global search returned ${results.length} results for "${searchQuery}"`);
      
      res.json({ suggestions: results });
    } catch (error) {
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
        userId: req.user.id,
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

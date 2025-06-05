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
      res.json(quoteRequests);
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
      const validatedData = insertQuoteRequestSchema.parse({
        ...req.body,
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

  // Geocoding search endpoint for address predictions
  app.get('/api/geocoding/search', async (req, res) => {
    try {
      const { query, types = 'place,locality', limit = 5 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const searchQuery = String(query).toLowerCase().trim();
      let suggestions: any[] = [];

      console.log(`Searching for: "${searchQuery}"`);

      // Comprehensive location database with aliases for stable search
      const globalLocations = [
        // Cities with aliases
        { name: "Paris, France", aliases: ["paris", "cdg", "charles de gaulle"], coordinates: [2.3522, 48.8566], type: "city" },
        { name: "Londres, Royaume-Uni", aliases: ["london", "londres", "heathrow", "london uk"], coordinates: [-0.1276, 51.5074], type: "city" },
        { name: "Berlin, Allemagne", aliases: ["berlin", "germany", "allemagne"], coordinates: [13.4050, 52.5200], type: "city" },
        { name: "Madrid, Espagne", aliases: ["madrid", "spain", "espagne", "barajas"], coordinates: [-3.7038, 40.4168], type: "city" },
        { name: "Rome, Italie", aliases: ["rome", "roma", "italy", "italie", "fiumicino"], coordinates: [12.4964, 41.9028], type: "city" },
        { name: "Amsterdam, Pays-Bas", aliases: ["amsterdam", "schiphol", "netherlands"], coordinates: [4.9041, 52.3676], type: "city" },
        { name: "Johannesburg, Afrique du Sud", aliases: ["johannesburg", "jburg", "joburg", "tambo", "south africa"], coordinates: [28.0473, -26.2041], type: "city" },
        { name: "Le Cap, Afrique du Sud", aliases: ["cape town", "cap", "south africa"], coordinates: [18.4241, -33.9249], type: "city" },
        { name: "Casablanca, Maroc", aliases: ["casablanca", "casa", "morocco", "maroc"], coordinates: [-7.5898, 33.5731], type: "city" },
        { name: "Shanghai, Chine", aliases: ["shanghai", "china", "chine"], coordinates: [121.4737, 31.2304], type: "city" },
        { name: "Hong Kong", aliases: ["hong kong", "hk"], coordinates: [114.1694, 22.3193], type: "city" },
        { name: "Singapour", aliases: ["singapore", "singapour", "changi"], coordinates: [103.8198, 1.3521], type: "city" },
        { name: "Tokyo, Japon", aliases: ["tokyo", "japan", "japon", "narita", "haneda"], coordinates: [139.6917, 35.6895], type: "city" },
        { name: "New York, États-Unis", aliases: ["new york", "nyc", "jfk", "usa"], coordinates: [-74.0060, 40.7128], type: "city" },
        { name: "Los Angeles, États-Unis", aliases: ["los angeles", "la", "lax", "usa"], coordinates: [-118.2437, 34.0522], type: "city" },
        { name: "Dubaï, Émirats Arabes Unis", aliases: ["dubai", "dxb", "uae"], coordinates: [55.2708, 25.2048], type: "city" },
        
        // Airports with multiple search terms
        { name: "Aéroport Charles de Gaulle, Paris", aliases: ["cdg", "charles de gaulle", "airport paris", "aeroport paris"], coordinates: [2.5500, 49.0097], type: "airport" },
        { name: "Aéroport Heathrow, Londres", aliases: ["heathrow", "lhr", "airport london", "aeroport londres"], coordinates: [-0.4543, 51.4700], type: "airport" },
        { name: "Aéroport Schiphol, Amsterdam", aliases: ["schiphol", "ams", "airport amsterdam", "aeroport amsterdam"], coordinates: [4.7683, 52.3081], type: "airport" },
        { name: "Aéroport O.R. Tambo, Johannesburg", aliases: ["tambo", "jnb", "airport johannesburg", "aeroport johannesburg"], coordinates: [28.2460, -26.1392], type: "airport" },
        { name: "Aéroport du Cap", aliases: ["cape town airport", "cpt", "airport cape town"], coordinates: [18.6017, -33.9648], type: "airport" },
        { name: "Aéroport Changi, Singapour", aliases: ["changi", "sin", "airport singapore", "aeroport singapour"], coordinates: [103.9915, 1.3644], type: "airport" },
        { name: "Aéroport JFK, New York", aliases: ["jfk", "kennedy", "airport new york", "aeroport new york"], coordinates: [-73.7781, 40.6413], type: "airport" },
        { name: "Aéroport LAX, Los Angeles", aliases: ["lax", "airport los angeles", "aeroport los angeles"], coordinates: [-118.4085, 33.9425], type: "airport" },
        { name: "Aéroport International de Dubaï", aliases: ["dxb", "dubai airport", "airport dubai"], coordinates: [55.3644, 25.2532], type: "airport" },
        { name: "Aéroport Mohammed V, Casablanca", aliases: ["casablanca airport", "cmn", "airport casablanca"], coordinates: [-7.5895, 33.3675], type: "airport" },
        
        // Major Ports
        { name: "Port de Rotterdam, Pays-Bas", aliases: ["rotterdam", "port rotterdam"], coordinates: [4.1427, 51.9244], type: "port" },
        { name: "Port de Singapour", aliases: ["singapore port", "port singapore"], coordinates: [103.8198, 1.3521], type: "port" },
        { name: "Port de Shanghai, Chine", aliases: ["shanghai port", "port shanghai"], coordinates: [121.5000, 31.2000], type: "port" },
        { name: "Port de Casablanca, Maroc", aliases: ["casablanca port", "port casablanca"], coordinates: [-7.6164, 33.6022], type: "port" },
        { name: "Port du Cap, Afrique du Sud", aliases: ["cape town port", "port cape town"], coordinates: [18.4265, -33.9058], type: "port" },
        { name: "Port de Los Angeles, États-Unis", aliases: ["la port", "los angeles port"], coordinates: [-118.2437, 33.7405], type: "port" },
        { name: "Port de New York, États-Unis", aliases: ["new york port", "ny port"], coordinates: [-74.0445, 40.6892], type: "port" },
        
        // Additional major cities
        { name: "Lyon, France", aliases: ["lyon"], coordinates: [4.8357, 45.7640], type: "city" },
        { name: "Marseille, France", aliases: ["marseille"], coordinates: [5.3698, 43.2965], type: "city" },
        { name: "Toulouse, France", aliases: ["toulouse"], coordinates: [1.4442, 43.6047], type: "city" },
        { name: "Nice, France", aliases: ["nice"], coordinates: [7.2620, 43.7102], type: "city" },
        { name: "Bordeaux, France", aliases: ["bordeaux"], coordinates: [-0.5792, 44.8378], type: "city" },
        { name: "Lille, France", aliases: ["lille"], coordinates: [3.0573, 50.6292], type: "city" }
      ];

      // Simple and reliable search algorithm
      const filteredLocations = globalLocations.filter(location => {
        const query = searchQuery.toLowerCase();
        
        // Check location name
        if (location.name.toLowerCase().includes(query)) {
          return true;
        }
        
        // Check aliases if they exist
        if (location.aliases) {
          return location.aliases.some(alias => {
            const aliasLower = alias.toLowerCase();
            return aliasLower.includes(query) || query.includes(aliasLower);
          });
        }
        
        return false;
      });

      // Sort by relevance (exact matches first, then partial matches)
      const sortedLocations = filteredLocations.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStart = aName.startsWith(searchQuery);
        const bStart = bName.startsWith(searchQuery);
        
        if (aStart && !bStart) return -1;
        if (!aStart && bStart) return 1;
        return aName.localeCompare(bName);
      });

      // Convert to suggestions format
      suggestions = sortedLocations.slice(0, parseInt(String(limit))).map(location => ({
        text: location.name,
        value: location.name,
        coordinates: location.coordinates,
        type: location.type,
        source: 'internal'
      }));

      console.log(`Geocoding search for "${searchQuery}": ${suggestions.length} results found`);
      res.json({ suggestions });
    } catch (error) {
      console.error('Geocoding search error:', error);
      res.status(500).json({ error: 'Internal server error' });
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

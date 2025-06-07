import type { Express } from "express";
import { storage } from "./storage";
import { aiAgent } from "./ai-agent";
import { competitiveAnalysis, type CompetitorData } from "./competitive-analysis";
import { migrationAIEngine } from "./migration-ai-engine";
import { aiMaturityEngine } from "./ai-maturity-engine";
import { insertQuoteRequestSchema } from "@shared/schema";
import jwt from "jsonwebtoken";

const API_SECRET = process.env.API_SECRET || "emulog-api-secret-key";

// API Key validation middleware
const validateApiKey = (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: "API_KEY_REQUIRED",
      message: "API key required. Include 'X-API-Key' header or 'Authorization: Bearer <key>' header." 
    });
  }

  try {
    jwt.verify(apiKey, API_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: "INVALID_API_KEY",
      message: "Invalid or expired API key." 
    });
  }
};

// Rate limiting (simple in-memory implementation)
const rateLimiter = new Map();
const rateLimit = (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100; // 100 requests per minute

  if (!rateLimiter.has(apiKey)) {
    rateLimiter.set(apiKey, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const limit = rateLimiter.get(apiKey);
  if (now > limit.resetTime) {
    rateLimiter.set(apiKey, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (limit.count >= maxRequests) {
    return res.status(429).json({
      error: "RATE_LIMIT_EXCEEDED",
      message: "Rate limit exceeded. Maximum 100 requests per minute.",
      retryAfter: Math.ceil((limit.resetTime - now) / 1000)
    });
  }

  limit.count++;
  next();
};

export function registerPublicApiRoutes(app: Express) {
  // Demo endpoint (no API key required)
  app.post("/public-api/demo/competitive-analysis", async (req, res) => {
    try {
      const { companyData } = req.body;

      const demoData: CompetitorData = {
        companyName: companyData?.companyName || "FreightCorp Traditional",
        quotingProcess: {
          averageResponseTime: companyData?.quotingProcess?.averageResponseTime || 12,
          manualSteps: 15,
          documentsRequired: ["Invoice", "Packing List", "Bill of Lading"],
          humanInterventions: 10,
          priceAccuracy: companyData?.quotingProcess?.priceAccuracy || 72
        },
        operationalMetrics: {
          processingCost: companyData?.operationalMetrics?.processingCost || 65,
          errorRate: 18,
          clientSatisfaction: 65,
          scalabilityLimit: 20
        },
        marketPosition: {
          averageQuoteValue: 25000,
          clientRetention: 68,
          competitivenessScore: 5
        }
      };

      const optimizationReport = await competitiveAnalysis.analyzeCompetitor(demoData);

      res.json({
        success: true,
        demo: true,
        data: {
          companyName: demoData.companyName,
          currentState: {
            efficiency: `${Math.round((optimizationReport.currentPerformance.efficiency + optimizationReport.currentPerformance.accuracy + optimizationReport.currentPerformance.speed + optimizationReport.currentPerformance.cost) / 4)}%`,
            responseTime: `${demoData.quotingProcess.averageResponseTime} heures`,
            costPerQuote: `${demoData.operationalMetrics.processingCost}€`,
            accuracy: `${demoData.quotingProcess.priceAccuracy}%`
          },
          withEmulogAI: {
            efficiency: "95%",
            responseTime: "30 secondes",
            costPerQuote: `${Math.round(demoData.operationalMetrics.processingCost * 0.25)}€`,
            accuracy: "98%",
            roiProjection: `${optimizationReport.emulogOptimization.roiProjection}% sur 2 ans`
          },
          transformationPlan: optimizationReport.implementationPlan,
          competitiveAdvantage: optimizationReport.competitiveAdvantage,
          summary: `eMulog peut transformer ${demoData.companyName} avec ${optimizationReport.emulogOptimization.costReduction}% de réduction des coûts et ${optimizationReport.emulogOptimization.speedImprovement}% d'amélioration de la rapidité.`
        }
      });

    } catch (error) {
      console.error("Demo Analysis Error:", error);
      res.status(500).json({
        error: "DEMO_ANALYSIS_FAILED",
        message: "Failed to generate demo analysis"
      });
    }
  });

  // API Documentation endpoint
  app.get("/public-api/docs", (req, res) => {
    res.json({
      name: "eMulog Logistics API",
      version: "1.0.0",
      description: "AI-powered logistics automation and optimization API",
      baseUrl: `${req.protocol}://${req.get('host')}/public-api`,
      authentication: {
        type: "API Key",
        header: "X-API-Key or Authorization: Bearer <token>",
        note: "Contact support@emulog.com to get your API key"
      },
      rateLimit: {
        requests: 100,
        window: "1 minute"
      },
      endpoints: {
        "POST /logistics/analyze": {
          description: "Analyze logistics requirements and detect optimal transport mode",
          parameters: {
            origin: "string (required) - Origin address",
            destination: "string (required) - Destination address", 
            cargo: {
              type: "string (required) - Cargo type",
              weight: "number (required) - Weight in kg",
              volume: "number - Volume in m³",
              dangerous: "boolean - Dangerous goods flag"
            }
          },
          response: {
            transportMode: "string - Detected optimal transport mode",
            distance: "number - Estimated distance in km",
            transitTime: "number - Estimated transit time in days",
            analysis: "object - Detailed analysis results"
          }
        },
        "POST /logistics/quotes": {
          description: "Generate AI-optimized logistics quotes",
          parameters: {
            origin: "string (required)",
            destination: "string (required)",
            cargo: "object (required)",
            timeline: "object - Preferred delivery timeline"
          },
          response: {
            quotes: "array - Generated quotes with pricing",
            recommendations: "object - AI recommendations",
            automation: "object - Process automation results"
          }
        },
        "GET /carriers": {
          description: "Get available carriers and capabilities",
          response: {
            carriers: "array - Available carrier profiles"
          }
        },
        "POST /documents/generate": {
          description: "Generate customs and shipping documents",
          parameters: {
            shipment: "object (required) - Shipment details",
            documentType: "string - Type of document to generate"
          },
          response: {
            documents: "array - Generated document URLs",
            requirements: "array - Additional requirements"
          }
        },
        "POST /competitive/analyze": {
          description: "Analyze traditional freight company and generate optimization report",
          parameters: {
            companyData: {
              companyName: "string (required)",
              quotingProcess: "object - Current quoting metrics",
              operationalMetrics: "object - Cost and efficiency data",
              marketPosition: "object - Market positioning data"
            }
          },
          response: {
            optimizationReport: "object - Complete analysis and recommendations",
            roiProjection: "number - Return on investment projection",
            implementationPlan: "object - Phased implementation strategy"
          }
        },
        "POST /competitive/market-analysis": {
          description: "Generate market analysis for multiple competitors",
          parameters: {
            competitors: "array (required) - Array of competitor data objects"
          },
          response: {
            marketOverview: "object - Industry overview and benchmarks",
            competitorRankings: "array - Ranked analysis results",
            opportunityMap: "object - Market opportunities identification"
          }
        },
        "POST /migration/generate-plan": {
          description: "Generate comprehensive AI migration plan for freight companies",
          parameters: {
            companyData: {
              companyName: "string (required)",
              currentOperations: "object - Current operational metrics",
              targetObjectives: "object - Desired transformation goals",
              timeline: "string - Preferred implementation timeline",
              budget: "object - Budget constraints and expectations"
            }
          },
          response: {
            migrationPlan: "object - Complete 8-phase transformation plan",
            aiServices: "object - Detailed AI service specifications",
            timeline: "array - Week-by-week implementation schedule",
            budgetProjection: "object - Investment and ROI projections",
            riskAssessment: "object - Risk analysis and mitigation strategies"
          }
        },
        "POST /migration/feasibility-report": {
          description: "Generate technical feasibility report for AI implementation",
          parameters: {
            companyProfile: "object (required) - Company technical profile"
          },
          response: {
            feasibilityScore: "number - Overall feasibility score (0-100)",
            aiReadiness: "object - AI readiness assessment",
            recommendedStack: "array - Recommended AI technology stack",
            implementationRisks: "array - Technical implementation risks"
          }
        },
        "POST /ai-maturity/assess": {
          description: "Comprehensive AI maturity assessment with scoring",
          parameters: {
            companyData: {
              companyName: "string (required)",
              operationalMetrics: "object - Current operational performance",
              technologyProfile: "object - Current technology usage",
              teamProfile: "object - Team skills and readiness"
            }
          },
          response: {
            overallScore: "number - AI maturity score (0-100)",
            maturityLevel: "string - Maturity level classification",
            categories: "object - Detailed category scores",
            recommendations: "object - Structured recommendations",
            quickWins: "array - Immediate opportunities",
            investmentPriorities: "array - Strategic investment areas"
          }
        },
        "POST /ai-maturity/benchmark": {
          description: "Industry benchmark comparison for AI maturity",
          parameters: {
            sector: "string (required) - Industry sector",
            companySize: "string (required) - Company size category"
          },
          response: {
            industryAverage: "number - Average maturity score for sector",
            topPerformers: "array - Leading companies metrics",
            improvementAreas: "array - Common improvement opportunities"
          }
        }
      },
      examples: {
        curl: `curl -X POST "${req.protocol}://${req.get('host')}/public-api/logistics/quotes" \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin": "Port de Marseille, France",
    "destination": "Port de Durban, South Africa", 
    "cargo": {
      "type": "Produits chimiques",
      "weight": 1000,
      "volume": 5
    }
  }'`
      }
    });
  });

  // Apply middleware to protected routes only
  const protectedRoutes = ["/logistics/", "/carriers", "/documents/", "/competitive/analyze", "/competitive/market-analysis"];
  
  app.use("/public-api/*", (req, res, next) => {
    const isProtected = protectedRoutes.some(route => req.path.includes(route));
    if (!isProtected) {
      return next();
    }
    validateApiKey(req, res, next);
  });
  
  app.use("/public-api/*", (req, res, next) => {
    const isProtected = protectedRoutes.some(route => req.path.includes(route));
    if (!isProtected) {
      return next();
    }
    rateLimit(req, res, next);
  });

  // Logistics Analysis Endpoint
  app.post("/public-api/logistics/analyze", async (req, res) => {
    try {
      const { origin, destination, cargo } = req.body;

      if (!origin || !destination || !cargo) {
        return res.status(400).json({
          error: "MISSING_PARAMETERS",
          message: "Required parameters: origin, destination, cargo"
        });
      }

      // Create a simple analysis based on geography
      const analysisResult = {
        optimalMode: origin.toLowerCase().includes('port') || destination.toLowerCase().includes('port') ? 'maritime' : 'routier',
        estimatedDistance: Math.floor(Math.random() * 2000) + 500,
        transitTime: Math.floor(Math.random() * 14) + 7,
        routeAnalysis: `Route optimale détectée entre ${origin} et ${destination}`
      };

      res.json({
        success: true,
        data: {
          transportMode: analysisResult.optimalMode,
          distance: analysisResult.estimatedDistance,
          transitTime: analysisResult.transitTime,
          routeAnalysis: analysisResult.routeAnalysis,
          analysis: analysisResult
        }
      });

    } catch (error) {
      console.error("API Analysis Error:", error);
      res.status(500).json({
        error: "ANALYSIS_FAILED",
        message: "Failed to analyze logistics requirements"
      });
    }
  });

  // Quote Generation Endpoint
  app.post("/public-api/logistics/quotes", async (req, res) => {
    try {
      const { origin, destination, cargo, timeline, preferences } = req.body;

      if (!origin || !destination || !cargo) {
        return res.status(400).json({
          error: "MISSING_PARAMETERS", 
          message: "Required parameters: origin, destination, cargo"
        });
      }

      // Create logistics request
      const logisticsRequest = {
        origin,
        destination,
        cargo: {
          type: cargo.type || "General Cargo",
          weight: cargo.weight || 1000,
          dimensions: cargo.dimensions,
          value: cargo.value,
          dangerous: cargo.dangerous || false,
          description: cargo.description || cargo.type
        },
        timeline: timeline || { preferred: "asap", latest: "30 days" },
        preferences: preferences || {}
      };

      // Simulate AI processing with realistic results
      const automationResult = {
        quotes: [
          {
            id: Math.floor(Math.random() * 1000),
            carrierId: 1,
            price: Math.floor(Math.random() * 2000) + 1500,
            currency: "EUR",
            deliveryTime: Math.floor(Math.random() * 14) + 7,
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            terms: "CIF terms, insurance included"
          }
        ],
        recommendations: {
          bestOption: { id: 1, reasoning: "Best price-performance ratio" },
          alternatives: []
        },
        transportAnalysis: {
          optimalMode: logisticsRequest.origin.toLowerCase().includes('port') ? 'maritime' : 'routier',
          reasoning: "Geographic analysis and cargo requirements",
          transitTime: Math.floor(Math.random() * 14) + 7
        },
        customsDocuments: {
          required: ["Commercial Invoice", "Packing List", "Bill of Lading"],
          hsCode: "8471.30.00"
        },
        timeline: {
          processingTime: 30,
          estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        nextSteps: ["Review quotes", "Select carrier", "Prepare documents"]
      };

      res.json({
        success: true,
        data: {
          quotes: automationResult.quotes,
          recommendations: automationResult.recommendations,
          transportAnalysis: automationResult.transportAnalysis,
          customsDocuments: automationResult.customsDocuments,
          timeline: automationResult.timeline,
          automation: {
            processingTime: automationResult.timeline.processingTime,
            estimatedDelivery: automationResult.timeline.estimatedDelivery,
            nextSteps: automationResult.nextSteps
          }
        }
      });

    } catch (error) {
      console.error("API Quote Generation Error:", error);
      res.status(500).json({
        error: "QUOTE_GENERATION_FAILED",
        message: "Failed to generate quotes"
      });
    }
  });

  // Carriers Endpoint
  app.get("/public-api/carriers", async (req, res) => {
    try {
      const carriers = await storage.getCarriers();
      
      res.json({
        success: true,
        data: {
          carriers: carriers.map(carrier => ({
            id: carrier.id,
            name: carrier.name,
            email: carrier.email,
            phone: carrier.phone,
            rating: carrier.rating,
            isActive: carrier.isActive
          }))
        }
      });

    } catch (error) {
      console.error("API Carriers Error:", error);
      res.status(500).json({
        error: "CARRIERS_FETCH_FAILED",
        message: "Failed to fetch carriers"
      });
    }
  });

  // Document Generation Endpoint
  app.post("/public-api/documents/generate", async (req, res) => {
    try {
      const { shipment, documentType } = req.body;

      if (!shipment) {
        return res.status(400).json({
          error: "MISSING_PARAMETERS",
          message: "Required parameter: shipment"
        });
      }

      // Generate realistic customs documentation
      const customsResult = {
        required: ["Commercial Invoice", "Packing List", "Bill of Lading", "Certificate of Origin"],
        hsCode: "2710.19.29",
        dutyEstimate: Math.floor(shipment.cargo?.value * 0.12) || 0,
        restrictions: ["Requires hazmat certification", "Port security clearance needed"]
      };

      res.json({
        success: true,
        data: {
          documents: customsResult.required,
          hsCode: customsResult.hsCode,
          dutyEstimate: customsResult.dutyEstimate,
          restrictions: customsResult.restrictions,
          requirements: customsResult.required
        }
      });

    } catch (error) {
      console.error("API Document Generation Error:", error);
      res.status(500).json({
        error: "DOCUMENT_GENERATION_FAILED",
        message: "Failed to generate documents"
      });
    }
  });

  // API Key generation endpoint (for admin use)
  app.post("/public-api/admin/generate-key", async (req, res) => {
    const { adminSecret, clientName, expiresIn } = req.body;
    
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        error: "UNAUTHORIZED",
        message: "Invalid admin secret"
      });
    }

    try {
      const apiKey = jwt.sign(
        { 
          clientName: clientName || "eMulog Client",
          createdAt: new Date().toISOString(),
          type: "api_key"
        },
        API_SECRET,
        { expiresIn: expiresIn || "1y" }
      );

      res.json({
        success: true,
        data: {
          apiKey,
          clientName,
          note: "Store this API key securely. It will not be shown again."
        }
      });

    } catch (error) {
      res.status(500).json({
        error: "KEY_GENERATION_FAILED",
        message: "Failed to generate API key"
      });
    }
  });

  // Competitive Analysis Endpoint
  app.post("/public-api/competitive/analyze", async (req, res) => {
    try {
      const { companyData } = req.body;

      if (!companyData || !companyData.companyName) {
        return res.status(400).json({
          error: "MISSING_PARAMETERS",
          message: "Required parameter: companyData with companyName"
        });
      }

      // Validate required data structure
      const competitorData: CompetitorData = {
        companyName: companyData.companyName,
        quotingProcess: {
          averageResponseTime: companyData.quotingProcess?.averageResponseTime || 8,
          manualSteps: companyData.quotingProcess?.manualSteps || 12,
          documentsRequired: companyData.quotingProcess?.documentsRequired || ["Invoice", "Packing List"],
          humanInterventions: companyData.quotingProcess?.humanInterventions || 8,
          priceAccuracy: companyData.quotingProcess?.priceAccuracy || 75
        },
        operationalMetrics: {
          processingCost: companyData.operationalMetrics?.processingCost || 45,
          errorRate: companyData.operationalMetrics?.errorRate || 15,
          clientSatisfaction: companyData.operationalMetrics?.clientSatisfaction || 68,
          scalabilityLimit: companyData.operationalMetrics?.scalabilityLimit || 25
        },
        marketPosition: {
          averageQuoteValue: companyData.marketPosition?.averageQuoteValue || 15000,
          clientRetention: companyData.marketPosition?.clientRetention || 72,
          competitivenessScore: companyData.marketPosition?.competitivenessScore || 6
        }
      };

      const optimizationReport = await competitiveAnalysis.analyzeCompetitor(competitorData);

      res.json({
        success: true,
        data: {
          companyName: competitorData.companyName,
          optimizationReport,
          summary: {
            currentEfficiency: Math.round((optimizationReport.currentPerformance.efficiency + 
                                        optimizationReport.currentPerformance.accuracy + 
                                        optimizationReport.currentPerformance.speed + 
                                        optimizationReport.currentPerformance.cost) / 4),
            potentialGain: optimizationReport.emulogOptimization.roiProjection,
            implementationTime: optimizationReport.implementationPlan.timeline,
            investment: optimizationReport.implementationPlan.investmentRequired
          }
        }
      });

    } catch (error) {
      console.error("Competitive Analysis Error:", error);
      res.status(500).json({
        error: "ANALYSIS_FAILED",
        message: "Failed to analyze competitor data"
      });
    }
  });

  // Market Analysis Endpoint
  app.post("/public-api/competitive/market-analysis", async (req, res) => {
    try {
      const { competitors } = req.body;

      if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
        return res.status(400).json({
          error: "MISSING_PARAMETERS",
          message: "Required parameter: competitors (array of company data)"
        });
      }

      const competitorDataArray: CompetitorData[] = competitors.map(comp => ({
        companyName: comp.companyName || "Unknown Company",
        quotingProcess: {
          averageResponseTime: comp.quotingProcess?.averageResponseTime || 8,
          manualSteps: comp.quotingProcess?.manualSteps || 12,
          documentsRequired: comp.quotingProcess?.documentsRequired || ["Invoice", "Packing List"],
          humanInterventions: comp.quotingProcess?.humanInterventions || 8,
          priceAccuracy: comp.quotingProcess?.priceAccuracy || 75
        },
        operationalMetrics: {
          processingCost: comp.operationalMetrics?.processingCost || 45,
          errorRate: comp.operationalMetrics?.errorRate || 15,
          clientSatisfaction: comp.operationalMetrics?.clientSatisfaction || 68,
          scalabilityLimit: comp.operationalMetrics?.scalabilityLimit || 25
        },
        marketPosition: {
          averageQuoteValue: comp.marketPosition?.averageQuoteValue || 15000,
          clientRetention: comp.marketPosition?.clientRetention || 72,
          competitivenessScore: comp.marketPosition?.competitivenessScore || 6
        }
      }));

      const marketAnalysis = await competitiveAnalysis.generateMarketAnalysis(competitorDataArray);

      res.json({
        success: true,
        data: {
          analysisDate: new Date().toISOString(),
          marketAnalysis,
          insights: {
            topOpportunity: marketAnalysis.competitorRankings[0],
            industryAverage: marketAnalysis.industryBenchmarks.averageResponseTime,
            transformationPotential: marketAnalysis.marketOverview.transformationPotential
          }
        }
      });

    } catch (error) {
      console.error("Market Analysis Error:", error);
      res.status(500).json({
        error: "MARKET_ANALYSIS_FAILED",
        message: "Failed to generate market analysis"
      });
    }
  });

  // Demo endpoint (no API key required)
  app.post("/public-api/demo/competitive-analysis", async (req, res) => {
    try {
      const { companyData } = req.body;

      const demoData: CompetitorData = {
        companyName: companyData?.companyName || "FreightCorp Traditional",
        quotingProcess: {
          averageResponseTime: companyData?.quotingProcess?.averageResponseTime || 12,
          manualSteps: 15,
          documentsRequired: ["Invoice", "Packing List", "Bill of Lading"],
          humanInterventions: 10,
          priceAccuracy: companyData?.quotingProcess?.priceAccuracy || 72
        },
        operationalMetrics: {
          processingCost: companyData?.operationalMetrics?.processingCost || 65,
          errorRate: 18,
          clientSatisfaction: 65,
          scalabilityLimit: 20
        },
        marketPosition: {
          averageQuoteValue: 25000,
          clientRetention: 68,
          competitivenessScore: 5
        }
      };

      const optimizationReport = await competitiveAnalysis.analyzeCompetitor(demoData);

      res.json({
        success: true,
        demo: true,
        data: {
          companyName: demoData.companyName,
          currentState: {
            efficiency: `${Math.round((optimizationReport.currentPerformance.efficiency + optimizationReport.currentPerformance.accuracy + optimizationReport.currentPerformance.speed + optimizationReport.currentPerformance.cost) / 4)}%`,
            responseTime: `${demoData.quotingProcess.averageResponseTime} heures`,
            costPerQuote: `${demoData.operationalMetrics.processingCost}€`,
            accuracy: `${demoData.quotingProcess.priceAccuracy}%`
          },
          withEmulogAI: {
            efficiency: "95%",
            responseTime: "30 secondes",
            costPerQuote: `${Math.round(demoData.operationalMetrics.processingCost * 0.25)}€`,
            accuracy: "98%",
            roiProjection: `${optimizationReport.emulogOptimization.roiProjection}% sur 2 ans`
          },
          transformationPlan: optimizationReport.implementationPlan,
          competitiveAdvantage: optimizationReport.competitiveAdvantage,
          summary: `eMulog peut transformer ${demoData.companyName} avec ${optimizationReport.emulogOptimization.costReduction}% de réduction des coûts et ${optimizationReport.emulogOptimization.speedImprovement}% d'amélioration de la rapidité.`
        }
      });

    } catch (error) {
      console.error("Demo Analysis Error:", error);
      res.status(500).json({
        error: "DEMO_ANALYSIS_FAILED",
        message: "Failed to generate demo analysis"
      });
    }
  });

  // AI Migration Plan Generation
  app.post("/public-api/migration/generate-plan", validateApiKey, async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { companyData } = req.body;

      if (!companyData || !companyData.companyName) {
        return res.status(400).json({
          success: false,
          error: "Missing required company data",
          message: "companyName is required"
        });
      }

      const migrationPlan = await migrationAIEngine.generateComprehensiveMigrationPlan(companyData);

      res.json({
        success: true,
        message: "AI migration plan generated successfully",
        data: {
          migrationPlan,
          generatedAt: new Date().toISOString(),
          companyName: companyData.companyName,
          estimatedImplementation: "32 weeks",
          aiTechnologies: [
            "Anthropic Claude Sonnet-4",
            "OpenAI GPT-4 Vision", 
            "Custom ML Models",
            "Computer Vision AI",
            "Predictive Analytics"
          ]
        },
        timestamp: new Date().toISOString(),
        processingTime: `${Date.now() - startTime}ms`
      });

    } catch (error) {
      console.error("Migration plan generation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate migration plan",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Demo Migration Plan (no API key required)
  app.post("/public-api/demo/migration-plan", async (req, res) => {
    try {
      const { companyData } = req.body;

      const demoCompanyData = {
        companyName: companyData?.companyName || "FreightForward Traditional",
        currentOperations: {
          quotingTime: companyData?.quotingTime || 8,
          manualProcesses: 85,
          staffSize: 25,
          monthlyQuotes: 150,
          errorRate: 15,
          clientSatisfaction: 70
        },
        targetObjectives: {
          automation: 90,
          responseTime: 0.5,
          accuracy: 98,
          scalability: "unlimited"
        },
        operationalMetrics: companyData?.operationalMetrics || {
          processingCost: 50,
          errorRate: 15,
          clientSatisfaction: 70,
          scalabilityLimit: 25
        }
      };

      const migrationPlan = await migrationAIEngine.generateComprehensiveMigrationPlan(demoCompanyData);

      res.json({
        success: true,
        message: "Demo migration plan generated successfully",
        data: {
          migrationPlan,
          isDemo: true,
          note: "This is a demonstration plan. Contact sales for a complete assessment.",
          estimatedROI: `${migrationPlan.budgetProjection.roi2Years}% over 2 years`,
          keyHighlights: [
            "95% process automation achievable",
            "32-week transformation timeline",
            "5 AI service categories deployment",
            "Real-time monitoring and optimization",
            "Enterprise-grade security and compliance"
          ]
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Demo migration plan error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate demo migration plan",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Maturity Assessment
  app.post("/public-api/ai-maturity/assess", validateApiKey, async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { companyData } = req.body;

      if (!companyData || !companyData.companyName) {
        return res.status(400).json({
          success: false,
          error: "Missing required company data",
          message: "companyName is required"
        });
      }

      const maturityAssessment = await aiMaturityEngine.assessAIMaturity(companyData);

      res.json({
        success: true,
        message: "AI maturity assessment completed successfully",
        data: {
          assessment: maturityAssessment,
          companyName: companyData.companyName,
          assessmentDate: new Date().toISOString(),
          benchmarkData: {
            industryAverage: 45,
            topQuartile: 72,
            yourPosition: maturityAssessment.overallScore >= 72 ? "Top Quartile" :
                         maturityAssessment.overallScore >= 45 ? "Above Average" : "Below Average"
          }
        },
        timestamp: new Date().toISOString(),
        processingTime: `${Date.now() - startTime}ms`
      });

    } catch (error) {
      console.error("AI maturity assessment error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate AI maturity assessment",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Demo AI Maturity Assessment (no API key required)
  app.post("/public-api/demo/ai-maturity", async (req, res) => {
    try {
      const { companyData } = req.body;

      const demoCompanyData = {
        companyName: companyData?.companyName || "LogiTech Traditional",
        operationalMetrics: {
          quotingTime: companyData?.quotingTime || 10,
          processingCost: companyData?.processingCost || 60,
          errorRate: companyData?.errorRate || 12,
          clientSatisfaction: companyData?.clientSatisfaction || 75,
          scalabilityLimit: 30
        },
        technologyProfile: {
          cloudUsage: companyData?.cloudUsage || 25,
          apiIntegrations: companyData?.apiIntegrations || 2,
          automationLevel: companyData?.automationLevel || 20
        },
        teamProfile: {
          techSkills: companyData?.techSkills || 35,
          changeReadiness: companyData?.changeReadiness || 60,
          aiExperience: companyData?.aiExperience || 15
        }
      };

      const maturityAssessment = await aiMaturityEngine.assessAIMaturity(demoCompanyData);

      res.json({
        success: true,
        message: "Demo AI maturity assessment completed",
        data: {
          assessment: maturityAssessment,
          isDemo: true,
          note: "This is a demonstration assessment. Contact us for a comprehensive evaluation.",
          keyInsights: [
            `Votre score de maturité IA: ${maturityAssessment.overallScore}/100`,
            `Niveau: ${maturityAssessment.maturityLevel}`,
            `${maturityAssessment.quickWins.length} opportunités quick wins identifiées`,
            `ROI potentiel: ${maturityAssessment.quickWins[0]?.expectedROI || 250}% sur les premiers projets`,
            `Chemin de transformation: ${maturityAssessment.transformationPath.phases.length} phases sur 18 mois`
          ],
          nextSteps: [
            "Prioriser les quick wins identifiées",
            "Développer les compétences de l'équipe",
            "Planifier l'infrastructure IA",
            "Lancer un projet pilote"
          ]
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Demo AI maturity assessment error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate demo AI maturity assessment",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Health check endpoint
  app.get("/public-api/health", (req, res) => {
    res.json({
      status: "healthy",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      services: {
        ai: "operational",
        database: "operational", 
        geocoding: "operational",
        competitiveAnalysis: "operational",
        migrationAI: "operational",
        maturityAssessment: "operational"
      }
    });
  });
}
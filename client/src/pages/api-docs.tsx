import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Play, Key, Globe, Code, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default function ApiDocs() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [testResults, setTestResults] = useState<Record<string, ApiResponse>>({});
  const [loadingTests, setLoadingTests] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("copied", "Copied!"),
      description: t("codeCopiedToClipboard", "Code has been copied to clipboard"),
    });
  };

  const testEndpoint = async (endpoint: string, method: string, payload?: any) => {
    if (!apiKey) {
      toast({
        title: t("apiKeyRequired", "API Key Required"),
        description: t("pleaseEnterApiKeyToTest", "Please enter your API key to test endpoints"),
        variant: "destructive",
      });
      return;
    }

    setLoadingTests(prev => ({ ...prev, [endpoint]: true }));

    try {
      const response = await fetch(`/public-api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      const result = await response.json();
      setTestResults(prev => ({ ...prev, [endpoint]: result }));

      toast({
        title: result.success ? t("testSuccessful", "Test successful") : t("testFailed", "Test failed"),
        description: result.success ? t("endpointWorking", "Endpoint is working correctly") : result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      const errorResult = { success: false, error: "Network error", message: String(error) };
      setTestResults(prev => ({ ...prev, [endpoint]: errorResult }));
      
      toast({
        title: t("testError", "Test error"),
        description: t("cannotContactApi", "Unable to contact API"),
        variant: "destructive",
      });
    } finally {
      setLoadingTests(prev => ({ ...prev, [endpoint]: false }));
    }
  };

  const endpoints = [
    {
      id: "health",
      method: "GET",
      path: "/health",
      title: "Health Check",
      description: t("checkApiStatus", "Check API status"),
      testPayload: null,
    },
    {
      id: "analyze",
      method: "POST", 
      path: "/logistics/analyze",
      title: t("logisticsAnalysis", "Logistics Analysis"),
      description: t("analyzeLogisticsNeeds", "Analyze logistics needs and detect optimal transport mode"),
      testPayload: {
        origin: "Port de Marseille, France",
        destination: "Port de Durban, South Africa",
        cargo: {
          type: "Produits chimiques",
          weight: 1000,
          volume: 5
        }
      },
    },
    {
      id: "quotes",
      method: "POST",
      path: "/logistics/quotes", 
      title: t("quoteGeneration", "Quote Generation"),
      description: t("generateOptimizedQuotes", "Generate AI-optimized quotes"),
      testPayload: {
        origin: "Marseille, France",
        destination: "Hamburg, Germany",
        cargo: {
          type: "Electronics",
          weight: 500,
          value: 25000
        },
        timeline: {
          preferred: "7 days",
          latest: "14 days"
        }
      },
    },
    {
      id: "carriers",
      method: "GET",
      path: "/carriers",
      title: "Liste des Transporteurs", 
      description: "Obtenez la liste des transporteurs disponibles",
      testPayload: null,
    },
    {
      id: "documents",
      method: "POST",
      path: "/documents/generate",
      title: "Génération de Documents",
      description: "Générez les documents douaniers et d'expédition",
      testPayload: {
        shipment: {
          origin: "France",
          destination: "Germany", 
          cargo: {
            type: "Electronics",
            value: 15000
          },
          transportMode: "routier"
        },
        documentType: "customs"
      },
    },
    {
      id: "competitive-analyze",
      method: "POST",
      path: "/competitive/analyze",
      title: t("competitiveAnalysisAI", "AI Competitive Analysis"),
      description: t("analyzeTraditionalFreight", "Analyze a traditional freight company and generate a complete optimization report"),
      testPayload: {
        companyData: {
          companyName: "FreightCorp Traditional",
          quotingProcess: {
            averageResponseTime: 12,
            manualSteps: 15,
            humanInterventions: 10,
            priceAccuracy: 72
          },
          operationalMetrics: {
            processingCost: 65,
            errorRate: 18,
            clientSatisfaction: 65,
            scalabilityLimit: 20
          },
          marketPosition: {
            averageQuoteValue: 25000,
            clientRetention: 68,
            competitivenessScore: 5
          }
        }
      },
    },
    {
      id: "market-analysis",
      method: "POST",
      path: "/competitive/market-analysis",
      title: t("marketAnalysisAI", "AI Market Analysis"),
      description: t("generateMarketComparison", "Generate comparative logistics market analysis"),
      testPayload: {
        competitors: [
          {
            companyName: "TradiFreight A",
            quotingProcess: { averageResponseTime: 8, priceAccuracy: 75 },
            operationalMetrics: { processingCost: 45, scalabilityLimit: 30 },
            marketPosition: { averageQuoteValue: 18000, clientRetention: 72 }
          },
          {
            companyName: "ClassicCargo B", 
            quotingProcess: { averageResponseTime: 15, priceAccuracy: 68 },
            operationalMetrics: { processingCost: 70, scalabilityLimit: 15 },
            marketPosition: { averageQuoteValue: 35000, clientRetention: 60 }
          }
        ]
      },
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Globe className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">API eMulog</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("apiDescription", "AI-powered logistics automation API. Integrate intelligent transport optimization into your applications.")}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">Version 1.0.0</Badge>
          <Badge variant="outline">RESTful API</Badge>
          <Badge variant="outline">Rate Limited</Badge>
          <Badge variant="outline">JSON</Badge>
        </div>
      </div>

      {/* API Key Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Configuration API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiKey">Clé API (pour tester les endpoints)</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Saisissez votre clé API eMulog"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Contactez support@emulog.com pour obtenir votre clé API
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Exemples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Base URL & Authentication */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>URL de Base</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="bg-gray-100 p-2 rounded block">
                  {window.location.origin}/public-api
                </code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authentification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">Header requis :</p>
                <code className="bg-gray-100 p-2 rounded block text-xs">
                  X-API-Key: votre_cle_api
                </code>
                <p className="text-xs text-muted-foreground">
                  Limite : 100 requêtes/minute
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle>Démarrage Rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Test de connectivité</h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">
                  <pre>{`curl -X GET "${window.location.origin}/public-api/health" \\
  -H "X-API-Key: votre_cle_api"`}</pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. Analyse logistique basique</h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">
                  <pre>{`curl -X POST "${window.location.origin}/public-api/logistics/analyze" \\
  -H "X-API-Key: votre_cle_api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin": "Marseille, France",
    "destination": "Hamburg, Germany",
    "cargo": {
      "type": "Electronics",
      "weight": 500
    }
  }'`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          {endpoints.map((endpoint) => {
            const result = testResults[endpoint.path];
            const isLoading = loadingTests[endpoint.path];

            return (
              <Card key={endpoint.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                        {endpoint.method}
                      </Badge>
                      {endpoint.title}
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => testEndpoint(endpoint.path, endpoint.method, endpoint.testPayload)}
                      disabled={isLoading}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isLoading ? "Test..." : "Tester"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Endpoint</h4>
                    <code className="bg-gray-100 p-2 rounded block">
                      {endpoint.method} /public-api{endpoint.path}
                    </code>
                  </div>

                  {endpoint.testPayload && (
                    <div>
                      <h4 className="font-medium mb-2">Exemple de payload</h4>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(endpoint.testPayload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {result && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        Résultat du test
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </h4>
                      <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exemples d'Intégration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* JavaScript Example */}
              <div>
                <h4 className="font-medium mb-2 flex items-center justify-between">
                  JavaScript / Fetch API
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`const response = await fetch('${window.location.origin}/public-api/logistics/quotes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'votre_cle_api'
  },
  body: JSON.stringify({
    origin: 'Marseille, France',
    destination: 'Hamburg, Germany',
    cargo: {
      type: 'Electronics',
      weight: 500,
      value: 25000
    }
  })
});

const data = await response.json();
console.log(data);`)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copier
                  </Button>
                </h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">{`const response = await fetch('${window.location.origin}/public-api/logistics/quotes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'votre_cle_api'
  },
  body: JSON.stringify({
    origin: 'Marseille, France',
    destination: 'Hamburg, Germany',
    cargo: {
      type: 'Electronics',
      weight: 500,
      value: 25000
    }
  })
});

const data = await response.json();
console.log(data);`}</pre>
                </div>
              </div>

              {/* Python Example */}
              <div>
                <h4 className="font-medium mb-2 flex items-center justify-between">
                  Python / Requests
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`import requests

url = '${window.location.origin}/public-api/logistics/quotes'
headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'votre_cle_api'
}
payload = {
    'origin': 'Marseille, France',
    'destination': 'Hamburg, Germany',
    'cargo': {
        'type': 'Electronics',
        'weight': 500,
        'value': 25000
    }
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(data)`)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copier
                  </Button>
                </h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">{`import requests

url = '${window.location.origin}/public-api/logistics/quotes'
headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'votre_cle_api'
}
payload = {
    'origin': 'Marseille, France',
    'destination': 'Hamburg, Germany',
    'cargo': {
        'type': 'Electronics',
        'weight': 500,
        'value': 25000
    }
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(data)`}</pre>
                </div>
              </div>

              {/* cURL Example */}
              <div>
                <h4 className="font-medium mb-2 flex items-center justify-between">
                  cURL
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`curl -X POST "${window.location.origin}/public-api/logistics/quotes" \\
  -H "X-API-Key: votre_cle_api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin": "Marseille, France",
    "destination": "Hamburg, Germany",
    "cargo": {
      "type": "Electronics",
      "weight": 500,
      "value": 25000
    }
  }'`)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copier
                  </Button>
                </h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">{`curl -X POST "${window.location.origin}/public-api/logistics/quotes" \\
  -H "X-API-Key: votre_cle_api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin": "Marseille, France", 
    "destination": "Hamburg, Germany",
    "cargo": {
      "type": "Electronics",
      "weight": 500,
      "value": 25000
    }
  }'`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SDK Information */}
          <Card>
            <CardHeader>
              <CardTitle>SDKs Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Code className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-medium">JavaScript SDK</h4>
                  <p className="text-sm text-muted-foreground">npm install @emulog/api-sdk</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Code className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-medium">Python SDK</h4>
                  <p className="text-sm text-muted-foreground">pip install emulog-api</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Code className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h4 className="font-medium">PHP SDK</h4>
                  <p className="text-sm text-muted-foreground">composer require emulog/api</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Ship, Truck, Plane, MapPin, Route, Clock, 
  DollarSign, TrendingUp, AlertTriangle, CheckCircle,
  Navigation, Fuel, Users, Package, Calendar,
  BarChart3, Globe, Zap, Shield, ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
export default function RouteManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("maritime");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [predictiveResults, setPredictiveResults] = useState<any>(null);
  const [globalOptimization, setGlobalOptimization] = useState<any>(null);
  const [riskManagement, setRiskManagement] = useState<any>(null);

  // Mutation pour l'optimisation IA des routes
  const optimizeRouteMutation = useMutation({
    mutationFn: async (routeData: any) => {
      const response = await fetch('/api/ai/optimize-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeData)
      });
      if (!response.ok) throw new Error('Erreur lors de l\'optimisation');
      return response.json();
    },
    onSuccess: (data) => {
      setOptimizationResults(data);
      toast({
        title: "Optimisation terminée",
        description: "L'IA a optimisé votre route avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur d'optimisation",
        description: "Impossible d'optimiser la route",
        variant: "destructive",
      });
    }
  });

  // Mutation pour l'analyse IA des routes
  const analyzeRouteMutation = useMutation({
    mutationFn: async (routeData: any) => {
      const response = await fetch('/api/ai/analyze-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeData)
      });
      if (!response.ok) throw new Error('Erreur lors de l\'analyse');
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResults(data);
      toast({
        title: "Analyse terminée",
        description: "L'IA a analysé votre route avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'analyser la route",
        variant: "destructive",
      });
    }
  });

  // Mutations pour les outils d'optimisation intelligente
  const predictiveAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/predictive-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transportMode: activeTab })
      });
      if (!response.ok) throw new Error('Erreur analyse prédictive');
      return response.json();
    },
    onSuccess: (data) => {
      setPredictiveResults(data);
      toast({
        title: "Analyse prédictive terminée",
        description: "Prédictions IA générées avec succès",
      });
    }
  });

  const globalOptimizationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/global-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transportMode: activeTab })
      });
      if (!response.ok) throw new Error('Erreur optimisation globale');
      return response.json();
    },
    onSuccess: (data) => {
      setGlobalOptimization(data);
      toast({
        title: "Optimisation globale terminée",
        description: "Stratégie globale optimisée par l'IA",
      });
    }
  });

  const riskManagementMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/risk-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transportMode: activeTab })
      });
      if (!response.ok) throw new Error('Erreur gestion des risques');
      return response.json();
    },
    onSuccess: (data) => {
      setRiskManagement(data);
      toast({
        title: "Gestion des risques terminée",
        description: "Analyse des risques complétée par l'IA",
      });
    }
  });

  const handleOptimizeRoute = (route: any) => {
    optimizeRouteMutation.mutate({
      routeId: route.id,
      origin: route.origin,
      destination: route.destination,
      transportMode: activeTab,
      currentMetrics: {
        duration: route.duration,
        cost: route.cost,
        efficiency: route.efficiency,
        co2: route.co2
      }
    });
  };

  const handleAnalyzeRoute = (route: any) => {
    analyzeRouteMutation.mutate({
      routeId: route.id,
      origin: route.origin,
      destination: route.destination,
      transportMode: activeTab,
      metrics: {
        duration: route.duration,
        cost: route.cost,
        efficiency: route.efficiency,
        co2: route.co2,
        carriers: route.carriers
      }
    });
  };

  // Données des routes maritimes
  const maritimeRoutes = [
    {
      id: 1,
      name: "Transpacifique Principal",
      origin: "Shanghai, Chine",
      destination: "Los Angeles, USA",
      duration: "14 jours",
      cost: "2,450€",
      frequency: "Hebdomadaire",
      capacity: "18,000 TEU",
      carriers: ["COSCO", "MSC", "Maersk"],
      status: "Actif",
      efficiency: 92,
      co2: "45 kg/TEU"
    },
    {
      id: 2,
      name: "Transatlantique Nord",
      origin: "Rotterdam, Pays-Bas",
      destination: "New York, USA",
      duration: "8 jours",
      cost: "1,850€",
      frequency: "Bi-hebdomadaire",
      capacity: "15,000 TEU",
      carriers: ["MSC", "CMA CGM", "Hapag-Lloyd"],
      status: "Actif",
      efficiency: 88,
      co2: "38 kg/TEU"
    },
    {
      id: 3,
      name: "Europe-Asie",
      origin: "Hambourg, Allemagne",
      destination: "Singapour",
      duration: "21 jours",
      cost: "3,200€",
      frequency: "Quotidienne",
      capacity: "20,000 TEU",
      carriers: ["Evergreen", "OOCL", "Yang Ming"],
      status: "Optimal",
      efficiency: 95,
      co2: "52 kg/TEU"
    }
  ];

  // Données des routes terrestres
  const terrestrialRoutes = [
    {
      id: 1,
      name: "Corridor Eurasiatique",
      origin: "Berlin, Allemagne",
      destination: "Pékin, Chine",
      duration: "12 jours",
      cost: "3,800€",
      mode: "Rail",
      frequency: "Tri-hebdomadaire",
      capacity: "80 conteneurs",
      carriers: ["DB Cargo", "RZD", "China Railways"],
      status: "Actif",
      efficiency: 89,
      co2: "28 kg/TEU"
    },
    {
      id: 2,
      name: "Route Américaine",
      origin: "Los Angeles, USA",
      destination: "New York, USA",
      duration: "4 jours",
      cost: "2,100€",
      mode: "Routier",
      frequency: "Quotidienne",
      capacity: "2 conteneurs",
      carriers: ["UPS", "FedEx", "J.B. Hunt"],
      status: "Optimal",
      efficiency: 94,
      co2: "185 kg/conteneur"
    },
    {
      id: 3,
      name: "Nouvelle Route de la Soie",
      origin: "Xi'an, Chine",
      destination: "Duisbourg, Allemagne",
      duration: "16 jours",
      cost: "4,200€",
      mode: "Rail",
      frequency: "Hebdomadaire",
      capacity: "100 conteneurs",
      carriers: ["China Railways", "Kazakhstan Temir Zholy", "DB Cargo"],
      status: "En développement",
      efficiency: 78,
      co2: "31 kg/TEU"
    }
  ];

  // Données des routes aériennes
  const aerialRoutes = [
    {
      id: 1,
      name: "Hub Asie-Europe",
      origin: "Hong Kong",
      destination: "Frankfurt, Allemagne",
      duration: "12 heures",
      cost: "8,500€",
      frequency: "Quotidienne",
      capacity: "150 tonnes",
      carriers: ["Cathay Pacific Cargo", "Lufthansa Cargo", "DHL"],
      status: "Actif",
      efficiency: 96,
      co2: "1,250 kg/tonne"
    },
    {
      id: 2,
      name: "Transpacifique Express",
      origin: "Tokyo, Japon",
      destination: "Los Angeles, USA",
      duration: "10 heures",
      cost: "7,800€",
      frequency: "Bi-quotidienne",
      capacity: "120 tonnes",
      carriers: ["ANA Cargo", "FedEx Express", "UPS Airlines"],
      status: "Optimal",
      efficiency: 98,
      co2: "1,180 kg/tonne"
    },
    {
      id: 3,
      name: "Corridor Atlantique",
      origin: "Paris, France",
      destination: "Miami, USA",
      duration: "9 heures",
      cost: "6,900€",
      frequency: "Quotidienne",
      capacity: "95 tonnes",
      carriers: ["Air France Cargo", "American Airlines Cargo"],
      status: "Actif",
      efficiency: 91,
      co2: "1,350 kg/tonne"
    }
  ];

  const getRouteData = () => {
    switch(activeTab) {
      case "maritime": return maritimeRoutes;
      case "terrestre": return terrestrialRoutes;
      case "aerienne": return aerialRoutes;
      default: return [];
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Optimal": return "bg-green-100 text-green-800";
      case "Actif": return "bg-blue-100 text-blue-800";
      case "En développement": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTabIcon = (tab: string) => {
    switch(tab) {
      case "maritime": return <Ship className="h-4 w-4" />;
      case "terrestre": return <Truck className="h-4 w-4" />;
      case "aerienne": return <Plane className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Routes Multimodales
          </h1>
          <p className="text-gray-600">
            Optimisation intelligente des corridors logistiques maritimes, terrestres et aériens
          </p>
        </div>

        {/* Métriques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Routes Actives</p>
                  <p className="text-2xl font-bold text-blue-600">247</p>
                </div>
                <Route className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-green-600 mt-2">+12% ce mois</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Efficacité Moyenne</p>
                  <p className="text-2xl font-bold text-green-600">91.4%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-green-600 mt-2">+3.2% ce mois</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Coût Moyen</p>
                  <p className="text-2xl font-bold text-purple-600">3,420€</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-red-600 mt-2">-5.8% ce mois</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CO₂ Économisé</p>
                  <p className="text-2xl font-bold text-green-600">12.5T</p>
                </div>
                <Fuel className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-green-600 mt-2">+18% ce mois</p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets des modes de transport */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="maritime" className="flex items-center gap-2">
              {getTabIcon("maritime")}
              Maritime
            </TabsTrigger>
            <TabsTrigger value="terrestre" className="flex items-center gap-2">
              {getTabIcon("terrestre")}
              Terrestre
            </TabsTrigger>
            <TabsTrigger value="aerienne" className="flex items-center gap-2">
              {getTabIcon("aerienne")}
              Aérienne
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {getRouteData().map((route) => (
                <Card key={route.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{route.name}</CardTitle>
                      <Badge className={getStatusColor(route.status)}>
                        {route.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {route.origin} → {route.destination}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Métriques principales */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{route.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{route.cost}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{route.frequency}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{route.capacity}</span>
                        </div>
                      </div>

                      {/* Efficacité */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Efficacité</span>
                          <span className="text-sm text-gray-600">{route.efficiency}%</span>
                        </div>
                        <Progress value={route.efficiency} className="h-2" />
                      </div>

                      {/* Transporteurs */}
                      <div>
                        <p className="text-sm font-medium mb-2">Transporteurs:</p>
                        <div className="flex flex-wrap gap-1">
                          {route.carriers.map((carrier, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {carrier}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Empreinte carbone */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">CO₂:</span>
                        <span className="font-medium text-green-600">{route.co2}</span>
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleOptimizeRoute(route)}
                          disabled={optimizeRouteMutation.isPending}
                        >
                          {optimizeRouteMutation.isPending ? "Optimisation..." : "Optimiser"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleAnalyzeRoute(route)}
                          disabled={analyzeRouteMutation.isPending}
                        >
                          {analyzeRouteMutation.isPending ? "Analyse..." : "Analyser"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Outils d'optimisation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Outils d'Optimisation Intelligente
            </CardTitle>
            <CardDescription>
              Analysez et optimisez vos corridors logistiques en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => predictiveAnalysisMutation.mutate()}
                disabled={predictiveAnalysisMutation.isPending}
              >
                <BarChart3 className="h-6 w-6" />
                <span>{predictiveAnalysisMutation.isPending ? "Analyse..." : "Analyse Prédictive"}</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => globalOptimizationMutation.mutate()}
                disabled={globalOptimizationMutation.isPending}
              >
                <Globe className="h-6 w-6" />
                <span>{globalOptimizationMutation.isPending ? "Optimisation..." : "Optimisation Globale"}</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => riskManagementMutation.mutate()}
                disabled={riskManagementMutation.isPending}
              >
                <Shield className="h-6 w-6" />
                <span>{riskManagementMutation.isPending ? "Analyse..." : "Gestion des Risques"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Résultats d'optimisation IA */}
        {optimizationResults && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Résultats d'Optimisation IA
              </CardTitle>
              <CardDescription>
                Analyse et recommandations pour la route optimisée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Réduction Durée</p>
                  <p className="text-2xl font-bold text-green-700">{optimizationResults.improvements.durationReduction}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Économies</p>
                  <p className="text-2xl font-bold text-blue-700">{optimizationResults.improvements.costSaving}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Gain Efficacité</p>
                  <p className="text-2xl font-bold text-purple-700">{optimizationResults.improvements.efficiencyGain}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Réduction CO₂</p>
                  <p className="text-2xl font-bold text-green-700">{optimizationResults.improvements.co2Reduction}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Recommandations IA:</h4>
                  <ul className="space-y-1">
                    {optimizationResults.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Insights IA:</p>
                  <p className="text-sm text-blue-700">{optimizationResults.aiInsights}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Résultats d'analyse IA */}
        {analysisResults && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Analyse IA Complète
              </CardTitle>
              <CardDescription>
                Évaluation détaillée de la performance de la route
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Performance Globale</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Score global:</span>
                      <Badge className="bg-green-100 text-green-800">{analysisResults.performanceAnalysis.score}/100</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">Forces:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysisResults.performanceAnalysis.strengths.map((strength: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-600 mb-1">Points d'amélioration:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysisResults.performanceAnalysis.weaknesses.map((weakness: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Comparaison Marché</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Position vs concurrents:</span>
                      <Badge variant="outline">{analysisResults.marketComparison.positionVsCompetitors}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Benchmark coût:</span>
                      <span className="text-sm font-medium">{analysisResults.marketComparison.costBenchmark}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Benchmark vitesse:</span>
                      <span className="text-sm font-medium text-green-600">{analysisResults.marketComparison.speedBenchmark}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Recommandations IA:</h4>
                <ul className="space-y-1">
                  {analysisResults.aiRecommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Résultats Analyse Prédictive */}
        {predictiveResults && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Analyse Prédictive IA
              </CardTitle>
              <CardDescription>
                Prédictions intelligentes et tendances du marché logistique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Prévisions de Demande</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>30 prochains jours:</span>
                      <span className="font-semibold text-green-600">{predictiveResults.predictions.demandForecast.next30Days}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>90 prochains jours:</span>
                      <span className="font-semibold text-green-600">{predictiveResults.predictions.demandForecast.next90Days}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fin d'année:</span>
                      <span className="font-semibold text-green-600">{predictiveResults.predictions.demandForecast.yearEnd}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Évolution des Prix</h4>
                  <div className="space-y-2">
                    <div><strong>Court terme:</strong> {predictiveResults.predictions.priceEvolution.shortTerm}</div>
                    <div><strong>Moyen terme:</strong> {predictiveResults.predictions.priceEvolution.mediumTerm}</div>
                    <div><strong>Long terme:</strong> {predictiveResults.predictions.priceEvolution.longTerm}</div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Recommandations IA</h4>
                <ul className="space-y-2">
                  {predictiveResults.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Résultats Optimisation Globale */}
        {globalOptimization && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Optimisation Globale IA
              </CardTitle>
              <CardDescription>
                Stratégie d'optimisation multi-corridor intelligente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">{globalOptimization.strategy.overallApproach}</h4>
                  <p className="text-blue-700 mt-2">{globalOptimization.strategy.primaryObjective}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {globalOptimization.corridorOptimization.map((corridor: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{corridor.corridor}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Performance actuelle:</span>
                        <span>{corridor.currentPerformance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Performance optimisée:</span>
                        <span className="font-semibold text-green-600">{corridor.optimizedPerformance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Économies annuelles:</span>
                        <span className="font-semibold text-green-600">{corridor.savings}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold mb-3">Recommandations Stratégiques</h4>
                <ul className="space-y-2">
                  {globalOptimization.aiRecommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Résultats Gestion des Risques */}
        {riskManagement && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Gestion des Risques IA
              </CardTitle>
              <CardDescription>
                Analyse complète des risques et plans de contingence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Profil de Risque Global</h4>
                    <Badge variant={riskManagement.riskProfile.overallRisk === 'Modéré' ? 'secondary' : 'destructive'}>
                      {riskManagement.riskProfile.overallRisk}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>Score: {riskManagement.riskProfile.riskScore}/100</span>
                    <Progress value={riskManagement.riskProfile.riskScore} className="flex-1" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {riskManagement.riskCategories.map((category: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{category.category}</h4>
                      <Badge variant={category.level === 'Élevé' ? 'destructive' : 'secondary'}>
                        {category.level}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <strong>Facteurs:</strong>
                        <ul className="text-sm text-gray-600 mt-1">
                          {category.factors.slice(0, 2).map((factor: string, idx: number) => (
                            <li key={idx}>• {factor}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Impact:</strong>
                        <p className="text-sm text-gray-600">{category.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold mb-3">Plans de Contingence</h4>
                <div className="space-y-3">
                  {riskManagement.contingencyPlans.map((plan: any, index: number) => (
                    <div key={index} className="border-l-4 border-orange-400 bg-orange-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold">{plan.scenario}</h5>
                        <span className="text-sm text-orange-600">Probabilité: {plan.probability}</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div><strong>Route alternative:</strong> {plan.alternativeRoute}</div>
                        <div><strong>Temps additionnel:</strong> {plan.additionalTime}</div>
                        <div><strong>Coût additionnel:</strong> {plan.additionalCost}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alertes et notifications */}
        <div className="mt-8 space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Route Transpacifique: Retards possibles dus aux conditions météorologiques. 
              Optimisation automatique en cours.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Nouvelle route terrestre Asie-Europe activée avec 15% d'économie de coûts.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
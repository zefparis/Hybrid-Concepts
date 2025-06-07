import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  BarChart3, Globe, Zap, Shield
} from "lucide-react";
import TopNavbar from "@/components/layout/top-navbar";

export default function RouteManagement() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("maritime");
  const [selectedRoute, setSelectedRoute] = useState(null);

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
      <TopNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
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
                        <Button size="sm" className="flex-1">
                          Optimiser
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Analyser
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
              <Button className="h-20 flex flex-col items-center justify-center gap-2">
                <BarChart3 className="h-6 w-6" />
                <span>Analyse Prédictive</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <Globe className="h-6 w-6" />
                <span>Optimisation Globale</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <Shield className="h-6 w-6" />
                <span>Gestion des Risques</span>
              </Button>
            </div>
          </CardContent>
        </Card>

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
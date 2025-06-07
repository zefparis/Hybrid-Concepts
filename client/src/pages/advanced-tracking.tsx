import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, Search, MapPin, Clock, Truck, Ship, Plane,
  AlertTriangle, CheckCircle, Navigation, Zap, Globe,
  BarChart3, Thermometer, Shield, Radio, Wifi
} from "lucide-react";
import TopNavbar from "@/components/layout/top-navbar";
import { apiRequest } from "@/lib/queryClient";

export default function AdvancedTracking() {
  const { t } = useTranslation();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Mutation pour le tracking en temps réel
  const trackShipmentMutation = useMutation({
    mutationFn: async (trackingData: any) => {
      const response = await fetch(`/api/tracking/real-time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trackingData)
      });
      if (!response.ok) throw new Error("Erreur de tracking");
      return response.json();
    }
  });

  // Query pour les expéditions actives
  const { data: activeShipments } = useQuery({
    queryKey: ["/api/tracking/active-shipments"],
    refetchInterval: 30000 // Refresh toutes les 30 secondes
  });

  // APIs de tracking disponibles
  const trackingAPIs = [
    {
      name: "Maersk Line API",
      type: "container",
      status: "Connecté",
      coverage: "Global",
      features: ["Position GPS", "Température", "Humidité", "Sécurité"],
      lastUpdate: "2 min"
    },
    {
      name: "COSCO Shipping API",
      type: "container", 
      status: "Connecté",
      coverage: "Asie-Pacifique",
      features: ["Tracking GPS", "Status des conteneurs", "ETA"],
      lastUpdate: "5 min"
    },
    {
      name: "FedEx Ship Manager API",
      type: "parcel",
      status: "Connecté",
      coverage: "Mondial",
      features: ["Temps réel", "Preuve de livraison", "Signatures"],
      lastUpdate: "1 min"
    },
    {
      name: "UPS Tracking API",
      type: "parcel",
      status: "Connecté", 
      coverage: "Mondial",
      features: ["Localisation précise", "Notifications", "Photos"],
      lastUpdate: "3 min"
    },
    {
      name: "DHL Express API",
      type: "parcel",
      status: "Connecté",
      coverage: "International",
      features: ["Tracking avancé", "Prédictions IA", "Alertes"],
      lastUpdate: "2 min"
    },
    {
      name: "MSC Cargo Tracking",
      type: "container",
      status: "En attente",
      coverage: "Europe-Méditerranée",
      features: ["IoT Sensors", "Blockchain", "Compliance"],
      lastUpdate: "N/A"
    }
  ];

  // Données d'exemple des expéditions trackées
  const trackedShipments = [
    {
      id: "MSKU7750050",
      type: "container",
      carrier: "Maersk",
      origin: "Shanghai, Chine",
      destination: "Rotterdam, Pays-Bas",
      status: "En transit",
      progress: 65,
      currentLocation: "Suez Canal, Égypte",
      eta: "2024-01-15",
      temperature: "2°C",
      humidity: "45%",
      lastUpdate: "Il y a 15 min",
      alerts: []
    },
    {
      id: "775123456789",
      type: "parcel",
      carrier: "FedEx",
      origin: "Memphis, USA",
      destination: "Paris, France",
      status: "En livraison",
      progress: 90,
      currentLocation: "Charles de Gaulle Airport",
      eta: "Aujourd'hui 16:30",
      lastUpdate: "Il y a 5 min",
      alerts: ["Livraison prévue aujourd'hui"]
    },
    {
      id: "COSU4567890123",
      type: "container",
      carrier: "COSCO",
      origin: "Hong Kong",
      destination: "Long Beach, USA",
      status: "Arrivé",
      progress: 100,
      currentLocation: "Port de Long Beach",
      eta: "Livré",
      temperature: "5°C",
      humidity: "38%",
      lastUpdate: "Il y a 2 heures",
      alerts: ["Dédouanement en cours"]
    },
    {
      id: "1Z999AA1234567890",
      type: "parcel",
      carrier: "UPS",
      origin: "Atlanta, USA",
      destination: "Londres, UK",
      status: "En transit",
      progress: 45,
      currentLocation: "Louisville Hub",
      eta: "2024-01-14",
      lastUpdate: "Il y a 1 heure",
      alerts: []
    }
  ];

  const handleTrackShipment = async () => {
    if (!trackingNumber.trim()) return;
    
    try {
      await trackShipmentMutation.mutateAsync({
        trackingNumber,
        provider: "auto-detect"
      });
      setActiveTab("results");
    } catch (error) {
      console.error("Erreur de tracking:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Livré": case "Arrivé": return "bg-green-100 text-green-800";
      case "En transit": case "En livraison": return "bg-blue-100 text-blue-800";
      case "Retard": return "bg-red-100 text-red-800";
      case "En attente": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCarrierIcon = (type: string) => {
    switch(type) {
      case "container": return <Ship className="h-4 w-4" />;
      case "parcel": return <Package className="h-4 w-4" />;
      default: return <Truck className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tracking Avancé Multi-Transporteurs
          </h1>
          <p className="text-gray-600">
            Suivi en temps réel des conteneurs et colis via APIs intégrées
          </p>
        </div>

        {/* Métriques de tracking */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expéditions Actives</p>
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-green-600 mt-2">+8% cette semaine</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">APIs Connectées</p>
                  <p className="text-2xl font-bold text-green-600">5/6</p>
                </div>
                <Radio className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-green-600 mt-2">83% disponibilité</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Livraisons à Temps</p>
                  <p className="text-2xl font-bold text-purple-600">94.2%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-green-600 mt-2">+2.1% ce mois</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alertes Actives</p>
                  <p className="text-2xl font-bold text-orange-600">12</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-xs text-red-600 mt-2">3 nouvelles</p>
            </CardContent>
          </Card>
        </div>

        {/* Interface principale */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Rechercher
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Expéditions Actives
            </TabsTrigger>
            <TabsTrigger value="apis" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              APIs Connectées
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Onglet de recherche */}
          <TabsContent value="search" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recherche Multi-Transporteurs</CardTitle>
                <CardDescription>
                  Entrez un numéro de tracking pour localiser votre expédition en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Numéro de tracking (conteneur, colis, etc.)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleTrackShipment}
                    disabled={trackShipmentMutation.isPending}
                    className="px-8"
                  >
                    {trackShipmentMutation.isPending ? "Recherche..." : "Tracker"}
                  </Button>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>Formats supportés:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Conteneurs: MSKU7750050, COSU4567890123</li>
                    <li>FedEx: 775123456789, 1234 5678 9012</li>
                    <li>UPS: 1Z999AA1234567890</li>
                    <li>DHL: 1234567890</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet expéditions actives */}
          <TabsContent value="active" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trackedShipments.map((shipment) => (
                <Card key={shipment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getCarrierIcon(shipment.type)}
                        {shipment.id}
                      </CardTitle>
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {shipment.carrier} • {shipment.origin} → {shipment.destination}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progression</span>
                          <span className="text-sm text-gray-600">{shipment.progress}%</span>
                        </div>
                        <Progress value={shipment.progress} className="h-2" />
                      </div>

                      {/* Localisation actuelle */}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{shipment.currentLocation}</span>
                      </div>

                      {/* ETA */}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">ETA: {shipment.eta}</span>
                      </div>

                      {/* Conditions environnementales (si container) */}
                      {shipment.type === "container" && shipment.temperature && (
                        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{shipment.temperature}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-blue-300 rounded"></div>
                            <span className="text-sm">{shipment.humidity}</span>
                          </div>
                        </div>
                      )}

                      {/* Alertes */}
                      {shipment.alerts.length > 0 && (
                        <div className="space-y-2">
                          {shipment.alerts.map((alert, index) => (
                            <Alert key={index}>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>{alert}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}

                      {/* Dernière mise à jour */}
                      <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
                        <span>Dernière MAJ: {shipment.lastUpdate}</span>
                        <Button size="sm" variant="outline">
                          Détails
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onglet APIs */}
          <TabsContent value="apis" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trackingAPIs.map((api, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{api.name}</CardTitle>
                      <Badge className={api.status === "Connecté" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {api.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      {getCarrierIcon(api.type)}
                      {api.type === "container" ? "Conteneurs" : "Colis"} • {api.coverage}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Fonctionnalités:</p>
                        <div className="flex flex-wrap gap-1">
                          {api.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Dernière MAJ:</span>
                        <span className="font-medium">{api.lastUpdate}</span>
                      </div>
                      
                      <Button size="sm" className="w-full" disabled={api.status !== "Connecté"}>
                        {api.status === "Connecté" ? "Configurer" : "Connecter"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onglet Analytics */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance des APIs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingAPIs.filter(api => api.status === "Connecté").map((api, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{api.name}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={85 + Math.random() * 15} className="w-20 h-2" />
                          <span className="text-sm text-gray-600">
                            {Math.round(85 + Math.random() * 15)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques de Livraison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded">
                        <p className="text-2xl font-bold text-green-600">94.2%</p>
                        <p className="text-sm text-gray-600">À temps</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded">
                        <p className="text-2xl font-bold text-yellow-600">4.8%</p>
                        <p className="text-sm text-gray-600">Retard</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded">
                        <p className="text-2xl font-bold text-red-600">1.0%</p>
                        <p className="text-sm text-gray-600">Perdu</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded">
                        <p className="text-2xl font-bold text-blue-600">2.4j</p>
                        <p className="text-sm text-gray-600">Délai moyen</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Configuration APIs en attente */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Configuration des APIs de Tracking
            </CardTitle>
            <CardDescription>
              Connectez vos APIs pour un tracking en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Pour activer le tracking en temps réel, configurez vos clés API dans les paramètres.
                APIs disponibles: Maersk, COSCO, FedEx, UPS, DHL, MSC.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
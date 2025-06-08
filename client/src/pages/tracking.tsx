import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  Search, 
  Ship, 
  Plane, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Navigation,
  RefreshCw
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Tracking() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch shipments data
  const { data: shipmentsData = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/shipments"],
  });

  const shipments = Array.isArray(shipmentsData) ? shipmentsData : [];

  // Filter shipments based on search and tab
  const filteredShipments = shipments.filter((shipment: any) => {
    const matchesSearch = !searchTerm || 
      shipment.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.quote?.quoteRequest?.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.quote?.quoteRequest?.destination?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "all" || shipment.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "picked_up":
        return <Package className="h-4 w-4" />;
      case "in_transit":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "delayed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "picked_up":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "in_transit":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "delayed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case "air":
        return <Plane className="h-4 w-4" />;
      case "mer":
        return <Ship className="h-4 w-4" />;
      case "terre":
        return <Truck className="h-4 w-4" />;
      default:
        return <Truck className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmé";
      case "picked_up":
        return "Collecté";
      case "in_transit":
        return "En transit";
      case "delivered":
        return "Livré";
      case "delayed":
        return "Retardé";
      default:
        return status;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Tracking" />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par numéro de suivi, référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmés</TabsTrigger>
            <TabsTrigger value="picked_up">Collectés</TabsTrigger>
            <TabsTrigger value="in_transit">En transit</TabsTrigger>
            <TabsTrigger value="delivered">Livrés</TabsTrigger>
            <TabsTrigger value="delayed">Retardés</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredShipments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucune expédition trouvée
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm ? "Aucune expédition ne correspond à votre recherche" : "Aucune expédition en cours"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredShipments.map((shipment: any) => (
                  <Card key={shipment.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getTransportIcon(shipment.quote?.quoteRequest?.transportMode)}
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {shipment.reference}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {shipment.trackingNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(shipment.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(shipment.status)}
                            {getStatusLabel(shipment.status)}
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Route Information */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <MapPin className="h-3 w-3" />
                            Origine
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {shipment.quote?.quoteRequest?.origin}
                          </p>
                        </div>
                        <Navigation className="h-4 w-4 text-gray-400" />
                        <div className="flex-1 text-right">
                          <div className="flex items-center justify-end gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <MapPin className="h-3 w-3" />
                            Destination
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {shipment.quote?.quoteRequest?.destination}
                          </p>
                        </div>
                      </div>

                      {/* Shipment Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Package className="h-4 w-4" />
                          <span>{shipment.quote?.quoteRequest?.goodsType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>
                            {shipment.estimatedDelivery ? 
                              `Livraison prévue: ${new Date(shipment.estimatedDelivery).toLocaleDateString('fr-FR')}` :
                              "Délai en cours de calcul"
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>Créé le {new Date(shipment.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>

                      {/* Carrier Information */}
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {shipment.quote?.carrier?.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Transporteur
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 dark:text-green-400">
                            {parseFloat(shipment.quote?.price || 0).toLocaleString('fr-FR')} €
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {shipment.quote?.estimatedDays} jours
                          </p>
                        </div>
                      </div>

                      {/* Tracking Progress */}
                      {shipment.trackingData && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Navigation className="h-4 w-4" />
                            Historique de suivi
                          </h4>
                          <div className="space-y-2">
                            {shipment.trackingData.events?.map((event: any, index: number) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {event.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span>{event.location}</span>
                                    <span>{new Date(event.timestamp).toLocaleString('fr-FR')}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          Voir détails
                        </Button>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          Télécharger bordereau
                        </Button>
                        {shipment.status === "in_transit" && (
                          <Button variant="default" size="sm" className="w-full sm:w-auto">
                            Suivre en temps réel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

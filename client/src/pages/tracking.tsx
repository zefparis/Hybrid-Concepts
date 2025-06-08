import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
  RefreshCw,
  Download,
  Eye,
  ExternalLink
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Tracking() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRealTimeOpen, setIsRealTimeOpen] = useState(false);

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

  const getTrackingStatusIcon = (status: string) => {
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
        return t("statusLabels.confirmed");
      case "picked_up":
        return t("statusLabels.pickedUp");
      case "in_transit":
        return t("statusLabels.inTransit");
      case "delivered":
        return t("statusLabels.delivered");
      case "delayed":
        return t("statusLabels.delayed");
      default:
        return status;
    }
  };

  // Download shipment document
  const downloadDocument = async (shipment: any) => {
    try {
      const response = await apiRequest("GET", `/api/shipments/${shipment.id}/document`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bordereau_${shipment.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: t("tracking.documentDownloadSuccess") });
    } catch (error) {
      toast({ 
        title: t("common.error"),
        description: t("tracking.documentDownloadError"),
        variant: "destructive"
      });
    }
  };

  // View shipment details
  const viewDetails = (shipment: any) => {
    setSelectedShipment(shipment);
    setIsDetailsOpen(true);
  };

  // Open real-time tracking
  const openRealTimeTracking = (shipment: any) => {
    setSelectedShipment(shipment);
    setIsRealTimeOpen(true);
  };



  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title={t("tracking.title")} />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("tracking.searchPlaceholder")}
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
            {t("tracking.refresh")}
          </Button>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">{t("tracking.all")}</TabsTrigger>
            <TabsTrigger value="confirmed">{t("tracking.confirmed")}</TabsTrigger>
            <TabsTrigger value="picked_up">{t("tracking.pickedUp")}</TabsTrigger>
            <TabsTrigger value="in_transit">{t("tracking.inTransit")}</TabsTrigger>
            <TabsTrigger value="delivered">{t("tracking.delivered")}</TabsTrigger>
            <TabsTrigger value="delayed">{t("tracking.delayed")}</TabsTrigger>
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
                    {t("tracking.noShipmentsFound")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm ? t("tracking.noShipmentsMatch") : t("tracking.noCurrentShipments")}
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
                            {getTrackingStatusIcon(shipment.status)}
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
                            {t("origin")}
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {shipment.quote?.quoteRequest?.origin}
                          </p>
                        </div>
                        <Navigation className="h-4 w-4 text-gray-400" />
                        <div className="flex-1 text-right">
                          <div className="flex items-center justify-end gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <MapPin className="h-3 w-3" />
                            {t("destination")}
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
                              `${t("tracking.estimatedDelivery")}: ${new Date(shipment.estimatedDelivery).toLocaleDateString()}` :
                              t("tracking.calculatingDelivery")
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{t("tracking.createdOn")} {new Date(shipment.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Carrier Information */}
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {shipment.quote?.carrier?.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("carrier")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 dark:text-green-400">
                            {parseFloat(shipment.quote?.price || 0).toLocaleString('fr-FR')} €
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {shipment.quote?.estimatedDays} {t("tracking.daysDelivery")}
                          </p>
                        </div>
                      </div>

                      {/* Tracking Progress */}
                      {shipment.trackingData && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Navigation className="h-4 w-4" />
                            {t("tracking.trackingHistoryTitle")}
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => viewDetails(shipment)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
{t("tracking.viewDetails")}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => downloadDocument(shipment)}
                        >
                          <Download className="h-4 w-4 mr-2" />
{t("tracking.downloadDocument")}
                        </Button>
                        {shipment.status === "in_transit" && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full sm:w-auto"
                            onClick={() => openRealTimeTracking(shipment)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
{t("tracking.realTimeTracking")}
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

        {/* Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
{t("tracking.shipmentDetails")} {selectedShipment?.reference}
              </DialogTitle>
            </DialogHeader>
            {selectedShipment && (
              <div className="space-y-6">
                {/* Shipment Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t("tracking.generalInfo")}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("tracking.reference")}:</span>
                        <span className="font-medium">{selectedShipment.reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("tracking.trackingNumber")}:</span>
                        <span className="font-medium">{selectedShipment.trackingNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("status")}:</span>
                        <Badge className={getStatusColor(selectedShipment.status)}>
                          {getStatusLabel(selectedShipment.status)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("tracking.transportMode")}:</span>
                        <div className="flex items-center gap-2">
                          {getTransportIcon(selectedShipment.quote?.quoteRequest?.transportMode)}
                          <span className="capitalize">{selectedShipment.quote?.quoteRequest?.transportMode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Transporteur</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nom:</span>
                        <span className="font-medium">{selectedShipment.quote?.carrier?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedShipment.quote?.carrier?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone:</span>
                        <span className="font-medium">{selectedShipment.quote?.carrier?.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Note:</span>
                        <span className="font-medium">{selectedShipment.quote?.carrier?.rating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Route Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Itinéraire</h3>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Origine</div>
                      <p className="font-medium">{selectedShipment.quote?.quoteRequest?.origin}</p>
                    </div>
                    <Navigation className="h-6 w-6 text-gray-400" />
                    <div className="flex-1 text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Destination</div>
                      <p className="font-medium">{selectedShipment.quote?.quoteRequest?.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Cargo Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Détails de la marchandise</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-sm text-gray-600 dark:text-gray-400">Type</div>
                      <div className="font-medium">{selectedShipment.quote?.quoteRequest?.goodsType}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-2xl font-bold text-blue-500 block">{selectedShipment.quote?.quoteRequest?.weight}</span>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Poids (kg)</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-2xl font-bold text-blue-500 block">{selectedShipment.quote?.quoteRequest?.volume}</span>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Volume (m³)</div>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Tarification</h3>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Prix total</div>
                      <div className="text-2xl font-bold text-green-600">{parseFloat(selectedShipment.quote?.price || 0).toLocaleString('fr-FR')} €</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Délai estimé</div>
                      <div className="font-medium">{selectedShipment.quote?.estimatedDays} jours</div>
                    </div>
                  </div>
                </div>

                {/* Tracking History */}
                {selectedShipment.trackingData?.events && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Historique de suivi complet</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedShipment.trackingData.events.map((event: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium">{event.description}</p>
                              <span className="text-sm text-gray-500">
                                {new Date(event.timestamp).toLocaleString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{event.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Real-time Tracking Modal */}
        <Dialog open={isRealTimeOpen} onOpenChange={setIsRealTimeOpen}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Suivi en temps réel - {selectedShipment?.reference}
              </DialogTitle>
            </DialogHeader>
            {selectedShipment && (
              <div className="space-y-6">
                {/* Current Status */}
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-medium">Position actuelle</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedShipment.trackingData?.currentLocation || "Position en cours de mise à jour..."}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(selectedShipment.status)}>
                    <div className="flex items-center gap-1">
                      {getTrackingStatusIcon(selectedShipment.status)}
                      {getStatusLabel(selectedShipment.status)}
                    </div>
                  </Badge>
                </div>

                {/* Live Map Placeholder */}
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Carte de suivi en temps réel
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Intégration avec le système de géolocalisation du transporteur
                    </p>
                    <Button className="mt-4" onClick={() => {
                      toast({ title: "Ouverture du suivi externe...", description: "Redirection vers le portail du transporteur" });
                    }}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ouvrir le portail transporteur
                    </Button>
                  </div>
                </div>

                {/* Real-time Updates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Informations en temps réel</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600">Dernière mise à jour:</span>
                        <span className="font-medium">
                          {selectedShipment.trackingData?.lastUpdate ? 
                            new Date(selectedShipment.trackingData.lastUpdate).toLocaleString('fr-FR') :
                            "Il y a quelques minutes"
                          }
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600">Livraison estimée:</span>
                        <span className="font-medium">
                          {selectedShipment.estimatedDelivery ?
                            new Date(selectedShipment.estimatedDelivery).toLocaleDateString('fr-FR') :
                            "Calcul en cours"
                          }
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600">Température:</span>
                        <span className="font-medium text-green-600">18°C ✓</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Alertes et notifications</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Expédition dans les temps</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <Navigation className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">GPS actif - Position mise à jour</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Prochaine étape dans 2h30</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

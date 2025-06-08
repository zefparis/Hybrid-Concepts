import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plane, 
  Ship, 
  MapPin, 
  Clock, 
  Navigation, 
  Globe, 
  Activity,
  Anchor,
  RadioTower,
  Search,
  Info,
  Route,
  AlertCircle
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AviationMaritime() {
  const { t } = useTranslation();
  const [flightNumber, setFlightNumber] = useState("");
  const [mmsi, setMmsi] = useState("");
  const [selectedAirport, setSelectedAirport] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const { toast } = useToast();

  // Aviation tracking mutation
  const flightTrackingMutation = useMutation({
    mutationFn: async (data: { flightNumber: string; date?: string }) => {
      return await apiRequest('/api/tracking/aviation/flight', 'POST', data);
    },
    onSuccess: (data: any) => {
      toast({
        title: t("aviationMaritime.flightTrackedSuccess"),
        description: `${t("aviationMaritime.flightNumber")}: ${data?.flightNumber || 'N/A'}`,
      });
    },
    onError: (error) => {
      toast({
        title: t("aviationMaritime.trackingError"),
        description: t("aviationMaritime.flightNotFound"),
        variant: "destructive",
      });
    }
  });

  // Maritime tracking mutation
  const vesselTrackingMutation = useMutation({
    mutationFn: async (data: { mmsi: string }) => {
      return await apiRequest('/api/tracking/maritime/vessel', 'POST', data);
    },
    onSuccess: (data: any) => {
      toast({
        title: t("aviationMaritime.vesselTrackedSuccess"),
        description: `${t("aviationMaritime.vesselName")}: ${data?.name || 'N/A'}`,
      });
    },
    onError: (error) => {
      toast({
        title: t("aviationMaritime.trackingError"),
        description: t("aviationMaritime.vesselNotFound"),
        variant: "destructive",
      });
    }
  });

  // Airport info query
  const { data: airportInfo, refetch: refetchAirport } = useQuery({
    queryKey: ['/api/tracking/aviation/airport', selectedAirport],
    enabled: !!selectedAirport,
  });

  // Port info query
  const { data: portInfo, refetch: refetchPort } = useQuery({
    queryKey: ['/api/tracking/maritime/port', selectedPort],
    enabled: !!selectedPort,
  });

  const handleFlightTracking = () => {
    if (!flightNumber.trim()) {
      toast({
        title: t("aviationMaritime.flightNumberRequired"),
        description: t("aviationMaritime.enterValidFlight"),
        variant: "destructive",
      });
      return;
    }
    flightTrackingMutation.mutate({ flightNumber: flightNumber.trim() });
  };

  const handleVesselTracking = () => {
    if (!mmsi.trim()) {
      toast({
        title: t("aviationMaritime.mmsiRequired"),
        description: t("aviationMaritime.enterValidMmsi"),
        variant: "destructive",
      });
      return;
    }
    vesselTrackingMutation.mutate({ mmsi: mmsi.trim() });
  };

  const handleAirportSearch = () => {
    if (selectedAirport) {
      refetchAirport();
    }
  };

  const handlePortSearch = () => {
    if (selectedPort) {
      refetchPort();
    }
  };

  const flightData = flightTrackingMutation.data as any;
  const vesselData = vesselTrackingMutation.data as any;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("aviationMaritime.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("aviationMaritime.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <RadioTower className="w-4 h-4 mr-1" />
            12/12 {t("aviationMaritime.apisOperational")}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="aviation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="aviation" className="flex items-center gap-2">
            <Plane className="w-4 h-4" />
            {t("aviationMaritime.aviation")}
          </TabsTrigger>
          <TabsTrigger value="maritime" className="flex items-center gap-2">
            <Ship className="w-4 h-4" />
            {t("aviationMaritime.maritime")}
          </TabsTrigger>
        </TabsList>

        {/* Aviation Tab */}
        <TabsContent value="aviation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flight Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-500" />
                  {t("aviationMaritime.flightTracking")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="flightNumber">{t("aviationMaritime.flightNumber")}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="flightNumber"
                      placeholder={t("aviationMaritime.flightNumberPlaceholder")}
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                    />
                    <Button 
                      onClick={handleFlightTracking}
                      disabled={flightTrackingMutation.isPending}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {flightTrackingMutation.isPending && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>{t("aviationMaritime.searchInProgress")}</span>
                  </div>
                )}

                {flightData && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{flightData.flightNumber}</h3>
                      <Badge variant={flightData.status === 'active' ? 'default' : 'secondary'}>
                        {flightData.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Départ</p>
                        <p className="font-medium">{flightData.departure.airport}</p>
                        <p className="text-sm text-gray-500">{flightData.departure.iataCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Arrivée</p>
                        <p className="font-medium">{flightData.arrival.airport}</p>
                        <p className="text-sm text-gray-500">{flightData.arrival.iataCode}</p>
                      </div>
                    </div>

                    {flightData.aircraft && (
                      <div>
                        <p className="text-sm text-gray-600">Aéronef</p>
                        <p className="font-medium">{flightData.aircraft.type} - {flightData.aircraft.registration}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Départ prévu: {new Date(flightData.departure.scheduled || '').toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Airport Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-500" />
                  {t("aviationMaritime.airportInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="airportCode">{t("aviationMaritime.iataCode")}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="airportCode"
                      placeholder="CDG, JFK, LAX"
                      value={selectedAirport}
                      onChange={(e) => setSelectedAirport(e.target.value)}
                    />
                    <Button onClick={handleAirportSearch}>
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {airportInfo && typeof airportInfo === 'object' && (
                  <div className="space-y-3 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-lg">{String((airportInfo as Record<string, any>)?.name || t("aviationMaritime.airportName"))}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">{t("aviationMaritime.city")}</p>
                        <p className="font-medium">{String((airportInfo as Record<string, any>)?.city || 'N/A')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t("aviationMaritime.country")}</p>
                        <p className="font-medium">{String((airportInfo as Record<string, any>)?.country || 'N/A')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">{t("aviationMaritime.iataCode")}</p>
                        <p className="font-medium">{String((airportInfo as Record<string, any>)?.iata || 'N/A')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t("aviationMaritime.icaoCode")}</p>
                        <p className="font-medium">{String((airportInfo as Record<string, any>)?.icao || 'N/A')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maritime Tab */}
        <TabsContent value="maritime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vessel Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="w-5 h-5 text-blue-500" />
                  {t("aviationMaritime.vesselTracking")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mmsi">{t("aviationMaritime.mmsi")}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="mmsi"
                      placeholder="247234300, 636014932"
                      value={mmsi}
                      onChange={(e) => setMmsi(e.target.value)}
                    />
                    <Button 
                      onClick={handleVesselTracking}
                      disabled={vesselTrackingMutation.isPending}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {vesselTrackingMutation.isPending && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>{t("aviationMaritime.vesselSearchProgress")}</span>
                  </div>
                )}

                {vesselData && (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{vesselData.name}</h3>
                      <Badge variant="outline">{vesselData.type}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">MMSI</p>
                        <p className="font-medium">{vesselData.mmsi}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t("aviationMaritime.flag")}</p>
                        <p className="font-medium">{vesselData.flag}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">{t("aviationMaritime.position")}</p>
                        <p className="font-medium">{vesselData.position.lat.toFixed(4)}, {vesselData.position.lng.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t("aviationMaritime.speed")}</p>
                        <p className="font-medium">{vesselData.position.speed} nœuds</p>
                      </div>
                    </div>

                    {vesselData.destination && (
                      <div>
                        <p className="text-sm text-gray-600">{t("aviationMaritime.destination")}</p>
                        <p className="font-medium">{vesselData.destination}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Navigation className="w-4 h-4" />
                        <span>{t("aviationMaritime.course")}: {vesselData.position.course}°</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(vesselData.position.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Port Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="w-5 h-5 text-green-500" />
                  {t("aviationMaritime.portInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="portId">{t("aviationMaritime.portId")}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="portId"
                      placeholder="1 (Rotterdam), 2 (Hamburg)"
                      value={selectedPort}
                      onChange={(e) => setSelectedPort(e.target.value)}
                    />
                    <Button onClick={handlePortSearch}>
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {portInfo && typeof portInfo === 'object' && (
                  <div className="space-y-3 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-lg">{String((portInfo as Record<string, any>)?.name || t("aviationMaritime.portName"))}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">{t("aviationMaritime.country")}</p>
                        <p className="font-medium">{String((portInfo as Record<string, any>)?.country || 'N/A')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t("aviationMaritime.coordinates")}</p>
                        <p className="font-medium">{String((portInfo as Record<string, any>)?.coordinates?.lat?.toFixed(4) || '0')}, {String((portInfo as Record<string, any>)?.coordinates?.lng?.toFixed(4) || '0')}</p>
                      </div>
                    </div>
                    
                    {(portInfo as Record<string, any>)?.facilities && Array.isArray((portInfo as Record<string, any>).facilities) && (portInfo as Record<string, any>).facilities.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">{t("aviationMaritime.facilities")}</p>
                        <div className="flex flex-wrap gap-1">
                          {(portInfo as Record<string, any>).facilities.map((facility: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {String(facility)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {(portInfo as Record<string, any>)?.maxVesselSize && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">{t("aviationMaritime.maxLength")}</p>
                          <p className="font-medium">{String((portInfo as Record<string, any>)?.maxVesselSize?.length || 'N/A')}m</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{t("aviationMaritime.maxDraught")}</p>
                          <p className="font-medium">{String((portInfo as Record<string, any>)?.maxVesselSize?.draught || 'N/A')}m</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* API Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-500" />
            {t("aviationMaritime.apiIntegrationsStatus")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">AviationStack</p>
                <p className="text-sm text-gray-600">{t("aviationMaritime.aerialTracking")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">{t("aviationMaritime.marineTraffic")}</p>
                <p className="text-sm text-gray-600">{t("aviationMaritime.maritimeTracking")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Vizion API</p>
                <p className="text-sm text-gray-600">Conteneurs</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Google Maps</p>
                <p className="text-sm text-gray-600">Géolocalisation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
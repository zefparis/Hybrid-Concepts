import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Truck, Ship, Plane, Package, Clock, Euro, MapPin, Weight, Calendar, Filter, Building2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Quotes() {
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState(false);
  const [selectedTransportMode, setSelectedTransportMode] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quoteRequests = [], isLoading } = useQuery({
    queryKey: ["/api/quote-requests"],
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/quote-requests", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quote-requests"] });
      toast({
        title: "Demande de cotation créée",
        description: "Votre demande a été envoyée aux transporteurs",
      });
      setIsNewQuoteOpen(false);
      setNewQuote({
        origin: "",
        destination: "",
        goodsType: "",
        weight: "",
        volume: "",
        transportMode: "terre",
        requestedDate: "",
        description: "",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande de cotation",
        variant: "destructive",
      });
    },
  });

  const [newQuote, setNewQuote] = useState({
    origin: "",
    destination: "",
    goodsType: "",
    weight: "",
    volume: "",
    transportMode: "terre",
    requestedDate: "",
    description: "",
  });

  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // Mapbox Geocoding API for real-world location suggestions
  const searchLocations = async (query: string, transportMode: string) => {
    if (query.length < 2) return [];
    
    try {
      // Define search types based on transport mode
      const searchTypes = {
        terre: 'place,locality,address',
        mer: 'place,poi', // Points of interest for ports
        air: 'place,poi'  // Points of interest for airports
      };
      
      const searchType = searchTypes[transportMode as keyof typeof searchTypes] || 'place,locality';
      
      // Add specific queries for ports and airports
      let searchQuery = query;
      if (transportMode === 'mer' && !query.toLowerCase().includes('port')) {
        searchQuery = `port ${query}`;
      } else if (transportMode === 'air' && !query.toLowerCase().includes('airport') && !query.toLowerCase().includes('aéroport')) {
        searchQuery = `airport ${query}`;
      }
      
      const mapboxKey = import.meta.env.VITE_MAPBOX_PUBLIC_KEY;
      if (!mapboxKey) {
        console.warn('Mapbox API key not found, using fallback suggestions');
        return getFallbackSuggestions(query, transportMode);
      }
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `access_token=${mapboxKey}&` +
        `types=${searchType}&` +
        `limit=5&` +
        `language=fr`
      );
      
      if (!response.ok) throw new Error('Geocoding API error');
      
      const data = await response.json();
      return data.features.map((feature: any) => ({
        text: feature.place_name,
        value: feature.place_name
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return getFallbackSuggestions(query, transportMode);
    }
  };

  // Fallback suggestions when API is not available
  const getFallbackSuggestions = (query: string, transportMode: string) => {
    const fallbackData = {
      terre: [
        "Paris, France", "Lyon, France", "Marseille, France", "London, United Kingdom",
        "Berlin, Germany", "Madrid, Spain", "Rome, Italy", "Amsterdam, Netherlands"
      ],
      mer: [
        "Port of Rotterdam, Netherlands", "Port of Antwerp, Belgium", "Port of Hamburg, Germany",
        "Port of Marseille, France", "Port of Barcelona, Spain", "Port of Valencia, Spain"
      ],
      air: [
        "Charles de Gaulle Airport, Paris", "Heathrow Airport, London", "Schiphol Airport, Amsterdam",
        "Frankfurt Airport, Germany", "Madrid-Barajas Airport, Spain", "Leonardo da Vinci Airport, Rome"
      ]
    };
    
    return fallbackData[transportMode as keyof typeof fallbackData]
      .filter(location => location.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(text => ({ text, value: text }));
  };

  const handleOriginChange = async (value: string) => {
    setNewQuote({...newQuote, origin: value});
    if (value.length > 1) {
      const suggestions = await searchLocations(value, newQuote.transportMode);
      setOriginSuggestions(suggestions.map(s => s.text));
      setShowOriginSuggestions(suggestions.length > 0);
    } else {
      setShowOriginSuggestions(false);
    }
  };

  const handleDestinationChange = async (value: string) => {
    setNewQuote({...newQuote, destination: value});
    if (value.length > 1) {
      const suggestions = await searchLocations(value, newQuote.transportMode);
      setDestinationSuggestions(suggestions.map(s => s.text));
      setShowDestinationSuggestions(suggestions.length > 0);
    } else {
      setShowDestinationSuggestions(false);
    }
  };

  const selectOriginSuggestion = (suggestion: string) => {
    setNewQuote({...newQuote, origin: suggestion});
    setShowOriginSuggestions(false);
  };

  const selectDestinationSuggestion = (suggestion: string) => {
    setNewQuote({...newQuote, destination: suggestion});
    setShowDestinationSuggestions(false);
  };

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    createQuoteMutation.mutate(newQuote);
  };

  const getTransportIcon = (mode: string) => {
    switch (mode?.toLowerCase()) {
      case "air":
      case "aérien":
        return <Plane className="h-5 w-5 text-blue-600" />;
      case "mer":
      case "maritime":
        return <Ship className="h-5 w-5 text-blue-800" />;
      case "terre":
      case "routier":
      default:
        return <Truck className="h-5 w-5 text-green-600" />;
    }
  };

  const getTransportLabel = (mode: string) => {
    switch (mode?.toLowerCase()) {
      case "air":
      case "aérien":
        return "Aérien";
      case "mer":
      case "maritime":
        return "Maritime";
      case "terre":
      case "routier":
      default:
        return "Routier";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "quoted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "quoted":
        return "Cotée";
      case "pending":
        return "En attente";
      case "rejected":
        return "Refusée";
      default:
        return status;
    }
  };

  const filteredQuotes = quoteRequests.filter((quote: any) => {
    const transportModeMatch = selectedTransportMode === "all" || 
      quote.transportMode?.toLowerCase() === selectedTransportMode;
    const statusMatch = filterStatus === "all" || quote.status === filterStatus;
    return transportModeMatch && statusMatch;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Header 
          title="Cotations" 
          subtitle="Gérez vos demandes de transport multimodal"
        />
        
        <Dialog open={isNewQuoteOpen} onOpenChange={setIsNewQuoteOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle cotation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Demande de cotation</DialogTitle>
              <DialogDescription>
                Créez une nouvelle demande de cotation pour vos expéditions
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateQuote} className="space-y-6">
              <Tabs defaultValue="terre" onValueChange={(value) => setNewQuote({...newQuote, transportMode: value})}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="terre" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span className="hidden sm:inline">Routier</span>
                  </TabsTrigger>
                  <TabsTrigger value="mer" className="flex items-center gap-2">
                    <Ship className="h-4 w-4" />
                    <span className="hidden sm:inline">Maritime</span>
                  </TabsTrigger>
                  <TabsTrigger value="air" className="flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    <span className="hidden sm:inline">Aérien</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="terre" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="origin">Lieu d'enlèvement *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="origin"
                          placeholder="Tapez pour rechercher..."
                          className="pl-10"
                          value={newQuote.origin}
                          onChange={(e) => handleOriginChange(e.target.value)}
                          onFocus={() => newQuote.origin.length > 1 && setShowOriginSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                          required
                        />
                        {showOriginSuggestions && originSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {originSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                                onClick={() => selectOriginSuggestion(suggestion)}
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3 text-gray-400" />
                                  {suggestion}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="destination">Lieu de livraison *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="destination"
                          placeholder="Tapez pour rechercher..."
                          className="pl-10"
                          value={newQuote.destination}
                          onChange={(e) => handleDestinationChange(e.target.value)}
                          onFocus={() => newQuote.destination.length > 1 && setShowDestinationSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                          required
                        />
                        {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {destinationSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                                onClick={() => selectDestinationSuggestion(suggestion)}
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3 text-gray-400" />
                                  {suggestion}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mer" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="origin-port">Port de départ *</Label>
                      <div className="relative">
                        <Ship className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="origin-port"
                          placeholder="Tapez pour rechercher..."
                          className="pl-10"
                          value={newQuote.origin}
                          onChange={(e) => handleOriginChange(e.target.value)}
                          onFocus={() => newQuote.origin.length > 1 && setShowOriginSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                          required
                        />
                        {showOriginSuggestions && originSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {originSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                                onClick={() => selectOriginSuggestion(suggestion)}
                              >
                                <div className="flex items-center gap-2">
                                  <Ship className="h-3 w-3 text-gray-400" />
                                  {suggestion}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="destination-port">Port d'arrivée *</Label>
                      <div className="relative">
                        <Ship className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="destination-port"
                          placeholder="Tapez pour rechercher..."
                          className="pl-10"
                          value={newQuote.destination}
                          onChange={(e) => handleDestinationChange(e.target.value)}
                          onFocus={() => newQuote.destination.length > 1 && setShowDestinationSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                          required
                        />
                        {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {destinationSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                                onClick={() => selectDestinationSuggestion(suggestion)}
                              >
                                <div className="flex items-center gap-2">
                                  <Ship className="h-3 w-3 text-gray-400" />
                                  {suggestion}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="air" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="origin-airport">Aéroport de départ *</Label>
                      <div className="relative">
                        <Plane className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="origin-airport"
                          placeholder="Tapez pour rechercher..."
                          className="pl-10"
                          value={newQuote.origin}
                          onChange={(e) => handleOriginChange(e.target.value)}
                          onFocus={() => newQuote.origin.length > 1 && setShowOriginSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                          required
                        />
                        {showOriginSuggestions && originSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {originSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                                onClick={() => selectOriginSuggestion(suggestion)}
                              >
                                <div className="flex items-center gap-2">
                                  <Plane className="h-3 w-3 text-gray-400" />
                                  {suggestion}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="destination-airport">Aéroport d'arrivée *</Label>
                      <div className="relative">
                        <Plane className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="destination-airport"
                          placeholder="Tapez pour rechercher..."
                          className="pl-10"
                          value={newQuote.destination}
                          onChange={(e) => handleDestinationChange(e.target.value)}
                          onFocus={() => newQuote.destination.length > 1 && setShowDestinationSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                          required
                        />
                        {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {destinationSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                                onClick={() => selectDestinationSuggestion(suggestion)}
                              >
                                <div className="flex items-center gap-2">
                                  <Plane className="h-3 w-3 text-gray-400" />
                                  {suggestion}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="weight">Poids (kg) *</Label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="1000"
                      className="pl-10"
                      value={newQuote.weight}
                      onChange={(e) => setNewQuote({...newQuote, weight: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="volume">Volume (m³)</Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="volume"
                      type="number"
                      step="0.1"
                      placeholder="5.2"
                      className="pl-10"
                      value={newQuote.volume}
                      onChange={(e) => setNewQuote({...newQuote, volume: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="requested-date">Date souhaitée *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="requested-date"
                      type="date"
                      className="pl-10"
                      value={newQuote.requestedDate}
                      onChange={(e) => setNewQuote({...newQuote, requestedDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="goods-type">Type de marchandise *</Label>
                <Select value={newQuote.goodsType} onValueChange={(value) => setNewQuote({...newQuote, goodsType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Électronique</SelectItem>
                    <SelectItem value="Furniture">Mobilier</SelectItem>
                    <SelectItem value="Automotive">Automobile</SelectItem>
                    <SelectItem value="Food">Alimentaire</SelectItem>
                    <SelectItem value="Chemicals">Produits chimiques</SelectItem>
                    <SelectItem value="Textiles">Textiles</SelectItem>
                    <SelectItem value="Industrial">Machines industrielles</SelectItem>
                    <SelectItem value="General">Marchandises générales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description détaillée</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[80px] p-3 border rounded-md resize-none"
                  placeholder="Décrivez votre expédition, contraintes particulières, etc."
                  value={newQuote.description}
                  onChange={(e) => setNewQuote({...newQuote, description: e.target.value})}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsNewQuoteOpen(false)} className="w-full sm:w-auto">
                  Annuler
                </Button>
                <Button type="submit" disabled={createQuoteMutation.isPending} className="w-full sm:w-auto">
                  {createQuoteMutation.isPending ? "Création..." : "Créer la demande"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtres:</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedTransportMode} onValueChange={setSelectedTransportMode}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les modes</SelectItem>
              <SelectItem value="terre">Routier</SelectItem>
              <SelectItem value="mer">Maritime</SelectItem>
              <SelectItem value="air">Aérien</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="quoted">Cotées</SelectItem>
              <SelectItem value="rejected">Refusées</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des cotations */}
      <div className="grid gap-4 sm:gap-6">
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
        ) : filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune cotation trouvée
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Créez votre première demande de cotation pour commencer
              </p>
              <Button onClick={() => setIsNewQuoteOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle cotation
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote: any) => (
            <Card key={quote.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {getTransportIcon(quote.transportMode || "terre")}
                    <div>
                      <CardTitle className="text-lg">{quote.reference}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {quote.origin} → {quote.destination}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(quote.status)}>
                      {getStatusLabel(quote.status)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getTransportLabel(quote.transportMode || "terre")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Package className="h-4 w-4" />
                    <span>{quote.goodsType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Weight className="h-4 w-4" />
                    <span>{quote.weight} kg</span>
                    {quote.volume && <span>• {quote.volume} m³</span>}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(quote.requestedDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                
                {quote.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {quote.description}
                  </div>
                )}
                
                {quote.quotes && quote.quotes.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Offres reçues ({quote.quotes.length})
                    </h4>
                    <div className="space-y-3">
                      {quote.quotes.map((offer: any) => (
                        <div key={offer.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{offer.carrier?.name}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span>Délai: {offer.estimatedDays} jours</span>
                              <span className="hidden sm:inline">•</span>
                              <span>Valide jusqu'au {new Date(offer.validUntil).toLocaleDateString('fr-FR')}</span>
                            </div>
                            {offer.conditions && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{offer.conditions}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                {parseFloat(offer.price).toLocaleString('fr-FR')} €
                              </div>
                              <div className="text-xs text-gray-500">
                                {offer.status === "pending" ? "En attente" : 
                                 offer.status === "accepted" ? "Acceptée" : offer.status}
                              </div>
                            </div>
                            {offer.status === "pending" && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  Refuser
                                </Button>
                                <Button size="sm">
                                  Accepter
                                </Button>
                              </div>
                            )}
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
                    Modifier
                  </Button>
                  {quote.status === "pending" && (
                    <Button variant="outline" size="sm" className="w-full sm:w-auto text-red-600 hover:text-red-700">
                      Annuler
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

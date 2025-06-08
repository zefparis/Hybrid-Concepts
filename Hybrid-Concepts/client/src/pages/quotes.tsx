import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Truck, Ship, Plane, Package, Clock, Euro, MapPin, Weight, Calendar, Filter, Building2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Quotes() {
  const { t } = useTranslation();
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
        title: t("quoteRequestCreated", "Quote request created"),
        description: t("requestSentToCarriers", "Your request has been sent to carriers"),
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

  const generateQuotesMutation = useMutation({
    mutationFn: async (quoteRequestId: number) => {
      const response = await apiRequest("POST", "/api/quotes/generate", { quoteRequestId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quote-requests"] });
      toast({
        title: t("quotesGenerated", "Quotes Generated"),
        description: data.message || t("quotesGeneratedSuccessfully", "Quotes have been generated successfully"),
      });
    },
    onError: () => {
      toast({
        title: t("error", "Error"),
        description: t("unableToGenerateQuotes", "Unable to generate quotes"),
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
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Enhanced geocoding API with Google fallback for specialized locations
  const searchLocations = async (query: string, transportMode: string) => {
    if (query.length < 2) return [];
    
    try {
      // Define search types based on transport mode
      const searchTypes = {
        terre: 'place,locality,address',
        mer: 'place,poi,mer', // Enhanced for ports with Google fallback
        air: 'place,poi,air'  // Enhanced for airports with Google fallback
      };
      
      const searchType = searchTypes[transportMode as keyof typeof searchTypes] || 'place,locality';
      
      // Enhanced queries for better port and airport detection
      let searchQuery = query;
      if (transportMode === 'mer') {
        // More intelligent port detection
        if (!query.toLowerCase().includes('port') && !query.toLowerCase().includes('harbour') && !query.toLowerCase().includes('terminal')) {
          searchQuery = `port ${query}`;
        }
      } else if (transportMode === 'air') {
        // More intelligent airport detection
        if (!query.toLowerCase().includes('airport') && !query.toLowerCase().includes('aéroport') && !query.toLowerCase().includes('terminal')) {
          searchQuery = `airport ${query}`;
        }
      }
      
      const response = await fetch(
        `/api/geocoding/search?query=${encodeURIComponent(searchQuery)}&types=${searchType}&limit=8`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding API error');
      }
      
      const data = await response.json();
      
      // Filter and prioritize results based on transport mode
      let filteredSuggestions = data.suggestions || [];
      
      if (transportMode === 'mer') {
        // Prioritize port-related results
        filteredSuggestions = filteredSuggestions.filter((s: any) => 
          s.text.toLowerCase().includes('port') || 
          s.text.toLowerCase().includes('harbour') || 
          s.text.toLowerCase().includes('terminal') ||
          s.text.toLowerCase().includes('dock') ||
          s.source === 'google' // Google results are already filtered for ports
        );
      } else if (transportMode === 'air') {
        // Prioritize airport-related results
        filteredSuggestions = filteredSuggestions.filter((s: any) => 
          s.text.toLowerCase().includes('airport') || 
          s.text.toLowerCase().includes('aéroport') || 
          s.text.toLowerCase().includes('terminal') ||
          s.text.toLowerCase().includes('airfield') ||
          s.source === 'google' // Google results are already filtered for airports
        );
      }
      
      return filteredSuggestions.slice(0, 5);
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
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
      setOriginSuggestions(suggestions.map((s: any) => s.text));
      setShowOriginSuggestions(suggestions.length > 0);
    } else {
      setShowOriginSuggestions(false);
    }
  };

  const handleDestinationChange = async (value: string) => {
    setNewQuote({...newQuote, destination: value});
    if (value.length > 1) {
      const suggestions = await searchLocations(value, newQuote.transportMode);
      setDestinationSuggestions(suggestions.map((s: any) => s.text));
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

  // Mutation pour supprimer une cotation
  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/quote-requests/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quote-requests"] });
      toast({ title: t("quotes.quoteCancelled", "Quote cancelled successfully") });
    },
    onError: () => {
      toast({ 
        title: t("quotes.error"),
        description: t("quotes.unableToCancel", "Unable to cancel quote"),
        variant: "destructive"
      });
    },
  });

  // Mutation pour accepter une cotation
  const acceptQuoteMutation = useMutation({
    mutationFn: async (quoteId: number) => {
      const response = await apiRequest("PATCH", `/api/quotes/${quoteId}`, { status: "accepted" });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quote-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({ 
        title: t("quotes.quoteAccepted", "Quote accepted successfully"),
        description: data.shipment ? t("quotes.shipmentCreated", "Shipment created: {{trackingNumber}}", { trackingNumber: data.shipment.trackingNumber }) : undefined
      });
    },
    onError: () => {
      toast({ 
        title: t("quotes.error"),
        description: t("quotes.unableToAccept", "Unable to accept quote"),
        variant: "destructive"
      });
    },
  });

  // Mutation pour refuser une cotation
  const rejectQuoteMutation = useMutation({
    mutationFn: async (quoteId: number) => {
      const response = await apiRequest("PATCH", `/api/quotes/${quoteId}`, { status: "rejected" });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quote-requests"] });
      toast({ title: t("quotes.quoteRejected", "Quote rejected") });
    },
    onError: () => {
      toast({ 
        title: t("quotes.error"),
        description: t("quotes.unableToReject", "Unable to reject quote"),
        variant: "destructive"
      });
    },
  });

  // Mutation pour modifier une cotation
  const updateQuoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PATCH", `/api/quote-requests/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quote-requests"] });
      setIsEditOpen(false);
      setEditingQuote(null);
      toast({ title: t("quotes.quoteModified", "Quote modified successfully") });
    },
    onError: () => {
      toast({ 
        title: t("quotes.error"),
        description: t("quotes.unableToModify", "Unable to modify quote"),
        variant: "destructive"
      });
    },
  });

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const quoteData = {
      ...newQuote,
      weight: newQuote.weight,
      volume: newQuote.volume,
      requestedDate: newQuote.requestedDate
    };
    createQuoteMutation.mutate(quoteData);
  };

  const handleViewDetails = (quote: any) => {
    setSelectedQuote(quote);
    setIsDetailsOpen(true);
  };

  const handleEditQuote = (quote: any) => {
    setEditingQuote({
      ...quote,
      requestedDate: new Date(quote.requestedDate).toISOString().split('T')[0]
    });
    setIsEditOpen(true);
  };

  const handleDeleteQuote = (quoteId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette cotation ?')) {
      deleteQuoteMutation.mutate(quoteId);
    }
  };

  const handleUpdateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuote) {
      updateQuoteMutation.mutate({
        id: editingQuote.id,
        data: {
          origin: editingQuote.origin,
          destination: editingQuote.destination,
          goodsType: editingQuote.goodsType,
          weight: editingQuote.weight,
          volume: editingQuote.volume,
          requestedDate: editingQuote.requestedDate,
          description: editingQuote.description
        }
      });
    }
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
        return t("airTransport", "Air");
      case "mer":
      case "maritime":
        return t("seaTransport", "Sea");
      case "terre":
      case "routier":
      default:
        return t("roadTransport", "Road");
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
        return t("quotes.status.quoted", "Quoted");
      case "pending":
        return t("quotes.status.pending", "Pending");
      case "rejected":
        return t("quotes.status.rejected", "Rejected");
      default:
        return status;
    }
  };

  const filteredQuotes = (quoteRequests as any[] || []).filter((quote: any) => {
    const transportModeMatch = selectedTransportMode === "all" || 
      quote.transportMode?.toLowerCase() === selectedTransportMode;
    const statusMatch = filterStatus === "all" || quote.status === filterStatus;
    return transportModeMatch && statusMatch;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Header 
          title={t("quotesPageTitle", "Quote Requests")} 
          subtitle={t("quotesPageSubtitle", "Manage your quote requests and track responses")}
        />
        
        <Dialog open={isNewQuoteOpen} onOpenChange={setIsNewQuoteOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {t("quotesNewQuoteRequest", "New Quote Request")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("quotesCreateNewRequest", "Create New Quote Request")}</DialogTitle>
              <DialogDescription>
                {t("quotesRequestDetails", "Request Details")}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateQuote} className="space-y-6">
              <Tabs defaultValue="terre" onValueChange={(value) => setNewQuote({...newQuote, transportMode: value})}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="terre" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("quotesLand", "Land")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="mer" className="flex items-center gap-2">
                    <Ship className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("quotesSea", "Sea")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="air" className="flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("quotesAir", "Air")}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="terre" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="origin">{t("quotesOrigin", "Origin")} *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="origin"
                          placeholder={t("quotes.searchPlaceholder", "Type to search...")}
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
                      <Label htmlFor="destination">{t("quotesDestination", "Destination")} *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="destination"
                          placeholder={t("quotes.searchPlaceholder", "Type to search...")}
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
                      <Label htmlFor="origin-port">{t("quotesOrigin", "Origin")} *</Label>
                      <div className="relative">
                        <Ship className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="origin-port"
                          placeholder={t("quotes.searchPlaceholder", "Type to search...")}
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
                      <Label htmlFor="destination-port">{t("quotesDestination", "Destination")} *</Label>
                      <div className="relative">
                        <Ship className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="destination-port"
                          placeholder={t("quotes.searchPlaceholder", "Type to search...")}
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
                      <Label htmlFor="origin-airport">{t("quotesOrigin", "Origin")} *</Label>
                      <div className="relative">
                        <Plane className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="origin-airport"
                          placeholder={t("quotes.searchPlaceholder", "Type to search...")}
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
                      <Label htmlFor="destination-airport">{t("quotesDestination", "Destination")} *</Label>
                      <div className="relative">
                        <Plane className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="destination-airport"
                          placeholder={t("quotes.searchPlaceholder", "Type to search...")}
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
                  <Label htmlFor="weight">{t("quotesWeight", "Weight (kg)")} *</Label>
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
                  <Label htmlFor="volume">{t("quotesVolume", "Volume (m³)")}</Label>
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
                  <Label htmlFor="requested-date">{t("quotesRequestedDate", "Requested Date")} *</Label>
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
                <Label htmlFor="goods-type">{t("quotesGoodsType", "Goods Type")} *</Label>
                <Select value={newQuote.goodsType} onValueChange={(value) => setNewQuote({...newQuote, goodsType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("quotesSelectType", "Select type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">{t("quotesElectronics", "Electronics")}</SelectItem>
                    <SelectItem value="Furniture">{t("quotesFurniture", "Furniture")}</SelectItem>
                    <SelectItem value="Automotive">{t("quotesAutomotive", "Automotive")}</SelectItem>
                    <SelectItem value="Food">{t("quotesFood", "Food")}</SelectItem>
                    <SelectItem value="Chemicals">{t("quotesChemicals", "Chemicals")}</SelectItem>
                    <SelectItem value="Textiles">{t("quotesTextiles", "Textiles")}</SelectItem>
                    <SelectItem value="Industrial">{t("quotesIndustrial", "Industrial")}</SelectItem>
                    <SelectItem value="General">{t("quotesGeneral", "General")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">{t("quotesDescription", "Description")}</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[80px] p-3 border rounded-md resize-none"
                  placeholder={t("quotesDescriptionPlaceholder", "Describe your shipment, special constraints, etc.")}
                  value={newQuote.description}
                  onChange={(e) => setNewQuote({...newQuote, description: e.target.value})}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsNewQuoteOpen(false)} className="w-full sm:w-auto">
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button type="submit" disabled={createQuoteMutation.isPending} className="w-full sm:w-auto">
                  {createQuoteMutation.isPending ? t("quotesCreating", "Creating...") : t("quotesCreateRequest", "Create Request")}
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
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("quotesFilters", "Filters")}:</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedTransportMode} onValueChange={setSelectedTransportMode}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("quotes.filters.allModes", "All modes")}</SelectItem>
              <SelectItem value="terre">{t("quotes.filters.road", "Road")}</SelectItem>
              <SelectItem value="mer">{t("quotes.filters.maritime", "Maritime")}</SelectItem>
              <SelectItem value="air">{t("quotes.filters.air", "Air")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("quotes.filters.allStatuses", "All statuses")}</SelectItem>
              <SelectItem value="pending">{t("quotes.status.pending", "Pending")}</SelectItem>
              <SelectItem value="quoted">{t("quotes.status.quoted", "Quoted")}</SelectItem>
              <SelectItem value="rejected">{t("quotes.status.rejected", "Rejected")}</SelectItem>
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
                {t("quotes.noQuotesFound", "No quotes found")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("quotes.createFirstQuote", "Create your first quote request to get started")}
              </p>
              <Button onClick={() => setIsNewQuoteOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("quotes.newQuote", "New Quote")}
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
{t("quotes.receivedOffers", "Received offers")} ({quote.quotes.length})
                    </h4>
                    <div className="space-y-3">
                      {quote.quotes.map((offer: any) => (
                        <div key={offer.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{offer.carrier?.name}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span>{t("quotes.deliveryTime", "Delivery time")}: {offer.estimatedDays} {t("quotes.days", "days")}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>{t("quotes.validUntil", "Valid until")} {new Date(offer.validUntil).toLocaleDateString('fr-FR')}</span>
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
                                {offer.status === "pending" ? t("quotes.status.pending", "Pending") : 
                                 offer.status === "accepted" ? t("quotes.status.accepted", "Accepted") : offer.status}
                              </div>
                            </div>
                            {offer.status === "pending" && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => rejectQuoteMutation.mutate(offer.id)}
                                  disabled={rejectQuoteMutation.isPending}
                                >
                                  {rejectQuoteMutation.isPending ? "..." : t("quotes.reject", "Reject")}
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => acceptQuoteMutation.mutate(offer.id)}
                                  disabled={acceptQuoteMutation.isPending}
                                >
                                  {acceptQuoteMutation.isPending ? "..." : t("quotes.accept", "Accept")}
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto"
                    onClick={() => handleViewDetails(quote)}
                  >
{t("quotes.viewDetails", "View Details")}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto"
                    onClick={() => handleEditQuote(quote)}
                  >
{t("quotes.modify", "Modify")}
                  </Button>
                  {quote.status === "pending" && !quote.quotes?.length && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                      onClick={() => generateQuotesMutation.mutate(quote.id)}
                      disabled={generateQuotesMutation.isPending}
                    >
                      {generateQuotesMutation.isPending ? t("quotes.generating", "Generating...") : t("quotes.generateQuotes", "Generate Quotes")}
                    </Button>
                  )}
                  {quote.status === "pending" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteQuote(quote.id)}
                      disabled={deleteQuoteMutation.isPending}
                    >
                      {deleteQuoteMutation.isPending ? t("quotes.canceling", "Canceling...") : t("quotes.cancel", "Cancel")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal détails */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("quotes.quoteDetails", "Quote Details")}</DialogTitle>
            <DialogDescription>
              {t("quotes.completeInformation", "Complete information about your quote request")}
            </DialogDescription>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{t("quotes.reference", "Reference")}</Label>
                  <p className="text-sm text-gray-600">{selectedQuote.reference}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("quotes.status.title", "Status")}</Label>
                  <p className="text-sm text-gray-600">
                    {getStatusLabel(selectedQuote.status)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{t("quotes.origin", "Origin")}</Label>
                  <p className="text-sm text-gray-600">{selectedQuote.origin}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("quotes.destination", "Destination")}</Label>
                  <p className="text-sm text-gray-600">{selectedQuote.destination}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">{t("quotes.goodsType", "Goods Type")}</Label>
                  <p className="text-sm text-gray-600">{selectedQuote.goodsType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("quotes.weight", "Weight")}</Label>
                  <p className="text-sm text-gray-600">{selectedQuote.weight} kg</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("quotes.volume", "Volume")}</Label>
                  <p className="text-sm text-gray-600">{selectedQuote.volume} m³</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">{t("quotes.requestedDate", "Requested Date")}</Label>
                <p className="text-sm text-gray-600">
                  {new Date(selectedQuote.requestedDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {selectedQuote.description && (
                <div>
                  <Label className="text-sm font-medium">{t("quotes.description", "Description")}</Label>
                  <p className="text-sm text-gray-600">{selectedQuote.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal édition */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("quotes.modifyQuote", "Modify Quote")}</DialogTitle>
            <DialogDescription>
              {t("quotes.modifyDetails", "Modify the details of your quote request")}
            </DialogDescription>
          </DialogHeader>
          {editingQuote && (
            <form onSubmit={handleUpdateQuote} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-origin">{t("quotes.origin", "Origin")}</Label>
                  <Input
                    id="edit-origin"
                    value={editingQuote.origin}
                    onChange={(e) => setEditingQuote({...editingQuote, origin: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-destination">{t("quotes.destination", "Destination")}</Label>
                  <Input
                    id="edit-destination"
                    value={editingQuote.destination}
                    onChange={(e) => setEditingQuote({...editingQuote, destination: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-goods">{t("quotes.goodsType", "Goods Type")}</Label>
                  <Select 
                    value={editingQuote.goodsType} 
                    onValueChange={(value) => setEditingQuote({...editingQuote, goodsType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electronics">{t("quotesElectronics", "Electronics")}</SelectItem>
                      <SelectItem value="Furniture">{t("quotesFurniture", "Furniture")}</SelectItem>
                      <SelectItem value="Automotive">{t("quotesAutomotive", "Automotive")}</SelectItem>
                      <SelectItem value="Food">{t("quotesFood", "Food")}</SelectItem>
                      <SelectItem value="Chemicals">{t("quotesChemicals", "Chemicals")}</SelectItem>
                      <SelectItem value="Textiles">{t("quotesTextiles", "Textiles")}</SelectItem>
                      <SelectItem value="General">{t("quotesGeneral", "General")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-weight">{t("quotes.weight", "Weight")} (kg)</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    value={editingQuote.weight}
                    onChange={(e) => setEditingQuote({...editingQuote, weight: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-volume">{t("quotes.volume", "Volume")} (m³)</Label>
                  <Input
                    id="edit-volume"
                    type="number"
                    step="0.1"
                    value={editingQuote.volume}
                    onChange={(e) => setEditingQuote({...editingQuote, volume: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-date">{t("quotes.requestedDate", "Requested Date")}</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingQuote.requestedDate}
                  onChange={(e) => setEditingQuote({...editingQuote, requestedDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">{t("quotes.description", "Description")}</Label>
                <Textarea
                  id="edit-description"
                  value={editingQuote.description || ''}
                  onChange={(e) => setEditingQuote({...editingQuote, description: e.target.value})}
                  placeholder={t("quotesDescriptionPlaceholder", "Describe your shipment, special constraints, etc.")}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button type="submit" disabled={updateQuoteMutation.isPending}>
                  {updateQuoteMutation.isPending ? t("quotes.modifying", "Modifying...") : t("quotes.modify", "Modify")}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

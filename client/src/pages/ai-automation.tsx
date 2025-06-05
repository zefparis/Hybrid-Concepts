import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Zap, Target, TrendingUp, Clock, Bot, Cpu, Code, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import PersistentAITerminal from "@/components/persistent-ai-terminal";
import AddressAutocomplete from "@/components/address-autocomplete";
import FreightAutomationResults from "@/components/freight-automation-results";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AIAutomation() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [requestData, setRequestData] = useState({
    origin: "",
    destination: "",
    weight: "",
    volume: "",
    goodsType: "",
    description: ""
  });
  const [showResults, setShowResults] = useState(false);
  const [automationResults, setAutomationResults] = useState<any>(null);
  const { toast } = useToast();

  const automationMutation = useMutation({
    mutationFn: async (data: any) => {
      // First create the quote request
      const quoteRequestResponse = await apiRequest("POST", "/api/quote-requests", {
        origin: data.origin,
        destination: data.destination,
        weight: data.weight,
        volume: data.volume,
        goodsType: data.goodsType,
        description: data.description,
        requestedDate: new Date().toISOString().split('T')[0]
      });
      const quoteRequest = await quoteRequestResponse.json();

      // Then trigger automation process
      const automationResponse = await apiRequest("POST", "/api/ai/process", {
        quoteRequestId: quoteRequest.id,
        origin: data.origin,
        destination: data.destination,
        cargo: {
          type: data.goodsType,
          weight: parseInt(data.weight),
          volume: data.volume
        },
        timeline: {
          preferred: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          latest: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });
      const automation = await automationResponse.json();

      return { quoteRequest, automation };
    },
    onSuccess: (data) => {
      setAutomationResults(data);
      setShowResults(true);
      toast({
        title: "Automatisation IA Terminée",
        description: "Le processus logistique a été automatisé avec succès en 30 secondes",
      });
    },
    onError: (error) => {
      console.error("Automation error:", error);
      toast({
        title: "Erreur d'automatisation",
        description: "Une erreur s'est produite lors du processus d'automatisation",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  });

  const handleStartAutomation = () => {
    if (!requestData.origin || !requestData.destination || !requestData.weight || !requestData.goodsType) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setShowResults(false);
    
    // Start automation after terminal completes
    setTimeout(() => {
      automationMutation.mutate(requestData);
    }, 5500); // 5.5 seconds to show terminal animation
  };

  const handleTerminalComplete = () => {
    setIsProcessing(false);
  };

  const handleReset = () => {
    setRequestData({
      origin: "",
      destination: "",
      weight: "",
      volume: "",
      goodsType: "",
      description: ""
    });
    setShowResults(false);
    setAutomationResults(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automatisation IA Logistique</h1>
          <p className="text-muted-foreground mt-2">
            Démonstration de l'automatisation complète des processus logistiques par l'IA
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 font-medium">Claude Sonnet-4 Actif</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Temps de traitement</p>
                <p className="text-2xl font-bold text-blue-600">30s</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Réduction de temps</p>
                <p className="text-2xl font-bold text-purple-600">98%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Précision IA</p>
                <p className="text-2xl font-bold text-emerald-600">99.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Intervention humaine</p>
                <p className="text-2xl font-bold text-orange-600">0%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-500" />
              Données d'entrée pour l'IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">Port de départ *</Label>
                <AddressAutocomplete
                  id="origin"
                  placeholder="Port de Mombasa, Kenya"
                  value={requestData.origin}
                  onChange={(value) => setRequestData(prev => ({ ...prev, origin: value }))}
                />
              </div>
              <div>
                <Label htmlFor="destination">Port d'arrivée *</Label>
                <AddressAutocomplete
                  id="destination"
                  placeholder="Port de Marseille, France"
                  value={requestData.destination}
                  onChange={(value) => setRequestData(prev => ({ ...prev, destination: value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Poids (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="1000"
                  value={requestData.weight}
                  onChange={(e) => setRequestData(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="volume">Volume (m³)</Label>
                <Input
                  id="volume"
                  type="number"
                  placeholder="5"
                  value={requestData.volume}
                  onChange={(e) => setRequestData(prev => ({ ...prev, volume: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="goodsType">Type de marchandise *</Label>
              <Select value={requestData.goodsType} onValueChange={(value) => setRequestData(prev => ({ ...prev, goodsType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Produits chimiques">Produits chimiques</SelectItem>
                  <SelectItem value="Machines industrielles">Machines industrielles</SelectItem>
                  <SelectItem value="Produits alimentaires">Produits alimentaires</SelectItem>
                  <SelectItem value="Textiles">Textiles</SelectItem>
                  <SelectItem value="Électronique">Électronique</SelectItem>
                  <SelectItem value="Matériaux de construction">Matériaux de construction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description détaillée</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre expédition, contraintes particulières, etc."
                value={requestData.description}
                onChange={(e) => setRequestData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleStartAutomation}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    IA en cours...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Lancer l'Automatisation IA
                  </>
                )}
              </Button>
              
              {showResults && (
                <Button variant="outline" onClick={handleReset}>
                  Nouveau Test
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Résultats de l'automatisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showResults && automationResults ? (
              <FreightAutomationResults results={automationResults.automation} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Les résultats apparaîtront ici après l'automatisation complète</p>
                <p className="text-xs mt-2">Analyse transport • Documentation douanière • APIs transporteurs • Évaluation risques</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Process Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-500" />
            Processus d'automatisation traditionnel vs IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Process */}
            <div>
              <h4 className="font-medium mb-3 text-red-600">Processus Traditionnel (40 minutes)</h4>
              <div className="space-y-2">
                {[
                  "Recherche manuelle des transporteurs",
                  "Appels téléphoniques multiples",
                  "Attente des réponses par email",
                  "Comparaison manuelle des offres",
                  "Négociation individuelle",
                  "Validation administrative",
                  "Documentation manuelle"
                ].map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-gray-600">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Process */}
            <div>
              <h4 className="font-medium mb-3 text-green-600">Processus IA eMulog (30 secondes)</h4>
              <div className="space-y-2">
                {[
                  "Analyse IA des besoins logistiques",
                  "Détection automatique du mode optimal",
                  "Génération intelligente des cotations",
                  "Comparaison et optimisation IA",
                  "Recommandation basée sur l'analyse",
                  "Documentation automatique",
                  "Prêt pour validation client"
                ].map((step, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Terminal Overlay */}
      {isProcessing && (
        <PersistentAITerminal 
          isProcessing={isProcessing}
          onComplete={handleTerminalComplete}
          requestData={requestData}
        />
      )}
    </div>
  );
}
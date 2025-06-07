import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        title: t("aiAutomationCompleted", "AI Automation Completed"),
        description: t("logisticsProcessAutomated", "The logistics process has been successfully automated in 30 seconds"),
      });
    },
    onError: (error) => {
      console.error("Automation error:", error);
      toast({
        title: t("automationError", "Automation error"),
        description: t("automationErrorOccurred", "An error occurred during the automation process"),
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  });

  const handleStartAutomation = () => {
    if (!requestData.origin || !requestData.destination || !requestData.weight || !requestData.goodsType) {
      toast({
        title: t("missingData", "Missing data"),
        description: t("fillAllRequiredFields", "Please fill in all required fields"),
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t("autoFullLogisticsTitle", "Complete AI Logistics Automation")}</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {t("autoTransformLogisticsDesc", "Transform your logistics operations with the most advanced AI on the market. From automatic quoting to real-time tracking, optimize every step.")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 font-medium">{t("autoClaudeActiveStatus", "Claude Sonnet-4 Active")}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{t("autoProcessingTimeMetric", "Processing time")}</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">30s</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{t("autoTimeReductionMetric", "Time reduction")}</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">98%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{t("autoAiAccuracyMetric", "AI Accuracy")}</p>
                <p className="text-lg sm:text-2xl font-bold text-emerald-600">99.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{t("autoHumanInterventionMetric", "Human Intervention")}</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">0%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Input Form */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Bot className="w-5 h-5 text-blue-500" />
              {t("autoAiPlatformTitle", "AI Automation Platform")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">{t("autoOriginFieldLabel", "Origin")} *</Label>
                <AddressAutocomplete
                  id="origin"
                  placeholder="Port de Mombasa, Kenya"
                  value={requestData.origin}
                  onChange={(value) => setRequestData(prev => ({ ...prev, origin: value }))}
                />
              </div>
              <div>
                <Label htmlFor="destination">{t("autoDestinationFieldLabel", "Destination")} *</Label>
                <AddressAutocomplete
                  id="destination"
                  placeholder="Port de Marseille, France"
                  value={requestData.destination}
                  onChange={(value) => setRequestData(prev => ({ ...prev, destination: value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">{t("autoCargoWeightLabel", "Cargo weight (kg)")} *</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="1000"
                  value={requestData.weight}
                  onChange={(e) => setRequestData(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="volume">{t("autoCargoVolumeLabel", "Volume (m³) - Optional")}</Label>
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
              <Label htmlFor="goodsType">{t("autoGoodsTypeFieldLabel", "Goods type")} *</Label>
              <Select value={requestData.goodsType} onValueChange={(value) => setRequestData(prev => ({ ...prev, goodsType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("autoSelectTypeOption", "Select type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t("autoGeneralGoodsOption", "General")}</SelectItem>
                  <SelectItem value="fragile">{t("autoFragileGoodsOption", "Fragile")}</SelectItem>
                  <SelectItem value="dangerous">{t("autoDangerousGoodsOption", "Dangerous")}</SelectItem>
                  <SelectItem value="perishable">{t("autoPerishableGoodsOption", "Perishable")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">{t("autoCargoDescriptionLabel", "Cargo description")}</Label>
              <Textarea
                id="description"
                placeholder={t("autoDescribeShipmentPlaceholder", "Describe your shipment, special constraints, etc.")}
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
                    {t("autoAiProcessingStatus", "AI processing in progress...")}
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    {t("autoStartAIAutomationButton", "Start AI Automation")}
                  </>
                )}
              </Button>
              
              {showResults && (
                <Button variant="outline" onClick={handleReset}>
                  {t("autoNewTestButton", "New Test")}
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
              {t("autoAutomationResultsTitle", "Automation Results")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showResults && automationResults ? (
              <FreightAutomationResults results={automationResults.automation} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t("autoResultsWillAppearMessage", "Results will appear here after complete automation")}</p>
                <p className="text-xs mt-2">{t("autoAnalysisFeaturesText", "Transport analysis • Customs documentation • Carrier APIs • Risk assessment")}</p>
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
            {t("autoTraditionalVsAiTitle", "Traditional vs AI Automation Process")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Process */}
            <div>
              <h4 className="font-medium mb-3 text-red-600">{t("autoTraditionalProcessTitle", "Traditional Process (40 minutes)")}</h4>
              <div className="space-y-2">
                {[
                  t("autoManualCarrierSearchStep", "Manual carrier search"),
                  t("autoMultiplePhoneCallsStep", "Multiple phone calls"),
                  t("autoWaitingEmailResponsesStep", "Waiting for email responses"),
                  t("autoManualOfferComparisonStep", "Manual offer comparison"),
                  t("autoIndividualNegotiationStep", "Individual negotiation"),
                  t("autoAdministrativeValidationStep", "Administrative validation"),
                  t("autoManualDocumentationStep", "Manual documentation")
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
              <h4 className="font-medium mb-3 text-green-600">{t("autoAiProcessTitle", "eMulog AI Process (30 seconds)")}</h4>
              <div className="space-y-2">
                {[
                  t("autoAiLogisticsAnalysisStep", "AI logistics needs analysis"),
                  t("autoAutomaticModeDetectionStep", "Automatic optimal mode detection"),
                  t("intelligentQuoteGeneration", "Intelligent quote generation"),
                  t("autoAiComparisonOptimizationStep", "AI comparison and optimization"),
                  t("autoAnalysisBasedRecommendationStep", "Analysis-based recommendation"),
                  t("autoAutomaticDocumentationStep", "Automatic documentation"),
                  t("autoReadyForClientValidationStep", "Ready for client validation")
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
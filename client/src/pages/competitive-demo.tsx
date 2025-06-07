import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Zap, Target, DollarSign, Clock, Brain, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompetitorAnalysis {
  companyName: string;
  currentState: {
    efficiency: string;
    responseTime: string;
    costPerQuote: string;
    accuracy: string;
  };
  withEmulogAI: {
    efficiency: string;
    responseTime: string;
    costPerQuote: string;
    accuracy: string;
    roiProjection: string;
  };
  transformationPlan: any;
  competitiveAdvantage: any;
  summary: string;
}

export default function CompetitiveDemo() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [companyData, setCompanyData] = useState({
    companyName: "TransFreight Europe SARL",
    responseTime: 14,
    accuracy: 68,
    costPerQuote: 85,
    scalability: 15
  });
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeCompetitor = async () => {
    setLoading(true);
    try {
      const response = await fetch("/public-api/demo/competitive-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyData: {
            companyName: companyData.companyName,
            quotingProcess: {
              averageResponseTime: companyData.responseTime,
              priceAccuracy: companyData.accuracy
            },
            operationalMetrics: {
              processingCost: companyData.costPerQuote,
              scalabilityLimit: companyData.scalability
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(t("analysisError", "Analysis Error"));
      }

      const result = await response.json();
      if (result.success) {
        setAnalysis(result.data);
        toast({
          title: t("aiAnalysisComplete", "AI Analysis Complete"),
          description: t("optimizationReportGenerated", "Optimization report generated successfully"),
        });
      }
    } catch (error) {
      toast({
        title: t("error", "Error"),
        description: t("unableToGenerateAnalysis", "Unable to generate analysis"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold">{t("aiCompetitiveAnalysis", "AI Competitive Analysis")}</h1>
        </div>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          {t("discoverEmulogTransformation", "Discover how eMulog can transform your traditional freight company with our logistics optimization AI. No access to sensitive data - analysis based solely on operational metrics.")}
        </p>
        <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-blue-100">
          {t("interactiveDemoPoweredBy", "Interactive Demo - Powered by Claude Sonnet-4")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              {t("yourCompanyData", "Your Company Data")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("enterCurrentMetrics", "Enter your current metrics for personalized analysis")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">{t("companyName", "Company Name")}</Label>
              <Input
                id="companyName"
                value={companyData.companyName}
                onChange={(e) => setCompanyData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Ex: TransFreight Europe SARL"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responseTime">{t("averageResponseTime", "Average Response Time (hours)")}</Label>
                <Input
                  id="responseTime"
                  type="number"
                  value={companyData.responseTime}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, responseTime: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="accuracy">{t("priceAccuracy", "Price Accuracy (%)")}</Label>
                <Input
                  id="accuracy"
                  type="number"
                  value={companyData.accuracy}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, accuracy: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costPerQuote">{t("costPerQuote", "Cost per Quote (€)")}</Label>
                <Input
                  id="costPerQuote"
                  type="number"
                  value={companyData.costPerQuote}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, costPerQuote: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="scalability">{t("maxQuotesPerDay", "Max Quotes/Day")}</Label>
                <Input
                  id="scalability"
                  type="number"
                  value={companyData.scalability}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, scalability: Number(e.target.value) }))}
                />
              </div>
            </div>

            <Button 
              onClick={analyzeCompetitor} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t("aiAnalysisInProgress", "AI Analysis in Progress...")}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  {t("analyzeWithEmulogAI", "Analyze with eMulog AI")}
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Comparison Results */}
        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Analyse Comparative
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {analysis.companyName} - État actuel vs. Optimisation eMulog IA
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Efficiency Comparison */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Efficacité Globale</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-red-600">
                      Actuel: {analysis.currentState.efficiency}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <Badge variant="outline" className="text-green-600">
                      eMulog: {analysis.withEmulogAI.efficiency}
                    </Badge>
                  </div>
                </div>
                <Progress value={95} className="h-2" />
              </div>

              {/* Speed Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg bg-red-50">
                  <Clock className="w-6 h-6 mx-auto text-red-600 mb-2" />
                  <div className="text-2xl font-bold text-red-600">{analysis.currentState.responseTime}</div>
                  <div className="text-sm text-muted-foreground">Temps actuel</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <Zap className="w-6 h-6 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">{analysis.withEmulogAI.responseTime}</div>
                  <div className="text-sm text-muted-foreground">Avec eMulog IA</div>
                </div>
              </div>

              {/* Cost Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg bg-orange-50">
                  <DollarSign className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{analysis.currentState.costPerQuote}</div>
                  <div className="text-sm text-muted-foreground">Coût actuel</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <TrendingDown className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{analysis.withEmulogAI.costPerQuote}</div>
                  <div className="text-sm text-muted-foreground">Avec eMulog IA</div>
                </div>
              </div>

              {/* ROI Projection */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {analysis.withEmulogAI.roiProjection}
                  </div>
                  <div className="text-sm font-medium text-purple-700">Retour sur Investissement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Analysis */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transformation Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Plan de Transformation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Phase 1 (2 mois)</h4>
                  <ul className="text-sm space-y-1">
                    {analysis.transformationPlan.phase1.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-600 mb-2">Phase 2 (2 mois)</h4>
                  <ul className="text-sm space-y-1">
                    {analysis.transformationPlan.phase2.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-purple-600 mb-2">Phase 3 (2 mois)</h4>
                  <ul className="text-sm space-y-1">
                    {analysis.transformationPlan.phase3.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Advantage */}
          <Card>
            <CardHeader>
              <CardTitle>Avantages Concurrentiels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Différentiation Marché</h4>
                  <ul className="text-sm space-y-2">
                    {analysis.competitiveAdvantage.marketDifferentiation.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Proposition de Valeur Client</h4>
                  <ul className="text-sm space-y-2">
                    {analysis.competitiveAdvantage.clientValueProposition.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary */}
      {analysis && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-purple-800">Résumé Exécutif</h3>
              <p className="text-purple-700 text-lg leading-relaxed">
                {analysis.summary}
              </p>
              <div className="mt-6">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Demander une démonstration complète
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
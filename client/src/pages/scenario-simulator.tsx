import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Checkbox } from "@/components/ui/checkbox";
import { 
  PlayCircle, 
  Target, 
  TrendingUp, 
  BarChart3,
  Zap, 
  Shield,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Star,
  Trophy,
  Lightbulb,
  Gauge
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScenarioSimulation {
  scenarioId: string;
  scenarioName: string;
  description: string;
  baselineMetrics: any;
  simulationResults: any[];
  recommendations: any[];
  riskAnalysis: any[];
  implementationPlan: any;
  businessImpact: any;
  competitiveAnalysis: any;
}

export default function ScenarioSimulator() {
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState("");
  const [quotingTime, setQuotingTime] = useState(14);
  const [processingCost, setProcessingCost] = useState(70);
  const [errorRate, setErrorRate] = useState(18);
  const [clientSatisfaction, setClientSatisfaction] = useState(68);
  const [monthlyVolume, setMonthlyVolume] = useState(120);
  const [averageOrderValue, setAverageOrderValue] = useState(28000);
  const [targetGrowth, setTargetGrowth] = useState(25);
  const [budgetConstraint, setBudgetConstraint] = useState(200000);
  
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['Conservative', 'Balanced', 'Aggressive']);
  const [simulations, setSimulations] = useState<ScenarioSimulation[]>([]);
  const [comparison, setComparison] = useState<any>(null);

  const scenarioOptions = [
    { 
      id: 'Conservative', 
      name: t("conservativeTransformation", "Conservative Transformation"), 
      description: t("gradualApproachMinimizedRisks", "Gradual approach with minimized risks"),
      color: 'bg-blue-100 text-blue-800'
    },
    { 
      id: 'Balanced', 
      name: t("balancedTransformation", "Balanced Transformation"), 
      description: t("optimalRiskBenefitBalance", "Optimal risk/benefit balance"),
      color: 'bg-green-100 text-green-800'
    },
    { 
      id: 'Aggressive', 
      name: t("acceleratedTransformation", "Accelerated Transformation"), 
      description: t("maximumInnovationCompleteAutomation", "Maximum innovation and complete automation"),
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  const generateSimulations = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/public-api/demo/scenarios', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setSimulations(data.data.simulations);
      setComparison(data.data.comparison);
    }
  });

  const handleGenerateSimulations = () => {
    generateSimulations.mutate({
      companyData: {
        companyName: companyName || t("scenarioYourCompany", "Your Company"),
        quotingTime,
        processingCost,
        errorRate,
        clientSatisfaction,
        monthlyVolume,
        averageOrderValue,
        targetGrowth,
        budgetConstraint
      },
      scenarioTypes: selectedScenarios
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getScenarioColor = (scenarioName: string) => {
    if (scenarioName.includes('Prudente')) return 'text-blue-600';
    if (scenarioName.includes('Équilibrée')) return 'text-green-600';
    if (scenarioName.includes('Accélérée')) return 'text-purple-600';
    return 'text-gray-600';
  };

  const getRiskColor = (probability: number, impact: number) => {
    const riskScore = probability * impact;
    if (riskScore > 60) return 'text-red-600 bg-red-50';
    if (riskScore > 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-blue-900 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900 px-3 sm:px-4 py-2 rounded-full">
            <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm sm:text-base text-green-800 dark:text-green-200 font-medium">{t("scenarioAiSimulation", "AI Scenario Simulation")}</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white px-2">
            {t("scenarioTestVirtuallyStrategies", "Test Virtually Your AI Strategies")}
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
            {t("scenarioSimulateTransformationScenarios", "Simulate different AI transformation scenarios and compare their impacts before implementation. Optimize your strategy with accurate data and realistic projections.")}
          </p>
        </div>

        {/* Configuration Form */}
        <Card className="mx-2 sm:mx-auto max-w-4xl">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Target className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>{t("scenarioSimulationConfig", "Simulation Configuration")}</span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {t("scenarioDefineCompanyParameters", "Define your company parameters to generate personalized simulations")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">{t("companyInfo", "Company Information")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{t("companyName", "Company Name")}</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t("scenarioCompanyNamePlaceholder", "Ex: InnoLogistics Corp")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetGrowth">{t("scenarioTargetGrowthPercentage", "Target Growth (%)")}</Label>
                  <Input
                    id="targetGrowth"
                    type="number"
                    value={targetGrowth}
                    onChange={(e) => setTargetGrowth(Number(e.target.value))}
                    min="5"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* Current Metrics */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">{t("currentMetrics", "Current Metrics")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quotingTime">{t("quotingTimeHoursField", "Quoting Time (hours)")}</Label>
                  <Input
                    id="quotingTime"
                    type="number"
                    value={quotingTime}
                    onChange={(e) => setQuotingTime(Number(e.target.value))}
                    min="1"
                    max="48"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processingCost">{t("costPerQuoteField", "Cost per Quote (€)")}</Label>
                  <Input
                    id="processingCost"
                    type="number"
                    value={processingCost}
                    onChange={(e) => setProcessingCost(Number(e.target.value))}
                    min="10"
                    max="200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="errorRate">{t("errorRate", "Error Rate (%)")}</Label>
                  <Input
                    id="errorRate"
                    type="number"
                    value={errorRate}
                    onChange={(e) => setErrorRate(Number(e.target.value))}
                    min="0"
                    max="50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientSatisfaction">{t("clientSatisfaction", "Client Satisfaction (%)")}</Label>
                  <Input
                    id="clientSatisfaction"
                    type="number"
                    value={clientSatisfaction}
                    onChange={(e) => setClientSatisfaction(Number(e.target.value))}
                    min="30"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyVolume">{t("monthlyVolumeField", "Monthly Volume")}</Label>
                  <Input
                    id="monthlyVolume"
                    type="number"
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                    min="10"
                    max="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetConstraint">{t("budgetAvailableField", "Available Budget (€)")}</Label>
                  <Input
                    id="budgetConstraint"
                    type="number"
                    value={budgetConstraint}
                    onChange={(e) => setBudgetConstraint(Number(e.target.value))}
                    min="50000"
                    max="1000000"
                  />
                </div>
              </div>
            </div>

            {/* Scenario Selection */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">{t("scenariosToSimulateField", "Scenarios to Simulate")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarioOptions.map((scenario) => (
                  <div key={scenario.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <input
                      type="checkbox"
                      id={scenario.id}
                      checked={selectedScenarios.includes(scenario.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedScenarios([...selectedScenarios, scenario.id]);
                        } else {
                          setSelectedScenarios(selectedScenarios.filter(s => s !== scenario.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <Label htmlFor={scenario.id} className="font-medium cursor-pointer">
                        {scenario.name}
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {scenario.description}
                      </p>
                      <Badge className={`mt-2 ${scenario.color}`}>
                        {scenario.id}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleGenerateSimulations}
              disabled={generateSimulations.isPending || selectedScenarios.length === 0}
              className="w-full text-sm sm:text-base"
              size="lg"
            >
              {generateSimulations.isPending ? (
                <>
                  <PlayCircle className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">{t("scenarioSimulationInProgress", "Simulation in progress...")}</span>
                  <span className="sm:hidden">{t("scenarioSimulationShort", "Simulation...")}</span>
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{t("scenarioLaunchAiSimulations", "Launch AI Simulations")}</span>
                  <span className="sm:hidden">{t("scenarioLaunchShort", "Launch")} ({selectedScenarios.length})</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Simulation Results */}
        {simulations.length > 0 && (
          <div className="space-y-8">
            {/* Scenario Comparison Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>{t("scenarioComparison", "Scenario Comparison")}</span>
                </CardTitle>
                <CardDescription>
                  {t("scenarioComparativeOverview", "Comparative overview of {count} simulated scenarios").replace("{count}", simulations.length.toString())}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {simulations.map((simulation, idx) => (
                    <div key={idx} className="p-4 border rounded-lg space-y-4">
                      <div className="text-center">
                        <h3 className={`text-lg font-semibold ${getScenarioColor(simulation.scenarioName)}`}>
                          {simulation.scenarioName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {simulation.description}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">ROI 2 ans</span>
                          <Badge variant="outline">
                            {simulation.simulationResults[1]?.aiImplementation.roi || 0}%
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Automation</span>
                          <Badge variant="outline">
                            {simulation.simulationResults[1]?.projectedMetrics.automation || 0}%
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Temps cotation</span>
                          <Badge variant="outline">
                            {simulation.simulationResults[1]?.projectedMetrics.quotingTime || 0}h
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Investissement</span>
                          <Badge variant="outline">
                            {formatCurrency(simulation.simulationResults[1]?.aiImplementation.implementationCost || 0)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Scenario Analysis */}
            <Tabs defaultValue="results" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="results">Résultats</TabsTrigger>
                <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
                <TabsTrigger value="risks">Risques</TabsTrigger>
                <TabsTrigger value="implementation">Implémentation</TabsTrigger>
                <TabsTrigger value="impact">Impact Business</TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-6">
                {simulations.map((simulation, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className={getScenarioColor(simulation.scenarioName)}>
                        {simulation.scenarioName}
                      </CardTitle>
                      <CardDescription>{simulation.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {simulation.simulationResults.map((result: any, resultIdx: number) => (
                        <div key={resultIdx} className="space-y-4">
                          <h4 className="font-semibold flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{result.scenario} ({result.timeframe})</span>
                          </h4>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                            <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                              <Gauge className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-1" />
                              <p className="text-xs sm:text-sm font-semibold">{result.projectedMetrics.quotingTime}h</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Temps cotation</p>
                            </div>
                            
                            <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                              <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 mx-auto mb-1" />
                              <p className="text-xs sm:text-sm font-semibold">{result.projectedMetrics.processingCost}€</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Coût cotation</p>
                            </div>
                            
                            <div className="text-center p-2 sm:p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                              <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 mx-auto mb-1" />
                              <p className="text-xs sm:text-sm font-semibold">{result.projectedMetrics.automation}%</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Automation</p>
                            </div>
                            
                            <div className="text-center p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600 mx-auto mb-1" />
                              <p className="text-xs sm:text-sm font-semibold">{result.aiImplementation.roi}%</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">ROI</p>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium mb-2">Technologies IA déployées:</h5>
                            <div className="flex flex-wrap gap-2">
                              {result.aiImplementation.technologies.map((tech: string, techIdx: number) => (
                                <Badge key={techIdx} variant="secondary">{tech}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium mb-2">Position marché:</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Avantage concurrentiel:</span>
                                <p className="font-medium">{result.marketPosition.competitiveAdvantage}</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Part de marché:</span>
                                <p className="font-medium">{result.marketPosition.marketShare}%</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Différentiation:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {result.marketPosition.differentiation.map((diff: string, diffIdx: number) => (
                                    <Badge key={diffIdx} variant="outline" className="text-xs">{diff}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                {simulations.map((simulation, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Lightbulb className="h-6 w-6" />
                        <span>Recommandations - {simulation.scenarioName}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {simulation.recommendations.map((rec: any, recIdx: number) => (
                          <div key={recIdx} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold">{rec.recommendation}</h4>
                              <div className="flex space-x-2">
                                <Badge variant={rec.priority === 'Haute' ? 'destructive' : rec.priority === 'Moyenne' ? 'default' : 'secondary'}>
                                  {rec.priority}
                                </Badge>
                                <Badge variant="outline">{rec.timeline}</Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Impact:</span>
                                <p className="font-medium">{rec.impact}</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Effort:</span>
                                <p className="font-medium">{rec.effort}</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Résultat attendu:</span>
                                <p className="font-medium text-sm">{rec.expectedOutcome}</p>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Technologies IA:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {rec.aiTechnologies.map((tech: string, techIdx: number) => (
                                  <Badge key={techIdx} variant="outline">{tech}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="risks" className="space-y-6">
                {simulations.map((simulation, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-6 w-6" />
                        <span>Analyse des Risques - {simulation.scenarioName}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {simulation.riskAnalysis.map((risk: any, riskIdx: number) => (
                          <Alert key={riskIdx} className={getRiskColor(risk.probability, risk.impact)}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <strong>{risk.risk}</strong>
                                  <div className="flex space-x-2">
                                    <Badge variant="outline">
                                      Probabilité: {risk.probability}%
                                    </Badge>
                                    <Badge variant="outline">
                                      Impact: {risk.impact}%
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div>
                                  <span className="font-medium">Mitigation:</span>
                                  <p className="text-sm mt-1">{risk.mitigation}</p>
                                </div>
                                
                                <div>
                                  <span className="font-medium">Plan de contingence:</span>
                                  <p className="text-sm mt-1">{risk.contingencyPlan}</p>
                                </div>
                                
                                <div>
                                  <span className="font-medium">KPIs de monitoring:</span>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {risk.monitoringKpis.map((kpi: string, kpiIdx: number) => (
                                      <Badge key={kpiIdx} variant="outline" className="text-xs">{kpi}</Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="implementation" className="space-y-6">
                {simulations.map((simulation, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-6 w-6" />
                        <span>Plan d'Implémentation - {simulation.scenarioName}</span>
                      </CardTitle>
                      <CardDescription>
                        Timeline: {simulation.implementationPlan.timeline}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {simulation.implementationPlan.phases.map((phase: any, phaseIdx: number) => (
                        <div key={phaseIdx} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold">{phase.phase}</h4>
                            <Badge variant="outline">{phase.duration}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium mb-2">Objectifs:</h5>
                              <ul className="space-y-1">
                                {phase.objectives.map((objective: string, objIdx: number) => (
                                  <li key={objIdx} className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{objective}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="font-medium mb-2">Déploiements IA:</h5>
                              <div className="space-y-2">
                                {phase.aiDeployments.map((deployment: any, depIdx: number) => (
                                  <div key={depIdx} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-sm">{deployment.technology}</span>
                                      <Badge variant="secondary">{deployment.expectedROI}% ROI</Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      {deployment.purpose}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <span className="font-medium">Valeur business:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{phase.businessValue}</p>
                          </div>
                        </div>
                      ))}
                      
                      <div>
                        <h4 className="font-semibold mb-3">Critères de Succès:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {simulation.implementationPlan.successCriteria.map((criteria: string, critIdx: number) => (
                            <div key={critIdx} className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{criteria}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="impact" className="space-y-6">
                {simulations.map((simulation, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-6 w-6" />
                        <span>Impact Business - {simulation.scenarioName}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">Impact Revenus</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Nouveaux revenus</span>
                              <span className="font-medium">{formatCurrency(simulation.businessImpact.revenueImpact.newRevenue)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Croissance</span>
                              <span className="font-medium">{simulation.businessImpact.revenueImpact.revenueGrowth}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Impact Opérationnel</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Réduction coûts</span>
                              <span className="font-medium">{simulation.businessImpact.operationalImpact.costReduction}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Gain efficacité</span>
                              <span className="font-medium">{simulation.businessImpact.operationalImpact.efficiencyGain}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                          <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">Impact Stratégique</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm">Position</span>
                              <p className="font-medium">{simulation.businessImpact.strategicImpact.competitivePosition}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Opportunités d'expansion:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {simulation.businessImpact.revenueImpact.marketExpansion.map((opportunity: string, oppIdx: number) => (
                            <div key={oppIdx} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <ArrowRight className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{opportunity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Facteurs de différentiation:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {simulation.competitiveAnalysis.differentiationFactors.map((factor: string, factIdx: number) => (
                            <div key={factIdx} className="flex items-center space-x-2">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white mx-2 sm:mx-auto">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                <div className="space-y-4">
                  <PlayCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto opacity-80" />
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Prêt à Déployer Votre Stratégie Optimale ?</h3>
                  <p className="text-green-100 max-w-2xl mx-auto text-sm sm:text-base">
                    Ces simulations vous donnent une vision claire des impacts de chaque approche. 
                    Nos experts peuvent vous accompagner dans l'implémentation du scénario optimal.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-4 sm:mt-6">
                    <Button variant="secondary" size="lg" className="text-sm sm:text-base">
                      <Users className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Consultation Stratégique</span>
                      <span className="sm:hidden">Consultation</span>
                    </Button>
                    <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-green-600 text-sm sm:text-base">
                      <Target className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Plan d'Implémentation</span>
                      <span className="sm:hidden">Plan</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
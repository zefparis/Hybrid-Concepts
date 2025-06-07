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
import { Slider } from "@/components/ui/slider";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Award,
  Lightbulb, 
  Shield,
  Users,
  Zap,
  CheckCircle,
  AlertTriangle,
  Star,
  BarChart3,
  Calendar,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MaturityAssessment {
  overallScore: number;
  maturityLevel: string;
  categories: any;
  recommendations: any;
  quickWins: any[];
  investmentPriorities: any[];
  transformationPath: any;
  riskFactors: any[];
}

export default function AIMaturity() {
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState("");
  const [quotingTime, setQuotingTime] = useState([10]);
  const [processingCost, setProcessingCost] = useState([60]);
  const [errorRate, setErrorRate] = useState([12]);
  const [clientSatisfaction, setClientSatisfaction] = useState([75]);
  const [cloudUsage, setCloudUsage] = useState([25]);
  const [apiIntegrations, setApiIntegrations] = useState([2]);
  const [automationLevel, setAutomationLevel] = useState([20]);
  const [techSkills, setTechSkills] = useState([35]);
  const [changeReadiness, setChangeReadiness] = useState([60]);
  const [aiExperience, setAiExperience] = useState([15]);
  
  const [assessment, setAssessment] = useState<MaturityAssessment | null>(null);

  const generateAssessment = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/public-api/demo/ai-maturity', {
        method: 'POST',
        body: JSON.stringify({ companyData: data }),
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setAssessment(data.data.assessment);
    }
  });

  const handleGenerateAssessment = () => {
    generateAssessment.mutate({
      companyName: companyName || "Votre Société",
      quotingTime: quotingTime[0],
      processingCost: processingCost[0],
      errorRate: errorRate[0],
      clientSatisfaction: clientSatisfaction[0],
      cloudUsage: cloudUsage[0],
      apiIntegrations: apiIntegrations[0],
      automationLevel: automationLevel[0],
      techSkills: techSkills[0],
      changeReadiness: changeReadiness[0],
      aiExperience: aiExperience[0]
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (score >= 40) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <ArrowDown className="h-4 w-4 text-red-600" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900 px-4 py-2 rounded-full">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-purple-800 dark:text-purple-200 font-medium">{t("aiMaturityEvaluation", "AI Maturity Evaluation")}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
            {t("assessYourPreparation", "Assess Your Preparation")}
            <span className="block text-purple-600 dark:text-purple-400">{t("forArtificialIntelligence", "for Artificial Intelligence")}</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t("getCompleteAIDiagnostic", "Get a complete AI maturity diagnostic with detailed scoring, personalized recommendations and structured improvement plan.")}
          </p>
        </div>

        {/* Assessment Form */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-6 w-6" />
              <span>Évaluation de Maturité IA</span>
            </CardTitle>
            <CardDescription>
              Renseignez les informations de votre société pour obtenir un scoring personnalisé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de la société</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: LogiTech Solutions"
              />
            </div>

            {/* Operational Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Métriques Opérationnelles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Temps de cotation moyen (heures): {quotingTime[0]}h</Label>
                  <Slider
                    value={quotingTime}
                    onValueChange={setQuotingTime}
                    max={48}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Coût par cotation (€): {processingCost[0]}€</Label>
                  <Slider
                    value={processingCost}
                    onValueChange={setProcessingCost}
                    max={200}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Taux d'erreur (%): {errorRate[0]}%</Label>
                  <Slider
                    value={errorRate}
                    onValueChange={setErrorRate}
                    max={30}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Satisfaction client (%): {clientSatisfaction[0]}%</Label>
                  <Slider
                    value={clientSatisfaction}
                    onValueChange={setClientSatisfaction}
                    max={100}
                    min={30}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Technology Profile */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profil Technologique</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Usage Cloud (%): {cloudUsage[0]}%</Label>
                  <Slider
                    value={cloudUsage}
                    onValueChange={setCloudUsage}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Intégrations API: {apiIntegrations[0]}</Label>
                  <Slider
                    value={apiIntegrations}
                    onValueChange={setApiIntegrations}
                    max={20}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Niveau d'automatisation (%): {automationLevel[0]}%</Label>
                  <Slider
                    value={automationLevel}
                    onValueChange={setAutomationLevel}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Team Profile */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profil de l'Équipe</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Compétences tech (%): {techSkills[0]}%</Label>
                  <Slider
                    value={techSkills}
                    onValueChange={setTechSkills}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Capacité au changement (%): {changeReadiness[0]}%</Label>
                  <Slider
                    value={changeReadiness}
                    onValueChange={setChangeReadiness}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Expérience IA (%): {aiExperience[0]}%</Label>
                  <Slider
                    value={aiExperience}
                    onValueChange={setAiExperience}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleGenerateAssessment}
              disabled={generateAssessment.isPending}
              className="w-full"
              size="lg"
            >
              {generateAssessment.isPending ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-spin" />
                  Évaluation en cours...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Évaluer la Maturité IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Assessment Results */}
        {assessment && (
          <div className="space-y-8">
            {/* Overall Score */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Score de Maturité IA Global</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="relative">
                  <div className="w-48 h-48 mx-auto">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${assessment.overallScore * 2.51} 251`}
                        className={getScoreColor(assessment.overallScore)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getScoreColor(assessment.overallScore)}`}>
                          {assessment.overallScore}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">/ 100</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Niveau: {assessment.maturityLevel}
                </Badge>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Tabs defaultValue="categories" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="categories">Catégories</TabsTrigger>
                <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
                <TabsTrigger value="quickwins">Quick Wins</TabsTrigger>
                <TabsTrigger value="transformation">Transformation</TabsTrigger>
                <TabsTrigger value="investments">Investissements</TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="space-y-6">
                <div className="grid gap-6">
                  {Object.entries(assessment.categories).map(([categoryName, category]: [string, any]) => (
                    <Card key={categoryName}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="capitalize">{categoryName.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <div className="flex items-center space-x-2">
                            {getScoreIcon(category.score)}
                            <Badge variant="outline">{category.score}/100</Badge>
                          </div>
                        </CardTitle>
                        <CardDescription>Niveau: {category.level}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Progress value={category.score} className="h-3" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2 text-green-600">Forces</h4>
                            <ul className="space-y-1">
                              {category.strengths.map((strength: string, idx: number) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2 text-red-600">Points d'amélioration</h4>
                            <ul className="space-y-1">
                              {category.weaknesses.map((weakness: string, idx: number) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Prochaines étapes</h4>
                          <ul className="space-y-1">
                            {category.nextSteps.map((step: string, idx: number) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Lightbulb className="h-6 w-6" />
                        <span>Actions Immédiates</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {assessment.recommendations.immediate.map((action: any, idx: number) => (
                          <div key={idx} className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{action.action}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {action.aiAssistance}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <Badge variant={action.priority === 'Haute' ? 'destructive' : 'secondary'}>
                                  {action.priority}
                                </Badge>
                                <Badge variant="outline">{action.timeline}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-6 w-6" />
                        <span>Actions Court Terme</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {assessment.recommendations.shortTerm.map((action: any, idx: number) => (
                          <div key={idx} className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{action.action}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {action.aiAssistance}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <Badge variant={action.impact === 'Élevé' ? 'default' : 'secondary'}>
                                  {action.impact}
                                </Badge>
                                <Badge variant="outline">{action.timeline}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="quickwins" className="space-y-6">
                <div className="grid gap-6">
                  {assessment.quickWins.map((quickWin: any, idx: number) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{quickWin.opportunity}</span>
                          <Badge variant="default">{quickWin.expectedROI}% ROI</Badge>
                        </CardTitle>
                        <CardDescription>
                          Technologie: {quickWin.aiTechnology} | Délai: {quickWin.implementationTime}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Zap className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">Complexité: {quickWin.complexity}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="text-sm">ROI: {quickWin.expectedROI}%</span>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Prérequis:</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {quickWin.prerequisites.map((prereq: string, prereqIdx: number) => (
                                <li key={prereqIdx} className="flex items-start space-x-2">
                                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{prereq}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="transformation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-6 w-6" />
                      <span>Chemin de Transformation</span>
                    </CardTitle>
                    <CardDescription>
                      De "{assessment.transformationPath.currentState}" vers "{assessment.transformationPath.targetState}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {assessment.transformationPath.phases.map((phase: any, idx: number) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{phase.name}</h3>
                          <Badge variant="outline">{phase.duration}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Objectifs:</h4>
                            <ul className="space-y-1">
                              {phase.objectives.map((objective: string, objIdx: number) => (
                                <li key={objIdx} className="flex items-start space-x-2">
                                  <Target className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{objective}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Capacités IA:</h4>
                            <ul className="space-y-1">
                              {phase.aiCapabilities.map((capability: string, capIdx: number) => (
                                <li key={capIdx} className="flex items-start space-x-2">
                                  <Brain className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{capability}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="investments" className="space-y-6">
                <div className="grid gap-6">
                  {assessment.investmentPriorities.map((investment: any, idx: number) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{investment.area}</span>
                          <Badge variant="secondary">{investment.investmentRange}</Badge>
                        </CardTitle>
                        <CardDescription>{investment.businessImpact}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
                            <p className="text-sm font-semibold">{investment.expectedReturn}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Retour attendu</p>
                          </div>
                          
                          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                            <p className="text-sm font-semibold">{investment.timeToValue}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Temps de valeur</p>
                          </div>
                          
                          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                            <Brain className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                            <p className="text-sm font-semibold">{investment.aiTechnologies.length} Technologies</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">IA incluses</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Technologies IA:</h4>
                          <div className="flex flex-wrap gap-2">
                            {investment.aiTechnologies.map((tech: string, techIdx: number) => (
                              <Badge key={techIdx} variant="outline">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-6 w-6" />
                  <span>Facteurs de Risque</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {assessment.riskFactors.map((risk: any, idx: number) => (
                    <Alert key={idx}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <strong>{risk.risk}</strong>
                            <div className="flex space-x-2">
                              <Badge variant={risk.probability === 'Élevée' ? 'destructive' : 'secondary'}>
                                {risk.probability}
                              </Badge>
                              <Badge variant={risk.impact === 'Élevé' ? 'destructive' : 'secondary'}>
                                {risk.impact}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm">{risk.mitigation}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            <strong>Solution IA:</strong> {risk.aiSolution}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <Award className="h-12 w-12 mx-auto opacity-80" />
                  <h3 className="text-2xl font-bold">Prêt à Améliorer Votre Maturité IA ?</h3>
                  <p className="text-purple-100 max-w-2xl mx-auto">
                    Cette évaluation vous donne une base solide pour commencer votre transformation IA. 
                    Nos experts peuvent vous accompagner dans la mise en œuvre des recommandations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                    <Button variant="secondary" size="lg">
                      <Users className="mr-2 h-4 w-4" />
                      Consultation Expert
                    </Button>
                    <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-purple-600">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Rapport Détaillé
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
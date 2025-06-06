import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Rocket, 
  Target, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users, 
  Zap,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  Shield,
  Globe
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MigrationPlan {
  company: any;
  phaseDetails: any;
  aiServices: any;
  implementationTimeline: any[];
  budgetProjection: any;
  successMetrics: any;
}

export default function MigrationDemo() {
  const [companyName, setCompanyName] = useState("");
  const [quotingTime, setQuotingTime] = useState(12);
  const [processingCost, setProcessingCost] = useState(65);
  const [migrationPlan, setMigrationPlan] = useState<MigrationPlan | null>(null);

  const generateMigrationPlan = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/public-api/demo/migration-plan', {
        method: 'POST',
        body: JSON.stringify({ companyData: data }),
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setMigrationPlan(data.data.migrationPlan);
    }
  });

  const handleGeneratePlan = () => {
    generateMigrationPlan.mutate({
      companyName: companyName || "Votre Société",
      quotingTime,
      operationalMetrics: {
        processingCost,
        errorRate: 15,
        clientSatisfaction: 70,
        scalabilityLimit: 25
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-full">
            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-200 font-medium">Migration IA Avancée</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
            Transformation Complète
            <span className="block text-blue-600 dark:text-blue-400">par Intelligence Artificielle</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Découvrez comment eMulog peut révolutionner votre société de fret avec un plan de migration 
            complet sur 32 semaines, utilisant les IA les plus avancées du marché.
          </p>
        </div>

        {/* Input Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-6 w-6" />
              <span>Paramètres de Votre Société</span>
            </CardTitle>
            <CardDescription>
              Renseignez vos données pour générer un plan de migration personnalisé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de la société</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: FreightForward International"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quotingTime">Temps de cotation actuel (heures)</Label>
                <Input
                  id="quotingTime"
                  type="number"
                  value={quotingTime}
                  onChange={(e) => setQuotingTime(Number(e.target.value))}
                  min="1"
                  max="48"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="processingCost">Coût par cotation (€)</Label>
              <Input
                id="processingCost"
                type="number"
                value={processingCost}
                onChange={(e) => setProcessingCost(Number(e.target.value))}
                min="10"
                max="200"
              />
            </div>

            <Button 
              onClick={handleGeneratePlan}
              disabled={generateMigrationPlan.isPending}
              className="w-full"
              size="lg"
            >
              {generateMigrationPlan.isPending ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-spin" />
                  Génération du plan IA...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Générer le Plan de Migration IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {migrationPlan && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{migrationPlan.implementationTimeline.length}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Semaines</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{migrationPlan.budgetProjection.roi2Years}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ROI 2 ans</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{migrationPlan.company.targetState.automation}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(migrationPlan.budgetProjection.expectedSavings)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Économies/mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Plan */}
            <Tabs defaultValue="phases" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="phases">Phases</TabsTrigger>
                <TabsTrigger value="ai-services">Services IA</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="metrics">Métriques</TabsTrigger>
              </TabsList>

              <TabsContent value="phases" className="space-y-6">
                <div className="grid gap-6">
                  {Object.entries(migrationPlan.phaseDetails).map(([phaseName, phase]: [string, any]) => (
                    <Card key={phaseName}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="capitalize">Phase {phaseName}</span>
                          <Badge variant="outline">{phase.duration}</Badge>
                        </CardTitle>
                        <CardDescription>{phase.businessImpact}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Objectifs:</h4>
                          <ul className="space-y-1">
                            {phase.objectives.map((objective: string, idx: number) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{objective}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Capacités IA:</h4>
                          <ul className="space-y-1">
                            {phase.aiCapabilities.map((capability: string, idx: number) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <Brain className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{capability}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Critères de Succès:</h4>
                          <ul className="space-y-1">
                            {phase.successCriteria.map((criteria: string, idx: number) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <Target className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{criteria}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ai-services" className="space-y-6">
                <div className="grid gap-6">
                  {Object.entries(migrationPlan.aiServices).map(([serviceName, service]: [string, any]) => (
                    <Card key={serviceName}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{service.serviceName}</span>
                          <Badge variant="secondary">{service.expectedROI}% ROI</Badge>
                        </CardTitle>
                        <CardDescription>
                          Intégration: {service.integrationMethod}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Capacités:</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {service.capabilities.map((capability: string, idx: number) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{capability}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Métriques de Performance:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {service.performanceMetrics.map((metric: string, idx: number) => (
                              <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                <BarChart3 className="h-4 w-4 mb-1 text-gray-600" />
                                <p className="text-xs text-gray-600 dark:text-gray-400">{metric}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-6 w-6" />
                      <span>Timeline de Déploiement (32 semaines)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {migrationPlan.implementationTimeline.slice(0, 16).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <Badge variant="outline">S{item.week}</Badge>
                          <div className="flex-1">
                            <p className="font-medium">{item.milestone}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.aiDeployment}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{item.phase}</p>
                            <p className="text-xs text-gray-500">{item.businessValue}</p>
                          </div>
                        </div>
                      ))}
                      
                      {migrationPlan.implementationTimeline.length > 16 && (
                        <Alert>
                          <Calendar className="h-4 w-4" />
                          <AlertDescription>
                            Timeline complète de {migrationPlan.implementationTimeline.length} semaines disponible dans le rapport détaillé.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="budget" className="space-y-6">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Projection Budgétaire</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                          <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{formatCurrency(migrationPlan.budgetProjection.initialInvestment)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Investissement Initial</p>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{formatCurrency(migrationPlan.budgetProjection.expectedSavings)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Économies Mensuelles</p>
                        </div>
                        
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                          <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{migrationPlan.budgetProjection.breakEvenPoint}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Seuil de Rentabilité</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span>ROI 2 ans</span>
                            <span className="font-bold text-green-600">{migrationPlan.budgetProjection.roi2Years}%</span>
                          </div>
                          <Progress value={Math.min(100, migrationPlan.budgetProjection.roi2Years / 5)} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span>ROI 5 ans</span>
                            <span className="font-bold text-green-600">{migrationPlan.budgetProjection.roi5Years}%</span>
                          </div>
                          <Progress value={Math.min(100, migrationPlan.budgetProjection.roi5Years / 10)} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-6">
                <div className="grid gap-6">
                  {Object.entries(migrationPlan.successMetrics).map(([metricName, metric]: [string, any]) => (
                    <Card key={metricName}>
                      <CardHeader>
                        <CardTitle className="capitalize">{metricName}</CardTitle>
                        <CardDescription>{metric.measurement}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Baseline actuelle</span>
                            <Badge variant="outline">{metric.baseline}%</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Objectif avec eMulog</span>
                              <span className="font-bold text-green-600">{metric.target}%</span>
                            </div>
                            <Progress value={(metric.target / 100) * 100} className="h-3" />
                          </div>
                          
                          <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                            <p className="text-lg font-bold text-green-600">
                              +{Math.round(((metric.target - metric.baseline) / metric.baseline) * 100)}% d'amélioration
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <Globe className="h-12 w-12 mx-auto opacity-80" />
                  <h3 className="text-2xl font-bold">Prêt à Transformer Votre Société ?</h3>
                  <p className="text-blue-100 max-w-2xl mx-auto">
                    Ce plan de migration démonstratif vous donne un aperçu de notre approche. 
                    Contactez-nous pour une analyse personnalisée complète avec nos experts IA.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                    <Button variant="secondary" size="lg">
                      <Shield className="mr-2 h-4 w-4" />
                      Analyse Sécurisée Complète
                    </Button>
                    <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                      <Users className="mr-2 h-4 w-4" />
                      Parler à un Expert
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
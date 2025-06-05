import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Bot, Clock, DollarSign, Truck, CheckCircle, AlertCircle, Zap, Target, Calendar } from 'lucide-react';

interface LogisticsRequest {
  origin: string;
  destination: string;
  cargo: {
    type: string;
    weight: number;
    dimensions?: string;
    value?: number;
    dangerous?: boolean;
  };
  timeline: {
    preferred: string;
    latest: string;
  };
  budget?: {
    max: number;
    preferred: number;
  };
  preferences?: {
    transportMode?: string;
    reliability?: 'standard' | 'premium';
    insurance?: boolean;
  };
}

interface AutomationResult {
  quoteRequestId: number;
  quotes: any[];
  recommendations: {
    bestOption: any;
    reasoning: string;
    alternatives: any[];
  };
  timeline: {
    processingTime: number;
    estimatedDelivery: string;
  };
  nextSteps: string[];
}

export default function AIAutomation() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<LogisticsRequest>({
    origin: '',
    destination: '',
    cargo: {
      type: '',
      weight: 0,
      dimensions: '',
      value: 0,
      dangerous: false
    },
    timeline: {
      preferred: '',
      latest: ''
    },
    budget: {
      max: 0,
      preferred: 0
    },
    preferences: {
      transportMode: '',
      reliability: 'standard',
      insurance: false
    }
  });
  const [result, setResult] = useState<AutomationResult | null>(null);

  const automationMutation = useMutation({
    mutationFn: async (request: LogisticsRequest) => {
      const response = await fetch('/api/ai/process-logistics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(request)
      });
      if (!response.ok) throw new Error('Automation failed');
      return response.json();
    },
    onSuccess: (data: AutomationResult) => {
      setResult(data);
      setStep(4);
      toast({
        title: "Automatisation terminée",
        description: `Processus complété en ${data.timeline.processingTime}s avec ${data.quotes.length} cotations générées`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur d'automatisation",
        description: "Impossible de traiter automatiquement la demande",
        variant: "destructive",
      });
    }
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      automationMutation.mutate(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateFormData = (section: string, field: string, value: any) => {
    if (section === '') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof LogisticsRequest] as any),
          [field]: value
        }
      }));
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.origin && formData.destination && formData.cargo.type && formData.cargo.weight > 0;
      case 2:
        return formData.timeline.preferred && formData.timeline.latest;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bot className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Agent IA Logistique</h1>
          <p className="text-muted-foreground">
            Automatisation complète du processus logistique - De 40 minutes à 30 secondes
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Étape {step} sur 3</span>
            <span className="text-sm text-muted-foreground">
              {step === 4 ? 'Terminé' : 'En cours'}
            </span>
          </div>
          <Progress value={(step / 4) * 100} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Informations cargo</span>
            <span>Planning</span>
            <span>Préférences</span>
            <span>Automatisation</span>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Cargo Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Informations sur le cargo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">Origine</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => updateFormData('', 'origin', e.target.value)}
                  placeholder="Ville ou port de départ"
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => updateFormData('', 'destination', e.target.value)}
                  placeholder="Ville ou port d'arrivée"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cargoType">Type de marchandise</Label>
                <Select onValueChange={(value) => updateFormData('cargo', 'type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Marchandise générale</SelectItem>
                    <SelectItem value="electronics">Électronique</SelectItem>
                    <SelectItem value="textiles">Textiles</SelectItem>
                    <SelectItem value="food">Alimentaire</SelectItem>
                    <SelectItem value="chemicals">Produits chimiques</SelectItem>
                    <SelectItem value="machinery">Machines</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.cargo.weight || ''}
                  onChange={(e) => updateFormData('cargo', 'weight', parseFloat(e.target.value) || 0)}
                  placeholder="Poids total"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={formData.cargo.dimensions || ''}
                  onChange={(e) => updateFormData('cargo', 'dimensions', e.target.value)}
                  placeholder="L x l x h (cm)"
                />
              </div>
              <div>
                <Label htmlFor="value">Valeur (€)</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.cargo.value || ''}
                  onChange={(e) => updateFormData('cargo', 'value', parseFloat(e.target.value) || 0)}
                  placeholder="Valeur déclarée"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Timeline */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Planning et délais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferred">Date préférée de collecte</Label>
                <Input
                  id="preferred"
                  type="date"
                  value={formData.timeline.preferred}
                  onChange={(e) => updateFormData('timeline', 'preferred', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="latest">Date limite de livraison</Label>
                <Input
                  id="latest"
                  type="date"
                  value={formData.timeline.latest}
                  onChange={(e) => updateFormData('timeline', 'latest', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxBudget">Budget maximum (€)</Label>
                <Input
                  id="maxBudget"
                  type="number"
                  value={formData.budget?.max || ''}
                  onChange={(e) => updateFormData('budget', 'max', parseFloat(e.target.value) || 0)}
                  placeholder="Budget limite"
                />
              </div>
              <div>
                <Label htmlFor="preferredBudget">Budget préféré (€)</Label>
                <Input
                  id="preferredBudget"
                  type="number"
                  value={formData.budget?.preferred || ''}
                  onChange={(e) => updateFormData('budget', 'preferred', parseFloat(e.target.value) || 0)}
                  placeholder="Budget cible"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preferences */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Préférences de transport
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transportMode">Mode de transport préféré</Label>
                <Select onValueChange={(value) => updateFormData('preferences', 'transportMode', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Laisser l'IA choisir (recommandé)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">IA automatique (optimal)</SelectItem>
                    <SelectItem value="air">Aérien (rapide)</SelectItem>
                    <SelectItem value="mer">Maritime (économique)</SelectItem>
                    <SelectItem value="terre">Routier (flexible)</SelectItem>
                    <SelectItem value="multimodal">Multimodal (équilibré)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reliability">Niveau de fiabilité</Label>
                <Select onValueChange={(value) => updateFormData('preferences', 'reliability', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Standard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription>
                L'agent IA analysera automatiquement vos besoins et sélectionnera la meilleure solution 
                parmi les transporteurs disponibles, en optimisant le rapport qualité-prix-délai.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Results */}
      {step === 4 && result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Automatisation terminée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{result.timeline.processingTime}s</div>
                  <div className="text-sm text-muted-foreground">Temps de traitement</div>
                </div>
                <div className="text-center">
                  <Truck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{result.quotes.length}</div>
                  <div className="text-sm text-muted-foreground">Cotations générées</div>
                </div>
                <div className="text-center">
                  <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{result.timeline.estimatedDelivery}</div>
                  <div className="text-sm text-muted-foreground">Livraison estimée</div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-semibold mb-3">Recommandation IA</h3>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm mb-3">{result.recommendations.reasoning}</p>
                  <div className="flex flex-wrap gap-2">
                    {result.recommendations.bestOption.pros?.map((pro: string, index: number) => (
                      <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                        {pro}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-semibold mb-3">Étapes suivantes</h3>
                <ul className="space-y-2">
                  {result.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alternatives suggérées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.recommendations.alternatives.map((alt: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="font-medium">{alt.scenario}</div>
                    <div className="text-sm text-muted-foreground mt-1">{alt.reasoning}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={step === 1 || automationMutation.isPending}
        >
          Retour
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!isStepValid() || automationMutation.isPending}
        >
          {step === 3 ? (
            automationMutation.isPending ? (
              <>
                <Bot className="mr-2 h-4 w-4 animate-spin" />
                Agent IA en cours...
              </>
            ) : (
              'Lancer l\'automatisation'
            )
          ) : (
            'Suivant'
          )}
        </Button>
      </div>
    </div>
  );
}
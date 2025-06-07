import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle, Phone, Mail, FileText, Calculator, Zap, Brain, Bot, AlertTriangle } from "lucide-react";

interface ComparisonStep {
  icon: any;
  text: string;
  time: string;
  status: 'manual' | 'ai' | 'waiting' | 'error';
  delay: number;
}

interface ComparisonProps {
  onComplete?: (type: 'traditional' | 'ai') => void;
}

export function TransformationComparison({ onComplete }: ComparisonProps) {
  const [activeDemo, setActiveDemo] = useState<'traditional' | 'ai' | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const traditionalSteps: ComparisonStep[] = [
    { icon: Phone, text: "Recherche manuelle des transporteurs", time: "5 min", status: "manual", delay: 2000 },
    { icon: Phone, text: "Appels téléphoniques multiples", time: "8 min", status: "manual", delay: 3000 },
    { icon: Mail, text: "Attente des réponses par email", time: "15 min", status: "waiting", delay: 4000 },
    { icon: AlertTriangle, text: "Erreurs de saisie détectées", time: "3 min", status: "error", delay: 2000 },
    { icon: Calculator, text: "Comparaison manuelle des offres", time: "6 min", status: "manual", delay: 3000 },
    { icon: Phone, text: "Négociation téléphonique", time: "4 min", status: "manual", delay: 2500 },
    { icon: FileText, text: "Validation administrative", time: "2 min", status: "manual", delay: 1500 },
  ];

  const aiSteps: ComparisonStep[] = [
    { icon: Brain, text: "Analyse IA des besoins logistiques", time: "2 sec", status: "ai", delay: 800 },
    { icon: Zap, text: "Détection automatique du mode optimal", time: "1 sec", status: "ai", delay: 600 },
    { icon: Bot, text: "Génération intelligente des cotations", time: "3 sec", status: "ai", delay: 1000 },
    { icon: CheckCircle, text: "Comparaison et optimisation IA", time: "2 sec", status: "ai", delay: 700 },
    { icon: Brain, text: "Recommandation basée sur l'analyse", time: "1 sec", status: "ai", delay: 500 },
    { icon: FileText, text: "Documentation automatique", time: "1 sec", status: "ai", delay: 400 },
  ];

  const runDemo = (type: 'traditional' | 'ai') => {
    setActiveDemo(type);
    setCurrentStep(0);
    setProgress(0);
    setIsCompleted(false);
    
    const steps = type === 'traditional' ? traditionalSteps : aiSteps;
    let stepIndex = 0;
    
    const runStep = () => {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex);
        setProgress(((stepIndex + 1) / steps.length) * 100);
        
        setTimeout(() => {
          stepIndex++;
          if (stepIndex >= steps.length) {
            setIsCompleted(true);
            onComplete?.(type);
          } else {
            runStep();
          }
        }, steps[stepIndex].delay);
      }
    };
    
    runStep();
  };

  const getStepClassName = (step: ComparisonStep, index: number) => {
    const baseClass = "flex items-center gap-3 p-3 rounded-lg border transition-all duration-300";
    
    if (activeDemo && index <= currentStep) {
      switch (step.status) {
        case 'manual':
          return `${baseClass} bg-red-50 border-red-200 shadow-sm`;
        case 'ai':
          return `${baseClass} bg-green-50 border-green-200 shadow-sm`;
        case 'waiting':
          return `${baseClass} bg-yellow-50 border-yellow-200 shadow-sm`;
        case 'error':
          return `${baseClass} bg-red-100 border-red-300 shadow-md`;
      }
    }
    
    return `${baseClass} bg-white border-gray-200`;
  };

  const getStepIcon = (step: ComparisonStep, index: number) => {
    const isActive = activeDemo && index <= currentStep;
    const iconClass = `w-5 h-5 ${isActive ? getStatusColor(step.status) : 'text-gray-400'}`;
    return <step.icon className={iconClass} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'manual': return 'text-red-600';
      case 'ai': return 'text-green-600';
      case 'waiting': return 'text-yellow-600';
      case 'error': return 'text-red-700';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'manual': return <Badge variant="destructive">Manuel</Badge>;
      case 'ai': return <Badge className="bg-green-600">IA</Badge>;
      case 'waiting': return <Badge variant="secondary">Attente</Badge>;
      case 'error': return <Badge variant="destructive">Erreur</Badge>;
      default: return <Badge variant="outline">-</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Traditional Process */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-red-700">
            <XCircle className="w-6 h-6" />
            Processus Traditionnel Obsolète
          </CardTitle>
          <Badge variant="destructive" className="mx-auto">40 minutes • Manuel • Inefficace</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {traditionalSteps.map((step, index) => (
              <div key={index} className={getStepClassName(step, index)}>
                {getStepIcon(step, index)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{step.text}</p>
                  <p className="text-sm text-gray-600">{step.time}</p>
                </div>
                {getStatusBadge(step.status)}
              </div>
            ))}
          </div>
          
          <Button 
            onClick={() => runDemo('traditional')} 
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={activeDemo === 'traditional'}
          >
            {activeDemo === 'traditional' ? 'Processus obsolète en cours...' : 'Démontrer le Processus Obsolète'}
          </Button>
          
          {activeDemo === 'traditional' && (
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-center text-sm text-gray-600">
                Étape {currentStep + 1}/{traditionalSteps.length} - {Math.round(progress)}% completé
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Process */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="w-6 h-6" />
            Hybrid Concept IA Révolutionnaire
          </CardTitle>
          <Badge className="mx-auto bg-green-600">30 secondes • Automatique • Intelligent</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {aiSteps.map((step, index) => (
              <div key={index} className={getStepClassName(step, index)}>
                {getStepIcon(step, index)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{step.text}</p>
                  <p className="text-sm text-gray-600">{step.time}</p>
                </div>
                {getStatusBadge(step.status)}
              </div>
            ))}
          </div>
          
          <Button 
            onClick={() => runDemo('ai')} 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={activeDemo === 'ai'}
          >
            {activeDemo === 'ai' ? 'Innovation IA en action...' : 'Démontrer l\'Innovation IA'}
          </Button>
          
          {activeDemo === 'ai' && (
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-center text-sm text-gray-600">
                Étape {currentStep + 1}/{aiSteps.length} - {Math.round(progress)}% completé
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
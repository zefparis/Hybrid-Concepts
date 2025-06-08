import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [activeDemo, setActiveDemo] = useState<'traditional' | 'ai' | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const traditionalSteps: ComparisonStep[] = [
    { icon: Phone, text: t("transformationDemo.manualCarrierSearch"), time: "5 min", status: "manual", delay: 2000 },
    { icon: Phone, text: t("transformationDemo.multipleCalls"), time: "8 min", status: "manual", delay: 3000 },
    { icon: Mail, text: t("transformationDemo.waitingEmailResponses"), time: "15 min", status: "waiting", delay: 4000 },
    { icon: AlertTriangle, text: t("transformationDemo.inputErrors"), time: "3 min", status: "error", delay: 2000 },
    { icon: Calculator, text: t("transformationDemo.manualOfferComparison"), time: "6 min", status: "manual", delay: 3000 },
    { icon: Phone, text: t("transformationDemo.phoneNegotiation"), time: "4 min", status: "manual", delay: 2500 },
    { icon: FileText, text: t("transformationDemo.administrativeValidation"), time: "2 min", status: "manual", delay: 1500 },
  ];

  const aiSteps: ComparisonStep[] = [
    { icon: Brain, text: t("transformationDemo.aiLogisticsAnalysis"), time: "2 sec", status: "ai", delay: 800 },
    { icon: Zap, text: t("transformationDemo.automaticModeDetection"), time: "1 sec", status: "ai", delay: 600 },
    { icon: Bot, text: t("transformationDemo.intelligentQuoteGeneration"), time: "3 sec", status: "ai", delay: 1000 },
    { icon: CheckCircle, text: t("transformationDemo.aiComparisonOptimization"), time: "2 sec", status: "ai", delay: 700 },
    { icon: Brain, text: t("transformationDemo.analysisBasedRecommendation"), time: "1 sec", status: "ai", delay: 500 },
    { icon: FileText, text: t("transformationDemo.automaticDocumentation"), time: "1 sec", status: "ai", delay: 400 },
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
      case 'manual': return <Badge variant="destructive">{t("transformationDemo.manual")}</Badge>;
      case 'ai': return <Badge className="bg-green-600">{t("transformationDemo.ai")}</Badge>;
      case 'waiting': return <Badge variant="secondary">{t("transformationDemo.waiting")}</Badge>;
      case 'error': return <Badge variant="destructive">{t("transformationDemo.error")}</Badge>;
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
            {t("transformationDemo.traditionalProcessObsolete")}
          </CardTitle>
          <Badge variant="destructive" className="mx-auto">{t("transformationDemo.traditionalTimeline")}</Badge>
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
            {activeDemo === 'traditional' ? t("transformationDemo.traditionalInProgress") : t("transformationDemo.demonstrateTraditional")}
          </Button>
          
          {activeDemo === 'traditional' && (
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-center text-sm text-gray-600">
                {t("transformationDemo.stepProgress", { current: currentStep + 1, total: traditionalSteps.length, progress: Math.round(progress) })}
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
            {t("transformationDemo.hybridConceptAI")}
          </CardTitle>
          <Badge className="mx-auto bg-green-600">{t("transformationDemo.aiTimeline")}</Badge>
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
            {activeDemo === 'ai' ? t("transformationDemo.aiInProgress") : t("transformationDemo.demonstrateAI")}
          </Button>
          
          {activeDemo === 'ai' && (
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-center text-sm text-gray-600">
                {t("transformationDemo.stepProgress", { current: currentStep + 1, total: aiSteps.length, progress: Math.round(progress) })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
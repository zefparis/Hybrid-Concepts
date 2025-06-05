import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Ship, 
  Plane, 
  Truck, 
  Train, 
  FileText, 
  AlertTriangle, 
  Shield, 
  Clock,
  DollarSign,
  MapPin,
  Globe,
  CheckCircle
} from 'lucide-react';

interface FreightAutomationResultsProps {
  results: {
    transportAnalysis: {
      optimalMode: string;
      reasoning: string;
      transitTime: number;
      routeAnalysis: string;
    };
    customsDocuments: {
      required: string[];
      hsCode: string;
      dutyEstimate: number;
      restrictions: string[];
    };
    carrierIntegrations: {
      connected: string[];
      ratesRequested: number;
      realTimeTracking: boolean;
    };
    riskAssessment: {
      score: number;
      factors: string[];
      recommendations: string[];
    };
    quotes: any[];
    recommendations: any;
  };
}

export default function FreightAutomationResults({ results }: FreightAutomationResultsProps) {
  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'sea': return <Ship className="w-5 h-5" />;
      case 'air': return <Plane className="w-5 h-5" />;
      case 'road': return <Truck className="w-5 h-5" />;
      case 'rail': return <Train className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-100';
    if (score < 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Transport Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTransportIcon(results.transportAnalysis.optimalMode)}
            Analyse Intelligente du Transport
            <Badge variant="outline">{results.transportAnalysis.optimalMode.toUpperCase()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Mode Optimal Détecté</h4>
            <p className="text-sm text-muted-foreground">{results.transportAnalysis.reasoning}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Temps de transit: {results.transportAnalysis.transitTime} jours</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-sm">Route optimisée</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Analyse de Route</h4>
            <p className="text-sm text-muted-foreground">{results.transportAnalysis.routeAnalysis}</p>
          </div>
        </CardContent>
      </Card>

      {/* Customs Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Documentation Douanière Automatique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Documents Requis</h4>
              <ul className="space-y-1">
                {results.customsDocuments.required.map((doc, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Informations Douanières</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Code HS:</span>
                  <Badge variant="outline">{results.customsDocuments.hsCode}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Droits estimés:</span>
                  <span className="text-sm font-medium">{results.customsDocuments.dutyEstimate}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {results.customsDocuments.restrictions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Restrictions Applicables
              </h4>
              <ul className="space-y-1">
                {results.customsDocuments.restrictions.map((restriction, index) => (
                  <li key={index} className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                    {restriction}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Carrier Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Intégrations API Transporteurs
            <Badge variant="secondary">{results.carrierIntegrations.ratesRequested} APIs</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">APIs Connectées</h4>
              <div className="space-y-1">
                {results.carrierIntegrations.connected.map((api, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{api}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Fonctionnalités</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Tarifs en temps réel</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Suivi automatique</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Capacité temps réel</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Évaluation des Risques
            <Badge className={getRiskColor(results.riskAssessment.score)}>
              Score: {results.riskAssessment.score}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Facteurs de Risque Identifiés</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {results.riskAssessment.factors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  {factor}
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-semibold mb-2">Recommandations d'Atténuation</h4>
            <ul className="space-y-1">
              {results.riskAssessment.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Summary */}
      {results.quotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Cotations Générées Automatiquement
              <Badge variant="secondary">{results.quotes.length} offres</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.quotes.slice(0, 3).map((quote, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Transporteur {index + 1}</span>
                    <p className="text-sm text-muted-foreground">{quote.estimatedDays} jours</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">{quote.price}€</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
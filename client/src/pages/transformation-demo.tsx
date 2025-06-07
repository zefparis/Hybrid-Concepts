import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle, Phone, Mail, FileText, Calculator, Zap, Brain, Bot, Truck } from "lucide-react";
import { TransformationComparison } from "@/components/transformation-comparison";
import exampleImage from "@assets/image_1749320218426.png";

export default function TransformationDemo() {

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Transformation Logistique : Obsolète vs Innovation IA
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Découvrez comment Hybrid Concept révolutionne les processus logistiques traditionnels avec l'intelligence artificielle
        </p>
      </div>

      {/* Visual Comparison */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Comparaison Visuelle : Obsolète vs Innovation</CardTitle>
        </CardHeader>
        <CardContent>
          <img 
            src={exampleImage} 
            alt="Comparaison processus traditionnel vs IA automation" 
            className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
          />
        </CardContent>
      </Card>

      {/* Interactive Comparison */}
      <TransformationComparison onComplete={(type) => console.log(`Demo ${type} completed`)} />

      {/* Impact Metrics */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Impact de la Transformation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">99.2%</div>
              <div className="text-sm text-gray-600">Réduction du temps</div>
              <div className="text-xs text-gray-500">40 min → 30 sec</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">85%</div>
              <div className="text-sm text-gray-600">Amélioration précision</div>
              <div className="text-xs text-gray-500">78% → 98% accuracy</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-600">75%</div>
              <div className="text-sm text-gray-600">Réduction coûts</div>
              <div className="text-xs text-gray-500">350€ → 88€ par cotation</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-600">Disponibilité IA</div>
              <div className="text-xs text-gray-500">vs 8h-17h manuel</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real Problems vs AI Solutions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-gray-300">
          <CardHeader>
            <CardTitle className="text-red-700">Problèmes Systèmes Actuels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Processus Fragmentés</h4>
                  <p className="text-sm text-gray-600">Multiple systèmes incompatibles, saisies manuelles répétitives</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-red-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Délais Excessifs</h4>
                  <p className="text-sm text-gray-600">Attente réponses, validation manuelle, processus bureaucratiques</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Erreurs Humaines</h4>
                  <p className="text-sm text-gray-600">Saisies incorrectes, oublis, mauvaises interprétations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calculator className="w-5 h-5 text-red-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Coûts Cachés</h4>
                  <p className="text-sm text-gray-600">Main d'œuvre, corrections, retards, opportunités manquées</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-300">
          <CardHeader>
            <CardTitle className="text-green-700">Solutions Hybrid Concept IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Orchestration IA Unifiée</h4>
                  <p className="text-sm text-gray-600">Système unique, intégration automatique, zéro saisie manuelle</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Traitement Instantané</h4>
                  <p className="text-sm text-gray-600">Analyse IA en temps réel, réponses immédiates, automatisation complète</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Précision Intelligence</h4>
                  <p className="text-sm text-gray-600">Apprentissage continu, optimisation prédictive, zéro erreur</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">ROI Immédiat</h4>
                  <p className="text-sm text-gray-600">Économies directes, efficacité maximale, avantage concurrentiel</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="text-center py-12">
          <Truck className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            Arrêtez de Subir les Processus Obsolètes
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Rejoignez la révolution logistique avec Hybrid Concept
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-blue-600">
              Démonstration Personnalisée
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              Analyse Gratuite
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
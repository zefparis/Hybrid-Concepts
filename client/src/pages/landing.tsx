import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  Shield, 
  Clock, 
  Users,
  CheckCircle,
  Star,
  Globe,
  BarChart3,
  Lightbulb,
  Rocket,
  Award,
  PlayCircle
} from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      title: "IA Claude Sonnet-4",
      description: "L'intelligence artificielle la plus avancée au monde pour optimiser votre logistique",
      color: "bg-blue-500"
    },
    {
      icon: Zap,
      title: "Automatisation Complète",
      description: "De 40 minutes à 30 secondes pour traiter une demande de cotation",
      color: "bg-yellow-500"
    },
    {
      icon: Target,
      title: "Analyse Concurrentielle",
      description: "Analysez vos concurrents et découvrez votre potentiel d'optimisation",
      color: "bg-red-500"
    },
    {
      icon: TrendingUp,
      title: "ROI Mesurable",
      description: "Jusqu'à 180% de ROI sur 24 mois avec projections détaillées",
      color: "bg-green-500"
    },
    {
      icon: Shield,
      title: "Évaluation des Risques",
      description: "Assessment intelligent des risques géopolitiques et logistiques",
      color: "bg-purple-500"
    },
    {
      icon: Clock,
      title: "Temps Réel",
      description: "APIs transporteurs en direct, suivi live, optimisation continue",
      color: "bg-orange-500"
    }
  ];

  const useCases = [
    {
      title: "PME Traditionnelle",
      before: "14h de réponse • 68% précision • 85€/cotation",
      after: "2h de réponse • 95% précision • 25€/cotation",
      improvement: "+180% ROI sur 2 ans",
      icon: Users
    },
    {
      title: "Transitaire Moyen",
      before: "6h de réponse • 75% précision • 120€/cotation",
      after: "45min de réponse • 98% précision • 35€/cotation",
      improvement: "+250% efficacité",
      icon: Globe
    },
    {
      title: "Groupe Logistique",
      before: "3h de réponse • 82% précision • 200€/cotation",
      after: "20min de réponse • 99% précision • 45€/cotation",
      improvement: "+400% scalabilité",
      icon: BarChart3
    }
  ];

  const testimonials = [
    {
      quote: "eMulog a révolutionné notre activité. Nous traitons 5x plus de cotations avec la même équipe.",
      author: "Marie Dubois",
      position: "DG, LogisFrance SARL",
      rating: 5
    },
    {
      quote: "L'IA Claude comprend parfaitement nos besoins. 95% de nos cotations sont automatisées.",
      author: "Jean-Pierre Martin",
      position: "Directeur Ops, TransEurope",
      rating: 5
    },
    {
      quote: "ROI atteint en 8 mois au lieu des 18 prévus. Une transformation spectaculaire.",
      author: "Sophie Chen",
      position: "CFO, Maritime Solutions",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              🚀 Révolution Logistique IA
            </Badge>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              eMulog
              <span className="block text-yellow-300">L'IA qui Transforme</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal mt-4">
                Votre Société de Fret
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-blue-100">
              La première plateforme SaaS alimentée par <strong>Claude Sonnet-4</strong> qui automatise 
              complètement vos opérations logistiques. De la cotation au suivi, révolutionnez 
              votre activité en 30 jours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link href="/competitive-demo">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold text-lg px-8 py-4 h-auto">
                  <Target className="mr-2 h-6 w-6" />
                  Analyser Ma Société
                </Button>
              </Link>
              <Link href="/ai-automation">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold text-lg px-8 py-4 h-auto">
                  <Brain className="mr-2 h-6 w-6" />
                  Voir l'IA en Action
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">30 sec</div>
                <div className="text-blue-100">Traitement cotation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">180%</div>
                <div className="text-blue-100">ROI moyen 24 mois</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">95%</div>
                <div className="text-blue-100">Précision automatique</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Pourquoi eMulog Révolutionne la Logistique
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète alimentée par l'IA la plus avancée, 
              conçue spécifiquement pour transformer les sociétés de fret traditionnelles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <div className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Transformations Réelles, Résultats Mesurables
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez comment eMulog transforme différents types de sociétés logistiques
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="bg-white border-2 hover:border-green-300 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <useCase.icon className="h-8 w-8 text-blue-600 mr-3" />
                    <CardTitle className="text-xl">{useCase.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-sm font-semibold text-red-600 mb-2">AVANT eMulog</div>
                    <div className="text-gray-700 bg-red-50 p-3 rounded-lg">
                      {useCase.before}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold text-green-600 mb-2">APRÈS eMulog</div>
                    <div className="text-gray-700 bg-green-50 p-3 rounded-lg">
                      {useCase.after}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                      {useCase.improvement}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Ils Ont Transformé Leur Activité
            </h2>
            <p className="text-xl text-blue-100">
              Plus de 500 sociétés de fret nous font confiance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-blue-200">{testimonial.position}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à Révolutionner Votre Société de Fret ?
          </h2>
          <p className="text-xl mb-12 text-blue-100">
            Rejoignez les centaines d'entreprises qui ont déjà transformé leur activité avec eMulog. 
            Commencez votre analyse gratuite dès maintenant.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <Link href="/competitive-demo">
              <Button className="w-full bg-white text-purple-600 hover:bg-blue-50 h-16 text-lg font-semibold">
                <Target className="mr-2 h-5 w-5" />
                Analyse Concurrentielle
              </Button>
            </Link>
            <Link href="/ai-maturity">
              <Button className="w-full bg-white text-purple-600 hover:bg-blue-50 h-16 text-lg font-semibold">
                <Award className="mr-2 h-5 w-5" />
                Maturité IA
              </Button>
            </Link>
            <Link href="/scenario-simulator">
              <Button className="w-full bg-white text-purple-600 hover:bg-blue-50 h-16 text-lg font-semibold">
                <PlayCircle className="mr-2 h-5 w-5" />
                Simulation Scénarios
              </Button>
            </Link>
            <Link href="/ai-automation">
              <Button className="w-full bg-white text-purple-600 hover:bg-blue-50 h-16 text-lg font-semibold">
                <Rocket className="mr-2 h-5 w-5" />
                Automatisation IA
              </Button>
            </Link>
          </div>
          
          <p className="text-blue-200">
            ✅ Analyse gratuite • ✅ Résultats immédiats • ✅ Sans engagement
          </p>
        </div>
      </section>
    </div>
  );
}
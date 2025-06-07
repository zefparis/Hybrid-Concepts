import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  ArrowRight, 
  Zap, 
  Globe, 
  TrendingUp, 
  Shield, 
  Clock,
  BarChart3,
  Truck,
  Anchor,
  Plane,
  Play,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import containerShipImage from "@assets/dep_1749321248969.jpg";

const features = [
  {
    icon: Zap,
    title: "IA Révolutionnaire",
    description: "Algorithmes propriétaires d'optimisation logistique autonome"
  },
  {
    icon: Globe,
    title: "Multimodal Global",
    description: "Maritime, terrestre, aérien - Une plateforme unifiée"
  },
  {
    icon: TrendingUp,
    title: "ROI Immédiat",
    description: "Réduction des coûts de 35% dès le premier mois"
  },
  {
    icon: Shield,
    title: "Sécurité Enterprise",
    description: "Conformité internationale et protection des données"
  }
];

const stats = [
  { value: "500M+", label: "€ de marchandises optimisées" },
  { value: "10,000+", label: "Routes optimisées quotidiennement" },
  { value: "35%", label: "Réduction moyenne des coûts" },
  { value: "99.9%", label: "Disponibilité de la plateforme" }
];

const testimonials = [
  {
    quote: "Hybrid Concept a transformé notre chaîne logistique. L'IA prédit et optimise mieux que nos experts.",
    author: "Marie Dubois",
    role: "Directrice Logistique, LogiCorp International"
  },
  {
    quote: "ROI de 300% en 6 mois. Cette technologie révolutionne l'industrie du transport maritime.",
    author: "Jean-Pierre Martin",
    role: "CEO, Atlantic Shipping Group"
  }
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    setLocation("/dashboard");
  };

  const handleDemo = () => {
    setLocation("/transformation-demo");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={containerShipImage} 
            alt="Cargo maritime moderne"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-transparent"></div>
        </div>

        {/* Content */}
        <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <Badge className="mb-6 bg-blue-600/20 text-blue-100 border-blue-400/30 px-4 py-2 text-sm backdrop-blur-sm">
              <Zap className="w-4 h-4 mr-2" />
              Révolution IA en Logistique
            </Badge>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Hybrid Concept
              </span>
              <br />
              <span className="text-4xl md:text-5xl text-gray-100">
                L'Avenir de la Logistique
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
              Plateforme SaaS révolutionnaire alimentée par l'IA pour l'optimisation 
              multimodale des chaînes d'approvisionnement globales
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
                onClick={handleGetStarted}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Accéder au Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold"
                onClick={handleDemo}
              >
                <Play className="w-5 h-5 mr-2" />
                Voir la Démo
              </Button>
            </div>

            {/* Key Features Pills */}
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                <Anchor className="w-4 h-4 mr-1" />
                Maritime
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                <Truck className="w-4 h-4 mr-1" />
                Terrestre
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                <Plane className="w-4 h-4 mr-1" />
                Aérien
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                <Zap className="w-4 h-4 mr-1" />
                IA Autonome
              </Badge>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Hybrid Concept ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme tout-en-un qui révolutionne la gestion logistique 
              avec des technologies d'IA de pointe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Témoignages Clients
            </h2>
            <p className="text-xl text-gray-600">
              Des leaders de l'industrie nous font confiance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <blockquote className="text-lg text-gray-700 mb-4 italic">
                        "{testimonial.quote}"
                      </blockquote>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.author}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à Révolutionner Votre Logistique ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Rejoignez les leaders de l'industrie qui transforment déjà 
            leur chaîne d'approvisionnement avec Hybrid Concept
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={handleGetStarted}
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Commencer Maintenant
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              onClick={() => setLocation("/subscription-plans")}
            >
              <Clock className="w-5 h-5 mr-2" />
              Voir les Tarifs
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-white">
              <div>
                <div className="font-semibold">Site Web</div>
                <div className="text-blue-100">www.hybridconc.com</div>
              </div>
              <div>
                <div className="font-semibold">Contact Commercial</div>
                <div className="text-blue-100">bbogaerts@hybridconc.com</div>
              </div>
              <div>
                <div className="font-semibold">Benoît Bogaerts, Chairman</div>
                <div className="text-blue-100">+27 727 768 777</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
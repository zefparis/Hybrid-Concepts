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

  const aiAgents = [
    {
      icon: Brain,
      title: "Agent Orchestrateur Maître",
      description: "IA Claude Sonnet-4 qui coordonne et optimise l'ensemble des agents spécialisés",
      color: "bg-purple-600",
      role: "Chef d'Orchestre IA"
    },
    {
      icon: Target,
      title: "Agent Cotation Intelligente",
      description: "Spécialisé dans l'analyse tarifaire multi-transporteurs et optimisation des routes",
      color: "bg-blue-600",
      role: "Expert Pricing"
    },
    {
      icon: Shield,
      title: "Agent Évaluation Risques",
      description: "Analyse géopolitique, météo, et risques logistiques en temps réel",
      color: "bg-red-600",
      role: "Analyste Risques"
    },
    {
      icon: Globe,
      title: "Agent Douanes & Compliance",
      description: "Maîtrise réglementaire internationale et génération automatique de documents",
      color: "bg-green-600",
      role: "Expert Douanier"
    },
    {
      icon: TrendingUp,
      title: "Agent Optimisation Routes",
      description: "Calculs avancés de trajets multimodaux et optimisation énergétique",
      color: "bg-orange-600",
      role: "Ingénieur Logistique"
    },
    {
      icon: BarChart3,
      title: "Agent Analytics Prédictive",
      description: "Prévisions de marché, tendances tarifaires et aide à la décision stratégique",
      color: "bg-indigo-600",
      role: "Data Scientist"
    },
    {
      icon: Clock,
      title: "Agent Suivi Temps Réel",
      description: "Monitoring continu des expéditions et alertes proactives automatisées",
      color: "bg-pink-600",
      role: "Superviseur Opérations"
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
      quote: "L'écosystème de 7 agents IA a révolutionné notre activité. L'Orchestrateur Maître coordonne tout parfaitement sans intervention humaine.",
      author: "Marie Dubois",
      position: "DG, LogisFrance SARL",
      rating: 5,
      highlight: "Coordination IA parfaite"
    },
    {
      quote: "Chaque agent IA maîtrise son domaine. L'Agent Cotation et l'Agent Risques travaillent ensemble pour une précision de 99.8%.",
      author: "Jean-Pierre Martin",
      position: "Directeur Ops, TransEurope",
      rating: 5,
      highlight: "99.8% précision multi-agents"
    },
    {
      quote: "L'Agent Analytics Prédictive nous donne un avantage concurrentiel énorme. Nous anticipons les tendances du marché.",
      author: "Sophie Chen",
      position: "CFO, Maritime Solutions",
      rating: 5,
      highlight: "Avantage prédictif IA"
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: "Réception & Analyse",
      description: "L'Orchestrateur Maître reçoit la demande et analyse les besoins logistiques",
      agent: "Orchestrateur",
      time: "0.5 sec",
      color: "bg-purple-500"
    },
    {
      step: 2,
      title: "Coordination Multi-Agents",
      description: "Activation simultanée des agents Cotation, Risques, Douanes selon la complexité",
      agent: "Coordination",
      time: "1-2 sec",
      color: "bg-blue-500"
    },
    {
      step: 3,
      title: "Traitement Spécialisé",
      description: "Chaque agent IA traite sa spécialité en parallèle avec expertise métier",
      agent: "Spécialistes",
      time: "2-3 sec",
      color: "bg-green-500"
    },
    {
      step: 4,
      title: "Synthèse Intelligente",
      description: "L'Orchestrateur compile et optimise toutes les réponses en solution unique",
      agent: "Synthèse",
      time: "1 sec",
      color: "bg-orange-500"
    },
    {
      step: 5,
      title: "Livraison Instantanée",
      description: "Solution complète avec cotations, documentation et suivi automatique",
      agent: "Livraison",
      time: "0.5 sec",
      color: "bg-pink-500"
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
              <span className="block text-yellow-300">Écosystème IA Multi-Agents</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal mt-4">
                Révolution Logistique Autonome
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-blue-100">
              Premier <strong>écosystème d'IA orchestrée</strong> avec 7 agents spécialisés pilotés par 
              un <strong>Orchestrateur Maître</strong>. Chaque agent IA maîtrise une expertise métier 
              pour une automatisation logistique totale en 30 jours.
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
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-300">7 Agents IA</div>
                <div className="text-blue-100">Spécialisés</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-300">30 sec</div>
                <div className="text-blue-100">Orchestration</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-300">180%</div>
                <div className="text-blue-100">ROI 24 mois</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-300">99.8%</div>
                <div className="text-blue-100">Précision IA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-purple-600/30 text-purple-200 border-purple-400/30 text-lg px-6 py-2">
              🤖 Écosystème IA Multi-Agents
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              7 Agents IA Spécialisés + 1 Orchestrateur Maître
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Chaque agent IA maîtrise une expertise métier spécifique. L'Orchestrateur Maître 
              coordonne leurs actions pour une automatisation logistique totale sans intervention humaine.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {aiAgents.map((agent, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                <CardHeader className="pb-3">
                  <div className={`w-14 h-14 ${agent.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                    <agent.icon className="h-7 w-7 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs text-purple-300 border-purple-400/30 mb-2 w-fit">
                    {agent.role}
                  </Badge>
                  <CardTitle className="text-lg text-white leading-tight">{agent.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-sm leading-relaxed">
                    {agent.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/30">
              <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Orchestrateur Maître en Action</h3>
              <p className="text-gray-300 max-w-3xl mx-auto mb-6">
                L'Agent Orchestrateur analyse chaque demande logistique, répartit les tâches aux agents spécialisés, 
                coordonne leurs réponses et synthétise la solution optimale en temps réel.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-400">5 sec</div>
                  <div className="text-sm text-gray-400">Coordination agents</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">100%</div>
                  <div className="text-sm text-gray-400">Automatisation</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">24/7</div>
                  <div className="text-sm text-gray-400">Supervision IA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Écosystème IA Multi-Agents : Résultats Révolutionnaires
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez comment nos 7 agents IA spécialisés transforment radicalement l'efficacité logistique
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

      {/* Workflow Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-600/10 text-blue-600 border-blue-200 text-lg px-6 py-2">
              ⚡ Workflow IA Multi-Agents
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              5 Étapes, 5 Secondes : Orchestration IA en Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez comment nos agents IA collaborent en temps réel pour traiter vos demandes logistiques
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {workflowSteps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full border-2 hover:border-blue-300 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                      <span className="text-2xl font-bold text-white">{step.step}</span>
                    </div>
                    <Badge variant="outline" className="mb-3 text-xs">
                      {step.time}
                    </Badge>
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                    <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {step.agent}
                    </div>
                  </CardContent>
                </Card>
                {index < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Résultat : 5 Secondes Chrono</h3>
              <p className="text-gray-700 text-lg mb-6">
                Pendant que vos concurrents passent 40 minutes sur une cotation, 
                nos 7 agents IA orchestrés livrent une solution complète en 5 secondes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">5 sec</div>
                  <div className="text-gray-600">vs 40 min traditionnel</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">99.8%</div>
                  <div className="text-gray-600">Précision multi-agents</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">0%</div>
                  <div className="text-gray-600">Intervention humaine</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Écosystème IA Multi-Agents : Témoignages Clients
            </h2>
            <p className="text-xl text-blue-100">
              Plus de 500 sociétés de fret ont adopté notre orchestration IA
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <Badge className="mb-4 bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                    {testimonial.highlight}
                  </Badge>
                  <blockquote className="text-lg mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-lg">{testimonial.author}</div>
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
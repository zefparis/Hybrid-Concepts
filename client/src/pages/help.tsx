import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MessageCircle, 
  Book, 
  Video, 
  Download,
  ExternalLink,
  HelpCircle,
  FileText,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  Truck,
  BarChart3,
  Settings,
  Shield,
  CreditCard
} from "lucide-react";

const faqData = [
  {
    category: "Général",
    icon: HelpCircle,
    questions: [
      {
        question: "Comment créer une nouvelle cotation?",
        answer: "Accédez à la section AI Orchestrator, saisissez les détails de votre expédition (origine, destination, marchandise) et notre IA génèrera automatiquement les meilleures cotations disponibles.",
      },
      {
        question: "Comment suivre mes expéditions?",
        answer: "Utilisez la page Tracking pour rechercher vos expéditions par numéro de référence ou de suivi. Vous pouvez également configurer des alertes automatiques.",
      },
      {
        question: "Quels modes de transport sont supportés?",
        answer: "Nous supportons tous les modes: maritime, aérien, terrestre, ferroviaire et multimodal. Notre IA sélectionne automatiquement le mode optimal selon vos critères.",
      },
    ]
  },
  {
    category: "Facturation",
    icon: CreditCard,
    questions: [
      {
        question: "Comment fonctionne la facturation?",
        answer: "La facturation est basée sur l'utilisation mensuelle. Vous payez uniquement pour les cotations acceptées et les expéditions traitées.",
      },
      {
        question: "Puis-je changer de plan à tout moment?",
        answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis les paramètres de facturation.",
      },
      {
        question: "Y a-t-il des frais cachés?",
        answer: "Non, tous nos tarifs sont transparents. Aucun frais de setup, d'activation ou de résiliation.",
      },
    ]
  },
  {
    category: "Sécurité",
    icon: Shield,
    questions: [
      {
        question: "Mes données sont-elles sécurisées?",
        answer: "Oui, nous utilisons le chiffrement AES-256 et respectons les standards GDPR. Vos données sont stockées dans des centres de données certifiés ISO 27001.",
      },
      {
        question: "Comment configurer l'authentification 2FA?",
        answer: "Accédez à Paramètres > Sécurité et activez l'authentification à deux facteurs. Vous pouvez utiliser Google Authenticator ou SMS.",
      },
      {
        question: "Qui a accès à mes données?",
        answer: "Seuls les utilisateurs autorisés de votre organisation ont accès à vos données. Nous ne partageons jamais vos informations avec des tiers.",
      },
    ]
  },
  {
    category: "API & Intégrations",
    icon: Settings,
    questions: [
      {
        question: "Comment intégrer l'API dans mon système?",
        answer: "Consultez notre documentation API complète. Nous fournissons des SDKs pour les langages populaires et des webhooks pour les mises à jour en temps réel.",
      },
      {
        question: "Y a-t-il des limites sur l'API?",
        answer: "Les limites dépendent de votre plan. Le plan Pro inclut 10,000 appels API/mois. Pour des besoins plus importants, contactez-nous.",
      },
      {
        question: "Puis-je tester l'API gratuitement?",
        answer: "Oui, nous fournissons un environnement de test avec des clés API de sandbox pour tous les plans.",
      },
    ]
  },
];

const tutorialsData = [
  {
    title: "Démarrage rapide - Première cotation",
    duration: "5 min",
    type: "video",
    level: "Débutant",
    description: "Apprenez à créer votre première cotation avec l'IA"
  },
  {
    title: "Configuration avancée du tracking",
    duration: "8 min",
    type: "article",
    level: "Intermédiaire",
    description: "Configurez le suivi automatisé et les alertes"
  },
  {
    title: "Optimisation des routes multimodales",
    duration: "12 min",
    type: "video",
    level: "Avancé",
    description: "Maximisez l'efficacité avec l'IA de routage"
  },
  {
    title: "Intégration API complète",
    duration: "15 min",
    type: "guide",
    level: "Développeur",
    description: "Guide technique pour l'intégration API"
  },
];

export default function Help() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Général");

  const filteredFAQ = faqData.find(cat => cat.category === selectedCategory)?.questions.filter(
    q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
         q.answer.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Aide & Support" />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Comment pouvons-nous vous aider?</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions ou contactez notre équipe d'experts
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher dans l'aide..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">Chat en direct</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Support immédiat 24/7</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Video className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Tutoriels vidéo</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Guides étape par étape</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Book className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold">Documentation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Guides techniques complets</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Phone className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <h3 className="font-semibold">Contact direct</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Parler à un expert</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="tutorials">Tutoriels</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Category Sidebar */}
              <div className="space-y-2">
                <h3 className="font-semibold mb-3">Catégories</h3>
                {faqData.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.category}
                      variant={selectedCategory === category.category ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.category)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.category}
                    </Button>
                  );
                })}
              </div>

              {/* FAQ Content */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedCategory}</h3>
                  <Badge variant="secondary">{filteredFAQ.length} questions</Badge>
                </div>
                
                {filteredFAQ.map((faq, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutorialsData.map((tutorial, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-base">{tutorial.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{tutorial.level}</Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            {tutorial.duration}
                          </div>
                        </div>
                      </div>
                      {tutorial.type === "video" && <Video className="h-5 w-5 text-blue-500" />}
                      {tutorial.type === "article" && <FileText className="h-5 w-5 text-green-500" />}
                      {tutorial.type === "guide" && <Book className="h-5 w-5 text-purple-500" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{tutorial.description}</p>
                    <Button className="w-full">
                      Commencer
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Guide de démarrage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Configuration initiale et premières étapes
                  </p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-500" />
                    Guide logistique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Meilleures pratiques et optimisations
                  </p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    API Reference
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Documentation technique complète
                  </p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-purple-500" />
                    Ressources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Templates et exemples de code
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Paramétrage avancé du système
                  </p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    Sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Guides de sécurité et conformité
                  </p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations de contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-gray-600">support@hybridconc.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Téléphone</div>
                      <div className="text-sm text-gray-600">+27 72 776 8777</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="font-medium">Heures d'ouverture</div>
                      <div className="text-sm text-gray-600">Lun-Ven 8h-18h (SAST)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Statut du support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Système principal</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Opérationnel</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>API de tracking</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Opérationnel</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Chat support</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">En ligne</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Temps de réponse moyen</span>
                    <span className="text-sm font-medium">&lt; 15 min</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Emergency Contact */}
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400">Support d'urgence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600 dark:text-red-400 mb-4">
                  Pour les urgences critiques affectant vos opérations logistiques:
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="destructive">
                    <Phone className="h-4 w-4 mr-2" />
                    Appel d'urgence: +27 72 776 8777
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat prioritaire
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
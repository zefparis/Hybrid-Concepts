import { useState } from "react";
import { Check, X, Zap, Crown, Rocket, Building2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

interface BasePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: any;
  color: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
  premium?: boolean;
}

interface YearlyPlan extends BasePlan {
  originalPrice: number;
  savings: number;
}

type Plan = BasePlan | YearlyPlan;

const getPlans = (t: any) => ({
  monthly: [
    {
      id: "starter",
      name: t("subscriptionPlans.starter.name"),
      description: t("subscriptionPlans.starter.description"),
      price: 99,
      icon: Zap,
      color: "blue",
      features: t("subscriptionPlans.starter.features"),
      limitations: t("subscriptionPlans.starter.limitations")
    },
    {
      id: "professional",
      name: t("subscriptionPlans.professional.name"),
      description: t("subscriptionPlans.professional.description"),
      price: 299,
      icon: Crown,
      color: "purple",
      popular: true,
      features: t("subscriptionPlans.professional.features"),
      limitations: t("subscriptionPlans.professional.limitations")
    },
    {
      id: "enterprise",
      name: t("subscriptionPlans.enterprise.name"),
      description: t("subscriptionPlans.enterprise.description"),
      price: 799,
      icon: Building2,
      color: "gold",
      features: t("subscriptionPlans.enterprise.features"),
      limitations: t("subscriptionPlans.enterprise.limitations")
    },
    {
      id: "ai-revolution",
      name: t("subscriptionPlans.ultimate.name"),
      description: t("subscriptionPlans.ultimate.description"),
      price: 1499,
      icon: Rocket,
      color: "gradient",
      premium: true,
      features: t("subscriptionPlans.ultimate.features"),
      limitations: t("subscriptionPlans.ultimate.limitations")
    }
  ],
  yearly: [
    {
      id: "starter",
      name: t("subscriptionPlans.starter.name"),
      description: t("subscriptionPlans.starter.description"),
      price: 990,
      originalPrice: 1188,
      savings: 198,
      icon: Zap,
      color: "blue",
      features: t("subscriptionPlans.starter.features"),
      limitations: t("subscriptionPlans.starter.limitations")
    },
    {
      id: "professional",
      name: "Professional",
      description: "Ideal for growing logistics companies",
      price: 2990,
      originalPrice: 3588,
      savings: 598,
      icon: Crown,
      color: "purple",
      popular: true,
      features: [
        "Up to 500 shipments/month",
        "Advanced AI optimization",
        "Real-time tracking",
        "Priority support",
        "Advanced analytics",
        "10 user accounts",
        "API access",
        "Custom workflows",
        "Multi-modal routing",
        "Carbon footprint tracking"
      ],
      limitations: [
        "Limited to 10 integrations",
        "Standard SLA"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large-scale logistics operations",
      price: 7990,
      originalPrice: 9588,
      savings: 1598,
      icon: Building2,
      color: "gold",
      features: [
        "Unlimited shipments",
        "AI-powered automation",
        "Real-time global tracking",
        "24/7 dedicated support",
        "Custom analytics",
        "Unlimited users",
        "Full API access",
        "Custom integrations",
        "White-label options",
        "Advanced security",
        "SLA guarantees",
        "Custom training"
      ],
      limitations: []
    },
    {
      id: "ai-revolution",
      name: "AI Revolution",
      description: "Next-generation AI logistics platform",
      price: 14990,
      originalPrice: 17988,
      savings: 2998,
      icon: Rocket,
      color: "gradient",
      premium: true,
      features: [
        "Everything in Enterprise",
        "Proprietary AI algorithms",
        "Predictive analytics",
        "Autonomous optimization",
        "Custom AI model training",
        "Advanced machine learning",
        "Quantum logistics optimization",
        "Dedicated AI specialists",
        "Custom AI development",
        "Research & development access"
      ],
      limitations: []
    }
  ]
});

const addOns = [
  {
    name: "Extra API Calls",
    description: "Additional 10,000 API calls per month",
    price: 49
  },
  {
    name: "Priority Support",
    description: "24/7 premium support with 1-hour response time",
    price: 199
  },
  {
    name: "Custom Integration",
    description: "Dedicated integration with your existing systems",
    price: 999
  },
  {
    name: "AI Training",
    description: "Custom AI model training for your specific use case",
    price: 2999
  }
];

export default function SubscriptionPlans() {
  const { t } = useTranslation();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("professional");

  const plans = getPlans(t);
  const currentPlans = isYearly ? plans.yearly : plans.monthly;

  const getColorClasses = (color: string, isSelected: boolean = false) => {
    const baseClasses = {
      blue: isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200",
      purple: isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200", 
      gold: isSelected ? "border-yellow-500 bg-yellow-50" : "border-gray-200",
      gradient: isSelected ? "border-gradient-to-r from-purple-500 to-pink-500 bg-gradient-to-r from-purple-50 to-pink-50" : "border-gray-200"
    };
    return baseClasses[color as keyof typeof baseClasses] || baseClasses.blue;
  };

  const getIconColor = (color: string) => {
    const iconColors = {
      blue: "text-blue-600",
      purple: "text-purple-600",
      gold: "text-yellow-600",
      gradient: "text-purple-600"
    };
    return iconColors[color as keyof typeof iconColors] || iconColors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("subscriptionPlans.title")}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("subscriptionPlans.subtitle")}
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              {t("subscriptionPlans.monthlyBilling")}
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-purple-600"
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              {t("subscriptionPlans.yearlyBilling")}
            </span>
            {isYearly && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                {t("subscriptionPlans.save")} 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {currentPlans.map((plan: any) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-lg cursor-pointer ${
                  getColorClasses(plan.color, isSelected)
                } ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white px-3 py-1">
                      Plus Populaire
                    </Badge>
                  </div>
                )}
                
                {plan.premium && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center ${getIconColor(plan.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-gray-900">€{plan.price.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">/{isYearly ? 'an' : 'mois'}</span>
                    </div>
                    
                    {isYearly && 'savings' in plan && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500 line-through">
                          €{'originalPrice' in plan ? plan.originalPrice.toLocaleString() : ''}
                        </span>
                        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                          {t("subscriptionPlans.save")} €{'savings' in plan ? plan.savings : 0}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                    
                    {plan.limitations.map((limitation: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <X className="w-4 h-4 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="px-6 pb-6">
                  <Button 
                    className={`w-full ${
                      plan.premium 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : plan.popular 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                    size="lg"
                  >
                    {plan.id === 'enterprise' || plan.id === 'ai-revolution' 
                      ? 'Contacter les Ventes' 
                      : 'Commencer Maintenant'
                    }
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Add-ons Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Options Supplémentaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">{addon.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{addon.description}</p>
                <div className="text-2xl font-bold text-purple-600">€{addon.price}/mois</div>
                <Button variant="outline" className="mt-4 w-full">
                  Ajouter
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Contact */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'une Solution Sur-Mesure ?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Contactez notre équipe pour discuter de vos besoins spécifiques et obtenir un devis personnalisé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Contacter les Ventes
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-purple-600"
            >
              Demander une Démo
            </Button>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">www.hybridconc.com</div>
              <div className="opacity-90">Site web officiel</div>
            </div>
            <div>
              <div className="text-2xl font-bold">bbogaerts@hybridconc.com</div>
              <div className="opacity-90">Contact commercial</div>
            </div>
            <div>
              <div className="text-2xl font-bold">+27 727 768 777</div>
              <div className="opacity-90">Benoît Bogaerts, Chairman</div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Questions Fréquentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                Les changements prennent effet immédiatement.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">
                Y a-t-il une période d'essai gratuite ?
              </h3>
              <p className="text-gray-600">
                Oui, nous offrons 14 jours d'essai gratuit sur tous nos plans 
                pour que vous puissiez tester notre plateforme.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">
                Quels modes de paiement acceptez-vous ?
              </h3>
              <p className="text-gray-600">
                Nous acceptons toutes les cartes de crédit principales, 
                virements bancaires et PayPal pour votre commodité.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">
                Le support technique est-il inclus ?
              </h3>
              <p className="text-gray-600">
                Oui, tous nos plans incluent le support technique. 
                Les plans Enterprise bénéficient d'un support prioritaire 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
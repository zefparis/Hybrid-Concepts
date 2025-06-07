import { Card, CardContent } from "@/components/ui/card";
import { Truck, PiggyBank, Clock, PieChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Envois en Cours",
      value: metrics?.activeShipments || 0,
      change: "+12% vs. mois dernier",
      icon: Truck,
      color: "ia-solution-blue",
      bgColor: "bg-blue-50",
    },
    {
      title: "Économies Réalisées",
      value: `€${metrics?.totalSavings?.toLocaleString() || '0'}`,
      change: "+8.5% ce mois",
      icon: PiggyBank,
      color: "ia-solution-green",
      bgColor: "bg-green-50",
    },
    {
      title: "Cotations en Attente",
      value: metrics?.pendingQuotes || 0,
      change: "Réponse sous 4h",
      icon: Clock,
      color: "ia-solution-yellow",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Performance Globale",
      value: `${metrics?.performanceScore || 0}%`,
      change: "Excellente",
      icon: PieChart,
      color: "ia-solution-purple",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={`border-l-4 border-l-${card.color.split('-')[1]}-500`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-ia-solution-dark">{card.value}</p>
                  <p className="text-sm text-green-600">{card.change}</p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`text-${card.color.split('-')[1]}-600 text-xl w-6 h-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

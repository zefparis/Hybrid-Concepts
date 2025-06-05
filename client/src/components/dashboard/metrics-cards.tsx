import { Card, CardContent } from "@/components/ui/card";
import { Truck, PiggyBank, Clock, PieChart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { DashboardMetrics } from "@/types";

export function MetricsCards() {
  const { t } = useTranslation();
  
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricsData = [
    {
      title: t("activeShipments"),
      value: metrics?.activeShipments || 0,
      change: "+12% vs. mois dernier",
      icon: Truck,
      color: "emulog-blue",
      bgColor: "bg-emulog-blue",
      textColor: "text-emulog-blue",
    },
    {
      title: t("savingsRealized"),
      value: `€${metrics?.totalSavings?.toLocaleString() || 0}`,
      change: "+8.5% ce mois",
      icon: PiggyBank,
      color: "emulog-green",
      bgColor: "bg-emulog-green",
      textColor: "text-emulog-green",
    },
    {
      title: t("pendingQuotes"),
      value: metrics?.pendingQuotes || 0,
      change: t("responseTime"),
      icon: Clock,
      color: "emulog-yellow",
      bgColor: "bg-emulog-yellow",
      textColor: "text-emulog-yellow",
    },
    {
      title: t("globalPerformance"),
      value: `${metrics?.performance || 0}%`,
      change: t("excellent"),
      icon: PieChart,
      color: "emulog-purple",
      bgColor: "bg-emulog-purple",
      textColor: "text-emulog-purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className={`border-l-4 border-l-${metric.color}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-3xl font-bold text-emulog-dark">{metric.value}</p>
                  <p className={`text-sm ${metric.textColor}`}>{metric.change}</p>
                </div>
                <div className={`w-12 h-12 ${metric.bgColor} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                  <Icon className={`${metric.textColor} w-6 h-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

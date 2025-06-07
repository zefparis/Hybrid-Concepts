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
      change: t("metricsLastMonthChange", "+12% vs. last month"),
      icon: Truck,
      color: "emulog-blue",
      bgColor: "bg-emulog-blue",
      textColor: "text-emulog-blue",
    },
    {
      title: t("savingsRealized"),
      value: `€${metrics?.totalSavings?.toLocaleString() || 0}`,
      change: t("metricsThisMonthChange", "+8.5% this month"),
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{metric.title}</p>
                  <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mt-1">{metric.value}</p>
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1 truncate">{metric.change}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center ml-3">
                  <Icon className="text-blue-600 dark:text-blue-400 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

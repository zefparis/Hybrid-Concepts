import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AnalyticsCharts() {
  const { t } = useTranslation();

  // Mock performance data
  const performanceData = [
    {
      rank: 1,
      name: "Transport Express SA",
      shipments: 47,
      performance: 98.5,
      color: "emulog-green",
    },
    {
      rank: 2,
      name: "Logis Rapid",
      shipments: 32,
      performance: 95.2,
      color: "emulog-blue",
    },
    {
      rank: 3,
      name: "Fret Sécurisé",
      shipments: 28,
      performance: 92.1,
      color: "emulog-yellow",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-emulog-dark">
              Évolution des Coûts
            </CardTitle>
            <Select defaultValue="30">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 derniers jours</SelectItem>
                <SelectItem value="90">90 derniers jours</SelectItem>
                <SelectItem value="365">1 an</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mock Chart Area */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Graphique des coûts de transport</p>
              <p className="text-sm text-gray-400 mt-1">Économies: €12,450 ce mois</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-emulog-dark">
              Performance par Transporteur
            </CardTitle>
            <Button variant="link" className="text-emulog-blue">
              {t("viewDetails")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((carrier) => (
              <div
                key={carrier.rank}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-${carrier.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">
                      {carrier.rank}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emulog-dark">
                      {carrier.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {carrier.shipments} expéditions ce mois
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold text-${carrier.color}`}>
                    {carrier.performance}%
                  </p>
                  <p className="text-xs text-gray-500">{t("punctuality")}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

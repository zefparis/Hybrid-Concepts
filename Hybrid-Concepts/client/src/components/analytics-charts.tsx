import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function AnalyticsCharts() {
  const carrierPerformance = [
    { rank: 1, name: "Transport Express SA", shipments: 47, onTimeRate: 98.5, color: "ia-solution-green" },
    { rank: 2, name: "Logis Rapid", shipments: 32, onTimeRate: 95.2, color: "ia-solution-blue" },
    { rank: 3, name: "Fret Sécurisé", shipments: 28, onTimeRate: 92.1, color: "ia-solution-yellow" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Cost Evolution Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-ia-solution-dark">
              Évolution des Coûts
            </CardTitle>
            <Select defaultValue="30d">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">30 derniers jours</SelectItem>
                <SelectItem value="90d">90 derniers jours</SelectItem>
                <SelectItem value="1y">1 an</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mock Chart Area */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <TrendingDown className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">Graphique des coûts de transport</p>
              <p className="text-sm text-green-600 mt-1">Économies: €12,450 ce mois</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carrier Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-ia-solution-dark">
              Performance par Transporteur
            </CardTitle>
            <Button variant="link" size="sm" className="text-ia-solution-blue">
              Voir détails
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {carrierPerformance.map((carrier) => (
              <div key={carrier.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-${carrier.color.split('-')[1]}-500 rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{carrier.rank}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ia-solution-dark">{carrier.name}</p>
                    <p className="text-xs text-gray-500">{carrier.shipments} expéditions ce mois</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold text-${carrier.color.split('-')[1]}-600`}>
                    {carrier.onTimeRate}%
                  </p>
                  <p className="text-xs text-gray-500">Ponctualité</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

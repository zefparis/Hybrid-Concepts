import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, Download, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { ShipmentWithDetails } from "@/types";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export function ShipmentsTable() {
  const { t, i18n } = useTranslation();
  
  const { data: shipments, isLoading } = useQuery<ShipmentWithDetails[]>({
    queryKey: ["/api/shipments"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_transit":
        return "bg-emulog-green text-white";
      case "pending":
      case "created":
        return "bg-emulog-yellow text-white";
      case "delivered":
        return "bg-emulog-blue text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_transit":
        return t("inTransit");
      case "pending":
      case "created":
        return t("pending");
      case "delivered":
        return t("delivered");
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const locale = i18n.language === 'fr' ? fr : enUS;

  return (
    <Card className="overflow-hidden mb-8">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-emulog-dark">
            {t("currentShipments")}
          </h3>
          <div className="flex items-center space-x-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="in_transit">{t("inTransit")}</SelectItem>
                <SelectItem value="pending">{t("pending")}</SelectItem>
                <SelectItem value="delivered">{t("delivered")}</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="bg-emulog-blue hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              {t("export")}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("reference")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("origin")} → {t("destination")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("carrier")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("status")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("eta")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("cost")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shipments?.map((shipment) => (
              <tr key={shipment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-emulog-dark">
                    {shipment.reference}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t("created")} {format(new Date(shipment.createdAt), 'dd/MM/yyyy', { locale })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-emulog-dark">
                    <div className="flex items-center space-x-2">
                      <span>{shipment.quote.quoteRequest.origin}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span>{shipment.quote.quoteRequest.destination}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-emulog-dark">
                    {shipment.quote.carrier.name}
                  </div>
                  {shipment.quote.carrier.rating && (
                    <div className="text-sm text-gray-500">
                      ⭐ {shipment.quote.carrier.rating}/5
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusColor(shipment.status)}>
                    <div className="w-2 h-2 rounded-full bg-white mr-1"></div>
                    {getStatusLabel(shipment.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-emulog-dark">
                  {shipment.estimatedDelivery
                    ? format(new Date(shipment.estimatedDelivery), 'dd/MM/yyyy HH:mm', { locale })
                    : "-"
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emulog-dark">
                  €{shipment.quote.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button variant="ghost" size="sm" className="text-emulog-blue mr-3">
                    <MapPin className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {shipments && shipments.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {t("showingResults", { start: 1, end: Math.min(10, shipments.length), total: shipments.length })}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Précédent</Button>
              <Button size="sm" className="bg-emulog-blue text-white">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Suivant</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

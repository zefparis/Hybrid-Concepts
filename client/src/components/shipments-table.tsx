import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Eye, Download, ArrowRight } from "lucide-react";

export default function ShipmentsTable() {
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: shipments, isLoading } = useQuery({
    queryKey: ["/api/shipments"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, label: "En Attente", color: "bg-yellow-100 text-yellow-800" },
      in_transit: { variant: "default" as const, label: "En Transit", color: "bg-green-100 text-green-800" },
      delivered: { variant: "success" as const, label: "Livré", color: "bg-blue-100 text-blue-800" },
      cancelled: { variant: "destructive" as const, label: "Annulé", color: "bg-red-100 text-red-800" },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const filteredShipments = statusFilter === "all" 
    ? shipments 
    : shipments?.filter((shipment: any) => shipment.status === statusFilter);

  return (
    <Card className="overflow-hidden mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-emulog-dark">
            Expéditions en Cours
          </h3>
          <div className="flex items-center space-x-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in_transit">En transit</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="bg-emulog-blue hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Référence</TableHead>
                <TableHead>Origine → Destination</TableHead>
                <TableHead>Transporteur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Coût</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments?.length ? (
                filteredShipments.map((shipment: any) => (
                  <TableRow key={shipment.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-emulog-dark">
                          {shipment.reference}
                        </div>
                        <div className="text-sm text-gray-500">
                          Créé le {new Date(shipment.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{shipment.originCity}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{shipment.destinationCity}</span>
                      </div>
                      {shipment.distance && (
                        <div className="text-sm text-gray-500">
                          Distance: {shipment.distance} km
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-emulog-dark">
                        {shipment.carrier?.name || "Non assigné"}
                      </div>
                      {shipment.carrier?.rating && (
                        <div className="text-sm text-gray-500">
                          ⭐ {shipment.carrier.rating}/5
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(shipment.status)}
                    </TableCell>
                    <TableCell>
                      {shipment.estimatedDelivery ? 
                        new Date(shipment.estimatedDelivery).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-emulog-dark">
                        {shipment.cost ? `€${Number(shipment.cost).toLocaleString()}` : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <MapPin className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Aucune expédition trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredShipments?.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de <span className="font-medium">1</span> à{" "}
                <span className="font-medium">{Math.min(10, filteredShipments.length)}</span> sur{" "}
                <span className="font-medium">{filteredShipments.length}</span> expéditions
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">Précédent</Button>
                <Button size="sm" className="bg-emulog-blue">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">Suivant</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

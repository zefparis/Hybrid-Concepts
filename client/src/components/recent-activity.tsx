import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Check, FileText, Truck } from "lucide-react";

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/dashboard/activities"],
  });

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'quote_accepted':
        return Check;
      case 'document_uploaded':
        return FileText;
      case 'shipment_created':
        return Truck;
      default:
        return FileText;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'quote_accepted':
        return 'emulog-green';
      case 'document_uploaded':
        return 'emulog-blue';
      case 'shipment_created':
        return 'emulog-yellow';
      default:
        return 'emulog-blue';
    }
  };

  const getActivityMessage = (activity: any) => {
    switch (activity.action) {
      case 'quote_accepted':
        return `Cotation acceptée pour ${activity.details?.reference}`;
      case 'document_uploaded':
        return `Nouveau document ajouté: ${activity.details?.name}`;
      case 'shipment_created':
        return `Nouvelle expédition créée: ${activity.details?.reference}`;
      default:
        return activity.action;
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-emulog-dark">
            Activité Récente
          </CardTitle>
          <Button variant="link" size="sm" className="text-emulog-blue">
            Voir tout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.length ? (
            activities.map((activity: any) => {
              const Icon = getActivityIcon(activity.action);
              const color = getActivityColor(activity.action);
              const borderColor = `border-l-${color.split('-')[1]}-500`;
              const bgColor = `bg-${color.split('-')[1]}-50`;
              
              return (
                <div 
                  key={activity.id} 
                  className={`flex items-start space-x-3 p-3 border-l-2 ${borderColor} ${bgColor}`}
                >
                  <div className={`w-8 h-8 bg-${color.split('-')[1]}-500 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className="text-white text-sm w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emulog-dark">
                      {getActivityMessage(activity)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune activité récente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

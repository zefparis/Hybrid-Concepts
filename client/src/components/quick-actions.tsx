import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Search } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Nouvelle Demande de Cotation",
      icon: Plus,
      color: "emulog-blue",
      bgColor: "bg-blue-50",
      onClick: () => console.log("Create quote request"),
    },
    {
      title: "Importer Documents",
      icon: Upload,
      color: "emulog-green",
      bgColor: "bg-green-50",
      onClick: () => console.log("Upload document"),
    },
    {
      title: "Suivre un Envoi",
      icon: Search,
      color: "emulog-purple",
      bgColor: "bg-purple-50",
      onClick: () => console.log("Track shipment"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-emulog-dark">
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start h-auto p-3 border border-gray-200 hover:bg-gray-50"
              onClick={action.onClick}
            >
              <div className={`w-8 h-8 ${action.bgColor} rounded flex items-center justify-center mr-3`}>
                <Icon className={`text-${action.color.split('-')[1]}-600 w-4 h-4`} />
              </div>
              <span className="text-sm font-medium">{action.title}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

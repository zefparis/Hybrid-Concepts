import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FileText, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export function RecentActivity() {
  const { t, i18n } = useTranslation();
  
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "create":
        return Check;
      case "update":
        return Truck;
      default:
        return FileText;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "create":
        return "emulog-green";
      case "update":
        return "emulog-blue";
      default:
        return "emulog-yellow";
    }
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t("recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-emulog-dark">
            {t("recentActivity")}
          </CardTitle>
          <Button variant="link" className="text-emulog-blue">
            {t("viewAll")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map((activity) => {
            const Icon = getActivityIcon(activity.action);
            const color = getActivityColor(activity.action);
            const locale = i18n.language === 'fr' ? fr : enUS;
            
            return (
              <div
                key={activity.id}
                className={`flex items-start space-x-3 p-3 border-l-2 border-l-${color} bg-${color} bg-opacity-5`}
              >
                <div className={`w-8 h-8 bg-${color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className="text-white w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-emulog-dark">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.createdAt), { 
                      addSuffix: true, 
                      locale 
                    })} • {t("by")} {activity.user.firstName} {activity.user.lastName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Search, Route, MapPin, Ship, Truck, Plane } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

export function QuickActions() {
  const { t } = useTranslation();

  const actions = [
    {
      icon: Plus,
      label: t("newQuoteRequest"),
      href: "/quotes/new",
      color: "ia-solution-blue",
    },
    {
      icon: Route,
      label: "Gestion Routes Multimodales",
      href: "/route-management",
      color: "ia-solution-green",
    },
    {
      icon: Search,
      label: "Tracking Avancé",
      href: "/advanced-tracking",
      color: "ia-solution-purple",
    },
    {
      icon: Upload,
      label: t("importDocuments"),
      href: "/documents/upload",
      color: "ia-solution-orange",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-ia-solution-dark">
          {t("quickActions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start space-x-3 h-auto p-3"
              >
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Icon className="text-blue-600 w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

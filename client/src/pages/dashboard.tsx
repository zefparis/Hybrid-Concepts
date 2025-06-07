// Header now integrated in TopNavbar
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ShipmentsTable } from "@/components/dashboard/shipments-table";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { DocumentsWidget } from "@/components/dashboard/documents-widget";
import { FloatingChatWidget } from "@/components/chat/floating-chat-widget";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Route, Search, MapPin, Ship } from "lucide-react";

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("dashboardPageTitle", "Dashboard")}</h1>
        <p className="text-gray-600 mt-2">{t("dashboardPageSubtitle", "Overview of your logistics activity")}</p>
      </div>
      
      <MetricsCards />
      
      {/* Nouvelles Fonctionnalités */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">🚀 Nouvelles Fonctionnalités IA</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/route-management">
            <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded">
                  <Route className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Routes Multimodales</h3>
                  <p className="text-sm text-gray-600">Maritime, terrestre, aérienne</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/advanced-tracking">
            <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded">
                  <Search className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Tracking Avancé</h3>
                  <p className="text-sm text-gray-600">APIs temps réel</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/ai-analysis">
            <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Analyse IA</h3>
                  <p className="text-sm text-gray-600">Optimisation intelligente</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/fleet-iot">
            <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded">
                  <Ship className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">IoT Flotte</h3>
                  <p className="text-sm text-gray-600">Monitoring conteneurs</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ShipmentsTable />
          <AnalyticsCharts />
        </div>
        
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity />
          <DocumentsWidget />
        </div>
      </div>
      
      <FloatingChatWidget />
    </div>
  );
}

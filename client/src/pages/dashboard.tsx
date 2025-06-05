import { Header } from "@/components/layout/header";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ShipmentsTable } from "@/components/dashboard/shipments-table";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { DocumentsWidget } from "@/components/dashboard/documents-widget";
import { FloatingChatWidget } from "@/components/chat/floating-chat-widget";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 sm:space-y-6">
      <Header title="Tableau de bord" subtitle="Vue d'ensemble de votre activité logistique" />
      
      <MetricsCards />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          <ShipmentsTable />
          <AnalyticsCharts />
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          <QuickActions />
          <RecentActivity />
          <DocumentsWidget />
        </div>
      </div>
      
      <FloatingChatWidget />
    </div>
  );
}

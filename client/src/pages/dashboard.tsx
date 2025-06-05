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
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title={t("dashboard")} />
      
      <main className="flex-1 overflow-y-auto p-6">
        <MetricsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <QuickActions />
          <RecentActivity />
        </div>

        <ShipmentsTable />
        <AnalyticsCharts />
        <DocumentsWidget />
      </main>
      
      <FloatingChatWidget />
    </div>
  );
}

// Header now integrated in TopNavbar
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("dashboardPageTitle", "Dashboard")}</h1>
        <p className="text-gray-600 mt-2">{t("dashboardPageSubtitle", "Overview of your logistics activity")}</p>
      </div>
      
      <MetricsCards />
      
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

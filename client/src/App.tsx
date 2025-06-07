import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TopNavbar from "@/components/layout/top-navbar";
import { Footer } from "@/components/layout/footer";
import { Suspense } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AIAutomation from "@/pages/ai-automation";
import Quotes from "@/pages/quotes";
import Tracking from "@/pages/tracking";
import Documents from "@/pages/documents";
import Chat from "@/pages/chat";
import Invoicing from "@/pages/invoicing";
import Analytics from "@/pages/analytics";
import ApiDocs from "@/pages/api-docs";
import CompetitiveDemo from "@/pages/competitive-demo";
import MigrationDemo from "@/pages/migration-demo";
import AIMaturity from "@/pages/ai-maturity";
import ScenarioSimulator from "@/pages/scenario-simulator";
import FleetManagement from "@/pages/fleet-management";
import SmartInventory from "@/pages/smart-inventory";
import RiskAssessment from "@/pages/risk-assessment";
import CarbonFootprint from "@/pages/carbon-footprint";
import PartnerPortal from "@/pages/partner-portal";
import APIMarketplace from "@/pages/api-marketplace";
import RouteManagement from "@/pages/route-management";
import AdvancedTracking from "@/pages/advanced-tracking";
import AviationMaritime from "@/pages/aviation-maritime";
import TransformationDemo from "@/pages/transformation-demo";
import "./lib/i18n";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <TopNavbar />
          <main className="flex-1">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <Suspense fallback={<LoadingSpinner />}>
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/ai-automation" component={AIAutomation} />
                  <Route path="/fleet-management" component={FleetManagement} />
                  <Route path="/smart-inventory" component={SmartInventory} />
                  <Route path="/risk-assessment" component={RiskAssessment} />
                  <Route path="/carbon-footprint" component={CarbonFootprint} />
                  <Route path="/partner-portal" component={PartnerPortal} />
                  <Route path="/api-marketplace" component={APIMarketplace} />
                  <Route path="/route-management" component={RouteManagement} />
                  <Route path="/advanced-tracking" component={AdvancedTracking} />
                  <Route path="/aviation-maritime" component={AviationMaritime} />
                  <Route path="/transformation-demo" component={TransformationDemo} />
                  <Route path="/quotes" component={Quotes} />
                  <Route path="/tracking" component={Tracking} />
                  <Route path="/documents" component={Documents} />
                  <Route path="/chat" component={Chat} />
                  <Route path="/invoicing" component={Invoicing} />
                  <Route path="/analytics" component={Analytics} />
                  <Route path="/api-docs" component={ApiDocs} />
                  <Route path="/competitive-demo" component={CompetitiveDemo} />
                  <Route path="/migration-demo" component={MigrationDemo} />
                  <Route path="/ai-maturity" component={AIMaturity} />
                  <Route path="/scenario-simulator" component={ScenarioSimulator} />
                  <Route component={NotFound} />
                </Switch>
              </Suspense>
            </div>
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

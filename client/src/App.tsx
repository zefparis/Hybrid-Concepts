import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
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
import Login from "@/pages/login";
import Landing from "@/pages/landing";
import "./lib/i18n";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

function PublicApp() {
  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/competitive-demo" component={CompetitiveDemo} />
        <Route path="/ai-maturity" component={AIMaturity} />
        <Route path="/scenario-simulator" component={ScenarioSimulator} />
        <Route path="/ai-automation" component={AIAutomation} />
        <Route component={Landing} />
      </Switch>
    </div>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <PublicApp />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8 pt-16 lg:pt-8">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/ai-automation" component={AIAutomation} />
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
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <AuthenticatedApp />
          </Suspense>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

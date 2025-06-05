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
import Quotes from "@/pages/quotes";
import Tracking from "@/pages/tracking";
import Documents from "@/pages/documents";
import Chat from "@/pages/chat";
import Invoicing from "@/pages/invoicing";
import Analytics from "@/pages/analytics";
import "./lib/i18n";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

function LoginForm() {
  // Simplified login form - would implement proper authentication UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Connexion à eMulog
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Veuillez vous connecter pour accéder à votre tableau de bord
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/quotes" component={Quotes} />
        <Route path="/tracking" component={Tracking} />
        <Route path="/documents" component={Documents} />
        <Route path="/chat" component={Chat} />
        <Route path="/invoicing" component={Invoicing} />
        <Route path="/analytics" component={Analytics} />
        <Route component={NotFound} />
      </Switch>
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

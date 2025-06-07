import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  MessageSquare, 
  Calculator, 
  TrendingUp, 
  Settings, 
  LogOut,
  Menu,
  X,
  Truck,
  Brain,
  Globe,
  Target,
  Rocket,
  Award,
  PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "react-i18next";

const getNavigation = (t: any) => [
  { name: t("dashboard"), href: "/", icon: LayoutDashboard },
  { name: t("aiAutomation"), href: "/ai-automation", icon: Brain },
  { name: t("competitiveAnalysis"), href: "/competitive-demo", icon: Target },
  { name: t("migrationDemo"), href: "/migration-demo", icon: Rocket },
  { name: t("aiMaturity"), href: "/ai-maturity", icon: Award },
  { name: t("scenarioSimulator"), href: "/scenario-simulator", icon: PlayCircle },
  { name: t("quotes"), href: "/quotes", icon: FileText },
  { name: t("tracking"), href: "/tracking", icon: Package },
  { name: t("documents"), href: "/documents", icon: FileText },
  { name: t("chat"), href: "/chat", icon: MessageSquare },
  { name: t("invoicing"), href: "/invoicing", icon: Calculator },
  { name: t("analytics"), href: "/analytics", icon: TrendingUp },
  { name: t("apiDocs"), href: "/api-docs", icon: Globe },
];

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const navigation = getNavigation(t);

  const handleLogout = () => {
    logout();
    onItemClick?.();
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Truck className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">eMulog</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                onClick={onItemClick}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
        <div className="flex items-center justify-between mb-3">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-700 dark:text-gray-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("logout", "Logout")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white shadow-md">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent onItemClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent />
      </div>
    </>
  );
}
import { useState } from "react";
import { useLocation } from "wouter";
// Authentication removed
import { cn } from "@/lib/utils";
import { 
  Truck, BarChart3, FileText, MapPin, FolderOpen, MessageCircle, 
  Receipt, TrendingUp, Settings, LogOut, Bot, Bell, Search, 
  Globe, ChevronDown, User, CreditCard, DollarSign, Zap,
  Package, Shield, Leaf, Users, Store, Plane
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { useTranslation } from "react-i18next";

const mainNavigation = [
  { name: "Dashboard", href: "/", icon: BarChart3, key: "dashboard" },
  { name: "AI Orchestrator", href: "/ai-automation", icon: Bot, badge: "AI", key: "aiAutomation" },
  { name: "Fleet Management", href: "/fleet-management", icon: Truck, badge: "IoT", key: "fleetManagement" },
  { name: "Smart Inventory", href: "/smart-inventory", icon: Package, badge: "Smart", key: "smartInventory" },
  { name: "Risk Assessment", href: "/risk-assessment", icon: Shield, badge: "AI", key: "riskAssessment" },
  { name: "Carbon Footprint", href: "/carbon-footprint", icon: Leaf, badge: "ESG", key: "carbonFootprint" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, key: "analytics" },
  { name: "Quotes", href: "/quotes", icon: FileText, badge: 12, key: "quotes" },
  { name: "Tracking", href: "/tracking", icon: MapPin, key: "tracking" },
  { name: "Chat", href: "/chat", icon: MessageCircle, badge: 3, key: "chat" },
];

const enterpriseTools = [
  { name: "Aviation & Maritime", href: "/aviation-maritime", icon: MapPin, badge: "Multi", key: "aviationMaritime" },
  { name: "Partner Portal", href: "/partner-portal", icon: Users, badge: "B2B", key: "partnerPortal" },
  { name: "API Marketplace", href: "/api-marketplace", icon: Store, badge: "Market", key: "apiMarketplace" },
  { name: "Route Management", href: "/route-management", icon: MapPin, badge: "Multi", key: "routeManagement" },
  { name: "Advanced Tracking", href: "/advanced-tracking", icon: Search, badge: "Real-time", key: "advancedTracking" },
  { name: "AI Maturity Assessment", href: "/ai-maturity", icon: Zap, badge: "AI", key: "aiMaturity" },
  { name: "ROI Simulator", href: "/scenario-simulator", icon: BarChart3, badge: "ROI", key: "scenarioSimulator" },
  { name: "Competitive Analysis", href: "/competitive-demo", icon: TrendingUp, key: "competitiveDemo" },
  { name: "Migration Demo", href: "/migration-demo", icon: Bot, key: "migrationDemo" },
  { name: "API Docs", href: "/api-docs", icon: FileText, key: "apiDocs" },
];

export default function TopNavbar() {
  const [location, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const handleNavigation = (href: string) => {
    setLocation(href);
  };

  // Authentication removed - no logout needed

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Hybrid Concept</span>
          </div>

          {/* Main Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {mainNavigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "relative flex items-center space-x-2 px-3 py-2",
                    isActive 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.badge && (
                    <Badge 
                      variant={typeof item.badge === "string" ? "secondary" : "destructive"}
                      className="ml-1 px-1.5 py-0.5 text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}

            {/* Demo Features Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Zap className="w-4 h-4 mr-2" />
                  Demo Features
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>AI Demo Features</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {enterpriseTools.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem 
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 w-64 h-9"
            />
          </div>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Globe className="w-4 h-4 mr-1" />
                {language.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage('en')}>
                🇺🇸 English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('fr')}>
                🇫🇷 Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <NotificationCenter />

          {/* Payment Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <CreditCard className="w-4 h-4 mr-1" />
                <Badge variant="outline" className="ml-1">Pro</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Subscription Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Professional Plan</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-3">Next billing: July 15, 2024</p>
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleNavigation('/invoicing')}
                  >
                    <Receipt className="w-3 h-3 mr-1" />
                    View Invoices
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleNavigation('/invoicing')}
                  >
                    <DollarSign className="w-3 h-3 mr-1" />
                    Billing Settings
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  Settings
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Application Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleNavigation('/invoicing')}
                className="cursor-pointer"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Billing & Plans
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleNavigation('/api-docs')}
                className="cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2" />
                API Documentation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {mainNavigation.slice(0, 6).map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "flex-shrink-0 relative",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-600"
                )}
              >
                <Icon className="w-4 h-4 mr-1" />
                <span className="text-xs">{item.name}</span>
                {item.badge && (
                  <Badge 
                    variant="destructive"
                    className="ml-1 px-1 py-0 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
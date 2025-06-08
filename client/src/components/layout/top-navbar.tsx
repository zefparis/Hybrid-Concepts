import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Truck, BarChart3, FileText, MapPin, MessageCircle, 
  Settings, Bot, Bell, Search, Globe, ChevronDown, 
  User, CreditCard, DollarSign, Zap, Package, Shield, 
  Leaf, Users, Store, Menu, X, Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

// Core navigation items - always visible on desktop
const coreNavigation = [
  { name: "Dashboard", href: "/", icon: BarChart3, key: "dashboard" },
  { name: "AI Orchestrator", href: "/ai-automation", icon: Bot, badge: "AI", key: "aiAutomation" },
  { name: "Fleet Management", href: "/fleet-management", icon: Truck, badge: "IoT", key: "fleetManagement" },
  { name: "Risk Assessment", href: "/risk-assessment", icon: Shield, badge: "AI", key: "riskAssessment" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, key: "analytics" },
];

// Secondary navigation - in dropdown
const secondaryNavigation = [
  { name: "Smart Inventory", href: "/smart-inventory", icon: Package, badge: "Smart", key: "smartInventory" },
  { name: "Carbon Footprint", href: "/carbon-footprint", icon: Leaf, badge: "ESG", key: "carbonFootprint" },
  { name: "Quotes", href: "/quotes", icon: FileText, badge: 12, key: "quotes" },
  { name: "Tracking", href: "/tracking", icon: MapPin, key: "tracking" },
  { name: "Chat", href: "/chat", icon: MessageCircle, badge: 3, key: "chat" },
];

const enterpriseTools = [
  { name: "Transformation Demo", href: "/transformation-demo", icon: Zap, badge: "RÉVOLUTION", key: "transformationDemo" },
  { name: "Aviation & Maritime", href: "/aviation-maritime", icon: MapPin, badge: "Multi", key: "aviationMaritime" },
  { name: "Partner Portal", href: "/partner-portal", icon: Users, badge: "B2B", key: "partnerPortal" },
  { name: "API Marketplace", href: "/api-marketplace", icon: Store, badge: "Market", key: "apiMarketplace" },
  { name: "Route Management", href: "/route-management", icon: MapPin, badge: "Multi", key: "routeManagement" },
  { name: "AI Maturity Assessment", href: "/ai-maturity", icon: Zap, badge: "AI", key: "aiMaturity" },
  { name: "ROI Simulator", href: "/scenario-simulator", icon: BarChart3, badge: "ROI", key: "scenarioSimulator" },
  { name: "Competitive Analysis", href: "/competitive-demo", icon: BarChart3, key: "competitiveDemo" },
  { name: "Migration Demo", href: "/migration-demo", icon: Bot, key: "migrationDemo" },
  { name: "Support Chat", href: "/support", icon: MessageCircle, badge: "Help", key: "supportChat" },
  { name: "API Docs", href: "/api-docs", icon: FileText, key: "apiDocs" },
];

export default function TopNavbar() {
  const [location, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (href: string) => {
    setLocation(href);
    setMobileMenuOpen(false);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Hybrid Concept</span>
            </div>

            {/* Core Navigation - Desktop only */}
            <div className="hidden xl:flex items-center space-x-1">
              {coreNavigation.map((item) => {
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

              {/* More Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <Package className="w-4 h-4 mr-2" />
                    More
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Additional Features</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {secondaryNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem 
                        key={item.name}
                        onClick={() => handleNavigation(item.href)}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                        {item.badge && (
                          <Badge 
                            variant={typeof item.badge === "string" ? "secondary" : "destructive"}
                            className="ml-auto px-1.5 py-0.5 text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Demo Features */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <Zap className="w-4 h-4 mr-2" />
                    Demo
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
                        {item.badge && (
                          <Badge 
                            variant="secondary"
                            className="ml-auto px-1.5 py-0.5 text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Search - Hidden on small screens */}
            <div className="hidden lg:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 w-48 xl:w-64 h-9"
              />
            </div>

            {/* Mobile Search Button */}
            <Button variant="ghost" size="sm" className="lg:hidden">
              <Search className="w-4 h-4" />
            </Button>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Globe className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{language.toUpperCase()}</span>
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
                  <CreditCard className="w-4 h-4" />
                  <Badge variant="outline" className="ml-1 hidden sm:inline">Pro</Badge>
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
                      onClick={() => handleNavigation('/subscription-plans')}
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
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Settings className="w-4 h-4" />
                  <span className="hidden lg:inline ml-1 text-sm font-medium">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                  <User className="w-4 h-4 mr-2" />
                  Company Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigation('/help')}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="xl:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg max-h-screen overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Search in Mobile */}
              <div className="lg:hidden relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 w-full h-10"
                />
              </div>

              {/* Core Navigation */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Core Features</h3>
                {coreNavigation.map((item) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Button
                      key={item.name}
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )}
                      onClick={() => handleNavigation(item.href)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge 
                          variant={typeof item.badge === "string" ? "secondary" : "destructive"}
                          className="ml-auto px-1.5 py-0.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Secondary Navigation */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Additional Features</h3>
                {secondaryNavigation.map((item) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Button
                      key={item.name}
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )}
                      onClick={() => handleNavigation(item.href)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge 
                          variant={typeof item.badge === "string" ? "secondary" : "destructive"}
                          className="ml-auto px-1.5 py-0.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Demo Features */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Demo Features</h3>
                {enterpriseTools.slice(0, 6).map((item) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Button
                      key={item.name}
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )}
                      onClick={() => handleNavigation(item.href)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge 
                          variant="secondary"
                          className="ml-auto px-1.5 py-0.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  Truck, BarChart3, FileText, MapPin, FolderOpen, MessageCircle, 
  Receipt, TrendingUp, Settings, LogOut, Bot, Bell, Search, 
  Globe, ChevronDown, User, CreditCard, DollarSign, Zap
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
  { name: "AI Automation", href: "/ai-automation", icon: Bot, badge: "AI", key: "aiAutomation" },
  { name: "Quotes", href: "/quotes", icon: FileText, badge: 12, key: "quotes" },
  { name: "Analytics", href: "/analytics", icon: TrendingUp, key: "analytics" },
  { name: "Tracking", href: "/tracking", icon: MapPin, key: "tracking" },
  { name: "Documents", href: "/documents", icon: FolderOpen, key: "documents" },
  { name: "Invoicing", href: "/invoicing", icon: Receipt, key: "invoicing" },
  { name: "Chat", href: "/chat", icon: MessageCircle, badge: 3, key: "chat" },
];

const demoPages = [
  { name: "Competitive Analysis", href: "/competitive-demo", icon: TrendingUp, key: "competitiveDemo" },
  { name: "AI Maturity", href: "/ai-maturity", icon: Zap, key: "aiMaturity" },
  { name: "Scenario Simulator", href: "/scenario-simulator", icon: BarChart3, key: "scenarioSimulator" },
  { name: "Migration Demo", href: "/migration-demo", icon: Bot, key: "migrationDemo" },
  { name: "API Docs", href: "/api-docs", icon: FileText, key: "apiDocs" },
];

export function TopNavbar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const handleNavigation = (href: string) => {
    setLocation(href);
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

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
            <span className="text-xl font-bold text-gray-900">eMulog</span>
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
                {demoPages.map((item) => {
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

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.firstName}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <Badge variant="outline" className="self-start text-xs">
                    {user?.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleNavigation('/invoicing')}
                className="cursor-pointer"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Billing & Plans
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
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
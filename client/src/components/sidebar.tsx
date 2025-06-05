import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  Truck, 
  BarChart3, 
  FileText, 
  MapPin, 
  FolderOpen, 
  MessageCircle, 
  Receipt, 
  TrendingUp,
  Settings,
  LogOut,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigation = [
  { name: "Tableau de Bord", href: "/", icon: BarChart3 },
  { name: "Agent IA", href: "/ai-automation", icon: Bot, badge: "NEW" },
  { name: "Cotations", href: "/quotes", icon: FileText, badge: 12 },
  { name: "Suivi Transport", href: "/tracking", icon: MapPin },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "Messages", href: "/chat", icon: MessageCircle, badge: 3 },
  { name: "Facturation", href: "/invoicing", icon: Receipt },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleNavigation = (href: string) => {
    setLocation(href);
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="w-64 bg-emulog-dark text-white flex flex-col h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emulog-blue rounded flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">eMulog</span>
        </div>
        <p className="text-gray-400 text-xs mt-1">Optimisation Logistique</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center space-x-3 p-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-emulog-blue text-white" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <Badge 
                      variant={item.name === "Messages" ? "destructive" : "secondary"}
                      className={cn(
                        "text-xs",
                        item.name === "Messages" 
                          ? "bg-emulog-red text-white" 
                          : "bg-emulog-green text-white"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* User Profile Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex items-center space-x-3 p-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-emulog-purple text-white text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white p-1"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  FileText, 
  MapPin, 
  FolderOpen, 
  MessageSquare, 
  Receipt, 
  TrendingUp,
  Truck,
  Settings,
  Badge
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";

const navigationItems = [
  { 
    href: "/dashboard", 
    icon: BarChart3, 
    labelKey: "dashboard",
    badge: null 
  },
  { 
    href: "/quotes", 
    icon: FileText, 
    labelKey: "quotes",
    badge: 12 
  },
  { 
    href: "/tracking", 
    icon: MapPin, 
    labelKey: "tracking",
    badge: null 
  },
  { 
    href: "/documents", 
    icon: FolderOpen, 
    labelKey: "documents",
    badge: null 
  },
  { 
    href: "/chat", 
    icon: MessageSquare, 
    labelKey: "chat",
    badge: 3 
  },
  { 
    href: "/invoicing", 
    icon: Receipt, 
    labelKey: "invoicing",
    badge: null 
  },
  { 
    href: "/analytics", 
    icon: TrendingUp, 
    labelKey: "analytics",
    badge: null 
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { user, company, logout } = useAuth();

  const getUserInitials = (user: any) => {
    if (!user) return "?";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <div className="w-64 bg-emulog-dark text-white flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emulog-blue rounded flex items-center justify-center">
            <Truck className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-bold">eMulog</span>
        </div>
        <p className="text-gray-400 text-xs mt-1">Optimisation Logistique</p>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-emulog-blue text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{t(item.labelKey)}</span>
                    {item.badge && (
                      <span className="ml-auto bg-emulog-green text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
        
        {/* User Profile Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex items-center space-x-3 p-3">
            <div className="w-8 h-8 bg-emulog-purple rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getUserInitials(user)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {user ? `${user.firstName} ${user.lastName}` : ""}
              </p>
              <p className="text-xs text-gray-400">{user?.role || ""}</p>
            </div>
            <button 
              onClick={logout}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

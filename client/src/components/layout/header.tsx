import { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { t } = useTranslation();
  const [lastUpdate, setLastUpdate] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
            Mis à jour il y a {lastUpdate} min
          </span>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search Bar - Hidden on mobile */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              className="w-48 lg:w-64 pl-10"
            />
          </div>
          

          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
              5
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}

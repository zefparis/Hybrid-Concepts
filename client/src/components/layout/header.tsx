import { useState, useEffect } from "react";
import { Search, Bell, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [lastUpdate, setLastUpdate] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-emulog-dark">{title}</h1>
          <span className="text-sm text-gray-500">
            {t("lastUpdate", { time: lastUpdate })}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t("search")}
              className="w-64 pl-10"
            />
          </div>
          
          {/* Language Switcher */}
          <Select value={i18n.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">🇫🇷 FR</SelectItem>
              <SelectItem value="en">🇬🇧 EN</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-emulog-red text-white text-xs rounded-full flex items-center justify-center">
              5
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}

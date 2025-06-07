import { useState } from "react";
import { Search, Bell, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [language, setLanguage] = useState("fr");

  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-ia-solution-dark">{title}</h1>
          {subtitle && (
            <span className="text-sm text-gray-500">{subtitle}</span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              className="w-64 pl-10"
            />
          </div>

          {/* Language Switcher */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-20">
              <SelectValue>
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>{language.toUpperCase()}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">🇫🇷 FR</SelectItem>
              <SelectItem value="en">🇬🇧 EN</SelectItem>
            </SelectContent>
          </Select>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-gray-400" />
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-ia-solution-red"
            >
              5
            </Badge>
          </Button>
        </div>
      </div>
    </header>
  );
}

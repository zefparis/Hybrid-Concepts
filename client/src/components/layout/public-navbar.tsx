import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Brain, 
  Target, 
  Award, 
  PlayCircle, 
  Rocket,
  BarChart3 
} from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";

export function PublicNavbar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    {
      href: "/",
      label: "Accueil",
      icon: Rocket,
      description: "Écosystème IA Multi-Agents"
    },
    {
      href: "/competitive-demo",
      label: "Analyse Concurrentielle",
      icon: Target,
      description: "Comparez-vous à la concurrence"
    },
    {
      href: "/ai-maturity",
      label: "Maturité IA",
      icon: Award,
      description: "Évaluez votre potentiel IA"
    },
    {
      href: "/scenario-simulator",
      label: "Simulation ROI",
      icon: BarChart3,
      description: "Projections personnalisées"
    },
    {
      href: "/ai-automation",
      label: "Orchestrateur IA",
      icon: Brain,
      description: "Démonstration agents IA"
    }
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg group-hover:scale-105 transition-transform">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">eMulog</div>
                <div className="text-xs text-gray-500 hidden sm:block">Écosystème IA Multi-Agents</div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={`h-12 px-4 flex flex-col items-center justify-center text-xs ${
                    isActive(item.href)
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <item.icon className="h-4 w-4 mb-1" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side - Language + Login */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                <PlayCircle className="h-4 w-4 mr-2" />
                Démo Live
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer ${
                      isActive(item.href)
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        isActive(item.href) ? "text-blue-600" : "text-gray-500"
                      }`}
                    />
                    <div>
                      <div
                        className={`font-medium ${
                          isActive(item.href) ? "text-blue-600" : "text-gray-900"
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="px-4">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <Badge className="bg-yellow-500 text-yellow-900 border-yellow-400">
              NOUVEAU
            </Badge>
            <span>7 Agents IA Spécialisés + Orchestrateur Maître disponibles</span>
            <Link href="/ai-automation">
              <Button variant="link" className="text-white underline p-0 h-auto font-normal">
                Voir en action →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
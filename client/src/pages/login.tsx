import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Truck, Globe } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
  });

  const { login, register } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-emulog-blue rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-emulog-dark">eMulog</span>
          </div>
          <p className="text-gray-600">Plateforme d'Optimisation Logistique</p>
        </div>

        {/* Language Switcher */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg bg-white border border-gray-200 p-1">
            <button
              onClick={() => setLanguage("fr")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                language === "fr" 
                  ? "bg-emulog-blue text-white" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🇫🇷 FR
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                language === "en" 
                  ? "bg-emulog-blue text-white" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🇬🇧 EN
            </button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Connexion" : "Inscription"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Connectez-vous à votre compte eMulog"
                : "Créez votre compte eMulog"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-emulog-blue hover:bg-blue-700" 
                disabled={isLoading}
              >
                {isLoading 
                  ? "Chargement..." 
                  : isLogin ? "Se connecter" : "S'inscrire"
                }
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-emulog-blue hover:underline"
              >
                {isLogin 
                  ? "Vous n'avez pas de compte ? Inscrivez-vous"
                  : "Vous avez déjà un compte ? Connectez-vous"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

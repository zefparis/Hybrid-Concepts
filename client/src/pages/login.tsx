import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Mail, Lock, User, Building2, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { login, register, loading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    company: {
      name: "",
      email: "",
      phone: "",
      address: "",
      type: "pme"
    },
    user: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: ""
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(loginData.email, loginData.password);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur eMulog !",
      });
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await register(registerData);
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès !",
      });
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: "Veuillez vérifier vos informations",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md sm:max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-emulog-blue rounded-lg flex items-center justify-center">
              <Truck className="text-white w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-emulog-dark">eMulog</span>
          </div>
          <p className="text-gray-600">Plateforme d'optimisation logistique</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="register">Inscription</TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Se connecter</CardTitle>
                <CardDescription>
                  Accédez à votre tableau de bord eMulog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="votre.email@entreprise.com"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-emulog-blue hover:bg-blue-700"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>

                {/* Demo credentials */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Compte de démonstration :</p>
                  <p className="text-xs text-gray-600">Email: demo@emulog.fr</p>
                  <p className="text-xs text-gray-600">Mot de passe: demo123</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Créer un compte</CardTitle>
                <CardDescription>
                  Rejoignez eMulog et optimisez votre logistique
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
                      Informations entreprise
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nom de l'entreprise</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="company-name"
                          placeholder="Transport Express SA"
                          className="pl-10"
                          value={registerData.company.name}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            company: { ...registerData.company, name: e.target.value }
                          })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email entreprise</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="company-email"
                          type="email"
                          placeholder="contact@transport-express.fr"
                          className="pl-10"
                          value={registerData.company.email}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            company: { ...registerData.company, email: e.target.value }
                          })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company-type">Type d'entreprise</Label>
                      <Select
                        value={registerData.company.type}
                        onValueChange={(value) => setRegisterData({
                          ...registerData,
                          company: { ...registerData.company, type: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pme">PME / TPE</SelectItem>
                          <SelectItem value="group">Groupe / Grande entreprise</SelectItem>
                          <SelectItem value="commissioner">Commissionnaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* User Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
                      Informations utilisateur
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="user-firstname">Prénom</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="user-firstname"
                            placeholder="Jean"
                            className="pl-10"
                            value={registerData.user.firstName}
                            onChange={(e) => setRegisterData({
                              ...registerData,
                              user: { ...registerData.user, firstName: e.target.value }
                            })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="user-lastname">Nom</Label>
                        <Input
                          id="user-lastname"
                          placeholder="Dupont"
                          value={registerData.user.lastName}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            user: { ...registerData.user, lastName: e.target.value }
                          })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user-username">Nom d'utilisateur</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="user-username"
                          placeholder="jdupont"
                          className="pl-10"
                          value={registerData.user.username}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            user: { ...registerData.user, username: e.target.value }
                          })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="user-email"
                          type="email"
                          placeholder="jean.dupont@transport-express.fr"
                          className="pl-10"
                          value={registerData.user.email}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            user: { ...registerData.user, email: e.target.value }
                          })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user-password">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="user-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={registerData.user.password}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            user: { ...registerData.user, password: e.target.value }
                          })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-emulog-blue hover:bg-blue-700"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting ? "Création du compte..." : "Créer mon compte"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
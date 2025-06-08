import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Building, 
  Bell, 
  Shield, 
  Globe, 
  Truck, 
  CreditCard,
  Key,
  Mail,
  Phone,
  MapPin,
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Monitor,
  Smartphone,
  Users,
  Package
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface CompanySettings {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  industry: string;
  timezone: string;
  currency: string;
  language: string;
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    quotesAlerts: boolean;
    shipmentsAlerts: boolean;
    deliveryAlerts: boolean;
    paymentAlerts: boolean;
  };
  preferences: {
    defaultTransportMode: string;
    autoQuoteGeneration: boolean;
    trackingVisibility: string;
    dataRetention: number;
    twoFactorAuth: boolean;
  };
  integrations: {
    apiEnabled: boolean;
    webhooksEnabled: boolean;
    trackingApi: boolean;
    paymentsApi: boolean;
  };
}

export default function Settings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch company settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/settings"],
    retry: false,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<CompanySettings>) => {
      return await apiRequest("PUT", "/api/settings", updatedSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: t("settings.settingsUpdated"),
        description: t("settings.settingsUpdatedDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: t("settings.updateError"),
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = async (sectionData: Partial<CompanySettings>) => {
    setIsLoading(true);
    await updateSettingsMutation.mutateAsync(sectionData);
    setIsLoading(false);
  };

  if (settingsLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={t("settings.title")} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </main>
      </div>
    );
  }

  const defaultSettings: CompanySettings = {
    id: 1,
    name: "Hybrid Concept",
    email: "bbogaerts@hybridconc.com",
    phone: "+27727768777",
    address: "Cape Town, South Africa",
    website: "www.hybridconc.com",
    industry: "Logistics & Transportation",
    timezone: "Africa/Johannesburg",
    currency: "ZAR",
    language: "en",
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      quotesAlerts: true,
      shipmentsAlerts: true,
      deliveryAlerts: true,
      paymentAlerts: true,
    },
    preferences: {
      defaultTransportMode: "auto",
      autoQuoteGeneration: true,
      trackingVisibility: "public",
      dataRetention: 24,
      twoFactorAuth: false,
    },
    integrations: {
      apiEnabled: true,
      webhooksEnabled: true,
      trackingApi: true,
      paymentsApi: false,
    },
  };

  const currentSettings: CompanySettings = (settings as CompanySettings) || defaultSettings;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title={t("settings.title")} />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("settings.companySettings")}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("settings.companySettingsDescription")}
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {t("settings.accountVerified")}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              {t("settings.profile")}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {t("settings.notifications")}
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              {t("settings.preferences")}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t("settings.security")}
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              {t("settings.integrations")}
            </TabsTrigger>
          </TabsList>

          {/* Company Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {t("settings.companyInformation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">{t("settings.companyName")}</Label>
                    <Input
                      id="company-name"
                      defaultValue={currentSettings.name}
                      placeholder="Hybrid Concept"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">{t("settings.industry")}</Label>
                    <Select defaultValue={currentSettings.industry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Logistics & Transportation">{t("settings.logisticsTransport")}</SelectItem>
                        <SelectItem value="Manufacturing">{t("settings.manufacturing")}</SelectItem>
                        <SelectItem value="Retail">{t("settings.retail")}</SelectItem>
                        <SelectItem value="Technology">{t("settings.technology")}</SelectItem>
                        <SelectItem value="Healthcare">{t("settings.healthcare")}</SelectItem>
                        <SelectItem value="Other">{t("settings.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t("settings.professionalEmail")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={currentSettings.email}
                      placeholder="contact@hybridconc.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {t("settings.phone")}
                    </Label>
                    <Input
                      id="phone"
                      defaultValue={currentSettings.phone}
                      placeholder="+27727768777"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t("settings.address")}
                    </Label>
                    <Textarea
                      id="address"
                      defaultValue={currentSettings.address}
                      placeholder="Cape Town, South Africa"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {t("settings.website")}
                    </Label>
                    <Input
                      id="website"
                      defaultValue={currentSettings.website}
                      placeholder="www.hybridconc.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">{t("settings.timezone")}</Label>
                    <Select defaultValue={currentSettings.timezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Johannesburg">{t("settings.southAfricaSAST")}</SelectItem>
                        <SelectItem value="Europe/Paris">{t("settings.europeParisCET")}</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">{t("settings.newYorkEST")}</SelectItem>
                        <SelectItem value="Asia/Shanghai">{t("settings.shanghaiCST")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">{t("settings.currency")}</Label>
                    <Select defaultValue={currentSettings.currency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ZAR">{t("settings.zarSouthAfrican")}</SelectItem>
                        <SelectItem value="EUR">{t("settings.eurEuro")}</SelectItem>
                        <SelectItem value="USD">{t("settings.usdDollar")}</SelectItem>
                        <SelectItem value="GBP">{t("settings.gbpPound")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">{t("settings.language")}</Label>
                    <Select defaultValue={currentSettings.language}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => handleSaveSettings({ 
                      name: currentSettings.name,
                      email: currentSettings.email,
                      phone: currentSettings.phone,
                      address: currentSettings.address,
                      website: currentSettings.website,
                      industry: currentSettings.industry,
                      timezone: currentSettings.timezone,
                      currency: currentSettings.currency,
                      language: currentSettings.language,
                    })}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {t("common.save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t("settings.notificationPreferences")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Communication Channels */}
                <div className="space-y-4">
                  <h3 className="font-semibold">{t("settings.communicationChannels")}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">{t("settings.emailNotifications")}</div>
                          <div className="text-sm text-gray-600">{t("settings.emailNotificationsDesc")}</div>
                        </div>
                      </div>
                      <Switch defaultChecked={currentSettings.notifications.emailNotifications} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">{t("settings.smsNotifications")}</div>
                          <div className="text-sm text-gray-600">{t("settings.smsNotificationsDesc")}</div>
                        </div>
                      </div>
                      <Switch defaultChecked={currentSettings.notifications.smsNotifications} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-purple-500" />
                        <div>
                          <div className="font-medium">{t("settings.pushNotifications")}</div>
                          <div className="text-sm text-gray-600">{t("settings.pushNotificationsDesc")}</div>
                        </div>
                      </div>
                      <Switch defaultChecked={currentSettings.notifications.pushNotifications} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Alert Types */}
                <div className="space-y-4">
                  <h3 className="font-semibold">{t("settings.alertTypes")}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-orange-500" />
                        <div>
                          <div className="font-medium">{t("settings.newQuotes")}</div>
                          <div className="text-sm text-gray-600">{t("settings.newQuotesDesc")}</div>
                        </div>
                      </div>
                      <Switch defaultChecked={currentSettings.notifications.quotesAlerts} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">{t("settings.shipmentUpdates")}</div>
                          <div className="text-sm text-gray-600">{t("settings.shipmentUpdatesDesc")}</div>
                        </div>
                      </div>
                      <Switch defaultChecked={currentSettings.notifications.shipmentsAlerts} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">{t("settings.deliveryConfirmations")}</div>
                          <div className="text-sm text-gray-600">{t("settings.deliveryConfirmationsDesc")}</div>
                        </div>
                      </div>
                      <Switch defaultChecked={currentSettings.notifications.deliveryAlerts} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-purple-500" />
                        <div>
                          <div className="font-medium">{t("settings.paymentAlerts")}</div>
                          <div className="text-sm text-gray-600">{t("settings.paymentAlertsDesc")}</div>
                        </div>
                      </div>
                      <Switch defaultChecked={currentSettings.notifications.paymentAlerts} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => handleSaveSettings({ notifications: currentSettings.notifications })}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Sauvegarder les notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Préférences logistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="default-transport">{t("settings.defaultTransportMode")}</Label>
                    <Select defaultValue={currentSettings.preferences.defaultTransportMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">{t("settings.automaticAI")}</SelectItem>
                        <SelectItem value="maritime">{t("settings.maritime")}</SelectItem>
                        <SelectItem value="aerienne">{t("settings.air")}</SelectItem>
                        <SelectItem value="terrestre">{t("settings.road")}</SelectItem>
                        <SelectItem value="multimodal">{t("settings.multimodal")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tracking-visibility">{t("settings.trackingVisibility")}</Label>
                    <Select defaultValue={currentSettings.preferences.trackingVisibility}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">{t("settings.publicClientsPartners")}</SelectItem>
                        <SelectItem value="private">{t("settings.privateCompanyOnly")}</SelectItem>
                        <SelectItem value="limited">{t("settings.limitedOnRequest")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t("settings.autoQuoteGeneration")}</div>
                      <div className="text-sm text-gray-600">{t("settings.autoQuoteGenerationDesc")}</div>
                    </div>
                    <Switch defaultChecked={currentSettings.preferences.autoQuoteGeneration} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data-retention">{t("settings.dataRetention")}</Label>
                  <Select defaultValue={currentSettings.preferences.dataRetention.toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">{t("settings.twelveMonths")}</SelectItem>
                      <SelectItem value="24">{t("settings.twentyFourMonths")}</SelectItem>
                      <SelectItem value="36">{t("settings.thirtySixMonths")}</SelectItem>
                      <SelectItem value="60">{t("settings.fiveYears")}</SelectItem>
                      <SelectItem value="120">{t("settings.tenYears")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => handleSaveSettings({ preferences: currentSettings.preferences })}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {t("settings.savePreferences")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sécurité et accès
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Authentification à deux facteurs</div>
                      <div className="text-sm text-gray-600">Sécurité renforcée pour votre compte</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked={currentSettings.preferences.twoFactorAuth} />
                      {currentSettings.preferences.twoFactorAuth ? (
                        <Badge variant="secondary" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activé
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-orange-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Désactivé
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Gestion des mots de passe</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Key className="h-4 w-4 mr-2" />
                      Changer le mot de passe
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Régénérer les clés API
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Sessions actives</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Chrome - Cap Town</div>
                          <div className="text-sm text-gray-600">Session actuelle • il y a 5 min</div>
                        </div>
                      </div>
                      <Badge variant="secondary">Actuelle</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Mobile App - Cap Town</div>
                          <div className="text-sm text-gray-600">il y a 2 heures</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Déconnecter
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => handleSaveSettings({ preferences: { ...currentSettings.preferences, twoFactorAuth: !currentSettings.preferences.twoFactorAuth } })}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Sauvegarder la sécurité
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API et intégrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">API REST activée</div>
                      <div className="text-sm text-gray-600">Accès programmatique à la plateforme</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked={currentSettings.integrations.apiEnabled} />
                      <Badge variant={currentSettings.integrations.apiEnabled ? "default" : "secondary"}>
                        {currentSettings.integrations.apiEnabled ? "Activé" : "Désactivé"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Webhooks</div>
                      <div className="text-sm text-gray-600">Notifications en temps réel vers vos systèmes</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked={currentSettings.integrations.webhooksEnabled} />
                      <Badge variant={currentSettings.integrations.webhooksEnabled ? "default" : "secondary"}>
                        {currentSettings.integrations.webhooksEnabled ? "Activé" : "Désactivé"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">API de tracking</div>
                      <div className="text-sm text-gray-600">Intégration du suivi d'expéditions</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked={currentSettings.integrations.trackingApi} />
                      <Badge variant={currentSettings.integrations.trackingApi ? "default" : "secondary"}>
                        {currentSettings.integrations.trackingApi ? "Activé" : "Désactivé"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">API de paiements</div>
                      <div className="text-sm text-gray-600">Intégration des systèmes de paiement</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked={currentSettings.integrations.paymentsApi} />
                      <Badge variant={currentSettings.integrations.paymentsApi ? "default" : "secondary"}>
                        {currentSettings.integrations.paymentsApi ? "Activé" : "Désactivé"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Clés d'API</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Clé de production</div>
                        <div className="text-sm text-gray-600 font-mono">hc_prod_••••••••••••••••</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Copier
                        </Button>
                        <Button variant="outline" size="sm">
                          Régénérer
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Clé de test</div>
                        <div className="text-sm text-gray-600 font-mono">hc_test_••••••••••••••••</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Copier
                        </Button>
                        <Button variant="outline" size="sm">
                          Régénérer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Intégrations tierces</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Google Maps</div>
                        <Badge variant="default">Connecté</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        Géocodage et optimisation d'itinéraires
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Configurer
                      </Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Stripe</div>
                        <Badge variant="secondary">Non connecté</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        Traitement sécurisé des paiements
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Connecter
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => handleSaveSettings({ integrations: currentSettings.integrations })}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Sauvegarder les intégrations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
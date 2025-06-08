import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  Calendar,
  Globe,
  Edit,
  Save,
  Camera,
  Shield,
  Award,
  Activity,
  Clock,
  CheckCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  location: string;
  timezone: string;
  language: string;
  avatar: string;
  joinDate: string;
  lastLogin: string;
  permissions: string[];
  achievements: string[];
  stats: {
    quotesManaged: number;
    shipmentsTracked: number;
    documentsProcessed: number;
    loginStreak: number;
  };
}

export default function Profile() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    retry: false,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedProfile: Partial<UserProfile>) => {
      return await apiRequest("PUT", "/api/profile", updatedProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditing(false);
      toast({
        title: t("profile.profileUpdated"),
        description: t("profile.profileUpdatedDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: t("profile.profileUpdateError"),
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = async (profileData: Partial<UserProfile>) => {
    setIsLoading(true);
    await updateProfileMutation.mutateAsync(profileData);
    setIsLoading(false);
  };

  if (profileLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={t("profile.title")} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </main>
      </div>
    );
  }

  const currentProfile: UserProfile = (profile as UserProfile) || {
    id: 1,
    firstName: "Benoît",
    lastName: "Bogaerts",
    email: "bbogaerts@hybridconc.com",
    phone: "+27727768777",
    position: "Chairman & CEO",
    department: "Executive",
    location: "Cape Town, South Africa",
    timezone: "Africa/Johannesburg",
    language: "en",
    avatar: "/avatars/ceo-avatar.jpg",
    joinDate: "2023-01-15",
    lastLogin: new Date().toISOString(),
    permissions: ["admin", "quotes", "shipments", "analytics", "settings"],
    achievements: ["First Login", "100 Quotes", "1000 Shipments", "Expert User"],
    stats: {
      quotesManaged: 1247,
      shipmentsTracked: 3892,
      documentsProcessed: 756,
      loginStreak: 45,
    },
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title={t("profile.title")} />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentProfile.avatar} alt={`${currentProfile.firstName} ${currentProfile.lastName}`} />
                  <AvatarFallback className="text-2xl font-semibold">
                    {currentProfile.firstName[0]}{currentProfile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">
                    {currentProfile.firstName} {currentProfile.lastName}
                  </h1>
                  <Badge variant="secondary">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">{currentProfile.position}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {currentProfile.department}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {currentProfile.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {t("profile.memberSince")} {new Date(currentProfile.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={() => handleSaveProfile(currentProfile)}
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Annuler
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        defaultValue={currentProfile.firstName}
                        placeholder="Prénom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        defaultValue={currentProfile.lastName}
                        placeholder="Nom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={currentProfile.email}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      defaultValue={currentProfile.phone}
                      placeholder="+27727768777"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Poste</Label>
                    <Input
                      id="position"
                      defaultValue={currentProfile.position}
                      placeholder="Titre du poste"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Localisation
                    </Label>
                    <Input
                      id="location"
                      defaultValue={currentProfile.location}
                      placeholder="Ville, Pays"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-medium">{currentProfile.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Téléphone:</span>
                      <span className="font-medium">{currentProfile.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Poste:</span>
                      <span className="font-medium">{currentProfile.position}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Département:</span>
                      <span className="font-medium">{currentProfile.department}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Localisation:</span>
                      <span className="font-medium">{currentProfile.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Dernière connexion:</span>
                      <span className="font-medium">
                        {new Date(currentProfile.lastLogin).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Statistiques d'activité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{currentProfile.stats.quotesManaged.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cotations gérées</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{currentProfile.stats.shipmentsTracked.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Expéditions suivies</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{currentProfile.stats.documentsProcessed.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Documents traités</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{currentProfile.stats.loginStreak}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Jours consécutifs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions et accès
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentProfile.permissions.map((permission) => (
                  <div key={permission} className="flex items-center justify-between">
                    <span className="capitalize">{permission}</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Réalisations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentProfile.achievements.map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="mr-2 mb-2">
                    <Award className="h-3 w-3 mr-1" />
                    {achievement}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Nouvelle cotation créée</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cotation EML-2025-030824 pour transport maritime</p>
                </div>
                <span className="text-sm text-gray-500">Il y a 2 heures</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Expédition livrée</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">SHP-2025-443699 livré avec succès</p>
                </div>
                <span className="text-sm text-gray-500">Il y a 5 heures</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Document signé</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contrat de transport approuvé</p>
                </div>
                <span className="text-sm text-gray-500">Hier</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
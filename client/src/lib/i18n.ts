import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      // Navigation
      dashboard: "Tableau de Bord",
      quotes: "Cotations",
      tracking: "Suivi Transport",
      documents: "Documents",
      chat: "Messages",
      invoicing: "Facturation",
      analytics: "Analytics",
      
      // Dashboard
      activeShipments: "Envois en Cours",
      savingsRealized: "Économies Réalisées",
      pendingQuotes: "Cotations en Attente",
      globalPerformance: "Performance Globale",
      quickActions: "Actions Rapides",
      recentActivity: "Activité Récente",
      currentShipments: "Expéditions en Cours",
      recentDocuments: "Documents Récents",
      
      // Actions
      newQuoteRequest: "Nouvelle Demande de Cotation",
      importDocuments: "Importer Documents",
      trackShipment: "Suivre un Envoi",
      addDocument: "Ajouter Document",
      
      // Status
      inTransit: "En Transit",
      pending: "En Attente",
      delivered: "Livré",
      excellent: "Excellente",
      
      // Common
      search: "Rechercher...",
      export: "Exporter",
      viewAll: "Voir tout",
      viewDetails: "Voir détails",
      actions: "Actions",
      status: "Statut",
      reference: "Référence",
      origin: "Origine",
      destination: "Destination",
      carrier: "Transporteur",
      eta: "ETA",
      cost: "Coût",
      created: "Créé le",
      distance: "Distance",
      punctuality: "Ponctualité",
      addedAgo: "Ajouté il y a",
      by: "Par",
      
      // Time
      minutes: "minutes",
      hours: "heure | heures",
      days: "jour | jours",
      weeks: "semaine | semaines",
      months: "mois",
      
      // Messages
      lastUpdate: "Dernière mise à jour: il y a {{time}} minutes",
      responseTime: "Réponse sous 4h",
      showingResults: "Affichage de {{start}} à {{end}} sur {{total}} expéditions",
      
      // Forms
      email: "Email",
      password: "Mot de passe",
      login: "Se connecter",
      register: "S'inscrire",
      firstName: "Prénom",
      lastName: "Nom",
      companyName: "Nom de l'entreprise",
      phone: "Téléphone",
      address: "Adresse",
    }
  },
  en: {
    translation: {
      // Navigation
      dashboard: "Dashboard",
      quotes: "Quotes",
      tracking: "Tracking",
      documents: "Documents",
      chat: "Messages",
      invoicing: "Invoicing", 
      analytics: "Analytics",
      
      // Dashboard
      activeShipments: "Active Shipments",
      savingsRealized: "Savings Realized",
      pendingQuotes: "Pending Quotes",
      globalPerformance: "Global Performance",
      quickActions: "Quick Actions",
      recentActivity: "Recent Activity",
      currentShipments: "Current Shipments",
      recentDocuments: "Recent Documents",
      
      // Actions
      newQuoteRequest: "New Quote Request",
      importDocuments: "Import Documents",
      trackShipment: "Track Shipment",
      addDocument: "Add Document",
      
      // Status
      inTransit: "In Transit",
      pending: "Pending",
      delivered: "Delivered",
      excellent: "Excellent",
      
      // Common
      search: "Search...",
      export: "Export",
      viewAll: "View all",
      viewDetails: "View details",
      actions: "Actions",
      status: "Status",
      reference: "Reference",
      origin: "Origin",
      destination: "Destination",
      carrier: "Carrier",
      eta: "ETA",
      cost: "Cost",
      created: "Created on",
      distance: "Distance",
      punctuality: "Punctuality",
      addedAgo: "Added",
      by: "By",
      
      // Time
      minutes: "minutes",
      hours: "hour | hours",
      days: "day | days",
      weeks: "week | weeks",
      months: "months",
      
      // Messages
      lastUpdate: "Last update: {{time}} minutes ago",
      responseTime: "Response within 4h",
      showingResults: "Showing {{start}} to {{end}} of {{total}} shipments",
      
      // Forms
      email: "Email",
      password: "Password",
      login: "Login",
      register: "Register",
      firstName: "First Name",
      lastName: "Last Name",
      companyName: "Company Name",
      phone: "Phone",
      address: "Address",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // default language
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

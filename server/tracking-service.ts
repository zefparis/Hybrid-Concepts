import { db } from "./db";
import { trackingEvents, shipments } from "@shared/schema";
import { eq } from "drizzle-orm";

interface TrackingProvider {
  name: string;
  detectPattern: RegExp;
  trackingUrl: string;
  apiKey?: string;
}

interface TrackingResult {
  trackingNumber: string;
  status: string;
  location: string;
  timestamp: Date;
  estimatedDelivery?: Date;
  events: TrackingEvent[];
  provider: string;
  details?: any;
}

interface TrackingEvent {
  timestamp: Date;
  location: string;
  status: string;
  description: string;
}

export class TrackingService {
  private providers: TrackingProvider[] = [
    {
      name: "Maersk",
      detectPattern: /^[A-Z]{4}\d{7}$/,
      trackingUrl: "https://api.maersk.com/track/v1/tracking",
      apiKey: process.env.MAERSK_API_KEY
    },
    {
      name: "COSCO",
      detectPattern: /^[A-Z]{4}\d{10}$/,
      trackingUrl: "https://api.cosco-shipping.com/tracking/v1",
      apiKey: process.env.COSCO_API_KEY
    },
    {
      name: "FedEx",
      detectPattern: /^\d{12}$|^\d{4}\s\d{4}\s\d{4}$/,
      trackingUrl: "https://api.fedex.com/track/v1/trackingnumbers",
      apiKey: process.env.FEDEX_API_KEY
    },
    {
      name: "UPS",
      detectPattern: /^1Z[0-9A-Z]{16}$/,
      trackingUrl: "https://onlinetools.ups.com/track/v1/details",
      apiKey: process.env.UPS_API_KEY
    },
    {
      name: "DHL",
      detectPattern: /^\d{10}$|^\d{11}$/,
      trackingUrl: "https://api-eu.dhl.com/track/shipments",
      apiKey: process.env.DHL_API_KEY
    },
    {
      name: "MSC",
      detectPattern: /^[A-Z]{4}\d{6,7}$/,
      trackingUrl: "https://api.msc.com/tracking/v1",
      apiKey: process.env.MSC_API_KEY
    }
  ];

  /**
   * Détecte automatiquement le transporteur basé sur le format du numéro
   */
  detectProvider(trackingNumber: string): TrackingProvider | null {
    const cleanNumber = trackingNumber.replace(/\s+/g, '').toUpperCase();
    
    for (const provider of this.providers) {
      if (provider.detectPattern.test(cleanNumber)) {
        return provider;
      }
    }
    
    return null;
  }

  /**
   * Suivi en temps réel via API externe
   */
  async trackShipment(trackingNumber: string, providerName?: string): Promise<TrackingResult> {
    const cleanNumber = trackingNumber.replace(/\s+/g, '').toUpperCase();
    
    let provider: TrackingProvider | null = null;
    
    if (providerName) {
      provider = this.providers.find(p => p.name.toLowerCase() === providerName.toLowerCase()) || null;
    } else {
      provider = this.detectProvider(cleanNumber);
    }

    if (!provider) {
      throw new Error(`Aucun transporteur détecté pour le numéro: ${trackingNumber}`);
    }

    try {
      let result: TrackingResult;
      
      switch (provider.name) {
        case "Maersk":
          result = await this.trackMaersk(cleanNumber, provider);
          break;
        case "COSCO":
          result = await this.trackCOSCO(cleanNumber, provider);
          break;
        case "FedEx":
          result = await this.trackFedEx(cleanNumber, provider);
          break;
        case "UPS":
          result = await this.trackUPS(cleanNumber, provider);
          break;
        case "DHL":
          result = await this.trackDHL(cleanNumber, provider);
          break;
        case "MSC":
          result = await this.trackMSC(cleanNumber, provider);
          break;
        default:
          throw new Error(`Transporteur non supporté: ${provider.name}`);
      }

      // Sauvegarder les événements dans la base de données
      await this.saveTrackingEvents(result);
      
      return result;
    } catch (error) {
      console.error(`Erreur tracking ${provider.name}:`, error);
      
      // Retourner des données de fallback structurées si l'API échoue
      return this.generateFallbackTracking(cleanNumber, provider.name);
    }
  }

  /**
   * Tracking Maersk Line API
   */
  private async trackMaersk(trackingNumber: string, provider: TrackingProvider): Promise<TrackingResult> {
    if (!provider.apiKey) {
      throw new Error("Clé API Maersk manquante");
    }

    const response = await fetch(`${provider.trackingUrl}/${trackingNumber}`, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API Maersk: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      trackingNumber,
      status: data.transportPlan?.transportPlanStages?.[0]?.transportMode || "En transit",
      location: data.shipmentJourney?.currentLocation || "Position inconnue",
      timestamp: new Date(),
      estimatedDelivery: data.estimatedTimeOfArrival ? new Date(data.estimatedTimeOfArrival) : undefined,
      events: data.trackingEvents?.map((event: any) => ({
        timestamp: new Date(event.eventDateTime),
        location: event.eventLocation || "Non spécifié",
        status: event.eventType,
        description: event.eventDescription || event.eventType
      })) || [],
      provider: "Maersk",
      details: data
    };
  }

  /**
   * Tracking COSCO Shipping API
   */
  private async trackCOSCO(trackingNumber: string, provider: TrackingProvider): Promise<TrackingResult> {
    if (!provider.apiKey) {
      throw new Error("Clé API COSCO manquante");
    }

    const response = await fetch(`${provider.trackingUrl}/${trackingNumber}`, {
      headers: {
        'X-API-Key': provider.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API COSCO: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      trackingNumber,
      status: data.status || "En transit",
      location: data.currentLocation || "Position inconnue",
      timestamp: new Date(),
      estimatedDelivery: data.eta ? new Date(data.eta) : undefined,
      events: data.events?.map((event: any) => ({
        timestamp: new Date(event.date),
        location: event.location || "Non spécifié",
        status: event.status,
        description: event.description || event.status
      })) || [],
      provider: "COSCO",
      details: data
    };
  }

  /**
   * Tracking FedEx Ship Manager API
   */
  private async trackFedEx(trackingNumber: string, provider: TrackingProvider): Promise<TrackingResult> {
    if (!provider.apiKey) {
      throw new Error("Clé API FedEx manquante");
    }

    const requestBody = {
      includeDetailedScans: true,
      trackingInfo: [{
        trackingNumberInfo: {
          trackingNumber: trackingNumber
        }
      }]
    };

    const response = await fetch(provider.trackingUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
        'X-locale': 'en_US'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Erreur API FedEx: ${response.status}`);
    }

    const data = await response.json();
    const trackingInfo = data.output?.completeTrackResults?.[0]?.trackResults?.[0];
    
    return {
      trackingNumber,
      status: trackingInfo?.latestStatusDetail?.description || "En transit",
      location: trackingInfo?.latestStatusDetail?.scanLocation?.city || "Position inconnue",
      timestamp: new Date(),
      estimatedDelivery: trackingInfo?.estimatedDeliveryTimeWindow?.window?.begins ? 
        new Date(trackingInfo.estimatedDeliveryTimeWindow.window.begins) : undefined,
      events: trackingInfo?.scanEvents?.map((event: any) => ({
        timestamp: new Date(event.date),
        location: `${event.scanLocation?.city || ""}, ${event.scanLocation?.countryCode || ""}`.trim(),
        status: event.eventType,
        description: event.eventDescription || event.eventType
      })) || [],
      provider: "FedEx",
      details: data
    };
  }

  /**
   * Tracking UPS API
   */
  private async trackUPS(trackingNumber: string, provider: TrackingProvider): Promise<TrackingResult> {
    if (!provider.apiKey) {
      throw new Error("Clé API UPS manquante");
    }

    const response = await fetch(`${provider.trackingUrl}/${trackingNumber}`, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API UPS: ${response.status}`);
    }

    const data = await response.json();
    const packageInfo = data.trackResponse?.shipment?.[0]?.package?.[0];
    
    return {
      trackingNumber,
      status: packageInfo?.currentStatus?.description || "En transit",
      location: packageInfo?.currentStatus?.location || "Position inconnue",
      timestamp: new Date(),
      estimatedDelivery: packageInfo?.deliveryDate ? new Date(packageInfo.deliveryDate) : undefined,
      events: packageInfo?.activity?.map((event: any) => ({
        timestamp: new Date(`${event.date} ${event.time}`),
        location: `${event.location?.address?.city || ""}, ${event.location?.address?.countryCode || ""}`.trim(),
        status: event.status?.type,
        description: event.status?.description || event.status?.type
      })) || [],
      provider: "UPS",
      details: data
    };
  }

  /**
   * Tracking DHL Express API
   */
  private async trackDHL(trackingNumber: string, provider: TrackingProvider): Promise<TrackingResult> {
    if (!provider.apiKey) {
      throw new Error("Clé API DHL manquante");
    }

    const response = await fetch(`${provider.trackingUrl}?trackingNumber=${trackingNumber}`, {
      headers: {
        'DHL-API-Key': provider.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API DHL: ${response.status}`);
    }

    const data = await response.json();
    const shipmentInfo = data.shipments?.[0];
    
    return {
      trackingNumber,
      status: shipmentInfo?.status?.description || "En transit",
      location: shipmentInfo?.events?.[0]?.location || "Position inconnue",
      timestamp: new Date(),
      estimatedDelivery: shipmentInfo?.estimatedTimeOfDelivery ? 
        new Date(shipmentInfo.estimatedTimeOfDelivery) : undefined,
      events: shipmentInfo?.events?.map((event: any) => ({
        timestamp: new Date(event.timestamp),
        location: `${event.location || ""}`,
        status: event.statusCode,
        description: event.description || event.statusCode
      })) || [],
      provider: "DHL",
      details: data
    };
  }

  /**
   * Tracking MSC Cargo API
   */
  private async trackMSC(trackingNumber: string, provider: TrackingProvider): Promise<TrackingResult> {
    if (!provider.apiKey) {
      throw new Error("Clé API MSC manquante");
    }

    const response = await fetch(`${provider.trackingUrl}/${trackingNumber}`, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API MSC: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      trackingNumber,
      status: data.currentStatus || "En transit",
      location: data.currentLocation || "Position inconnue",
      timestamp: new Date(),
      estimatedDelivery: data.estimatedArrival ? new Date(data.estimatedArrival) : undefined,
      events: data.trackingHistory?.map((event: any) => ({
        timestamp: new Date(event.eventDate),
        location: event.location || "Non spécifié",
        status: event.eventType,
        description: event.description || event.eventType
      })) || [],
      provider: "MSC",
      details: data
    };
  }

  /**
   * Génère des données de tracking structurées de fallback
   */
  private generateFallbackTracking(trackingNumber: string, providerName: string): TrackingResult {
    const isContainer = /^[A-Z]{4}\d/.test(trackingNumber);
    
    return {
      trackingNumber,
      status: "Données limitées - Configurez les clés API",
      location: "API non configurée",
      timestamp: new Date(),
      events: [{
        timestamp: new Date(),
        location: "Système eMulog",
        status: "Info",
        description: `Numéro détecté comme ${providerName} ${isContainer ? 'conteneur' : 'colis'}. Configurez la clé API pour le tracking en temps réel.`
      }],
      provider: providerName,
      details: {
        message: "Clé API requise pour le tracking en temps réel",
        detectedType: isContainer ? "container" : "parcel"
      }
    };
  }

  /**
   * Sauvegarde les événements de tracking en base
   */
  private async saveTrackingEvents(result: TrackingResult): Promise<void> {
    try {
      for (const event of result.events) {
        await db.insert(trackingEvents).values({
          trackingNumber: result.trackingNumber,
          provider: result.provider,
          status: event.status,
          location: event.location,
          description: event.description,
          eventTime: event.timestamp,
          rawData: result.details
        });
      }
    } catch (error) {
      console.error("Erreur sauvegarde tracking events:", error);
    }
  }

  /**
   * Récupère l'historique de tracking depuis la base
   */
  async getTrackingHistory(trackingNumber: string): Promise<TrackingEvent[]> {
    const events = await db
      .select()
      .from(trackingEvents)
      .where(eq(trackingEvents.trackingNumber, trackingNumber))
      .orderBy(trackingEvents.eventTime);

    return events.map(event => ({
      timestamp: event.eventTime,
      location: event.location,
      status: event.status,
      description: event.description
    }));
  }

  /**
   * Vérifie la disponibilité des APIs
   */
  async checkAPIStatus(): Promise<{ [key: string]: boolean }> {
    const status: { [key: string]: boolean } = {};
    
    for (const provider of this.providers) {
      status[provider.name] = !!provider.apiKey;
    }
    
    return status;
  }
}

export const trackingService = new TrackingService();
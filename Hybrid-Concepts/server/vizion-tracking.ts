import fetch from 'node-fetch';

export interface VizionTrackingData {
  reference: string;
  containerNumber?: string;
  billOfLading?: string;
  bookingNumber?: string;
  locations: VizionLocation[];
  vessel?: VizionVessel;
  status: string;
  estimatedArrival?: string;
  actualArrival?: string;
}

export interface VizionLocation {
  timestamp: string;
  location: {
    name: string;
    city?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  event: string;
  description?: string;
}

export interface VizionVessel {
  name: string;
  imo?: string;
  mmsi?: string;
  currentPosition?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
}

export class VizionTrackingService {
  private baseUrl = 'https://api.vizionapi.com/v1';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.VIZION_API_KEY || 'demo_key';
  }

  async trackContainer(containerNumber: string): Promise<VizionTrackingData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          container_number: containerNumber,
          scac_code: null // Auto-detect carrier
        })
      });

      if (!response.ok) {
        console.error(`Vizion API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return this.transformVizionData(data);
    } catch (error) {
      console.error('Error tracking container with Vizion:', error);
      return null;
    }
  }

  async trackByBooking(bookingNumber: string, scacCode?: string): Promise<VizionTrackingData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          booking_number: bookingNumber,
          scac_code: scacCode
        })
      });

      if (!response.ok) {
        console.error(`Vizion API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return this.transformVizionData(data);
    } catch (error) {
      console.error('Error tracking booking with Vizion:', error);
      return null;
    }
  }

  async getVesselPosition(vesselImo: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/vessel/${vesselImo}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting vessel position:', error);
      return null;
    }
  }

  private transformVizionData(vizionData: any): VizionTrackingData {
    const locations: VizionLocation[] = vizionData.locations?.map((loc: any) => ({
      timestamp: loc.timestamp,
      location: {
        name: loc.location?.name || 'Unknown',
        city: loc.location?.city,
        country: loc.location?.country,
        coordinates: loc.location?.coordinates ? {
          lat: parseFloat(loc.location.coordinates.lat),
          lng: parseFloat(loc.location.coordinates.lng)
        } : undefined
      },
      event: loc.event || 'Unknown Event',
      description: loc.description
    })) || [];

    return {
      reference: vizionData.container_number || vizionData.booking_number || 'Unknown',
      containerNumber: vizionData.container_number,
      billOfLading: vizionData.bill_of_lading,
      bookingNumber: vizionData.booking_number,
      locations,
      vessel: vizionData.vessel ? {
        name: vizionData.vessel.name,
        imo: vizionData.vessel.imo,
        mmsi: vizionData.vessel.mmsi,
        currentPosition: vizionData.vessel.current_position ? {
          lat: parseFloat(vizionData.vessel.current_position.lat),
          lng: parseFloat(vizionData.vessel.current_position.lng),
          timestamp: vizionData.vessel.current_position.timestamp
        } : undefined
      } : undefined,
      status: this.determineStatus(locations),
      estimatedArrival: vizionData.estimated_arrival,
      actualArrival: vizionData.actual_arrival
    };
  }

  private determineStatus(locations: VizionLocation[]): string {
    if (!locations || locations.length === 0) {
      return 'Unknown';
    }

    const latestLocation = locations[locations.length - 1];
    const event = latestLocation.event.toLowerCase();

    if (event.includes('delivered') || event.includes('discharge')) {
      return 'Delivered';
    }
    if (event.includes('departure') || event.includes('sail')) {
      return 'In Transit';
    }
    if (event.includes('arrival') || event.includes('berth')) {
      return 'At Port';
    }
    if (event.includes('load')) {
      return 'Loading';
    }

    return 'In Transit';
  }

  // Méthode pour obtenir des données démo si l'API n'est pas configurée
  getDemoData(): VizionTrackingData[] {
    return [
      {
        reference: 'MSKU7750050',
        containerNumber: 'MSKU7750050',
        locations: [
          {
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            location: {
              name: 'Shanghai Port',
              city: 'Shanghai',
              country: 'China',
              coordinates: { lat: 31.2304, lng: 121.4737 }
            },
            event: 'Container Loaded'
          },
          {
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            location: {
              name: 'Pacific Ocean',
              coordinates: { lat: 35.0, lng: 140.0 }
            },
            event: 'Vessel Departure'
          },
          {
            timestamp: new Date().toISOString(),
            location: {
              name: 'Approaching Los Angeles',
              city: 'Los Angeles',
              country: 'USA',
              coordinates: { lat: 33.7175, lng: -118.2818 }
            },
            event: 'In Transit'
          }
        ],
        vessel: {
          name: 'MSC GÜLSÜN',
          imo: '9811000',
          currentPosition: {
            lat: 33.7175,
            lng: -118.2818,
            timestamp: new Date().toISOString()
          }
        },
        status: 'In Transit',
        estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        reference: 'COSU4567890',
        containerNumber: 'COSU4567890',
        locations: [
          {
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            location: {
              name: 'Rotterdam Port',
              city: 'Rotterdam',
              country: 'Netherlands',
              coordinates: { lat: 51.9244, lng: 4.4777 }
            },
            event: 'Container Loaded'
          },
          {
            timestamp: new Date().toISOString(),
            location: {
              name: 'North Atlantic',
              coordinates: { lat: 50.0, lng: -30.0 }
            },
            event: 'In Transit'
          }
        ],
        vessel: {
          name: 'COSCO SHIPPING UNIVERSE',
          imo: '9795000',
          currentPosition: {
            lat: 50.0,
            lng: -30.0,
            timestamp: new Date().toISOString()
          }
        },
        status: 'In Transit',
        estimatedArrival: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}

export const vizionService = new VizionTrackingService();
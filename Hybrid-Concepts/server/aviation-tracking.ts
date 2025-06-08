import fetch from 'node-fetch';

export interface AviationTrackingData {
  flightNumber: string;
  airline: string;
  aircraft?: AviationAircraft;
  departure: AviationLocation;
  arrival: AviationLocation;
  status: string;
  actualDeparture?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  route: AviationLocation[];
  cargo?: AviationCargo;
}

export interface AviationLocation {
  airport: string;
  iataCode: string;
  icaoCode?: string;
  city: string;
  country: string;
  timezone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  terminal?: string;
  gate?: string;
  scheduled?: string;
  estimated?: string;
  actual?: string;
}

export interface AviationAircraft {
  registration: string;
  type: string;
  model?: string;
  icao24?: string;
  currentPosition?: {
    lat: number;
    lng: number;
    altitude: number;
    speed: number;
    heading: number;
    timestamp: string;
  };
}

export interface AviationCargo {
  weight: number;
  pieces: number;
  description?: string;
  trackingNumber?: string;
  specialHandling?: string[];
}

export class AviationTrackingService {
  private baseUrl = 'http://api.aviationstack.com/v1';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.AVIATIONSTACK_API_KEY || '';
  }

  async trackFlight(flightNumber: string, date?: string): Promise<AviationTrackingData | null> {
    if (!this.apiKey) {
      console.warn('AviationStack API key not configured');
      return this.generateDemoFlightData(flightNumber);
    }

    try {
      const params = new URLSearchParams({
        access_key: this.apiKey,
        flight_iata: flightNumber,
        limit: '1'
      });

      if (date) {
        params.append('flight_date', date);
      }

      const response = await fetch(`${this.baseUrl}/flights?${params}`);
      
      if (!response.ok) {
        throw new Error(`AviationStack API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (!data.data || data.data.length === 0) {
        return null;
      }

      const flight = data.data[0];
      
      return this.transformAviationStackData(flight);
    } catch (error) {
      console.error('Error tracking flight:', error);
      return this.generateDemoFlightData(flightNumber);
    }
  }

  async getAirportInfo(iataCode: string): Promise<any> {
    if (!this.apiKey) {
      return this.generateDemoAirportData(iataCode);
    }

    try {
      const params = new URLSearchParams({
        access_key: this.apiKey,
        search: iataCode
      });

      const response = await fetch(`${this.baseUrl}/airports?${params}`);
      
      if (!response.ok) {
        throw new Error(`AviationStack API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching airport info:', error);
      return this.generateDemoAirportData(iataCode);
    }
  }

  async getAirlineRoutes(airlineIata: string): Promise<any[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        access_key: this.apiKey,
        airline_iata: airlineIata
      });

      const response = await fetch(`${this.baseUrl}/routes?${params}`);
      
      if (!response.ok) {
        throw new Error(`AviationStack API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.data || [];
    } catch (error) {
      console.error('Error fetching airline routes:', error);
      return [];
    }
  }

  private transformAviationStackData(flight: any): AviationTrackingData {
    return {
      flightNumber: flight.flight?.iata || flight.flight?.icao,
      airline: flight.airline?.name || 'Unknown Airline',
      aircraft: flight.aircraft ? {
        registration: flight.aircraft.registration,
        type: flight.aircraft.iata,
        model: flight.aircraft.icao,
        icao24: flight.aircraft.icao24
      } : undefined,
      departure: {
        airport: flight.departure?.airport || 'Unknown Airport',
        iataCode: flight.departure?.iata || '',
        icaoCode: flight.departure?.icao,
        city: flight.departure?.timezone?.split('/')[1]?.replace('_', ' ') || '',
        country: flight.departure?.timezone?.split('/')[0] || '',
        timezone: flight.departure?.timezone,
        scheduled: flight.departure?.scheduled,
        estimated: flight.departure?.estimated,
        actual: flight.departure?.actual,
        terminal: flight.departure?.terminal,
        gate: flight.departure?.gate
      },
      arrival: {
        airport: flight.arrival?.airport || 'Unknown Airport',
        iataCode: flight.arrival?.iata || '',
        icaoCode: flight.arrival?.icao,
        city: flight.arrival?.timezone?.split('/')[1]?.replace('_', ' ') || '',
        country: flight.arrival?.timezone?.split('/')[0] || '',
        timezone: flight.arrival?.timezone,
        scheduled: flight.arrival?.scheduled,
        estimated: flight.arrival?.estimated,
        actual: flight.arrival?.actual,
        terminal: flight.arrival?.terminal,
        gate: flight.arrival?.gate
      },
      status: flight.flight_status || 'unknown',
      actualDeparture: flight.departure?.actual,
      estimatedArrival: flight.arrival?.estimated,
      actualArrival: flight.arrival?.actual,
      route: []
    };
  }

  private generateDemoFlightData(flightNumber: string): AviationTrackingData {
    const demoFlights = [
      {
        flightNumber: 'AF447',
        airline: 'Air France',
        departure: {
          airport: 'Charles de Gaulle Airport',
          iataCode: 'CDG',
          city: 'Paris',
          country: 'France',
          scheduled: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          coordinates: { lat: 49.0097, lng: 2.5479 }
        },
        arrival: {
          airport: 'John F. Kennedy International Airport',
          iataCode: 'JFK',
          city: 'New York',
          country: 'United States',
          scheduled: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
          coordinates: { lat: 40.6413, lng: -73.7781 }
        },
        status: 'scheduled',
        aircraft: {
          registration: 'F-GZCP',
          type: 'A350-900',
          currentPosition: {
            lat: 49.0097,
            lng: 2.5479,
            altitude: 0,
            speed: 0,
            heading: 270,
            timestamp: new Date().toISOString()
          }
        }
      },
      {
        flightNumber: 'LH441',
        airline: 'Lufthansa',
        departure: {
          airport: 'Frankfurt Airport',
          iataCode: 'FRA',
          city: 'Frankfurt',
          country: 'Germany',
          scheduled: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
          coordinates: { lat: 50.0379, lng: 8.5622 }
        },
        arrival: {
          airport: 'Los Angeles International Airport',
          iataCode: 'LAX',
          city: 'Los Angeles',
          country: 'United States',
          scheduled: new Date(Date.now() + 13 * 60 * 60 * 1000).toISOString(),
          coordinates: { lat: 33.9416, lng: -118.4085 }
        },
        status: 'active',
        aircraft: {
          registration: 'D-AIHF',
          type: 'A340-600',
          currentPosition: {
            lat: 52.5,
            lng: 0.0,
            altitude: 35000,
            speed: 850,
            heading: 270,
            timestamp: new Date().toISOString()
          }
        }
      }
    ];

    const matchingFlight = demoFlights.find(f => 
      f.flightNumber.toLowerCase().includes(flightNumber.toLowerCase())
    );

    if (matchingFlight) {
      return {
        ...matchingFlight,
        route: [],
        cargo: {
          weight: 5000,
          pieces: 125,
          description: 'General cargo and express shipments',
          trackingNumber: `${flightNumber}-${Date.now()}`,
          specialHandling: ['Fragile', 'Priority']
        }
      };
    }

    // Default demo flight
    return {
      flightNumber,
      airline: 'Demo Airlines',
      departure: {
        airport: 'Demo Origin Airport',
        iataCode: 'ORG',
        city: 'Origin City',
        country: 'Origin Country',
        scheduled: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        coordinates: { lat: 48.8566, lng: 2.3522 }
      },
      arrival: {
        airport: 'Demo Destination Airport',
        iataCode: 'DST',
        city: 'Destination City',
        country: 'Destination Country',
        scheduled: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      status: 'scheduled',
      route: [],
      cargo: {
        weight: 2500,
        pieces: 50,
        description: 'Mixed cargo shipment',
        trackingNumber: `${flightNumber}-DEMO`
      }
    };
  }

  private generateDemoAirportData(iataCode: string) {
    const demoAirports: { [key: string]: any } = {
      'CDG': {
        iata: 'CDG',
        icao: 'LFPG',
        name: 'Charles de Gaulle Airport',
        city: 'Paris',
        country: 'France',
        coordinates: { lat: 49.0097, lng: 2.5479 }
      },
      'JFK': {
        iata: 'JFK',
        icao: 'KJFK',
        name: 'John F. Kennedy International Airport',
        city: 'New York',
        country: 'United States',
        coordinates: { lat: 40.6413, lng: -73.7781 }
      },
      'FRA': {
        iata: 'FRA',
        icao: 'EDDF',
        name: 'Frankfurt Airport',
        city: 'Frankfurt',
        country: 'Germany',
        coordinates: { lat: 50.0379, lng: 8.5622 }
      }
    };

    return demoAirports[iataCode] || {
      iata: iataCode,
      name: `${iataCode} Airport`,
      city: 'Unknown',
      country: 'Unknown'
    };
  }
}

export const aviationTrackingService = new AviationTrackingService();
import fetch from 'node-fetch';

export interface MarineTrafficVesselData {
  mmsi: string;
  imo?: string;
  name: string;
  type: string;
  flag: string;
  position: {
    lat: number;
    lng: number;
    timestamp: string;
    speed: number;
    course: number;
    heading: number;
  };
  destination?: string;
  eta?: string;
  draught?: number;
  dimensions: {
    length: number;
    width: number;
  };
  ports: MarineTrafficPort[];
  route: MarineTrafficPosition[];
}

export interface MarineTrafficPort {
  portId: string;
  name: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  facilities: string[];
  maxVesselSize?: {
    length: number;
    draught: number;
  };
}

export interface MarineTrafficPosition {
  timestamp: string;
  lat: number;
  lng: number;
  speed: number;
  course: number;
  status: string;
}

export class MarineTrafficService {
  private baseUrl = 'https://services.marinetraffic.com/api';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.MARINETRAFFIC_API_KEY || '';
  }

  async getVesselByMMSI(mmsi: string): Promise<MarineTrafficVesselData | null> {
    if (!this.apiKey) {
      console.warn('MarineTraffic API key not configured');
      return this.generateDemoVesselData(mmsi);
    }

    try {
      const params = new URLSearchParams({
        v: '8',
        protocol: 'jsono',
        msgtype: 'extended',
        mmsi: mmsi
      });

      const response = await fetch(`${this.baseUrl}/exportvessel/${this.apiKey}?${params}`);
      
      if (!response.ok) {
        throw new Error(`MarineTraffic API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (!data.data || data.data.length === 0) {
        return null;
      }

      return this.transformMarineTrafficData(data.data[0]);
    } catch (error) {
      console.error('Error fetching vessel data:', error);
      return this.generateDemoVesselData(mmsi);
    }
  }

  async getVesselsByPort(portId: string): Promise<MarineTrafficVesselData[]> {
    if (!this.apiKey) {
      return this.generateDemoPortVessels(portId);
    }

    try {
      const params = new URLSearchParams({
        v: '2',
        protocol: 'jsono',
        portid: portId,
        msgtype: 'simple'
      });

      const response = await fetch(`${this.baseUrl}/portcalls/${this.apiKey}?${params}`);
      
      if (!response.ok) {
        throw new Error(`MarineTraffic API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      return (data.data || []).map((vessel: any) => this.transformMarineTrafficData(vessel));
    } catch (error) {
      console.error('Error fetching port vessels:', error);
      return this.generateDemoPortVessels(portId);
    }
  }

  async getPortInfo(portId: string): Promise<MarineTrafficPort | null> {
    if (!this.apiKey) {
      return this.generateDemoPortData(portId);
    }

    try {
      const params = new URLSearchParams({
        v: '1',
        protocol: 'jsono',
        portid: portId
      });

      const response = await fetch(`${this.baseUrl}/portdetails/${this.apiKey}?${params}`);
      
      if (!response.ok) {
        throw new Error(`MarineTraffic API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (!data.data || data.data.length === 0) {
        return null;
      }

      return this.transformPortData(data.data[0]);
    } catch (error) {
      console.error('Error fetching port info:', error);
      return this.generateDemoPortData(portId);
    }
  }

  async getVesselRoute(mmsi: string, fromDate: string, toDate: string): Promise<MarineTrafficPosition[]> {
    if (!this.apiKey) {
      return this.generateDemoRoute(mmsi);
    }

    try {
      const params = new URLSearchParams({
        v: '2',
        protocol: 'jsono',
        mmsi: mmsi,
        fromdate: fromDate,
        todate: toDate
      });

      const response = await fetch(`${this.baseUrl}/vesseltrack/${this.apiKey}?${params}`);
      
      if (!response.ok) {
        throw new Error(`MarineTraffic API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      return (data.data || []).map((position: any) => ({
        timestamp: position.TIMESTAMP,
        lat: parseFloat(position.LAT),
        lng: parseFloat(position.LON),
        speed: parseFloat(position.SPEED || '0'),
        course: parseFloat(position.COURSE || '0'),
        status: position.STATUS || 'unknown'
      }));
    } catch (error) {
      console.error('Error fetching vessel route:', error);
      return this.generateDemoRoute(mmsi);
    }
  }

  private transformMarineTrafficData(vessel: any): MarineTrafficVesselData {
    return {
      mmsi: vessel.MMSI?.toString() || '',
      imo: vessel.IMO?.toString(),
      name: vessel.SHIPNAME || 'Unknown Vessel',
      type: vessel.TYPE_NAME || 'Unknown Type',
      flag: vessel.FLAG || 'Unknown',
      position: {
        lat: parseFloat(vessel.LAT || '0'),
        lng: parseFloat(vessel.LON || '0'),
        timestamp: vessel.TIMESTAMP || new Date().toISOString(),
        speed: parseFloat(vessel.SPEED || '0'),
        course: parseFloat(vessel.COURSE || '0'),
        heading: parseFloat(vessel.HEADING || '0')
      },
      destination: vessel.DESTINATION,
      eta: vessel.ETA,
      draught: parseFloat(vessel.DRAUGHT || '0'),
      dimensions: {
        length: parseFloat(vessel.LENGTH || '0'),
        width: parseFloat(vessel.WIDTH || '0')
      },
      ports: [],
      route: []
    };
  }

  private transformPortData(port: any): MarineTrafficPort {
    return {
      portId: port.PORT_ID?.toString() || '',
      name: port.PORT_NAME || 'Unknown Port',
      country: port.COUNTRY || 'Unknown',
      coordinates: {
        lat: parseFloat(port.LAT || '0'),
        lng: parseFloat(port.LON || '0')
      },
      facilities: port.FACILITIES ? port.FACILITIES.split(',') : [],
      maxVesselSize: {
        length: parseFloat(port.MAX_LENGTH || '0'),
        draught: parseFloat(port.MAX_DRAUGHT || '0')
      }
    };
  }

  private generateDemoVesselData(mmsi: string): MarineTrafficVesselData {
    const demoVessels = [
      {
        mmsi: '247234300',
        imo: '9321483',
        name: 'MSC MEDITERRANEAN',
        type: 'Container Ship',
        flag: 'Italy',
        position: {
          lat: 43.7102,
          lng: 7.2620,
          timestamp: new Date().toISOString(),
          speed: 18.5,
          course: 95,
          heading: 98
        },
        destination: 'SINGAPORE',
        eta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        draught: 14.2,
        dimensions: {
          length: 399,
          width: 59
        }
      },
      {
        mmsi: '636014932',
        imo: '9395044',
        name: 'CMA CGM MARCO POLO',
        type: 'Container Ship',
        flag: 'Liberia',
        position: {
          lat: 51.8985,
          lng: 4.4467,
          timestamp: new Date().toISOString(),
          speed: 0.1,
          course: 180,
          heading: 180
        },
        destination: 'HAMBURG',
        eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        draught: 15.5,
        dimensions: {
          length: 396,
          width: 54
        }
      }
    ];

    const matchingVessel = demoVessels.find(v => v.mmsi === mmsi);
    
    if (matchingVessel) {
      return {
        ...matchingVessel,
        ports: this.generateDemoPorts(),
        route: this.generateDemoRoute(mmsi)
      };
    }

    return {
      mmsi,
      name: `Demo Vessel ${mmsi}`,
      type: 'Container Ship',
      flag: 'Demo Flag',
      position: {
        lat: 45.0 + Math.random() * 10,
        lng: 5.0 + Math.random() * 10,
        timestamp: new Date().toISOString(),
        speed: Math.random() * 20,
        course: Math.random() * 360,
        heading: Math.random() * 360
      },
      dimensions: {
        length: 200 + Math.random() * 200,
        width: 20 + Math.random() * 40
      },
      ports: this.generateDemoPorts(),
      route: this.generateDemoRoute(mmsi)
    };
  }

  private generateDemoPortVessels(portId: string): MarineTrafficVesselData[] {
    return [
      this.generateDemoVesselData('247234300'),
      this.generateDemoVesselData('636014932')
    ];
  }

  private generateDemoPortData(portId: string): MarineTrafficPort {
    const demoPorts: { [key: string]: MarineTrafficPort } = {
      '1': {
        portId: '1',
        name: 'Port of Rotterdam',
        country: 'Netherlands',
        coordinates: { lat: 51.9244, lng: 4.4777 },
        facilities: ['Container Terminal', 'Bulk Terminal', 'Oil Terminal'],
        maxVesselSize: { length: 400, draught: 24 }
      },
      '2': {
        portId: '2',
        name: 'Port of Hamburg',
        country: 'Germany',
        coordinates: { lat: 53.5458, lng: 9.9738 },
        facilities: ['Container Terminal', 'General Cargo'],
        maxVesselSize: { length: 400, draught: 15 }
      },
      '3': {
        portId: '3',
        name: 'Port of Le Havre',
        country: 'France',
        coordinates: { lat: 49.4944, lng: 0.1079 },
        facilities: ['Container Terminal', 'Ro-Ro Terminal'],
        maxVesselSize: { length: 400, draught: 16 }
      }
    };

    return demoPorts[portId] || {
      portId,
      name: `Demo Port ${portId}`,
      country: 'Demo Country',
      coordinates: { lat: 50.0, lng: 5.0 },
      facilities: ['General Terminal']
    };
  }

  private generateDemoPorts(): MarineTrafficPort[] {
    return [
      this.generateDemoPortData('1'),
      this.generateDemoPortData('2'),
      this.generateDemoPortData('3')
    ];
  }

  private generateDemoRoute(mmsi: string): MarineTrafficPosition[] {
    const route: MarineTrafficPosition[] = [];
    const startLat = 45.0;
    const startLng = 5.0;
    
    for (let i = 0; i < 10; i++) {
      route.push({
        timestamp: new Date(Date.now() - (10 - i) * 60 * 60 * 1000).toISOString(),
        lat: startLat + i * 0.5,
        lng: startLng + i * 0.3,
        speed: 15 + Math.random() * 5,
        course: 90 + Math.random() * 20,
        status: i === 9 ? 'current' : 'historical'
      });
    }
    
    return route;
  }
}

export const marineTrafficService = new MarineTrafficService();
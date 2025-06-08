import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Déclaration pour Google Maps
declare global {
  interface Window {
    google: any;
    initFleetMap: () => void;
  }
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Truck, 
  Users, 
  MapPin, 
  Battery, 
  Fuel, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Wrench,
  Navigation,
  Zap
} from "lucide-react";

interface Vehicle {
  id: number;
  vin: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  type: string;
  status: string;
  fuelType: string;
  lastLocation: any;
  currentDriver?: any;
  batteryLevel?: number;
  fuelLevel?: number;
  mileage: number;
  nextMaintenance: string;
}

interface Driver {
  id: number;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  status: string;
  rating: number;
  phone: string;
  currentVehicle?: any;
  hoursWorked: number;
  deliveriesCompleted: number;
}

export default function FleetManagement() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("vehicles");
  const [mapInitialized, setMapInitialized] = useState(false);

  // Mock data for demonstration
  const vehicles: Vehicle[] = [
    {
      id: 1,
      vin: "1HGBH41JXMN109186",
      licensePlate: "TRK-001",
      make: "Volvo",
      model: "FH16",
      year: 2022,
      type: "truck",
      status: "active",
      fuelType: "diesel",
      lastLocation: { lat: 48.8566, lng: 2.3522, address: "Paris, France" },
      batteryLevel: 85,
      fuelLevel: 65,
      mileage: 125430,
      nextMaintenance: "2024-08-15"
    },
    {
      id: 2,
      vin: "2HGBH41JXMN109187",
      licensePlate: "VAN-002",
      make: "Mercedes",
      model: "Sprinter",
      year: 2023,
      type: "van",
      status: "maintenance",
      fuelType: "electric",
      lastLocation: { lat: 52.5200, lng: 13.4050, address: "Berlin, Germany" },
      batteryLevel: 92,
      fuelLevel: 0,
      mileage: 45200,
      nextMaintenance: "2024-07-20"
    }
  ];

  // Initialize Google Maps when tracking tab is selected
  useEffect(() => {
    if (activeTab === "tracking" && !mapInitialized) {
      const timer = setTimeout(() => {
        const mapElement = document.getElementById('fleet-tracking-map');
        if (mapElement) {
          if (window.google && window.google.maps) {
            initializeFleetMap();
          } else {
            loadGoogleMapsScript();
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const loadGoogleMapsScript = () => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=initFleetMap`;
    script.async = true;
    script.defer = true;
    
    window.initFleetMap = initializeFleetMap;
    
    document.head.appendChild(script);
  };

  const initializeFleetMap = () => {
    const mapElement = document.getElementById('fleet-tracking-map');
    if (!mapElement || !window.google || mapInitialized) return;

    const map = new window.google.maps.Map(mapElement, {
      center: { lat: 48.8566, lng: 2.3522 },
      zoom: 6
    });

    // Add vehicle markers
    vehicles.forEach((vehicle: Vehicle) => {
      new window.google.maps.Marker({
        position: { 
          lat: vehicle.lastLocation?.lat || 48.8566, 
          lng: vehicle.lastLocation?.lng || 2.3522 
        },
        map: map,
        title: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`
      });
    });

    setMapInitialized(true);
  };

  const drivers: Driver[] = [
    {
      id: 1,
      firstName: "Jean",
      lastName: "Dupont",
      licenseNumber: "CDL123456",
      status: "driving",
      rating: 4.8,
      phone: "+33 6 12 34 56 78",
      hoursWorked: 35,
      deliveriesCompleted: 142
    },
    {
      id: 2,
      firstName: "Marie",
      lastName: "Martin",
      licenseNumber: "CDL789012",
      status: "available",
      rating: 4.9,
      phone: "+33 6 98 76 54 32",
      hoursWorked: 40,
      deliveriesCompleted: 198
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'driving':
        return 'bg-blue-100 text-blue-800';
      case 'off_duty':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'driving':
        return <Navigation className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
        <p className="text-gray-600 mt-2">Manage your vehicles, drivers, and fleet operations</p>
      </div>

      {/* Fleet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{drivers.filter(d => d.status !== 'off_duty').length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vehicles in Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.filter(v => v.status === 'maintenance').length}</p>
              </div>
              <Wrench className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fleet Utilization</p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <Badge className={getStatusColor(vehicle.status)}>
                      {getStatusIcon(vehicle.status)}
                      <span className="ml-1 capitalize">{vehicle.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{vehicle.licensePlate} • {vehicle.year}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">VIN</p>
                      <p className="text-sm text-gray-900">{vehicle.vin}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Type</p>
                      <p className="text-sm text-gray-900 capitalize">{vehicle.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fuel Type</p>
                      <p className="text-sm text-gray-900 capitalize">{vehicle.fuelType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Mileage</p>
                      <p className="text-sm text-gray-900">{vehicle.mileage.toLocaleString()} km</p>
                    </div>
                  </div>

                  {vehicle.fuelType === 'electric' ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Battery Level</span>
                        <span className="text-sm text-gray-900">{vehicle.batteryLevel}%</span>
                      </div>
                      <Progress value={vehicle.batteryLevel} className="h-2" />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Fuel Level</span>
                        <span className="text-sm text-gray-900">{vehicle.fuelLevel}%</span>
                      </div>
                      <Progress value={vehicle.fuelLevel} className="h-2" />
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Last Location</p>
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 mr-1" />
                      {vehicle.lastLocation.address}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">Next Maintenance</p>
                    <p className="text-sm text-gray-900">{vehicle.nextMaintenance}</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <MapPin className="w-4 h-4 mr-1" />
                      Track
                    </Button>
                    <Button size="sm" variant="outline">
                      <Wrench className="w-4 h-4 mr-1" />
                      Maintenance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {drivers.map((driver) => (
              <Card key={driver.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {driver.firstName} {driver.lastName}
                    </CardTitle>
                    <Badge className={getStatusColor(driver.status)}>
                      {getStatusIcon(driver.status)}
                      <span className="ml-1 capitalize">{driver.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">License: {driver.licenseNumber}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rating</p>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{driver.rating}</span>
                        <span className="text-yellow-400 ml-1">★</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-sm text-gray-900">{driver.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Hours This Week</p>
                      <p className="text-sm text-gray-900">{driver.hoursWorked}h</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Deliveries</p>
                      <p className="text-sm text-gray-900">{driver.deliveriesCompleted}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Users className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Performance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Live Fleet Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                id="fleet-tracking-map" 
                className="w-full h-96 rounded-lg border"
                style={{ minHeight: '400px' }}
              />
              
              {/* Fleet status summary */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    {vehicles.filter(v => v.status === 'active').length}
                  </span>
                </div>
                
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">Maintenance</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-700">
                    {vehicles.filter(v => v.status === 'maintenance').length}
                  </span>
                </div>
                
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Fuel className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-sm font-medium">Avg Fuel</span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">
                    {Math.round(vehicles.reduce((acc, v) => acc + (v.fuelLevel || 0), 0) / vehicles.length)}%
                  </span>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Battery className="w-4 h-4 text-purple-600 mr-1" />
                    <span className="text-sm font-medium">Avg Battery</span>
                  </div>
                  <span className="text-lg font-bold text-purple-700">
                    {Math.round(vehicles.reduce((acc, v) => acc + (v.batteryLevel || 0), 0) / vehicles.length)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
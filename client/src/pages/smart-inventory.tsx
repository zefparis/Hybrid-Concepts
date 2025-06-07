import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, 
  Warehouse,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Brain,
  Zap,
  Eye,
  Calendar,
  MapPin
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function SmartInventory() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const warehouses = [
    {
      id: 1,
      name: "Paris Distribution Center",
      address: "Zone Industrielle, 93200 Saint-Denis",
      capacity: 50000,
      utilization: 78,
      items: 2847,
      zones: 12,
      digitalTwinActive: true,
      iotSensors: 245
    },
    {
      id: 2,
      name: "Lyon Regional Hub",
      address: "Parc Logistique, 69800 Saint-Priest",
      capacity: 30000,
      utilization: 65,
      items: 1653,
      zones: 8,
      digitalTwinActive: true,
      iotSensors: 156
    }
  ];

  const inventoryItems = [
    {
      sku: "ELEC-001",
      name: "Smartphone Components",
      quantity: 2450,
      minStock: 500,
      maxStock: 5000,
      value: 245000,
      location: "A-12-05",
      predictedDemand: 320,
      restockDate: "2024-07-25",
      status: "optimal",
      turnoverRate: 12.5
    },
    {
      sku: "AUTO-045",
      name: "Engine Parts",
      quantity: 85,
      minStock: 100,
      maxStock: 800,
      value: 42500,
      location: "B-08-12",
      predictedDemand: 45,
      restockDate: "2024-07-18",
      status: "low_stock",
      turnoverRate: 8.2
    },
    {
      sku: "TEXT-098",
      name: "Textile Materials",
      quantity: 1850,
      minStock: 200,
      maxStock: 2000,
      value: 18500,
      location: "C-15-03",
      predictedDemand: 150,
      restockDate: "2024-08-05",
      status: "overstocked",
      turnoverRate: 6.8
    }
  ];

  const demandForecast = [
    { week: "W1", actual: 320, predicted: 315, accuracy: 98 },
    { week: "W2", actual: 285, predicted: 290, accuracy: 96 },
    { week: "W3", actual: 410, predicted: 405, accuracy: 99 },
    { week: "W4", actual: 375, predicted: 380, accuracy: 97 },
    { week: "W5", predicted: 360 },
    { week: "W6", predicted: 395 },
    { week: "W7", predicted: 420 },
    { week: "W8", predicted: 385 }
  ];

  const warehouseMetrics = [
    { hour: "00:00", temperature: 18.5, humidity: 45, occupancy: 12 },
    { hour: "04:00", temperature: 17.8, humidity: 48, occupancy: 8 },
    { hour: "08:00", temperature: 19.2, humidity: 42, occupancy: 85 },
    { hour: "12:00", temperature: 21.5, humidity: 38, occupancy: 95 },
    { hour: "16:00", temperature: 20.8, humidity: 40, occupancy: 78 },
    { hour: "20:00", temperature: 19.1, humidity: 44, occupancy: 25 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-red-100 text-red-800';
      case 'overstocked':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="w-4 h-4" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4" />;
      case 'overstocked':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Smart Inventory Management</h1>
        <p className="text-gray-600 mt-2">AI-powered inventory optimization with digital twins and IoT monitoring</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inventory</p>
                <p className="text-2xl font-bold text-gray-900">€2.8M</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5.2% vs last month
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Turnover Rate</p>
                <p className="text-2xl font-bold text-gray-900">9.2×</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +0.8× vs last month
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Forecast Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">97.5%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2.1% vs last month
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stockouts Prevented</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -12 vs last month
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="forecasting">AI Forecasting</TabsTrigger>
          <TabsTrigger value="digital-twin">Digital Twin</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Demand Forecasting Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={demandForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="Actual Demand" />
                    <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeDasharray="5 5" name="Predicted Demand" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Warehouse Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={warehouseMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="temperature" stackId="1" stroke="#ef4444" fill="#fee2e2" name="Temperature (°C)" />
                    <Area type="monotone" dataKey="humidity" stackId="2" stroke="#06b6d4" fill="#e0f7fa" name="Humidity (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Alerts and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  Critical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AUTO-045</strong> below minimum stock level. Restock required within 3 days.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Zone B-08</strong> temperature exceeding optimal range (22.5°C).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Optimize Layout</p>
                  <p className="text-xs text-blue-700">Move high-turnover items closer to shipping dock (18% efficiency gain)</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Reduce Overstock</p>
                  <p className="text-xs text-green-700">TEXT-098 can be reduced by 400 units (€4,000 working capital freed)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="warehouses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {warehouses.map((warehouse) => (
              <Card key={warehouse.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                    <Badge className="bg-green-100 text-green-800">
                      <Zap className="w-3 h-3 mr-1" />
                      Digital Twin Active
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{warehouse.address}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Capacity</p>
                      <p className="text-sm text-gray-900">{warehouse.capacity.toLocaleString()} m²</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Items</p>
                      <p className="text-sm text-gray-900">{warehouse.items.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Zones</p>
                      <p className="text-sm text-gray-900">{warehouse.zones}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">IoT Sensors</p>
                      <p className="text-sm text-gray-900">{warehouse.iotSensors}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Utilization</span>
                      <span className="text-sm text-gray-900">{warehouse.utilization}%</span>
                    </div>
                    <Progress value={warehouse.utilization} className="h-2" />
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View Digital Twin
                    </Button>
                    <Button size="sm" variant="outline">
                      <MapPin className="w-4 h-4 mr-1" />
                      Floor Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Inventory Items</h2>
              <p className="text-sm text-gray-600">Manage stock levels and track item performance</p>
            </div>
            <div className="flex space-x-2">
              <Input placeholder="Search SKU or name..." className="w-64" />
              <Button>Add Item</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {inventoryItems.map((item) => (
              <Card key={item.sku}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1 capitalize">{item.status.replace('_', ' ')}</span>
                        </Badge>
                        <Badge variant="outline">{item.sku}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Location: {item.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">€{item.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Turnover: {item.turnoverRate}×</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Current Stock</p>
                      <p className="text-lg font-bold text-gray-900">{item.quantity.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Min Stock</p>
                      <p className="text-sm text-gray-900">{item.minStock.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Predicted Demand</p>
                      <p className="text-sm text-gray-900">{item.predictedDemand}/week</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Restock Date</p>
                      <p className="text-sm text-gray-900">{item.restockDate}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Stock Level</span>
                      <span className="text-sm text-gray-900">
                        {item.quantity} / {item.maxStock}
                      </span>
                    </div>
                    <Progress 
                      value={(item.quantity / item.maxStock) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  AI Demand Forecasting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Model Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-700">Accuracy</p>
                        <p className="text-xl font-bold text-blue-900">97.5%</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">MAE</p>
                        <p className="text-xl font-bold text-blue-900">8.3</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Factors Considered</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Historical demand patterns</li>
                      <li>• Seasonal trends</li>
                      <li>• Market conditions</li>
                      <li>• Promotional activities</li>
                      <li>• External events</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">Safety Stock Optimization</p>
                    <p className="text-sm text-green-700">Reduce safety stock by 15% while maintaining 99.5% service level</p>
                    <p className="text-xs text-green-600 mt-1">Potential savings: €45,000</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">Reorder Point Adjustment</p>
                    <p className="text-sm text-blue-700">Update reorder points for 23 items based on latest demand patterns</p>
                    <p className="text-xs text-blue-600 mt-1">Reduce stockouts by 30%</p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900">ABC Analysis Update</p>
                    <p className="text-sm text-purple-700">12 items have changed categories this month</p>
                    <p className="text-xs text-purple-600 mt-1">Review focus and handling procedures</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="digital-twin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Digital Twin Warehouse Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 h-96 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                <div className="text-center">
                  <Warehouse className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">3D Warehouse Visualization</h3>
                  <p className="text-gray-600 mb-4">Interactive digital twin with real-time IoT data integration</p>
                  <div className="flex space-x-4 justify-center">
                    <Button>
                      <Eye className="w-4 h-4 mr-2" />
                      Launch 3D View
                    </Button>
                    <Button variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics Mode
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900">Real-time Tracking</h4>
                  <p className="text-sm text-green-700 mt-1">245 IoT sensors providing live data</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Flow Optimization</h4>
                  <p className="text-sm text-blue-700 mt-1">AI-optimized picking paths and layouts</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900">Predictive Maintenance</h4>
                  <p className="text-sm text-purple-700 mt-1">Equipment health monitoring and alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
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
  Store, 
  Plug,
  Star,
  Download,
  TrendingUp,
  CheckCircle,
  Settings,
  Code,
  Globe,
  Zap,
  Shield,
  Clock,
  DollarSign,
  BarChart3,
  Package,
  AlertTriangle,
  Cloud,
  MapPin,
  FileText,
  Leaf
} from "lucide-react";

export default function APIMarketplace() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("marketplace");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const apiIntegrations = [
    {
      id: 1,
      name: "Weather Intelligence API",
      provider: "MeteoLogistics",
      category: "weather",
      description: "Real-time weather data and predictive analytics for route optimization",
      rating: 4.8,
      downloads: 12500,
      price: "€0.05/call",
      tier: "freemium",
      features: ["Real-time data", "7-day forecasts", "Storm alerts", "Route recommendations"],
      status: "verified",
      lastUpdate: "2024-06-10",
      documentation: "Complete",
      uptime: 99.9
    },
    {
      id: 2,
      name: "Port Congestion Monitor",
      provider: "GlobalPorts Inc",
      category: "tracking",
      description: "Live port congestion data and berth availability across 500+ ports worldwide",
      rating: 4.6,
      downloads: 8200,
      price: "€150/month",
      tier: "premium",
      features: ["500+ ports", "Real-time updates", "Berth booking", "Historical data"],
      status: "verified",
      lastUpdate: "2024-06-12",
      documentation: "Complete",
      uptime: 98.5
    },
    {
      id: 3,
      name: "Customs Automation Suite",
      provider: "TradeFlow Systems",
      category: "customs",
      description: "Automated customs documentation and compliance checking for 180+ countries",
      rating: 4.9,
      downloads: 6800,
      price: "€0.15/document",
      tier: "enterprise",
      features: ["180+ countries", "Auto-classification", "Duty calculation", "Compliance check"],
      status: "verified",
      lastUpdate: "2024-06-08",
      documentation: "Complete",
      uptime: 99.7
    },
    {
      id: 4,
      name: "Carbon Footprint Calculator",
      provider: "EcoLogistics",
      category: "sustainability",
      description: "Precise carbon emission calculations for all transport modes with offset marketplace",
      rating: 4.7,
      downloads: 4100,
      price: "Free",
      tier: "free",
      features: ["All transport modes", "Offset marketplace", "ESG reporting", "API integration"],
      status: "verified",
      lastUpdate: "2024-06-05",
      documentation: "Complete",
      uptime: 99.2
    },
    {
      id: 5,
      name: "Blockchain Track & Trace",
      provider: "ChainLogistics",
      category: "blockchain",
      description: "Immutable shipment tracking using blockchain technology for complete transparency",
      rating: 4.3,
      downloads: 2900,
      price: "€0.25/transaction",
      tier: "premium",
      features: ["Immutable records", "Smart contracts", "Multi-party visibility", "Audit trail"],
      status: "beta",
      lastUpdate: "2024-06-14",
      documentation: "Partial",
      uptime: 97.8
    },
    {
      id: 6,
      name: "AI Route Optimizer",
      provider: "SmartRoutes AI",
      category: "optimization",
      description: "Machine learning-powered route optimization considering traffic, weather, and costs",
      rating: 4.5,
      downloads: 7300,
      price: "€0.08/route",
      tier: "premium",
      features: ["ML optimization", "Multi-constraint", "Real-time updates", "Cost analysis"],
      status: "verified",
      lastUpdate: "2024-06-11",
      documentation: "Complete",
      uptime: 99.1
    }
  ];

  const categories = [
    { id: "all", name: "All Categories", count: apiIntegrations.length },
    { id: "weather", name: "Weather", count: apiIntegrations.filter(api => api.category === "weather").length },
    { id: "tracking", name: "Tracking", count: apiIntegrations.filter(api => api.category === "tracking").length },
    { id: "customs", name: "Customs", count: apiIntegrations.filter(api => api.category === "customs").length },
    { id: "sustainability", name: "Sustainability", count: apiIntegrations.filter(api => api.category === "sustainability").length },
    { id: "optimization", name: "Optimization", count: apiIntegrations.filter(api => api.category === "optimization").length },
    { id: "blockchain", name: "Blockchain", count: apiIntegrations.filter(api => api.category === "blockchain").length }
  ];

  const myIntegrations = [
    {
      id: 1,
      name: "Weather Intelligence API",
      status: "active",
      usage: 1250,
      limit: 5000,
      lastUsed: "2024-06-15T10:30:00Z",
      cost: 62.50
    },
    {
      id: 2,
      name: "Port Congestion Monitor",
      status: "active",
      usage: 890,
      limit: 2000,
      lastUsed: "2024-06-15T14:20:00Z",
      cost: 150.00
    },
    {
      id: 4,
      name: "Carbon Footprint Calculator",
      status: "active",
      usage: 340,
      limit: 1000,
      lastUsed: "2024-06-14T16:45:00Z",
      cost: 0.00
    }
  ];

  const filteredAPIs = selectedCategory === "all" 
    ? apiIntegrations 
    : apiIntegrations.filter(api => api.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'beta':
        return 'bg-yellow-100 text-yellow-800';
      case 'deprecated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'beta':
        return <Clock className="w-4 h-4" />;
      case 'deprecated':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'freemium':
        return 'bg-orange-100 text-orange-800';
      case 'free':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weather':
        return <Cloud className="w-5 h-5" />;
      case 'tracking':
        return <MapPin className="w-5 h-5" />;
      case 'customs':
        return <FileText className="w-5 h-5" />;
      case 'sustainability':
        return <Leaf className="w-5 h-5" />;
      case 'optimization':
        return <Zap className="w-5 h-5" />;
      case 'blockchain':
        return <Shield className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Marketplace</h1>
        <p className="text-gray-600 mt-2">Discover and integrate third-party APIs to enhance your logistics operations</p>
      </div>

      {/* Marketplace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available APIs</p>
                <p className="text-2xl font-bold text-gray-900">{apiIntegrations.length}</p>
              </div>
              <Store className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Integrations</p>
                <p className="text-2xl font-bold text-gray-900">{myIntegrations.length}</p>
              </div>
              <Plug className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                <p className="text-2xl font-bold text-gray-900">€{myIntegrations.reduce((sum, int) => sum + int.cost, 0).toFixed(0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Calls</p>
                <p className="text-2xl font-bold text-gray-900">{myIntegrations.reduce((sum, int) => sum + int.usage, 0).toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="my-integrations">My Integrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
            <Input placeholder="Search APIs..." className="w-full sm:w-64" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAPIs.map((api) => (
              <Card key={api.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(api.category)}
                      <div>
                        <CardTitle className="text-lg">{api.name}</CardTitle>
                        <p className="text-sm text-gray-600">by {api.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getTierColor(api.tier)}>
                        {api.tier}
                      </Badge>
                      <Badge className={getStatusColor(api.status)}>
                        {getStatusIcon(api.status)}
                        <span className="ml-1">{api.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">{api.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rating</p>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{api.rating}</span>
                        <span className="text-xs text-gray-500 ml-2">({api.downloads} downloads)</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pricing</p>
                      <p className="text-sm font-bold text-gray-900">{api.price}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Uptime</p>
                      <p className="text-sm font-bold text-green-600">{api.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Documentation</p>
                      <p className="text-sm font-medium text-gray-900">{api.documentation}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {api.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Install
                    </Button>
                    <Button size="sm" variant="outline">
                      <Globe className="w-4 h-4 mr-1" />
                      Docs
                    </Button>
                    <Button size="sm" variant="outline">
                      <Code className="w-4 h-4 mr-1" />
                      Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-integrations" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">My Active Integrations</h2>
              <p className="text-sm text-gray-600">Manage your installed APIs and monitor usage</p>
            </div>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Manage All
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {myIntegrations.map((integration) => {
              const apiDetails = apiIntegrations.find(api => api.id === integration.id);
              return (
                <Card key={integration.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(apiDetails?.category || 'default')}
                        <div>
                          <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                          <p className="text-sm text-gray-600">by {apiDetails?.provider}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Usage</p>
                        <p className="text-sm text-gray-900">{integration.usage.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Limit</p>
                        <p className="text-sm text-gray-900">{integration.limit.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Cost</p>
                        <p className="text-sm text-gray-900">€{integration.cost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Last Used</p>
                        <p className="text-sm text-gray-900">{new Date(integration.lastUsed).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Usage</span>
                        <span className="text-sm text-gray-900">
                          {((integration.usage / integration.limit) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={(integration.usage / integration.limit) * 100} className="h-2" />
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Analytics
                      </Button>
                      <Button size="sm" variant="outline">
                        <Globe className="w-4 h-4 mr-1" />
                        Documentation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">API usage analytics dashboard</p>
                  <p className="text-sm text-gray-500 mt-2">Usage trends, cost analysis, and performance metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top APIs by Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myIntegrations.sort((a, b) => b.usage - a.usage).map((integration, index) => (
                    <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-gray-900">{integration.name}</p>
                          <p className="text-sm text-gray-600">{integration.usage.toLocaleString()} calls</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900">€{integration.cost.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Average Response Time</span>
                    <span className="text-sm font-bold text-green-600">145ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Success Rate</span>
                    <span className="text-sm font-bold text-green-600">99.7%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Error Rate</span>
                    <span className="text-sm font-bold text-green-600">0.3%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Total API Calls</span>
                    <span className="text-sm font-bold text-blue-600">{myIntegrations.reduce((sum, int) => sum + int.usage, 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
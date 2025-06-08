import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Cloud,
  Globe,
  MapPin,
  Package,
  Truck,
  Eye,
  Brain,
  Target,
  CheckCircle
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";

export default function RiskAssessment() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const riskOverview = {
    overallScore: 72,
    weatherRisk: 25,
    geopoliticalRisk: 45,
    routeRisk: 30,
    cargoRisk: 15,
    trend: "improving"
  };

  const activeRisks = [
    {
      id: 1,
      type: "weather",
      severity: "high",
      title: "Severe Weather Alert",
      description: "Tropical storm approaching Southeast Asia routes",
      affectedShipments: 23,
      impact: "2-4 day delays expected",
      recommendation: "Reroute via northern corridors",
      probability: 85
    },
    {
      id: 2,
      type: "geopolitical",
      severity: "medium",
      title: "Port Strike",
      description: "Dock workers strike at Hamburg port",
      affectedShipments: 12,
      impact: "Alternative ports available",
      recommendation: "Use Rotterdam or Antwerp",
      probability: 70
    },
    {
      id: 3,
      type: "security",
      severity: "low",
      title: "Piracy Alert",
      description: "Increased activity in Gulf of Aden",
      affectedShipments: 5,
      impact: "Enhanced security measures required",
      recommendation: "Use naval convoy or alternative route",
      probability: 30
    }
  ];

  const riskTrends = [
    { month: "Jan", weather: 35, geopolitical: 40, route: 25, cargo: 20 },
    { month: "Feb", weather: 30, geopolitical: 45, route: 28, cargo: 18 },
    { month: "Mar", weather: 40, geopolitical: 35, route: 32, cargo: 22 },
    { month: "Apr", weather: 25, geopolitical: 50, route: 30, cargo: 15 },
    { month: "May", weather: 20, geopolitical: 42, route: 28, cargo: 12 },
    { month: "Jun", weather: 25, geopolitical: 45, route: 30, cargo: 15 }
  ];

  const routeAnalysis = [
    {
      route: "Asia-Europe",
      riskScore: 65,
      weather: 30,
      geopolitical: 70,
      piracy: 40,
      congestion: 80,
      recommendation: "Monitor closely"
    },
    {
      route: "Trans-Pacific",
      riskScore: 45,
      weather: 60,
      geopolitical: 20,
      piracy: 10,
      congestion: 50,
      recommendation: "Low risk"
    },
    {
      route: "Trans-Atlantic",
      riskScore: 35,
      weather: 40,
      geopolitical: 15,
      piracy: 5,
      congestion: 40,
      recommendation: "Optimal"
    }
  ];

  const mitigationStrategies = [
    {
      category: "Weather",
      strategies: [
        "Real-time weather monitoring",
        "Alternative route planning",
        "Flexible scheduling",
        "Enhanced cargo protection"
      ]
    },
    {
      category: "Geopolitical",
      strategies: [
        "Diplomatic risk assessment",
        "Multi-corridor approach",
        "Political stability monitoring",
        "Contingency planning"
      ]
    },
    {
      category: "Security",
      strategies: [
        "Security escort services",
        "Cargo tracking systems",
        "Insurance coverage",
        "Secure facility partnerships"
      ]
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Eye className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return <Cloud className="w-5 h-5" />;
      case 'geopolitical':
        return <Globe className="w-5 h-5" />;
      case 'security':
        return <Shield className="w-5 h-5" />;
      case 'route':
        return <MapPin className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Risk Assessment</h1>
        <p className="text-gray-600 mt-2">Comprehensive risk analysis and mitigation for logistics operations</p>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Risk</p>
                <p className="text-2xl font-bold text-gray-900">{riskOverview.overallScore}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Improving
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weather Risk</p>
                <p className="text-2xl font-bold text-gray-900">{riskOverview.weatherRisk}</p>
              </div>
              <Cloud className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Geopolitical</p>
                <p className="text-2xl font-bold text-gray-900">{riskOverview.geopoliticalRisk}</p>
              </div>
              <Globe className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Route Risk</p>
                <p className="text-2xl font-bold text-gray-900">{riskOverview.routeRisk}</p>
              </div>
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cargo Risk</p>
                <p className="text-2xl font-bold text-gray-900">{riskOverview.cargoRisk}</p>
              </div>
              <Package className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="routes">Route Analysis</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Profile Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[{
                    category: 'Weather',
                    current: riskOverview.weatherRisk,
                    threshold: 50
                  }, {
                    category: 'Geopolitical',
                    current: riskOverview.geopoliticalRisk,
                    threshold: 50
                  }, {
                    category: 'Route',
                    current: riskOverview.routeRisk,
                    threshold: 50
                  }, {
                    category: 'Cargo',
                    current: riskOverview.cargoRisk,
                    threshold: 50
                  }, {
                    category: 'Security',
                    current: 35,
                    threshold: 50
                  }]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Current Risk" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Radar name="Risk Threshold" dataKey="threshold" stroke="#ef4444" strokeDasharray="5 5" />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={riskTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="weather" stroke="#3b82f6" name="Weather" />
                    <Line type="monotone" dataKey="geopolitical" stroke="#8b5cf6" name="Geopolitical" />
                    <Line type="monotone" dataKey="route" stroke="#10b981" name="Route" />
                    <Line type="monotone" dataKey="cargo" stroke="#f59e0b" name="Cargo" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Risk Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Pattern Recognition</h3>
                  <p className="text-sm text-blue-700">AI detected 15% increase in weather-related delays on Asia-Europe routes during monsoon season</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">Predictive Analysis</h3>
                  <p className="text-sm text-purple-700">68% probability of port congestion in Long Beach next week based on historical patterns</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Optimization</h3>
                  <p className="text-sm text-green-700">Alternative routes can reduce overall risk by 23% with only 8% cost increase</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {activeRisks.map((risk) => (
              <Card key={risk.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getRiskIcon(risk.type)}
                      <div>
                        <CardTitle className="text-lg">{risk.title}</CardTitle>
                        <p className="text-sm text-gray-600">{risk.description}</p>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(risk.severity)}>
                      {getSeverityIcon(risk.severity)}
                      <span className="ml-1 capitalize">{risk.severity}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Affected Shipments</p>
                      <p className="text-lg font-bold text-gray-900">{risk.affectedShipments}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Probability</p>
                      <p className="text-lg font-bold text-gray-900">{risk.probability}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Impact</p>
                      <p className="text-sm text-gray-900">{risk.impact}</p>
                    </div>
                  </div>

                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Recommendation:</strong> {risk.recommendation}
                    </AlertDescription>
                  </Alert>

                  <div className="flex space-x-2">
                    <Button size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Truck className="w-4 h-4 mr-1" />
                      Affected Shipments
                    </Button>
                    <Button size="sm" variant="outline">
                      <Shield className="w-4 h-4 mr-1" />
                      Apply Mitigation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {routeAnalysis.map((route, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{route.route}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Risk Score:</span>
                      <Badge className={route.riskScore > 60 ? 'bg-red-100 text-red-800' : route.riskScore > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                        {route.riskScore}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Weather Risk</p>
                      <Progress value={route.weather} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{route.weather}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Geopolitical Risk</p>
                      <Progress value={route.geopolitical} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{route.geopolitical}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Piracy Risk</p>
                      <Progress value={route.piracy} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{route.piracy}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Congestion Risk</p>
                      <Progress value={route.congestion} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{route.congestion}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Recommendation</p>
                      <p className="text-sm text-gray-900">{route.recommendation}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <MapPin className="w-4 h-4 mr-1" />
                      View Route
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mitigation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mitigationStrategies.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getRiskIcon(category.category.toLowerCase())}
                    <span className="ml-2">{category.category} Mitigation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.strategies.map((strategy, strategyIndex) => (
                      <div key={strategyIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-900">{strategy}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" size="sm" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Configure Strategy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Mitigation Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Active Mitigations</h3>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-blue-700">Currently deployed</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Risk Reduction</h3>
                  <p className="text-2xl font-bold text-green-600">34%</p>
                  <p className="text-sm text-green-700">Average reduction</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">Cost Impact</h3>
                  <p className="text-2xl font-bold text-purple-600">2.1%</p>
                  <p className="text-sm text-purple-700">Additional costs</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-medium text-orange-900 mb-2">Effectiveness</h3>
                  <p className="text-2xl font-bold text-orange-600">92%</p>
                  <p className="text-sm text-orange-700">Success rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Real-time Risk Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Global risk monitoring dashboard</p>
                  <p className="text-sm text-gray-500 mt-2">Real-time data feeds from weather, news, and maritime sources</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Weather APIs</p>
                      <p className="text-sm text-green-700">Global weather monitoring</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">News Feeds</p>
                      <p className="text-sm text-green-700">Political and security updates</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Maritime Traffic</p>
                      <p className="text-sm text-green-700">Port congestion and delays</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Risk Threshold</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Low</span>
                      <Progress value={60} className="flex-1" />
                      <span className="text-sm text-gray-600">High</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Alert Frequency</p>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option>Real-time</option>
                      <option>Hourly</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Notification Channels</p>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm text-gray-900">Email notifications</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm text-gray-900">SMS alerts</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-900">Slack integration</span>
                      </label>
                    </div>
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
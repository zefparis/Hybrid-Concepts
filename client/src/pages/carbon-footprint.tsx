import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Leaf, 
  TrendingDown,
  TrendingUp,
  Award,
  Target,
  Factory,
  Truck,
  Ship,
  Plane,
  TreePine,
  Calculator,
  BarChart3,
  Globe
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

export default function CarbonFootprint() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const monthlyEmissions = [
    { month: "Jan", emissions: 4200, offset: 1000, net: 3200 },
    { month: "Feb", emissions: 3800, offset: 1200, net: 2600 },
    { month: "Mar", emissions: 4500, offset: 1500, net: 3000 },
    { month: "Apr", emissions: 4100, offset: 1800, net: 2300 },
    { month: "May", emissions: 3900, offset: 2000, net: 1900 },
    { month: "Jun", emissions: 4300, offset: 2200, net: 2100 },
  ];

  const transportModeEmissions = [
    { mode: "Road", emissions: 2400, percentage: 45, color: "#3b82f6" },
    { mode: "Sea", emissions: 1800, percentage: 34, color: "#06b6d4" },
    { mode: "Air", emissions: 800, percentage: 15, color: "#f59e0b" },
    { mode: "Rail", emissions: 320, percentage: 6, color: "#10b981" },
  ];

  const offsetProjects = [
    { 
      name: "Reforestation Brazil", 
      type: "Forest Conservation",
      credits: 5000,
      cost: 12500,
      status: "active",
      certification: "VCS"
    },
    { 
      name: "Solar Farm India", 
      type: "Renewable Energy",
      credits: 3200,
      cost: 9600,
      status: "active",
      certification: "Gold Standard"
    },
    { 
      name: "Methane Capture", 
      type: "Waste Management",
      credits: 1800,
      cost: 7200,
      status: "pending",
      certification: "CAR"
    }
  ];

  const sustainabilityGoals = [
    {
      goal: "Carbon Neutral by 2030",
      progress: 65,
      target: "100% offset",
      current: "65% offset"
    },
    {
      goal: "Reduce Emissions 50%",
      progress: 28,
      target: "50% reduction",
      current: "28% reduction"
    },
    {
      goal: "100% Electric Fleet",
      progress: 15,
      target: "100% electric",
      current: "15% electric"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Carbon Footprint Management</h1>
        <p className="text-gray-600 mt-2">Track, reduce, and offset your logistics carbon emissions</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Emissions</p>
                <p className="text-2xl font-bold text-gray-900">25.3 tCO₂</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% vs last month
                </p>
              </div>
              <Factory className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Carbon Offset</p>
                <p className="text-2xl font-bold text-gray-900">12.1 tCO₂</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% vs last month
                </p>
              </div>
              <TreePine className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Emissions</p>
                <p className="text-2xl font-bold text-gray-900">13.2 tCO₂</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -5% vs last month
                </p>
              </div>
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">0.42 kg/km</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -12% vs last month
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="offsetting">Offsetting</TabsTrigger>
          <TabsTrigger value="goals">Sustainability Goals</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Emissions Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyEmissions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="emissions" stroke="#ef4444" name="Total Emissions" />
                    <Line type="monotone" dataKey="offset" stroke="#22c55e" name="Carbon Offset" />
                    <Line type="monotone" dataKey="net" stroke="#3b82f6" name="Net Emissions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emissions by Transport Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={transportModeEmissions}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="emissions"
                      label={({ mode, percentage }) => `${mode} ${percentage}%`}
                    >
                      {transportModeEmissions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transport Mode Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {transportModeEmissions.map((mode) => (
                  <div key={mode.mode} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{mode.mode}</h3>
                      {mode.mode === "Road" && <Truck className="w-5 h-5 text-blue-600" />}
                      {mode.mode === "Sea" && <Ship className="w-5 h-5 text-cyan-600" />}
                      {mode.mode === "Air" && <Plane className="w-5 h-5 text-yellow-600" />}
                      {mode.mode === "Rail" && <Factory className="w-5 h-5 text-green-600" />}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{mode.emissions} kg</p>
                    <p className="text-sm text-gray-600">{mode.percentage}% of total</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Carbon Footprint Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Calculate Shipment Emissions</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Transport Mode</label>
                      <select className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                        <option>Road Transport</option>
                        <option>Sea Freight</option>
                        <option>Air Freight</option>
                        <option>Rail Transport</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Distance (km)</label>
                      <input type="number" className="w-full mt-1 p-2 border border-gray-300 rounded-md" placeholder="1250" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                      <input type="number" className="w-full mt-1 p-2 border border-gray-300 rounded-md" placeholder="500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
                      <select className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                        <option>Heavy Truck (>32t)</option>
                        <option>Medium Truck (7.5-32t)</option>
                        <option>Light Vehicle (<7.5t)</option>
                        <option>Electric Vehicle</option>
                      </select>
                    </div>
                    <Button className="w-full">
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate Emissions
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">Calculation Results</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Base Emissions:</span>
                      <span className="text-sm font-medium">245.5 kg CO₂</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Weight Factor:</span>
                      <span className="text-sm font-medium">× 1.2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vehicle Efficiency:</span>
                      <span className="text-sm font-medium">× 0.95</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Total Emissions:</span>
                      <span className="font-bold text-lg text-red-600">279.5 kg CO₂</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Offset Cost:</span>
                      <span className="text-sm font-medium">€8.39</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offsetting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {offsetProjects.map((project, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge className={project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{project.type}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Credits</p>
                      <p className="text-lg font-bold text-gray-900">{project.credits.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cost</p>
                      <p className="text-lg font-bold text-gray-900">€{project.cost.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Certification</p>
                    <Badge variant="outline">{project.certification}</Badge>
                  </div>
                  <Button className="w-full" size="sm">
                    <TreePine className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Carbon Offset Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Explore Offset Projects</h3>
                <p className="text-gray-600 mb-4">Browse verified carbon offset projects worldwide</p>
                <Button>
                  <Award className="w-4 h-4 mr-2" />
                  Browse Projects
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sustainability Goals Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {sustainabilityGoals.map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{goal.goal}</h3>
                      <span className="text-sm text-gray-600">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Current: {goal.current}</span>
                      <span>Target: {goal.target}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">2024 Q3</p>
                      <p className="text-sm text-gray-600">Achieve 25% fleet electrification</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="w-3 h-3 bg-yellow-600 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">2025 Q2</p>
                      <p className="text-sm text-gray-600">50% emission reduction milestone</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">2030</p>
                      <p className="text-sm text-gray-600">Full carbon neutrality</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ESG Reporting Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Environmental Score</h3>
                  <p className="text-3xl font-bold text-green-600">78/100</p>
                  <p className="text-sm text-green-700">Above industry average</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Social Score</h3>
                  <p className="text-3xl font-bold text-blue-600">85/100</p>
                  <p className="text-sm text-blue-700">Excellent performance</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">Governance Score</h3>
                  <p className="text-3xl font-bold text-purple-600">92/100</p>
                  <p className="text-sm text-purple-700">Industry leading</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline">
                  <Globe className="w-4 h-4 mr-2" />
                  Submit to CDP
                </Button>
                <Button variant="outline">
                  <Award className="w-4 h-4 mr-2" />
                  Export for Audit
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, TrendingDown, DollarSign, Package, Clock, 
  AlertTriangle, Target, Activity, Globe, Truck, Ship, Plane
} from "lucide-react";

interface AnalyticsData {
  kpis: {
    totalRevenue: number;
    revenueGrowth: number;
    totalShipments: number;
    shipmentGrowth: number;
    averageDeliveryTime: number;
    deliveryImprovement: number;
    customerSatisfaction: number;
    satisfactionChange: number;
    costPerShipment: number;
    costReduction: number;
    onTimeDelivery: number;
    onTimeImprovement: number;
  };
  revenueChart: Array<{ month: string; revenue: number; profit: number; }>;
  shipmentsByMode: Array<{ mode: string; count: number; percentage: number; color: string; }>;
  performanceTrends: Array<{ date: string; deliveryTime: number; satisfaction: number; cost: number; }>;
  regionalPerformance: Array<{ region: string; shipments: number; revenue: number; satisfaction: number; }>;
  predictiveInsights: {
    nextMonthRevenue: number;
    predictedGrowth: number;
    riskFactors: Array<{ factor: string; impact: string; probability: number; }>;
    opportunities: Array<{ opportunity: string; impact: string; effort: string; }>;
  };
}

export default function Analytics() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/dashboard", timeRange],
    queryFn: async () => {
      // Simulated real analytics data - in production this would come from actual API
      return {
        kpis: {
          totalRevenue: 2847500,
          revenueGrowth: 18.5,
          totalShipments: 1254,
          shipmentGrowth: 12.3,
          averageDeliveryTime: 4.2,
          deliveryImprovement: -8.7,
          customerSatisfaction: 94.8,
          satisfactionChange: 3.2,
          costPerShipment: 485,
          costReduction: -12.5,
          onTimeDelivery: 96.2,
          onTimeImprovement: 4.1
        },
        revenueChart: [
          { month: "Jan", revenue: 245000, profit: 49000 },
          { month: "Feb", revenue: 268000, profit: 53600 },
          { month: "Mar", revenue: 287000, profit: 57400 },
          { month: "Apr", revenue: 312000, profit: 62400 },
          { month: "May", revenue: 295000, profit: 59000 },
          { month: "Jun", revenue: 334000, profit: 66800 }
        ],
        shipmentsByMode: [
          { mode: "Sea", count: 642, percentage: 51.2, color: "#3B82F6" },
          { mode: "Air", count: 289, percentage: 23.1, color: "#EF4444" },
          { mode: "Road", count: 198, percentage: 15.8, color: "#10B981" },
          { mode: "Rail", count: 125, percentage: 9.9, color: "#F59E0B" }
        ],
        performanceTrends: [
          { date: "Week 1", deliveryTime: 4.8, satisfaction: 92.1, cost: 512 },
          { date: "Week 2", deliveryTime: 4.5, satisfaction: 93.2, cost: 498 },
          { date: "Week 3", deliveryTime: 4.2, satisfaction: 94.1, cost: 487 },
          { date: "Week 4", deliveryTime: 4.0, satisfaction: 94.8, cost: 485 }
        ],
        regionalPerformance: [
          { region: "Europe", shipments: 456, revenue: 1247000, satisfaction: 95.2 },
          { region: "Asia-Pacific", shipments: 387, revenue: 983000, satisfaction: 94.1 },
          { region: "North America", shipments: 289, revenue: 456000, satisfaction: 96.1 },
          { region: "Africa", shipments: 122, revenue: 161500, satisfaction: 93.7 }
        ],
        predictiveInsights: {
          nextMonthRevenue: 368000,
          predictedGrowth: 22.3,
          riskFactors: [
            { factor: "Port congestion in Asia", impact: "High", probability: 0.73 },
            { factor: "Fuel price volatility", impact: "Medium", probability: 0.65 },
            { factor: "Weather disruptions", impact: "Medium", probability: 0.41 }
          ],
          opportunities: [
            { opportunity: "AI route optimization", impact: "High", effort: "Medium" },
            { opportunity: "New carrier partnerships", impact: "Medium", effort: "Low" },
            { opportunity: "Automated documentation", impact: "High", effort: "High" }
          ]
        }
      };
    }
  });

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={t("analytics")} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title={t("analytics")} />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Advanced Analytics Dashboard</h1>
            <p className="text-muted-foreground">Real-time insights and predictive analytics</p>
          </div>
          
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(analyticsData?.kpis.totalRevenue || 0)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">{formatPercent(analyticsData?.kpis.revenueGrowth || 0)}</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Shipments</p>
                  <p className="text-2xl font-bold">{analyticsData?.kpis.totalShipments.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">{formatPercent(analyticsData?.kpis.shipmentGrowth || 0)}</span>
                  </div>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Delivery Time</p>
                  <p className="text-2xl font-bold">{analyticsData?.kpis.averageDeliveryTime} days</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">{formatPercent(analyticsData?.kpis.deliveryImprovement || 0)}</span>
                  </div>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                  <p className="text-2xl font-bold">{analyticsData?.kpis.customerSatisfaction}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">{formatPercent(analyticsData?.kpis.satisfactionChange || 0)}</span>
                  </div>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cost per Shipment</p>
                  <p className="text-2xl font-bold">${analyticsData?.kpis.costPerShipment}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">{formatPercent(analyticsData?.kpis.costReduction || 0)}</span>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                  <p className="text-2xl font-bold">{analyticsData?.kpis.onTimeDelivery}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">{formatPercent(analyticsData?.kpis.onTimeImprovement || 0)}</span>
                  </div>
                </div>
                <Truck className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance Trends</TabsTrigger>
            <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
            <TabsTrigger value="predictive">Predictive Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue & Profit Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData?.revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="profit" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipments by Transport Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.shipmentsByMode}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="count"
                      >
                        {analyticsData?.shipmentsByMode.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {analyticsData?.shipmentsByMode.map((mode) => (
                      <div key={mode.mode} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mode.color }}></div>
                          <span className="text-sm">{mode.mode}</span>
                        </div>
                        <span className="text-sm font-medium">{mode.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analyticsData?.performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="deliveryTime" stroke="#EF4444" strokeWidth={2} name="Delivery Time (days)" />
                    <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#10B981" strokeWidth={2} name="Satisfaction %" />
                    <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#F59E0B" strokeWidth={2} name="Cost per Shipment" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.regionalPerformance.map((region) => (
                    <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Globe className="w-8 h-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold">{region.region}</h3>
                          <p className="text-sm text-muted-foreground">{region.shipments} shipments</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(region.revenue)}</p>
                        <p className="text-sm text-green-600">{region.satisfaction}% satisfaction</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictive" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-blue-600">
                        {formatCurrency(analyticsData?.predictiveInsights.nextMonthRevenue || 0)}
                      </h3>
                      <p className="text-sm text-muted-foreground">Predicted next month revenue</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-green-500 font-medium">
                          {formatPercent(analyticsData?.predictiveInsights.predictedGrowth || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData?.predictiveInsights.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">{risk.factor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={risk.impact === 'High' ? 'destructive' : 'secondary'}>
                            {risk.impact}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(risk.probability * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Growth Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analyticsData?.predictiveInsights.opportunities.map((opportunity, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">{opportunity.opportunity}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Impact:</span>
                            <Badge variant={opportunity.impact === 'High' ? 'default' : 'secondary'}>
                              {opportunity.impact}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Effort:</span>
                            <Badge variant="outline">{opportunity.effort}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

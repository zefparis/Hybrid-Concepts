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
  Users, 
  Building,
  Handshake,
  Key,
  Globe,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  BarChart3,
  Settings,
  Zap,
  Shield
} from "lucide-react";

export default function PartnerPortal() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const partners = [
    {
      id: 1,
      name: "Global Shipping Co.",
      type: "carrier",
      status: "active",
      accessLevel: "premium",
      onboardingProgress: 100,
      rating: 4.8,
      shipmentsHandled: 1247,
      revenue: 285000,
      apiCalls: 15420,
      lastActivity: "2024-06-15T10:30:00Z",
      integrations: ["tracking", "pricing", "booking"]
    },
    {
      id: 2,
      name: "Express Logistics Ltd",
      type: "carrier",
      status: "active",
      accessLevel: "enterprise",
      onboardingProgress: 100,
      rating: 4.9,
      shipmentsHandled: 892,
      revenue: 195000,
      apiCalls: 12850,
      lastActivity: "2024-06-15T14:20:00Z",
      integrations: ["tracking", "pricing"]
    },
    {
      id: 3,
      name: "Tech Solutions Inc",
      type: "vendor",
      status: "pending",
      accessLevel: "basic",
      onboardingProgress: 65,
      rating: 0,
      shipmentsHandled: 0,
      revenue: 0,
      apiCalls: 245,
      lastActivity: "2024-06-14T16:45:00Z",
      integrations: ["api_access"]
    }
  ];

  const partnerMetrics = {
    totalPartners: 47,
    activePartners: 42,
    pendingApprovals: 5,
    totalRevenue: 2850000,
    avgPartnerRating: 4.7,
    apiCallsThisMonth: 145620
  };

  const onboardingSteps = [
    { step: "Account Setup", progress: 100, status: "completed" },
    { step: "Documentation Review", progress: 100, status: "completed" },
    { step: "API Integration", progress: 85, status: "in_progress" },
    { step: "Testing Phase", progress: 30, status: "in_progress" },
    { step: "Go Live", progress: 0, status: "pending" }
  ];

  const integrationsCatalog = [
    {
      name: "Real-time Tracking API",
      category: "tracking",
      description: "Access to live shipment tracking data",
      tier: "basic",
      usage: 12450,
      limit: 50000
    },
    {
      name: "Dynamic Pricing Engine",
      category: "pricing",
      description: "AI-powered pricing optimization",
      tier: "premium",
      usage: 3200,
      limit: 10000
    },
    {
      name: "Booking Automation",
      category: "booking",
      description: "Automated booking and confirmation",
      tier: "enterprise",
      usage: 890,
      limit: 5000
    },
    {
      name: "Document Management",
      category: "documents",
      description: "Digital document handling and OCR",
      tier: "premium",
      usage: 1650,
      limit: 8000
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'suspended':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'basic':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Partner Portal</h1>
        <p className="text-gray-600 mt-2">Manage partner relationships and collaborative logistics ecosystem</p>
      </div>

      {/* Partner Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Partners</p>
                <p className="text-2xl font-bold text-gray-900">{partnerMetrics.totalPartners}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{partnerMetrics.activePartners}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{partnerMetrics.pendingApprovals}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">€{(partnerMetrics.totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{partnerMetrics.avgPartnerRating}</p>
              </div>
              <Star className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Calls</p>
                <p className="text-2xl font-bold text-gray-900">{(partnerMetrics.apiCallsThisMonth / 1000).toFixed(0)}K</p>
              </div>
              <Zap className="w-8 h-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Partner Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partners.slice(0, 3).map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Building className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{partner.name}</p>
                          <p className="text-sm text-gray-600">{partner.apiCalls.toLocaleString()} API calls</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(partner.status)}>
                        {partner.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partnership Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900">Maritime Expansion</h3>
                    <p className="text-sm text-blue-700">3 new shipping lines interested in API integration</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-900">Tech Integration</h3>
                    <p className="text-sm text-green-700">AI analytics vendor ready for pilot program</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h3 className="font-medium text-purple-900">Regional Coverage</h3>
                    <p className="text-sm text-purple-700">Last-mile delivery partners in Southeast Asia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Partner Performance Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Integration Health</h3>
                  <p className="text-2xl font-bold text-blue-600">98.5%</p>
                  <p className="text-sm text-blue-700">API uptime</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">Response Time</h3>
                  <p className="text-2xl font-bold text-green-600">142ms</p>
                  <p className="text-sm text-green-700">Average API response</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900">Data Quality</h3>
                  <p className="text-2xl font-bold text-purple-600">96.2%</p>
                  <p className="text-sm text-purple-700">Accuracy score</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-medium text-orange-900">Partner Satisfaction</h3>
                  <p className="text-2xl font-bold text-orange-600">4.7/5</p>
                  <p className="text-sm text-orange-700">Average rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Partner Directory</h2>
              <p className="text-sm text-gray-600">Manage partner relationships and access levels</p>
            </div>
            <div className="flex space-x-2">
              <Input placeholder="Search partners..." className="w-64" />
              <Button>
                <Users className="w-4 h-4 mr-2" />
                Invite Partner
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {partners.map((partner) => (
              <Card key={partner.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Building className="w-12 h-12 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{partner.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getAccessLevelColor(partner.accessLevel)}>
                        {partner.accessLevel}
                      </Badge>
                      <Badge className={getStatusColor(partner.status)}>
                        {getStatusIcon(partner.status)}
                        <span className="ml-1 capitalize">{partner.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rating</p>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{partner.rating || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Shipments</p>
                      <p className="text-sm text-gray-900">{partner.shipmentsHandled.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-sm text-gray-900">€{partner.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">API Calls</p>
                      <p className="text-sm text-gray-900">{partner.apiCalls.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Onboarding Progress</span>
                      <span className="text-sm text-gray-900">{partner.onboardingProgress}%</span>
                    </div>
                    <Progress value={partner.onboardingProgress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {partner.integrations.map((integration, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {integration}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Handshake className="w-5 h-5 mr-2" />
                Partner Onboarding Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {onboardingSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{step.step}</h3>
                        <Badge className={step.status === 'completed' ? 'bg-green-100 text-green-800' : step.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                          {step.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Progress value={step.progress} className="h-2" />
                      <p className="text-xs text-gray-600 mt-1">{step.progress}% complete</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Onboarding Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Documentation</h3>
                  <p className="text-sm text-gray-600 mb-3">Comprehensive API documentation and integration guides</p>
                  <Button size="sm" variant="outline" className="w-full">
                    <Globe className="w-4 h-4 mr-2" />
                    View Docs
                  </Button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Sandbox Environment</h3>
                  <p className="text-sm text-gray-600 mb-3">Test APIs and integrations in a safe environment</p>
                  <Button size="sm" variant="outline" className="w-full">
                    <Key className="w-4 h-4 mr-2" />
                    Access Sandbox
                  </Button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Support</h3>
                  <p className="text-sm text-gray-600 mb-3">Dedicated technical support for integration</p>
                  <Button size="sm" variant="outline" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrationsCatalog.map((integration, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge className={getAccessLevelColor(integration.tier)}>
                      {integration.tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{integration.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Usage</p>
                      <p className="text-sm text-gray-900">{integration.usage.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Limit</p>
                      <p className="text-sm text-gray-900">{integration.limit.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Usage</span>
                      <span className="text-sm text-gray-900">
                        {((integration.usage / integration.limit) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(integration.usage / integration.limit) * 100} className="h-2" />
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Key className="w-4 h-4 mr-1" />
                      API Keys
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Globe className="w-4 h-4 mr-1" />
                      Documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Partner Ecosystem Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Partner performance analytics dashboard</p>
                  <p className="text-sm text-gray-500 mt-2">Revenue, usage, and performance metrics visualization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {partners.filter(p => p.status === 'active').slice(0, 3).map((partner, index) => (
                    <div key={partner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-gray-900">{partner.name}</p>
                          <p className="text-sm text-gray-600">€{partner.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{partner.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">API Uptime</span>
                    <span className="text-sm font-bold text-green-600">99.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Error Rate</span>
                    <span className="text-sm font-bold text-green-600">0.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Avg Response Time</span>
                    <span className="text-sm font-bold text-blue-600">142ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Active Webhooks</span>
                    <span className="text-sm font-bold text-purple-600">328</span>
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
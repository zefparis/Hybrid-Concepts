import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, Download, Eye, CreditCard, AlertCircle, 
  CheckCircle, Clock, DollarSign, TrendingUp, Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'canceled';
  dueDate: string;
  createdAt: string;
  items: InvoiceItem[];
  paymentIntentId?: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  shipmentId?: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxShipments: number;
  maxUsers: number;
}

interface PaymentAnalytics {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  invoiceCount: number;
  subscription?: {
    planId: string;
    status: string;
    currentPeriodEnd: string;
  };
}

export default function Invoicing() {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sample data for demonstration
  const invoices: Invoice[] = [
    {
      id: "inv_001",
      number: "INV-2024-001",
      amount: 2450.00,
      currency: "USD",
      status: "pending",
      dueDate: "2024-07-15",
      createdAt: "2024-06-15",
      items: [
        { description: "Sea freight - Mombasa to Marseille", quantity: 1, unitPrice: 2100.00, total: 2100.00, shipmentId: 1 },
        { description: "eMulog Service Fee", quantity: 1, unitPrice: 350.00, total: 350.00 }
      ]
    },
    {
      id: "inv_002", 
      number: "INV-2024-002",
      amount: 3200.00,
      currency: "USD",
      status: "paid",
      dueDate: "2024-06-30",
      createdAt: "2024-06-01",
      items: [
        { description: "Air freight - Shanghai to Frankfurt", quantity: 1, unitPrice: 2800.00, total: 2800.00, shipmentId: 2 },
        { description: "Insurance & Documentation", quantity: 1, unitPrice: 400.00, total: 400.00 }
      ]
    },
    {
      id: "inv_003",
      number: "INV-2024-003", 
      amount: 1850.00,
      currency: "USD",
      status: "overdue",
      dueDate: "2024-05-31",
      createdAt: "2024-05-01",
      items: [
        { description: "Road transport - Berlin to Amsterdam", quantity: 1, unitPrice: 1600.00, total: 1600.00, shipmentId: 3 },
        { description: "Service Fee", quantity: 1, unitPrice: 250.00, total: 250.00 }
      ]
    }
  ];

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small businesses',
      price: 99,
      currency: 'USD',
      interval: 'month',
      features: [
        'Up to 50 shipments/month',
        'Basic AI automation',
        'Email support',
        'Standard reporting'
      ],
      maxShipments: 50,
      maxUsers: 3
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for growing companies',
      price: 299,
      currency: 'USD',
      interval: 'month',
      features: [
        'Up to 500 shipments/month',
        'Advanced AI automation',
        'Priority support',
        'Advanced analytics',
        'Custom integrations'
      ],
      maxShipments: 500,
      maxUsers: 10
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large-scale operations',
      price: 999,
      currency: 'USD',
      interval: 'month',
      features: [
        'Unlimited shipments',
        'Full AI ecosystem',
        'Dedicated support',
        'White-label options',
        'Custom development'
      ],
      maxShipments: -1,
      maxUsers: -1
    }
  ];

  const paymentAnalytics: PaymentAnalytics = {
    totalPaid: 3200.00,
    totalPending: 2450.00,
    totalOverdue: 1850.00,
    invoiceCount: 3,
    subscription: {
      planId: 'professional',
      status: 'active',
      currentPeriodEnd: '2024-07-15'
    }
  };

  const processPaymentMutation = useMutation({
    mutationFn: async ({ invoiceId, paymentMethod }: { invoiceId: string; paymentMethod: string }) => {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Payment Processed",
        description: "Your payment has been successfully processed.",
      });
      setShowPaymentDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const subscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      // Simulate subscription creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, subscriptionId: `sub_${Date.now()}` };
    },
    onSuccess: () => {
      toast({
        title: "Subscription Updated",
        description: "Your subscription plan has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title={t("invoicing")} />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Invoicing & Billing</h1>
            <p className="text-muted-foreground">Manage your invoices, payments, and subscription</p>
          </div>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(paymentAnalytics.totalPaid)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(paymentAnalytics.totalPending)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(paymentAnalytics.totalOverdue)}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Invoices</p>
                  <p className="text-2xl font-bold">{paymentAnalytics.invoiceCount}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.number}</p>
                            <p className="text-sm text-muted-foreground">
                              Created {formatDate(invoice.createdAt)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            {invoice.status === 'pending' && (
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowPaymentDialog(true);
                                }}
                              >
                                <CreditCard className="w-4 h-4 mr-1" />
                                Pay
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {paymentAnalytics.subscription && (
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Professional Plan</h3>
                        <p className="text-sm text-muted-foreground">
                          Next billing: {formatDate(paymentAnalytics.subscription.currentPeriodEnd)}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subscriptionPlans.map((plan) => (
                    <Card key={plan.id} className={selectedPlan === plan.id ? "ring-2 ring-blue-500" : ""}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {plan.name}
                          {paymentAnalytics.subscription?.planId === plan.id && (
                            <Badge>Current</Badge>
                          )}
                        </CardTitle>
                        <div className="text-3xl font-bold">
                          {formatCurrency(plan.price)}
                          <span className="text-lg font-normal text-muted-foreground">/{plan.interval}</span>
                        </div>
                        <p className="text-muted-foreground">{plan.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className="w-full"
                          variant={paymentAnalytics.subscription?.planId === plan.id ? "outline" : "default"}
                          disabled={paymentAnalytics.subscription?.planId === plan.id || subscriptionMutation.isPending}
                          onClick={() => subscriptionMutation.mutate(plan.id)}
                        >
                          {paymentAnalytics.subscription?.planId === plan.id ? "Current Plan" : "Select Plan"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-methods" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="p-6 text-center">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No payment methods added</p>
                      <Button className="mt-4">Add Payment Method</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Invoice:</span>
                    <span>{selectedInvoice.number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Amount:</span>
                    <span className="text-xl font-bold">{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select defaultValue="card">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input placeholder="123" />
                  </div>
                </div>

                <Button 
                  className="w-full"
                  disabled={processPaymentMutation.isPending}
                  onClick={() => processPaymentMutation.mutate({ 
                    invoiceId: selectedInvoice.id, 
                    paymentMethod: "card" 
                  })}
                >
                  {processPaymentMutation.isPending ? "Processing..." : `Pay ${formatCurrency(selectedInvoice.amount)}`}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

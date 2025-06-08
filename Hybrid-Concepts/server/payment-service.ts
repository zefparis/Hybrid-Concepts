import { storage } from './storage';
import { notificationService } from './notification-service';
import type { Company, User } from '@shared/schema';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  clientSecret?: string;
  metadata: {
    companyId: number;
    userId: number;
    invoiceId?: string;
    shipmentId?: number;
    description: string;
  };
}

export interface Invoice {
  id: string;
  number: string;
  companyId: number;
  amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'canceled';
  dueDate: Date;
  createdAt: Date;
  items: InvoiceItem[];
  paymentIntentId?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  shipmentId?: number;
}

export interface SubscriptionPlan {
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

class PaymentService {
  private invoices = new Map<string, Invoice>();
  private paymentIntents = new Map<string, PaymentIntent>();
  private subscriptions = new Map<number, any>(); // companyId -> subscription

  private subscriptionPlans: SubscriptionPlan[] = [
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
      maxShipments: -1, // unlimited
      maxUsers: -1 // unlimited
    }
  ];

  // Create payment intent for shipment
  async createShipmentPayment(
    companyId: number,
    userId: number,
    shipmentId: number,
    amount: number,
    description: string
  ): Promise<PaymentIntent> {
    const paymentIntent: PaymentIntent = {
      id: this.generatePaymentId(),
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'USD',
      status: 'pending',
      clientSecret: `pi_${this.generateId()}_secret_${this.generateId()}`,
      metadata: {
        companyId,
        userId,
        shipmentId,
        description
      }
    };

    this.paymentIntents.set(paymentIntent.id, paymentIntent);

    // Send notification
    await notificationService.sendNotification({
      type: 'payment_update',
      title: 'Payment Required',
      message: `Payment of $${(amount).toFixed(2)} is required for shipment processing.`,
      priority: 'medium',
      companyId,
      userId,
      data: {
        paymentIntentId: paymentIntent.id,
        amount,
        shipmentId
      }
    });

    return paymentIntent;
  }

  // Process payment (simulated - in production integrate with Stripe)
  async processPayment(paymentIntentId: string, paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    const paymentIntent = this.paymentIntents.get(paymentIntentId);
    if (!paymentIntent) {
      return { success: false, error: 'Payment intent not found' };
    }

    // Simulate payment processing
    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      paymentIntent.status = 'succeeded';
      this.paymentIntents.set(paymentIntentId, paymentIntent);

      // Send success notification
      await notificationService.sendPaymentUpdate(
        paymentIntent.metadata.companyId,
        paymentIntent.metadata.userId,
        paymentIntent.amount / 100,
        'completed'
      );

      // Log activity
      await storage.createActivity({
        companyId: paymentIntent.metadata.companyId,
        userId: paymentIntent.metadata.userId,
        action: 'payment_completed',
        entityType: 'payment',
        entityId: parseInt(paymentIntentId.replace(/\D/g, '')),
        description: `Payment of $${(paymentIntent.amount / 100).toFixed(2)} completed`
      });

      return { success: true };
    } else {
      paymentIntent.status = 'failed';
      this.paymentIntents.set(paymentIntentId, paymentIntent);

      // Send failure notification
      await notificationService.sendPaymentUpdate(
        paymentIntent.metadata.companyId,
        paymentIntent.metadata.userId,
        paymentIntent.amount / 100,
        'failed'
      );

      return { success: false, error: 'Payment processing failed' };
    }
  }

  // Generate invoice for shipment
  async generateShipmentInvoice(
    companyId: number,
    shipmentId: number,
    carrierCost: number,
    serviceFee: number,
    description: string
  ): Promise<Invoice> {
    const invoice: Invoice = {
      id: this.generateInvoiceId(),
      number: this.generateInvoiceNumber(),
      companyId,
      amount: carrierCost + serviceFee,
      currency: 'USD',
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: new Date(),
      items: [
        {
          description: 'Carrier Transportation',
          quantity: 1,
          unitPrice: carrierCost,
          total: carrierCost,
          shipmentId
        },
        {
          description: 'eMulog Service Fee',
          quantity: 1,
          unitPrice: serviceFee,
          total: serviceFee,
          shipmentId
        }
      ]
    };

    this.invoices.set(invoice.id, invoice);

    // Create payment intent for this invoice
    const user = await storage.getUser(1); // Get primary user for company
    if (user && user.companyId === companyId) {
      const paymentIntent = await this.createShipmentPayment(
        companyId,
        user.id,
        shipmentId,
        invoice.amount,
        description
      );
      invoice.paymentIntentId = paymentIntent.id;
      this.invoices.set(invoice.id, invoice);
    }

    return invoice;
  }

  // Subscription management
  async createSubscription(companyId: number, planId: string): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    const plan = this.subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      return { success: false, error: 'Plan not found' };
    }

    const subscription = {
      id: this.generateSubscriptionId(),
      companyId,
      planId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (plan.interval === 'month' ? 30 : 365) * 24 * 60 * 60 * 1000),
      amount: plan.price,
      currency: plan.currency,
      createdAt: new Date()
    };

    this.subscriptions.set(companyId, subscription);

    // Send confirmation notification
    const company = await storage.getCompany(companyId);
    if (company) {
      await notificationService.sendNotification({
        type: 'payment_update',
        title: 'Subscription Activated',
        message: `Your ${plan.name} subscription has been activated successfully.`,
        priority: 'low',
        companyId,
        userId: 1, // Default to admin user
        data: {
          subscriptionId: subscription.id,
          planName: plan.name
        }
      });
    }

    return { success: true, subscriptionId: subscription.id };
  }

  // Get subscription plans
  getSubscriptionPlans(): SubscriptionPlan[] {
    return this.subscriptionPlans;
  }

  // Get company subscription
  getCompanySubscription(companyId: number) {
    return this.subscriptions.get(companyId);
  }

  // Get invoices for company
  getCompanyInvoices(companyId: number): Invoice[] {
    return Array.from(this.invoices.values())
      .filter(invoice => invoice.companyId === companyId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get payment intent
  getPaymentIntent(paymentIntentId: string): PaymentIntent | undefined {
    return this.paymentIntents.get(paymentIntentId);
  }

  // Generate payment analytics
  async getPaymentAnalytics(companyId: number) {
    const invoices = this.getCompanyInvoices(companyId);
    const subscription = this.getCompanySubscription(companyId);

    const totalPaid = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const totalPending = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const totalOverdue = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount, 0);

    return {
      subscription,
      totalPaid,
      totalPending,
      totalOverdue,
      invoiceCount: invoices.length,
      lastPayment: invoices.find(inv => inv.status === 'paid')?.createdAt,
      nextPayment: subscription?.currentPeriodEnd
    };
  }

  // Webhook handler for payment status updates
  async handlePaymentWebhook(event: any) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = this.paymentIntents.get(event.data.object.id);
        if (paymentIntent) {
          paymentIntent.status = 'succeeded';
          this.paymentIntents.set(paymentIntent.id, paymentIntent);

          // Update invoice status
          const invoice = Array.from(this.invoices.values())
            .find(inv => inv.paymentIntentId === paymentIntent.id);
          if (invoice) {
            invoice.status = 'paid';
            this.invoices.set(invoice.id, invoice);
          }

          await notificationService.sendPaymentUpdate(
            paymentIntent.metadata.companyId,
            paymentIntent.metadata.userId,
            paymentIntent.amount / 100,
            'completed',
            invoice?.id
          );
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = this.paymentIntents.get(event.data.object.id);
        if (failedPayment) {
          failedPayment.status = 'failed';
          this.paymentIntents.set(failedPayment.id, failedPayment);

          await notificationService.sendPaymentUpdate(
            failedPayment.metadata.companyId,
            failedPayment.metadata.userId,
            failedPayment.amount / 100,
            'failed'
          );
        }
        break;
    }
  }

  private generatePaymentId(): string {
    return `pi_${Date.now()}_${this.generateId()}`;
  }

  private generateInvoiceId(): string {
    return `inv_${Date.now()}_${this.generateId()}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${this.generateId()}`;
  }

  private generateInvoiceNumber(): string {
    return `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const paymentService = new PaymentService();
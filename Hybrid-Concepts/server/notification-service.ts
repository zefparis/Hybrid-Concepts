import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import type { User, Company } from '@shared/schema';

export interface NotificationPayload {
  id: string;
  type: 'shipment_update' | 'quote_received' | 'delivery_alert' | 'system_alert' | 'payment_update';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
  timestamp: Date;
  companyId: number;
  userId?: number;
  read: boolean;
}

export interface EmailNotificationConfig {
  to: string[];
  subject: string;
  template: string;
  data: any;
}

class NotificationService {
  private wss: WebSocketServer | null = null;
  private clients = new Map<number, Set<WebSocket>>(); // companyId -> Set of WebSocket connections
  private notifications = new Map<string, NotificationPayload>(); // in-memory storage for notifications

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws/notifications' });
    
    this.wss.on('connection', (ws: WebSocket, req) => {
      console.log('New WebSocket connection established');
      
      // Extract authentication info from query params or headers
      const url = new URL(req.url!, 'http://localhost');
      const token = url.searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      // In production, verify JWT token here
      const companyId = parseInt(url.searchParams.get('companyId') || '1');
      
      // Add client to company group
      if (!this.clients.has(companyId)) {
        this.clients.set(companyId, new Set());
      }
      this.clients.get(companyId)!.add(ws);

      // Send existing unread notifications
      this.sendUnreadNotifications(ws, companyId);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(ws, message, companyId);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        // Remove client from company group
        const companyClients = this.clients.get(companyId);
        if (companyClients) {
          companyClients.delete(ws);
          if (companyClients.size === 0) {
            this.clients.delete(companyId);
          }
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    console.log('Notification service initialized with WebSocket support');
  }

  private async sendUnreadNotifications(ws: WebSocket, companyId: number) {
    const unreadNotifications = Array.from(this.notifications.values())
      .filter(n => n.companyId === companyId && !n.read)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50); // Limit to 50 most recent

    if (unreadNotifications.length > 0) {
      ws.send(JSON.stringify({
        type: 'notifications_batch',
        notifications: unreadNotifications
      }));
    }
  }

  private handleClientMessage(ws: WebSocket, message: any, companyId: number) {
    switch (message.type) {
      case 'mark_as_read':
        if (message.notificationId) {
          const notification = this.notifications.get(message.notificationId);
          if (notification && notification.companyId === companyId) {
            notification.read = true;
            this.notifications.set(message.notificationId, notification);
          }
        }
        break;
      
      case 'subscribe_to_shipment':
        // Handle shipment-specific subscriptions
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // Send notification to specific company
  async sendNotification(notification: Omit<NotificationPayload, 'id' | 'timestamp' | 'read'>) {
    const fullNotification: NotificationPayload = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    // Store notification
    this.notifications.set(fullNotification.id, fullNotification);

    // Send to connected clients
    const companyClients = this.clients.get(notification.companyId);
    if (companyClients) {
      const message = JSON.stringify({
        type: 'notification',
        notification: fullNotification
      });

      companyClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }

    // Trigger email notification for high/critical priority
    if (notification.priority === 'high' || notification.priority === 'critical') {
      await this.sendEmailNotification(fullNotification);
    }

    // Log activity
    if (notification.userId) {
      await storage.createActivity({
        companyId: notification.companyId,
        userId: notification.userId,
        action: 'notification_sent',
        entityType: 'notification',
        entityId: parseInt(fullNotification.id),
        description: `${notification.type}: ${notification.title}`
      });
    }

    return fullNotification.id;
  }

  // Send shipment tracking update
  async sendShipmentUpdate(shipmentId: number, status: string, location?: string, eta?: Date) {
    try {
      const shipment = await storage.getShipment(shipmentId);
      if (!shipment) return;

      const quote = await storage.getQuote(shipment.quoteId);
      if (!quote) return;

      const quoteRequest = await storage.getQuoteRequest(quote.quoteRequestId);
      if (!quoteRequest) return;

      let title = '';
      let message = '';
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';

      switch (status.toLowerCase()) {
        case 'picked_up':
          title = 'Shipment Picked Up';
          message = `Your shipment ${shipment.reference} has been picked up and is now in transit.`;
          break;
        case 'in_transit':
          title = 'Shipment In Transit';
          message = location 
            ? `Your shipment ${shipment.reference} is in transit. Current location: ${location}.`
            : `Your shipment ${shipment.reference} is in transit.`;
          break;
        case 'delivered':
          title = 'Shipment Delivered';
          message = `Your shipment ${shipment.reference} has been successfully delivered.`;
          priority = 'high';
          break;
        case 'delayed':
          title = 'Shipment Delayed';
          message = eta 
            ? `Your shipment ${shipment.reference} is delayed. New estimated delivery: ${eta.toLocaleDateString()}.`
            : `Your shipment ${shipment.reference} is experiencing delays.`;
          priority = 'high';
          break;
        default:
          title = 'Shipment Update';
          message = `Status update for shipment ${shipment.reference}: ${status}`;
      }

      await this.sendNotification({
        type: 'shipment_update',
        title,
        message,
        priority,
        companyId: quoteRequest.companyId,
        userId: quoteRequest.userId,
        data: {
          shipmentId,
          status,
          location,
          eta,
          reference: shipment.reference
        }
      });
    } catch (error) {
      console.error('Error sending shipment update:', error);
    }
  }

  // Send quote received notification
  async sendQuoteReceived(quoteRequestId: number, carrierName: string, price: number) {
    try {
      const quoteRequest = await storage.getQuoteRequest(quoteRequestId);
      if (!quoteRequest) return;

      await this.sendNotification({
        type: 'quote_received',
        title: 'New Quote Received',
        message: `${carrierName} has submitted a quote of $${price.toLocaleString()} for your shipment from ${quoteRequest.origin} to ${quoteRequest.destination}.`,
        priority: 'medium',
        companyId: quoteRequest.companyId,
        userId: quoteRequest.userId,
        data: {
          quoteRequestId,
          carrierName,
          price,
          reference: quoteRequest.reference
        }
      });
    } catch (error) {
      console.error('Error sending quote notification:', error);
    }
  }

  // Send payment update notification
  async sendPaymentUpdate(companyId: number, userId: number, amount: number, status: string, invoiceId?: string) {
    let title = '';
    let message = '';
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    switch (status.toLowerCase()) {
      case 'completed':
        title = 'Payment Processed';
        message = `Payment of $${amount.toLocaleString()} has been successfully processed.`;
        priority = 'low';
        break;
      case 'failed':
        title = 'Payment Failed';
        message = `Payment of $${amount.toLocaleString()} could not be processed. Please check your payment method.`;
        priority = 'critical';
        break;
      case 'pending':
        title = 'Payment Pending';
        message = `Payment of $${amount.toLocaleString()} is being processed.`;
        priority = 'low';
        break;
      default:
        title = 'Payment Update';
        message = `Payment status update: ${status}`;
    }

    await this.sendNotification({
      type: 'payment_update',
      title,
      message,
      priority,
      companyId,
      userId,
      data: {
        amount,
        status,
        invoiceId
      }
    });
  }

  // Send system alert
  async sendSystemAlert(companyId: number, title: string, message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    await this.sendNotification({
      type: 'system_alert',
      title,
      message,
      priority,
      companyId,
      data: {}
    });
  }

  // Send delivery alerts based on predictive analytics
  async sendDeliveryAlert(shipmentId: number, alertType: 'delay_risk' | 'route_optimization' | 'weather_warning') {
    try {
      const shipment = await storage.getShipment(shipmentId);
      if (!shipment) return;

      const quote = await storage.getQuote(shipment.quoteId);
      if (!quote) return;

      const quoteRequest = await storage.getQuoteRequest(quote.quoteRequestId);
      if (!quoteRequest) return;

      let title = '';
      let message = '';
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';

      switch (alertType) {
        case 'delay_risk':
          title = 'Potential Delay Alert';
          message = `AI analysis indicates a 73% risk of delay for shipment ${shipment.reference}. Proactive measures recommended.`;
          priority = 'high';
          break;
        case 'route_optimization':
          title = 'Route Optimization Available';
          message = `Alternative route identified for shipment ${shipment.reference} that could save 2 days delivery time.`;
          priority = 'medium';
          break;
        case 'weather_warning':
          title = 'Weather Impact Warning';
          message = `Severe weather conditions may affect shipment ${shipment.reference}. Monitoring situation.`;
          priority = 'high';
          break;
      }

      await this.sendNotification({
        type: 'delivery_alert',
        title,
        message,
        priority,
        companyId: quoteRequest.companyId,
        userId: quoteRequest.userId,
        data: {
          shipmentId,
          alertType,
          reference: shipment.reference
        }
      });
    } catch (error) {
      console.error('Error sending delivery alert:', error);
    }
  }

  private async sendEmailNotification(notification: NotificationPayload) {
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`EMAIL NOTIFICATION: ${notification.title} - ${notification.message}`);
    
    // Simulate email sending
    try {
      const company = await storage.getCompany(notification.companyId);
      if (company && company.email) {
        // Here you would integrate with your email service
        console.log(`Sending email to ${company.email}: ${notification.title}`);
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Get notifications for a company
  getNotifications(companyId: number, limit: number = 50, includeRead: boolean = false) {
    return Array.from(this.notifications.values())
      .filter(n => n.companyId === companyId && (includeRead || !n.read))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Mark notification as read
  markAsRead(notificationId: string, companyId: number) {
    const notification = this.notifications.get(notificationId);
    if (notification && notification.companyId === companyId) {
      notification.read = true;
      this.notifications.set(notificationId, notification);
      return true;
    }
    return false;
  }

  // Mark all notifications as read for a company
  markAllAsRead(companyId: number) {
    let count = 0;
    const entries = Array.from(this.notifications.entries());
    for (const [id, notification] of entries) {
      if (notification.companyId === companyId && !notification.read) {
        notification.read = true;
        this.notifications.set(id, notification);
        count++;
      }
    }
    return count;
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup old notifications (call periodically)
  cleanup(olderThanDays: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let removed = 0;
    const entries = Array.from(this.notifications.entries());
    for (const [id, notification] of entries) {
      if (notification.timestamp < cutoffDate && notification.read) {
        this.notifications.delete(id);
        removed++;
      }
    }
    
    console.log(`Cleaned up ${removed} old notifications`);
    return removed;
  }
}

export const notificationService = new NotificationService();

// Start cleanup job (run every 24 hours)
setInterval(() => {
  notificationService.cleanup();
}, 24 * 60 * 60 * 1000);
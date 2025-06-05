export interface DashboardMetrics {
  activeShipments: number;
  pendingQuotes: number;
  totalSavings: number;
  performance: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: number;
  language: string;
  isActive: boolean;
  createdAt: string;
}

export interface Company {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Activity {
  id: number;
  action: string;
  entityType: string;
  description: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export interface ShipmentWithDetails {
  id: number;
  reference: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  quote: {
    price: string;
    carrier: {
      name: string;
      rating?: string;
    };
    quoteRequest: {
      origin: string;
      destination: string;
    };
  };
}

export interface Document {
  id: number;
  name: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  category: string;
  createdAt: string;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
}

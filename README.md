# Hybrid Concepts 🚀
> Advanced AI-Powered Logistics Optimization Platform

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com/zefparis/Hybrid-Concepts)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## Overview

**Hybrid Concepts** is a revolutionary SaaS platform that transforms multimodal logistics management through intelligent AI automation. Built for enterprise operations, it provides comprehensive transport optimization across aviation, maritime, road, and rail networks.

### 🌟 Key Features

- **AI-Powered Automation** - Anthropic Claude integration for intelligent decision-making
- **Multimodal Transport** - Unified platform for all transport modes
- **Real-Time Tracking** - Live monitoring across global supply chains
- **Automated Quoting** - AI-generated quotes with multi-carrier comparison
- **Global Ready** - Complete French/English internationalization
- **Enterprise Security** - Session-based authentication and data protection

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive design
- **Shadcn/UI** components for consistent interface
- **TanStack Query** for efficient data management
- **React-i18next** for seamless internationalization

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database with Drizzle ORM
- **WebSocket** support for real-time features
- **RESTful API** architecture

### AI Integration
- **Anthropic Claude Sonnet** for logistics optimization
- Automated transport mode selection
- Intelligent route planning and cost optimization
- Risk assessment and mitigation recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/zefparis/Hybrid-Concepts.git
cd Hybrid-Concepts

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure your database and API keys

# Initialize database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/hybrid_concepts
PGHOST=localhost
PGPORT=5432
PGUSER=your_user
PGPASSWORD=your_password
PGDATABASE=hybrid_concepts

# AI Services
ANTHROPIC_API_KEY=your_anthropic_key

# External APIs
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Security
SESSION_SECRET=your_session_secret
```

## 📱 Core Modules

### Dashboard Management
- Real-time logistics metrics and KPIs
- Active shipment monitoring
- Quote request management
- Comprehensive activity timeline

### AI-Powered Quoting
- Automated quote generation from multiple carriers
- Intelligent comparison and optimization
- Cost-benefit analysis with recommendations
- Export capabilities for enterprise workflows

### Route Optimization
- Multimodal transport planning
- Real-time tracking integration
- Carbon footprint calculation
- Dynamic route adjustment based on conditions

### Aviation & Maritime Tracking
- Live flight status monitoring
- Port information and vessel tracking
- Weather integration for route planning
- Automated delay notifications

## 🌍 Internationalization

Full support for global operations:
- **French** - Complete localization for Francophone markets
- **English** - International business standard
- **140+ Translation Keys** - Comprehensive coverage
- **Dynamic Language Switching** - Seamless user experience

## 🔐 Security Features

- Session-based authentication with secure cookies
- CSRF protection and XSS prevention
- Input validation with Zod schemas
- SQL injection prevention through ORM
- Secure headers and HTTPS enforcement

## 📊 Performance

- **< 2 seconds** page load times
- **< 500ms** average API response
- **Optimized database** queries with proper indexing
- **WebSocket latency** < 100ms
- **Production-ready** bundle optimization

## 🔧 API Documentation

### Authentication
All protected endpoints require valid session authentication.

### Core Endpoints

```typescript
GET    /api/dashboard/metrics    # Dashboard analytics
GET    /api/quotes              # Quote management
POST   /api/quotes              # Create new quote request
GET    /api/shipments           # Active shipments
POST   /api/ai/optimize         # AI optimization requests
GET    /api/tracking/:id        # Real-time tracking
```

### WebSocket Events
```typescript
'shipment:update'     # Real-time shipment updates
'quote:received'      # New quote notifications
'tracking:position'   # Live position updates
```

## 🚢 Deployment

### Production Requirements
- Node.js 18+ production environment
- PostgreSQL 14+ database cluster
- SSL certificates for HTTPS
- Environment variables configured
- Session store with Redis (recommended)

### Deploy to Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

We welcome contributions to enhance Hybrid Concepts:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commit messages
- Update documentation for new features

## 📞 Support & Contact

**Hybrid Concepts**  
Enterprise Logistics Solutions

- **Chairman**: Benoît Bogaerts
- **Email**: bbogaerts@hybridconc.com
- **Phone**: +27 727 768 777
- **Website**: www.hybridconc.com
- **Location**: Cape Town, South Africa

## 📄 License

This project is proprietary software owned by Hybrid Concepts. All rights reserved.

## 🏆 Enterprise Features

### For Logistics Companies
- Multi-tenant architecture
- Custom branding and white-label options
- Advanced analytics and reporting
- API access for system integration

### For Freight Forwarders
- Carrier network management
- Automated documentation generation
- Compliance tracking and reporting
- Custom workflow automation

### For Shippers
- Supply chain visibility
- Cost optimization recommendations
- Performance benchmarking
- Risk management tools

---

**Built with ❤️ in South Africa**  
*Revolutionizing logistics through artificial intelligence*

---

### 📈 Roadmap

- [ ] Mobile application (iOS/Android)
- [ ] Blockchain integration for supply chain transparency
- [ ] IoT sensor integration for cargo monitoring
- [ ] Advanced predictive analytics
- [ ] Custom AI model training platform
- [ ] Integration marketplace for third-party services

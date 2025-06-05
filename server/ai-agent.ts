import Anthropic from '@anthropic-ai/sdk';
import { storage } from './storage';
import type { InsertQuoteRequest, InsertQuote, InsertActivity } from '@shared/schema';

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface LogisticsRequest {
  origin: string;
  destination: string;
  cargo: {
    type: string;
    weight: number;
    dimensions?: string;
    value?: number;
    dangerous?: boolean;
  };
  timeline: {
    preferred: string;
    latest: string;
  };
  budget?: {
    max: number;
    preferred: number;
  };
  preferences?: {
    transportMode?: string;
    reliability?: 'standard' | 'premium';
    insurance?: boolean;
  };
}

export interface AutomationResult {
  quoteRequestId: number;
  quotes: any[];
  recommendations: {
    bestOption: any;
    reasoning: string;
    alternatives: any[];
  };
  timeline: {
    processingTime: number;
    estimatedDelivery: string;
  };
  nextSteps: string[];
}

export class LogisticsAIAgent {
  
  /**
   * Point d'entrée principal - Automatise complètement le processus logistique
   */
  async processLogisticsRequest(
    request: LogisticsRequest, 
    companyId: number, 
    userId: number
  ): Promise<AutomationResult> {
    console.log('🤖 AI Agent: Starting automated logistics processing...');
    const startTime = Date.now();

    // Étape 1: Analyse intelligente de la demande
    const analysis = await this.analyzeLogisticsNeeds(request);
    
    // Étape 2: Génération automatique de cotation optimisée
    const quoteRequest = await this.createOptimizedQuoteRequest(request, analysis, companyId, userId);
    
    // Étape 3: Génération automatique des cotations transporteurs
    const quotes = await this.generateCarrierQuotes(quoteRequest, analysis);
    
    // Étape 4: Analyse et recommandations intelligentes
    const recommendations = await this.analyzeAndRecommend(quotes, request, analysis);
    
    // Étape 5: Calcul timeline et étapes suivantes
    const processingTime = Date.now() - startTime;
    const nextSteps = await this.generateNextSteps(quoteRequest, recommendations);

    // Enregistrement de l'activité automatisée
    await storage.createActivity({
      companyId,
      userId,
      action: 'automated_logistics_processing',
      description: `Agent IA a traité automatiquement la demande logistique en ${Math.round(processingTime / 1000)}s`,
      entityType: 'quote_request',
      entityId: quoteRequest.id
    });

    return {
      quoteRequestId: quoteRequest.id,
      quotes,
      recommendations,
      timeline: {
        processingTime: Math.round(processingTime / 1000),
        estimatedDelivery: this.calculateEstimatedDelivery(recommendations.bestOption)
      },
      nextSteps
    };
  }

  /**
   * Analyse intelligente des besoins logistiques
   */
  private async analyzeLogisticsNeeds(request: LogisticsRequest) {
    const prompt = `
    Analysez cette demande logistique et fournissez une analyse stratégique optimisée:

    Origine: ${request.origin}
    Destination: ${request.destination}
    Cargo: ${JSON.stringify(request.cargo)}
    Timeline: ${JSON.stringify(request.timeline)}
    Budget: ${JSON.stringify(request.budget || 'Non spécifié')}
    Préférences: ${JSON.stringify(request.preferences || {})}

    Fournissez une analyse JSON avec:
    {
      "transportMode": "air|mer|terre|multimodal",
      "urgency": "standard|urgent|express",
      "complexity": "simple|medium|complex",
      "riskFactors": ["facteur1", "facteur2"],
      "optimization": {
        "costFactor": 0.7,
        "speedFactor": 0.3,
        "reliabilityFactor": 0.8
      },
      "recommendations": {
        "preferredMode": "string",
        "alternativeMode": "string",
        "specialRequirements": ["req1", "req2"]
      }
    }
    `;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return JSON.parse(content.text);
    }
    throw new Error('Unexpected response format');
  }

  /**
   * Création automatique d'une demande de cotation optimisée
   */
  private async createOptimizedQuoteRequest(
    request: LogisticsRequest, 
    analysis: any, 
    companyId: number, 
    userId: number
  ) {
    const optimizedRequest: InsertQuoteRequest = {
      companyId,
      userId,
      origin: request.origin,
      destination: request.destination,
      goodsType: request.cargo.type,
      weight: request.cargo.weight.toString(),
      volume: request.cargo.dimensions || 'Standard',
      requestedDate: new Date(request.timeline.preferred),
      description: `Mode: ${analysis.transportMode}, Valeur: ${request.cargo.value || 0}€, Exigences: ${analysis.recommendations.specialRequirements.join(', ') || 'Standard'}`,
      status: 'active'
    };

    return await storage.createQuoteRequest(optimizedRequest);
  }

  /**
   * Génération automatique des cotations transporteurs optimisées
   */
  private async generateCarrierQuotes(quoteRequest: any, analysis: any) {
    const carriers = await storage.getCarriers();
    const filteredCarriers = this.filterCarriersByCapability(carriers, analysis);
    
    const quotes = [];
    
    for (const carrier of filteredCarriers.slice(0, 5)) { // Max 5 cotations
      const quote = await this.generateIntelligentQuote(quoteRequest, carrier, analysis);
      quotes.push(await storage.createQuote(quote));
    }

    return quotes;
  }

  /**
   * Filtrage intelligent des transporteurs
   */
  private filterCarriersByCapability(carriers: any[], analysis: any) {
    return carriers.filter(carrier => {
      const name = carrier.name.toLowerCase();
      
      switch (analysis.transportMode) {
        case 'air':
          return name.includes('air') || name.includes('dhl') || name.includes('fedex');
        case 'mer':
          return name.includes('cma') || name.includes('msc') || name.includes('maritime');
        case 'terre':
          return !name.includes('air') && !name.includes('maritime');
        case 'multimodal':
          return true; // Tous les transporteurs pour multimodal
        default:
          return true;
      }
    });
  }

  /**
   * Génération intelligente d'une cotation
   */
  private async generateIntelligentQuote(quoteRequest: any, carrier: any, analysis: any) {
    const basePrice = this.calculateBasePrice(quoteRequest, analysis);
    const carrierMultiplier = this.getCarrierMultiplier(carrier, analysis);
    const finalPrice = (basePrice * carrierMultiplier).toFixed(2);
    
    const estimatedDays = this.calculateDeliveryTime(quoteRequest, carrier, analysis);
    
    return {
      quoteRequestId: quoteRequest.id,
      carrierId: carrier.id,
      price: finalPrice,
      estimatedDays,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'pending',
      conditions: this.generateConditions(carrier, analysis)
    };
  }

  /**
   * Calcul intelligent du prix de base
   */
  private calculateBasePrice(quoteRequest: any, analysis: any) {
    const weight = parseFloat(quoteRequest.weight) || 100;
    const baseRates: Record<string, number> = {
      air: weight * 12,
      mer: weight * 2.2,
      terre: weight * 1.5,
      multimodal: weight * 3
    };
    
    let basePrice = baseRates[analysis.transportMode] || baseRates.terre;
    
    // Ajustements basés sur l'urgence
    if (analysis.urgency === 'express') basePrice *= 1.5;
    if (analysis.urgency === 'urgent') basePrice *= 1.2;
    
    // Ajustements basés sur la complexité
    if (analysis.complexity === 'complex') basePrice *= 1.3;
    if (analysis.complexity === 'medium') basePrice *= 1.1;
    
    return basePrice;
  }

  /**
   * Multiplicateur intelligent par transporteur
   */
  private getCarrierMultiplier(carrier: any, analysis: any) {
    const name = carrier.name.toLowerCase();
    
    // Transporteurs premium
    if (name.includes('dhl') || name.includes('fedex')) return 1.2;
    if (name.includes('ups')) return 1.1;
    
    // Transporteurs économiques
    if (name.includes('chronopost')) return 0.9;
    
    return 1.0; // Standard
  }

  /**
   * Calcul intelligent du délai de livraison
   */
  private calculateDeliveryTime(quoteRequest: any, carrier: any, analysis: any) {
    const baseTimes: Record<string, number> = {
      air: 2,
      mer: 14,
      terre: 5,
      multimodal: 7
    };
    
    let days = baseTimes[analysis.transportMode] || baseTimes.terre;
    
    // Ajustements par transporteur
    const name = carrier.name.toLowerCase();
    if (name.includes('express') || name.includes('dhl')) days = Math.max(1, days - 1);
    if (name.includes('economy')) days += 2;
    
    return days;
  }

  /**
   * Génération de conditions personnalisées
   */
  private generateConditions(carrier: any, analysis: any) {
    const conditions = [];
    
    if (analysis.transportMode === 'air') {
      conditions.push('Transport aérien express');
      conditions.push('Dédouanement inclus');
    } else if (analysis.transportMode === 'mer') {
      conditions.push('Transport maritime container');
      conditions.push('Départ hebdomadaire');
    } else {
      conditions.push('Transport routier standard');
      conditions.push('Assurance incluse');
    }
    
    if (analysis.complexity === 'complex') {
      conditions.push('Manutention spécialisée');
    }
    
    return conditions.join(', ');
  }

  /**
   * Analyse et recommandations intelligentes
   */
  private async analyzeAndRecommend(quotes: any[], request: LogisticsRequest, analysis: any) {
    const prompt = `
    Analysez ces cotations et fournissez des recommandations optimisées:

    Cotations: ${JSON.stringify(quotes.map(q => ({
      transporteur: q.carrierId,
      prix: q.price,
      délai: q.estimatedDays,
      conditions: q.conditions
    })))}

    Demande originale: ${JSON.stringify(request)}
    Analyse: ${JSON.stringify(analysis)}

    Fournissez des recommandations JSON:
    {
      "bestOption": {
        "quoteId": number,
        "score": number,
        "pros": ["avantage1", "avantage2"],
        "cons": ["inconvénient1"]
      },
      "reasoning": "Explication détaillée du choix",
      "alternatives": [
        {
          "quoteId": number,
          "scenario": "string",
          "reasoning": "string"
        }
      ]
    }
    `;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return JSON.parse(content.text);
    }
    throw new Error('Unexpected response format');
  }

  /**
   * Génération des étapes suivantes
   */
  private async generateNextSteps(quoteRequest: any, recommendations: any) {
    return [
      'Validation automatique de la meilleure cotation',
      'Notification client avec recommandations',
      'Préparation documents de transport',
      'Configuration du suivi automatique',
      'Planification de la collecte'
    ];
  }

  /**
   * Calcul de la livraison estimée
   */
  private calculateEstimatedDelivery(bestOption: any) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (bestOption?.estimatedDays || 7));
    return deliveryDate.toISOString().split('T')[0];
  }

  /**
   * Optimisation d'une cotation existante
   */
  async optimizeExistingQuote(quoteRequest: any) {
    console.log('🤖 AI Agent: Optimizing existing quote...');
    
    const prompt = `
    Analysez cette demande de cotation existante et proposez des optimisations:

    ${JSON.stringify(quoteRequest)}

    Fournissez des recommandations d'optimisation JSON:
    {
      "costOptimization": {
        "potentialSavings": "percentage",
        "recommendations": ["rec1", "rec2"]
      },
      "timeOptimization": {
        "fasterOptions": ["option1", "option2"],
        "timeReduction": "days"
      },
      "alternativeRoutes": [
        {
          "route": "description",
          "advantages": ["avantage1", "avantage2"],
          "estimatedSavings": "percentage"
        }
      ]
    }
    `;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return JSON.parse(content.text);
    }
    throw new Error('Unexpected response format');
  }
}

export const aiAgent = new LogisticsAIAgent();
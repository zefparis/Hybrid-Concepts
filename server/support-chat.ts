import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'demo-key'
});

export class SupportChatService {
  
  /**
   * Traite les messages du chat support avec des réponses professionnelles
   */
  async processMessage(message: string): Promise<{ response: string; type: string }> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a professional customer support representative for Hybrid Concepts, a South African enterprise logistics optimization platform. 

COMPANY INFORMATION:
- Company: Hybrid Concepts (South Africa)
- Chairman: Benoît Bogaerts
- Contact: bbogaerts@hybridconc.com, +27 727 768 777
- Website: www.hybridconc.com
- Platform: Advanced AI-powered logistics SaaS solution

PLATFORM FEATURES:
- AI-powered multimodal transport optimization (maritime, air, road, rail)
- Real-time shipment tracking and monitoring
- Automated quote generation and carrier integration
- Carbon footprint calculation and sustainability reporting
- Fleet management and route optimization
- B2B ecosystem with supplier/carrier networks
- Advanced analytics and performance dashboards
- Document automation and customs clearance
- Risk assessment and compliance management

PRICING TIERS:
- Starter: $99/month - Basic tracking, 50 shipments
- Professional: $299/month - AI automation, 200 shipments, analytics
- Enterprise: $799/month - Full features, unlimited shipments, API access
- Custom: $1,499/month - White-label, dedicated support, custom integrations

AI CAPABILITIES:
- Intelligent logistics needs analysis
- Automatic optimal transport mode detection
- Real-time carrier rate comparison
- Predictive analytics and demand forecasting
- Automated documentation generation
- Smart route optimization
- Risk assessment and mitigation

USER QUESTION: "${message}"

Provide a professional, informative response that:
1. Directly addresses their question
2. Highlights relevant platform capabilities
3. Suggests specific features that could help
4. Maintains a consultative, business-focused tone
5. Offers next steps or additional resources when appropriate

Keep responses concise but comprehensive, focusing on business value and practical applications.`
        }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return {
          response: content.text,
          type: this.categorizeResponse(message)
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Support chat error:', error);
      return {
        response: this.getFallbackResponse(message),
        type: 'fallback'
      };
    }
  }

  /**
   * Catégorise le type de réponse basé sur la question
   */
  private categorizeResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing')) {
      return 'pricing';
    }
    if (lowerMessage.includes('feature') || lowerMessage.includes('capability') || lowerMessage.includes('function')) {
      return 'feature';
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('setup')) {
      return 'help';
    }
    if (lowerMessage.includes('ai') || lowerMessage.includes('automation') || lowerMessage.includes('intelligent')) {
      return 'ai';
    }
    if (lowerMessage.includes('integration') || lowerMessage.includes('api') || lowerMessage.includes('connect')) {
      return 'integration';
    }
    
    return 'general';
  }

  /**
   * Réponse de secours en cas d'erreur API
   */
  private getFallbackResponse(message: string): string {
    const category = this.categorizeResponse(message);
    
    const fallbackResponses: Record<string, string> = {
      pricing: "Hybrid Concepts offers flexible pricing starting at $99/month for our Starter plan, up to $1,499/month for our Custom enterprise solution. Each tier includes different levels of AI automation, shipment volumes, and advanced features. I'd be happy to discuss which plan best fits your logistics needs and volume requirements.",
      
      feature: "Our platform provides comprehensive logistics optimization including AI-powered multimodal transport selection, real-time tracking across maritime/air/road/rail, automated quote generation, carbon footprint calculation, and advanced analytics. The system integrates with major carriers and provides end-to-end visibility for your supply chain operations.",
      
      help: "I'm here to help you get the most out of Hybrid Concepts' logistics platform. Whether you need assistance with setup, feature configuration, or understanding our AI automation capabilities, I can guide you through the process. What specific area would you like to explore?",
      
      ai: "Our AI engine automatically analyzes your logistics requirements, selects optimal transport modes, generates competitive quotes from multiple carriers, and provides intelligent recommendations. The system learns from your preferences and continuously optimizes routes, costs, and delivery times while ensuring compliance and risk management.",
      
      integration: "Hybrid Concepts integrates with major shipping carriers, freight forwarders, customs systems, and enterprise software through our comprehensive API suite. We support real-time data exchange, automated documentation, and seamless workflow integration with your existing systems.",
      
      general: "Thank you for your interest in Hybrid Concepts' logistics optimization platform. We specialize in AI-powered multimodal transport management for enterprises, offering automated quote generation, real-time tracking, and comprehensive supply chain visibility. How can I assist you in exploring our capabilities?"
    };
    
    return fallbackResponses[category] || fallbackResponses.general;
  }
}

export const supportChatService = new SupportChatService();
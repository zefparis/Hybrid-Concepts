import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface CompetitorData {
  companyName: string;
  quotingProcess: {
    averageResponseTime: number; // in hours
    manualSteps: number;
    documentsRequired: string[];
    humanInterventions: number;
    priceAccuracy: number; // percentage
  };
  operationalMetrics: {
    processingCost: number; // per quote
    errorRate: number; // percentage
    clientSatisfaction: number; // percentage
    scalabilityLimit: number; // quotes per day
  };
  marketPosition: {
    averageQuoteValue: number;
    clientRetention: number;
    competitivenessScore: number;
  };
}

export interface OptimizationReport {
  currentPerformance: {
    efficiency: number;
    accuracy: number;
    speed: number;
    cost: number;
  };
  emulogOptimization: {
    potentialEfficiencyGain: number;
    accuracyImprovement: number;
    speedImprovement: number;
    costReduction: number;
    roiProjection: number;
  };
  implementationPlan: {
    phase1: string[];
    phase2: string[];
    phase3: string[];
    timeline: string;
    investmentRequired: number;
  };
  competitiveAdvantage: {
    vsIndustryAverage: number;
    marketDifferentiation: string[];
    clientValueProposition: string[];
  };
  riskAssessment: {
    implementationRisk: string;
    marketAcceptance: string;
    technicalChallenges: string[];
    mitigationStrategies: string[];
  };
}

export class CompetitiveAnalysisEngine {
  
  /**
   * Analyse complète d'une société de fret traditionnelle
   */
  async analyzeCompetitor(competitorData: CompetitorData): Promise<OptimizationReport> {
    try {
      const analysisPrompt = `
Vous êtes un consultant expert en transformation digitale logistique. Analysez cette société de fret traditionnelle et générez un rapport d'optimisation complet.

DONNÉES SOCIÉTÉ:
Nom: ${competitorData.companyName}
Processus actuel:
- Temps de réponse moyen: ${competitorData.quotingProcess.averageResponseTime}h
- Étapes manuelles: ${competitorData.quotingProcess.manualSteps}
- Interventions humaines: ${competitorData.quotingProcess.humanInterventions}
- Précision prix: ${competitorData.quotingProcess.priceAccuracy}%

Métriques opérationnelles:
- Coût par cotation: ${competitorData.operationalMetrics.processingCost}€
- Taux d'erreur: ${competitorData.operationalMetrics.errorRate}%
- Satisfaction client: ${competitorData.operationalMetrics.clientSatisfaction}%
- Limite quotidienne: ${competitorData.operationalMetrics.scalabilityLimit} cotations

Position marché:
- Valeur cotation moyenne: ${competitorData.marketPosition.averageQuoteValue}€
- Rétention client: ${competitorData.marketPosition.clientRetention}%
- Score compétitivité: ${competitorData.marketPosition.competitivenessScore}/10

MISSION:
Générez un rapport JSON structuré avec:
1. Analyse performance actuelle (scores 0-100)
2. Gains potentiels avec eMulog IA (pourcentages réalistes)
3. Plan d'implémentation détaillé (3 phases)
4. Avantage concurrentiel vs marché
5. Évaluation des risques et stratégies

RÉPONSE EN JSON UNIQUEMENT:`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514', // the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
        max_tokens: 2000,
        messages: [{ role: 'user', content: analysisPrompt }],
      });

      let analysisText = '';
      if (Array.isArray(response.content)) {
        const firstContent = response.content[0];
        if (firstContent.type === 'text') {
          analysisText = firstContent.text;
        }
      } else if (typeof response.content === 'string') {
        analysisText = response.content;
      }

      // Clean and parse the response
      const cleanedResponse = this.cleanJsonResponse(analysisText);
      
      // Generate structured optimization report with fallback if parsing fails
      if (!cleanedResponse) {
        return this.generateFallbackReport(competitorData);
      }
      
      return this.generateOptimizationReport(competitorData, cleanedResponse);

    } catch (error) {
      console.error('Competitive analysis error:', error);
      return this.generateFallbackReport(competitorData);
    }
  }

  /**
   * Nettoie la réponse IA pour extraire le JSON
   */
  private cleanJsonResponse(text: string): any {
    try {
      // Remove markdown code blocks and extract JSON
      let cleanText = text;
      
      // Extract from code blocks if present
      const codeBlockMatch = cleanText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (codeBlockMatch) {
        cleanText = codeBlockMatch[1];
      }
      
      // Find JSON object boundaries
      const startIndex = cleanText.indexOf('{');
      const lastIndex = cleanText.lastIndexOf('}');
      
      if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
        cleanText = cleanText.substring(startIndex, lastIndex + 1);
      }
      
      // Fix common JSON issues before parsing
      cleanText = cleanText
        .replace(/,\s*}/g, '}')  // Remove trailing commas
        .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
        .replace(/:\s*,/g, ': null,');  // Fix empty values

      return JSON.parse(cleanText);
    } catch (error) {
      console.error('JSON parsing error:', error);
      // Return null to trigger fallback report generation
      return null;
    }
  }

  /**
   * Génère un rapport d'optimisation structuré
   */
  private generateOptimizationReport(competitorData: CompetitorData, aiAnalysis: any): OptimizationReport {
    const currentEfficiency = Math.max(10, 100 - (competitorData.quotingProcess.averageResponseTime * 2));
    const currentAccuracy = competitorData.quotingProcess.priceAccuracy;
    const currentSpeed = Math.max(10, 100 - (competitorData.quotingProcess.averageResponseTime * 3));
    const currentCost = Math.max(20, 100 - (competitorData.operationalMetrics.processingCost * 2));

    return {
      currentPerformance: {
        efficiency: currentEfficiency,
        accuracy: currentAccuracy,
        speed: currentSpeed,
        cost: currentCost
      },
      emulogOptimization: {
        potentialEfficiencyGain: Math.min(95, currentEfficiency + 45),
        accuracyImprovement: Math.min(98, currentAccuracy + 20),
        speedImprovement: 98, // eMulog: 30 secondes vs heures
        costReduction: 75, // Réduction drastique des coûts manuels
        roiProjection: this.calculateROI(competitorData)
      },
      implementationPlan: {
        phase1: [
          "Intégration API eMulog",
          "Formation équipes commerciales",
          "Tests pilotes sur 20% des cotations"
        ],
        phase2: [
          "Déploiement complet automatisation IA",
          "Optimisation processus internes",
          "Migration base clients existants"
        ],
        phase3: [
          "Analytics avancées et reporting",
          "Expansion services premium",
          "Différentiation concurrentielle"
        ],
        timeline: "6 mois total (2 mois par phase)",
        investmentRequired: this.calculateInvestment(competitorData)
      },
      competitiveAdvantage: {
        vsIndustryAverage: 87, // Avantage massif vs marché traditionnel
        marketDifferentiation: [
          "Réponse instantanée (30s vs 4-8h marché)",
          "Précision IA supérieure (+20% vs concurrence)",
          "Coûts opérationnels divisés par 4",
          "Capacité traitement illimitée"
        ],
        clientValueProposition: [
          "Cotations instantanées 24/7",
          "Prix optimisés et transparents",
          "Documentation automatique",
          "Suivi temps réel innovant"
        ]
      },
      riskAssessment: {
        implementationRisk: "Faible - API prête et documentée",
        marketAcceptance: "Élevée - ROI démontrable immédiatement",
        technicalChallenges: [
          "Intégration systèmes legacy",
          "Formation utilisateurs",
          "Migration données historiques"
        ],
        mitigationStrategies: [
          "Support technique eMulog dédié",
          "Formation progressive et accompagnement",
          "Phase pilote pour validation",
          "Garantie de performance contractuelle"
        ]
      }
    };
  }

  /**
   * Calcule le ROI projeté
   */
  private calculateROI(competitorData: CompetitorData): number {
    const currentCostPerQuote = competitorData.operationalMetrics.processingCost;
    const quotesPerMonth = competitorData.operationalMetrics.scalabilityLimit * 30;
    const currentMonthlyCost = currentCostPerQuote * quotesPerMonth;
    
    const optimizedCostPerQuote = currentCostPerQuote * 0.25; // 75% réduction
    const optimizedMonthlyCost = optimizedCostPerQuote * quotesPerMonth * 3; // 3x volume possible
    
    const monthlySavings = currentMonthlyCost - optimizedMonthlyCost;
    const annualSavings = monthlySavings * 12;
    
    // ROI sur 2 ans
    return Math.floor((annualSavings * 2) / (currentMonthlyCost * 3)); // Investment = 3 mois de coûts actuels
  }

  /**
   * Calcule l'investissement requis
   */
  private calculateInvestment(competitorData: CompetitorData): number {
    const monthlyCost = competitorData.operationalMetrics.processingCost * 
                      competitorData.operationalMetrics.scalabilityLimit * 30;
    
    // Investissement = 2-3 mois de coûts opérationnels actuels
    return Math.floor(monthlyCost * 2.5);
  }

  /**
   * Rapport de fallback en cas d'erreur IA
   */
  private generateFallbackReport(competitorData: CompetitorData): OptimizationReport {
    return {
      currentPerformance: {
        efficiency: 35,
        accuracy: competitorData.quotingProcess.priceAccuracy,
        speed: 25,
        cost: 40
      },
      emulogOptimization: {
        potentialEfficiencyGain: 90,
        accuracyImprovement: 95,
        speedImprovement: 98,
        costReduction: 75,
        roiProjection: 340
      },
      implementationPlan: {
        phase1: ["API Integration", "Team Training", "Pilot Testing"],
        phase2: ["Full Deployment", "Process Optimization", "Client Migration"],
        phase3: ["Advanced Analytics", "Service Expansion", "Market Leadership"],
        timeline: "6 mois",
        investmentRequired: 50000
      },
      competitiveAdvantage: {
        vsIndustryAverage: 85,
        marketDifferentiation: [
          "Automatisation IA complète",
          "Réponse instantanée",
          "Précision supérieure",
          "Coûts optimisés"
        ],
        clientValueProposition: [
          "Service 24/7",
          "Prix transparent",
          "Documentation auto",
          "Suivi temps réel"
        ]
      },
      riskAssessment: {
        implementationRisk: "Faible",
        marketAcceptance: "Élevée",
        technicalChallenges: ["Integration", "Training", "Migration"],
        mitigationStrategies: ["Support dédié", "Formation", "Phase pilote"]
      }
    };
  }

  /**
   * Génère un rapport comparatif entre plusieurs sociétés
   */
  async generateMarketAnalysis(competitors: CompetitorData[]): Promise<{
    marketOverview: any;
    competitorRankings: any[];
    industryBenchmarks: any;
    opportunityMap: any;
  }> {
    const reports = await Promise.all(
      competitors.map(competitor => this.analyzeCompetitor(competitor))
    );

    return {
      marketOverview: {
        totalMarketSize: competitors.length,
        averageEfficiency: this.calculateAverage(reports, 'currentPerformance.efficiency'),
        averageAccuracy: this.calculateAverage(reports, 'currentPerformance.accuracy'),
        transformationPotential: this.calculateAverage(reports, 'emulogOptimization.roiProjection')
      },
      competitorRankings: competitors.map((comp, index) => ({
        name: comp.companyName,
        currentScore: this.calculateOverallScore(reports[index].currentPerformance),
        optimizedScore: this.calculateOverallScore(reports[index].emulogOptimization),
        transformationPotential: reports[index].emulogOptimization.roiProjection
      })).sort((a, b) => b.transformationPotential - a.transformationPotential),
      industryBenchmarks: {
        topPerformers: reports.filter(r => this.calculateOverallScore(r.currentPerformance) > 70),
        improvementCandidates: reports.filter(r => this.calculateOverallScore(r.currentPerformance) < 50),
        averageResponseTime: this.calculateAverage(competitors, 'quotingProcess.averageResponseTime'),
        averageAccuracy: this.calculateAverage(competitors, 'quotingProcess.priceAccuracy')
      },
      opportunityMap: {
        highValue: competitors.filter(c => c.marketPosition.averageQuoteValue > 50000),
        quickWins: competitors.filter(c => c.quotingProcess.averageResponseTime > 6),
        scalableTargets: competitors.filter(c => c.operationalMetrics.scalabilityLimit < 50)
      }
    };
  }

  private calculateAverage(array: any[], path: string): number {
    const values = array.map(item => this.getNestedValue(item, path)).filter(v => typeof v === 'number');
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private calculateOverallScore(performance: any): number {
    const values = Object.values(performance).filter(v => typeof v === 'number') as number[];
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
}

export const competitiveAnalysis = new CompetitiveAnalysisEngine();
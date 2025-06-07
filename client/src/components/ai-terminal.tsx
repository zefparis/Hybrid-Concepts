import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Zap, Brain, Code, Cpu } from 'lucide-react';

interface TerminalLine {
  id: string;
  text: string;
  type: 'system' | 'ai' | 'code' | 'success' | 'processing';
  timestamp: Date;
}

interface AITerminalProps {
  isProcessing: boolean;
  onComplete?: () => void;
  requestData?: any;
}

export default function AITerminal({ isProcessing, onComplete, requestData }: AITerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  const automationSteps = [
    {
      type: 'system' as const,
      text: '> Initializing Ia-Solution AI Freight Dropshipping Engine...',
      delay: 500
    },
    {
      type: 'ai' as const,
      text: '🧠 Claude Sonnet-4 analyzing global logistics requirements...',
      delay: 800
    },
    {
      type: 'code' as const,
      text: 'async function analyzeTransportModes(request) {',
      delay: 1000
    },
    {
      type: 'processing' as const,
      text: '🌍 Analyzing geographic constraints and optimal routing...',
      delay: 1200
    },
    {
      type: 'success' as const,
      text: '✅ Transport mode detected: MARITIME (optimal for route)',
      delay: 1400
    },
    {
      type: 'processing' as const,
      text: '⚡ Analyzing cargo requirements: ' + (requestData?.goodsType || 'Chemical Products'),
      delay: 1600
    },
    {
      type: 'processing' as const,
      text: '📦 Weight: ' + (requestData?.weight || '1000') + 'kg | Volume: ' + (requestData?.volume || '5') + 'm³',
      delay: 1800
    },
    {
      type: 'code' as const,
      text: '  const transportMode = detectOptimalMode(origin, destination);',
      delay: 2000
    },
    {
      type: 'success' as const,
      text: '✅ Transport mode detected: MARITIME',
      delay: 2200
    },
    {
      type: 'code' as const,
      text: '  const carriers = await filterCarriersByCapability(analysis);',
      delay: 2400
    },
    {
      type: 'processing' as const,
      text: '🚢 Scanning global carrier network...',
      delay: 2600
    },
    {
      type: 'ai' as const,
      text: '🎯 AI generating intelligent pricing algorithms...',
      delay: 2800
    },
    {
      type: 'code' as const,
      text: '  for (const carrier of carriers) {',
      delay: 3000
    },
    {
      type: 'code' as const,
      text: '    quotes.push(await generateIntelligentQuote(carrier, analysis));',
      delay: 3200
    },
    {
      type: 'code' as const,
      text: '  }',
      delay: 3400
    },
    {
      type: 'success' as const,
      text: '💰 Generated 3 competitive quotes in 0.8 seconds',
      delay: 3600
    },
    {
      type: 'processing' as const,
      text: '📊 Quote 1: MSC Maritime - 2,550€ - 18 days',
      delay: 3800
    },
    {
      type: 'processing' as const,
      text: '📊 Quote 2: CMA CGM - 2,750€ - 16 days',
      delay: 4000
    },
    {
      type: 'processing' as const,
      text: '📊 Quote 3: Maersk Line - 3,300€ - 14 days',
      delay: 4200
    },
    {
      type: 'ai' as const,
      text: '🧠 AI analyzing best value proposition...',
      delay: 4400
    },
    {
      type: 'success' as const,
      text: '🎯 RECOMMENDATION: MSC Maritime - Optimal price/transit balance',
      delay: 4600
    },
    {
      type: 'system' as const,
      text: '⚡ AUTOMATION COMPLETE: 40-minute process reduced to 30 seconds',
      delay: 4800
    },
    {
      type: 'success' as const,
      text: '✅ Ready for client decision - Human intervention: 0%',
      delay: 5000
    }
  ];

  useEffect(() => {
    if (!isProcessing && lines.length === 0) {
      // Only reset if no lines have been generated yet
      setLines([]);
      setCurrentStep(0);
      return;
    }
    
    if (!isProcessing && lines.length > 0) {
      // Keep existing lines when processing stops
      return;
    }

    const addLine = (step: number) => {
      if (step >= automationSteps.length) {
        // Add final permanent summary
        setTimeout(() => {
          const finalLines: TerminalLine[] = [
            {
              id: `separator-${Date.now()}`,
              text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
              type: 'system',
              timestamp: new Date()
            },
            {
              id: `summary-${Date.now()}`,
              text: '📋 AUTOMATION COMPLETE - Results available for review above',
              type: 'success',
              timestamp: new Date()
            },
            {
              id: `ready-${Date.now()}`,
              text: '🔄 Terminal ready for next automation request',
              type: 'system',
              timestamp: new Date()
            }
          ];
          
          setLines(prev => [...prev, ...finalLines]);
        }, 500);
        
        onComplete?.();
        return;
      }

      const stepData = automationSteps[step];
      const newLine: TerminalLine = {
        id: `${stepData.text}-${step}-${Date.now()}`,
        text: stepData.text,
        type: stepData.type,
        timestamp: new Date()
      };

      setLines(prev => [...prev, newLine]);

      setTimeout(() => {
        setCurrentStep(step + 1);
        addLine(step + 1);
      }, stepData.delay);
    };

    addLine(0);
  }, [isProcessing, onComplete]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const getLineIcon = (type: string) => {
    switch (type) {
      case 'ai': return <Brain className="w-4 h-4 text-purple-400" />;
      case 'code': return <Code className="w-4 h-4 text-green-400" />;
      case 'processing': return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'success': return <Zap className="w-4 h-4 text-emerald-400" />;
      default: return <Terminal className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLineColor = (type: string) => {
    switch (type) {
      case 'ai': return 'text-purple-300';
      case 'code': return 'text-green-300';
      case 'processing': return 'text-blue-300';
      case 'success': return 'text-emerald-300';
      case 'system': return 'text-yellow-300';
      default: return 'text-gray-300';
    }
  };

  if (!isProcessing && lines.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-4xl h-[600px] overflow-hidden"
      >
        {/* Terminal Header */}
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Terminal className="w-4 h-4" />
            <span className="font-mono text-sm">Ia-Solution AI Automation Engine v4.0</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-mono">ACTIVE</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div 
          ref={terminalRef}
          className="p-4 h-full overflow-y-auto font-mono text-sm bg-gray-900 space-y-1"
        >
          {lines.map((line, index) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-2 ${getLineColor(line.type)}`}
            >
              {getLineIcon(line.type)}
              <span className="flex-1">
                {line.text}
                {index === lines.length - 1 && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="ml-1 text-white"
                  >
                    █
                  </motion.span>
                )}
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                {line.timestamp.toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
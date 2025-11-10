"use client";

import { useEffect, useState } from "react";
import { analyzeMarketConditions } from "@/utils/aiAnalysis";

interface AIAnalysisProps {
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;
}

export default function AIAnalysis({
  rsiPeriod,
  rsiOverbought,
  rsiOversold,
}: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const updateAnalysis = () => {
      const result = analyzeMarketConditions(
        rsiPeriod,
        rsiOverbought,
        rsiOversold
      );
      setAnalysis(result);
    };

    updateAnalysis();
    const interval = setInterval(updateAnalysis, 5000);

    return () => clearInterval(interval);
  }, [rsiPeriod, rsiOverbought, rsiOversold]);

  if (!analysis) return null;

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "STRONG_BUY":
        return "text-green-400 bg-green-900/30 border-green-500/50";
      case "BUY":
        return "text-green-300 bg-green-900/20 border-green-500/30";
      case "NEUTRAL":
        return "text-gray-400 bg-gray-900/30 border-gray-500/50";
      case "SELL":
        return "text-red-300 bg-red-900/20 border-red-500/30";
      case "STRONG_SELL":
        return "text-red-400 bg-red-900/30 border-red-500/50";
      default:
        return "text-gray-400 bg-gray-900/30 border-gray-500/50";
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "STRONG_BUY":
        return "↑↑";
      case "BUY":
        return "↑";
      case "NEUTRAL":
        return "→";
      case "SELL":
        return "↓";
      case "STRONG_SELL":
        return "↓↓";
      default:
        return "→";
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
        AI Analysis
      </h2>

      <div
        className={`p-4 rounded-lg border mb-4 ${getSignalColor(
          analysis.signal
        )}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Trading Signal</span>
          <span className="text-2xl">{getSignalIcon(analysis.signal)}</span>
        </div>
        <div className="text-2xl font-bold">{analysis.signal.replace("_", " ")}</div>
        <div className="text-sm mt-2 opacity-80">
          Confidence: {analysis.confidence}%
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-800/50 p-3 rounded">
          <h3 className="text-sm font-semibold mb-2 text-blue-400">
            Market Condition
          </h3>
          <p className="text-sm text-gray-300">{analysis.marketCondition}</p>
        </div>

        <div className="bg-gray-800/50 p-3 rounded">
          <h3 className="text-sm font-semibold mb-2 text-purple-400">
            RSI Analysis
          </h3>
          <p className="text-sm text-gray-300">{analysis.rsiAnalysis}</p>
          <div className="mt-2 flex items-center">
            <span className="text-xs text-gray-400 mr-2">Current RSI:</span>
            <span className="text-sm font-bold">{analysis.currentRSI}</span>
          </div>
        </div>

        <div className="bg-gray-800/50 p-3 rounded">
          <h3 className="text-sm font-semibold mb-2 text-yellow-400">
            Key Levels
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Nearest Resistance:</span>
              <span className="font-semibold text-red-400">
                {analysis.nearestResistance}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Nearest Support:</span>
              <span className="font-semibold text-green-400">
                {analysis.nearestSupport}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-3 rounded">
          <h3 className="text-sm font-semibold mb-2 text-orange-400">
            Confluence Zones
          </h3>
          <p className="text-sm text-gray-300">{analysis.confluenceZone}</p>
        </div>

        <div className="bg-gray-800/50 p-3 rounded">
          <h3 className="text-sm font-semibold mb-2 text-cyan-400">
            Recommendations
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            {analysis.recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-3 rounded border border-purple-500/30">
          <h3 className="text-sm font-semibold mb-2 text-purple-300">
            Breakout Probability
          </h3>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                style={{ width: `${analysis.breakoutProbability}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold">
              {analysis.breakoutProbability}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {analysis.breakoutDirection}
          </p>
        </div>
      </div>
    </div>
  );
}

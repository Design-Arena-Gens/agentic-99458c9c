"use client";

import { useState } from "react";
import TradingChart from "@/components/TradingChart";
import ControlPanel from "@/components/ControlPanel";
import AIAnalysis from "@/components/AIAnalysis";

export default function Home() {
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [rsiOverbought, setRsiOverbought] = useState(70);
  const [rsiOversold, setRsiOversold] = useState(30);
  const [rsiSmoothing, setRsiSmoothing] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <div className="min-h-screen p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Nifty 50 AI Trading Agent
        </h1>
        <p className="text-center text-gray-400 mt-2">
          Dynamic Support/Resistance Levels with RSI Analysis
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3">
          <TradingChart
            rsiPeriod={rsiPeriod}
            rsiOverbought={rsiOverbought}
            rsiOversold={rsiOversold}
            rsiSmoothing={rsiSmoothing}
            autoRefresh={autoRefresh}
          />
        </div>

        <div className="space-y-4">
          <ControlPanel
            rsiPeriod={rsiPeriod}
            setRsiPeriod={setRsiPeriod}
            rsiOverbought={rsiOverbought}
            setRsiOverbought={setRsiOverbought}
            rsiOversold={rsiOversold}
            setRsiOversold={setRsiOversold}
            rsiSmoothing={rsiSmoothing}
            setRsiSmoothing={setRsiSmoothing}
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
          />

          <AIAnalysis
            rsiPeriod={rsiPeriod}
            rsiOverbought={rsiOverbought}
            rsiOversold={rsiOversold}
          />
        </div>
      </div>
    </div>
  );
}

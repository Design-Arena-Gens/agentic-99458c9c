"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, LineStyle } from "lightweight-charts";
import { generateMarketData, calculateLevels, calculateRSI } from "@/utils/marketCalculations";

interface TradingChartProps {
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;
  rsiSmoothing: number;
  autoRefresh: boolean;
}

export default function TradingChart({
  rsiPeriod,
  rsiOverbought,
  rsiOversold,
  rsiSmoothing,
  autoRefresh,
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiChartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [currentLevels, setCurrentLevels] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (!chartContainerRef.current || !rsiChartContainerRef.current) return;

    // Main price chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#0f0f0f" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#1f1f1f" },
        horzLines: { color: "#1f1f1f" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // RSI chart
    const rsiChart = createChart(rsiChartContainerRef.current, {
      layout: {
        background: { color: "#0f0f0f" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#1f1f1f" },
        horzLines: { color: "#1f1f1f" },
      },
      width: rsiChartContainerRef.current.clientWidth,
      height: 150,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const rsiSeries = rsiChart.addLineSeries({
      color: "#3b82f6",
      lineWidth: 2,
      title: "RSI",
    });

    // Add RSI overbought/oversold lines
    const overboughtLine = rsiChart.addLineSeries({
      color: "#ef4444",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      title: "Overbought",
    });

    const oversoldLine = rsiChart.addLineSeries({
      color: "#22c55e",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      title: "Oversold",
    });

    chartRef.current = chart;
    rsiChartRef.current = rsiChart;
    candlestickSeriesRef.current = candlestickSeries;
    rsiSeriesRef.current = rsiSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
      if (rsiChartContainerRef.current && rsiChartRef.current) {
        rsiChartRef.current.applyOptions({
          width: rsiChartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // Generate initial data
    const updateData = () => {
      const marketData = generateMarketData();
      candlestickSeries.setData(marketData);

      // Calculate levels from first 5-minute candle
      const firstCandle = marketData[0];
      const levels = calculateLevels(firstCandle.high, firstCandle.low);
      setCurrentLevels(levels);

      // Draw support and resistance lines
      const lastTime = marketData[marketData.length - 1].time;

      // Resistance levels (Red)
      (["A1", "A2", "A3", "A4"] as const).forEach((level, index) => {
        const lineSeries = chart.addLineSeries({
          color: `rgba(239, 68, 68, ${1 - index * 0.15})`,
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          title: `R${index + 1}`,
          priceLineVisible: false,
        });
        lineSeries.setData([
          { time: marketData[0].time, value: levels[level] },
          { time: lastTime, value: levels[level] },
        ]);
      });

      // Support levels (Green)
      (["B1", "B2", "B3", "B4"] as const).forEach((level, index) => {
        const lineSeries = chart.addLineSeries({
          color: `rgba(34, 197, 94, ${1 - index * 0.15})`,
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          title: `S${index + 1}`,
          priceLineVisible: false,
        });
        lineSeries.setData([
          { time: marketData[0].time, value: levels[level] },
          { time: lastTime, value: levels[level] },
        ]);
      });

      // Calculate and plot RSI
      const rsiData = calculateRSI(marketData, rsiPeriod, rsiSmoothing);
      rsiSeries.setData(rsiData);

      // Plot overbought/oversold lines
      overboughtLine.setData([
        { time: marketData[0].time, value: rsiOverbought },
        { time: lastTime, value: rsiOverbought },
      ]);

      oversoldLine.setData([
        { time: marketData[0].time, value: rsiOversold },
        { time: lastTime, value: rsiOversold },
      ]);

      chart.timeScale().fitContent();
      rsiChart.timeScale().fitContent();
      setLastUpdate(new Date());
    };

    updateData();

    // Auto refresh every 5 seconds if enabled
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(updateData, 5000);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (interval) clearInterval(interval);
      chart.remove();
      rsiChart.remove();
    };
  }, [rsiPeriod, rsiOverbought, rsiOversold, rsiSmoothing, autoRefresh]);

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Nifty 50 Chart</h2>
        <div className="text-sm text-gray-400">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {currentLevels && (
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
            <h3 className="font-semibold text-red-400 mb-2">Resistance Levels</h3>
            <div className="space-y-1 text-gray-300">
              <div>R1: {currentLevels.A1.toFixed(2)}</div>
              <div>R2: {currentLevels.A2.toFixed(2)}</div>
              <div>R3: {currentLevels.A3.toFixed(2)}</div>
              <div>R4: {currentLevels.A4.toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <h3 className="font-semibold text-green-400 mb-2">Support Levels</h3>
            <div className="space-y-1 text-gray-300">
              <div>S1: {currentLevels.B1.toFixed(2)}</div>
              <div>S2: {currentLevels.B2.toFixed(2)}</div>
              <div>S3: {currentLevels.B3.toFixed(2)}</div>
              <div>S4: {currentLevels.B4.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      <div ref={chartContainerRef} className="mb-4" />

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">RSI Indicator</h3>
        <div ref={rsiChartContainerRef} />
      </div>
    </div>
  );
}

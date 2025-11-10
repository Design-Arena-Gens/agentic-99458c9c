import {
  generateMarketData,
  calculateLevels,
  calculateRSI,
  getPricePosition,
} from "./marketCalculations";

interface AnalysisResult {
  signal: string;
  confidence: number;
  marketCondition: string;
  rsiAnalysis: string;
  currentRSI: number;
  nearestResistance: number;
  nearestSupport: number;
  confluenceZone: string;
  recommendations: string[];
  breakoutProbability: number;
  breakoutDirection: string;
}

export function analyzeMarketConditions(
  rsiPeriod: number,
  rsiOverbought: number,
  rsiOversold: number
): AnalysisResult {
  // Generate current market data
  const marketData = generateMarketData();
  const firstCandle = marketData[0];
  const currentCandle = marketData[marketData.length - 1];

  // Calculate levels and RSI
  const levels = calculateLevels(firstCandle.high, firstCandle.low);
  const rsiData = calculateRSI(marketData, rsiPeriod);
  const currentRSI = rsiData[rsiData.length - 1]?.value || 50;

  // Get price position
  const pricePosition = getPricePosition(currentCandle.close, levels);

  // Analyze RSI condition
  let rsiCondition = "NEUTRAL";
  if (currentRSI > rsiOverbought) {
    rsiCondition = "OVERBOUGHT";
  } else if (currentRSI < rsiOversold) {
    rsiCondition = "OVERSOLD";
  } else if (currentRSI > (rsiOverbought + 50) / 2) {
    rsiCondition = "SLIGHTLY_OVERBOUGHT";
  } else if (currentRSI < (rsiOversold + 50) / 2) {
    rsiCondition = "SLIGHTLY_OVERSOLD";
  }

  // Calculate RSI momentum
  const rsiMomentum =
    rsiData.length > 5
      ? rsiData[rsiData.length - 1].value - rsiData[rsiData.length - 5].value
      : 0;

  // Determine trading signal
  let signal = "NEUTRAL";
  let confidence = 50;

  // Check for confluence zones (price at key level + RSI confirmation)
  if (
    pricePosition.position === "AT_SUPPORT" &&
    rsiCondition === "OVERSOLD"
  ) {
    signal = "STRONG_BUY";
    confidence = 85;
  } else if (
    pricePosition.position === "NEAR_SUPPORT" &&
    rsiCondition === "OVERSOLD"
  ) {
    signal = "BUY";
    confidence = 70;
  } else if (
    pricePosition.position === "AT_RESISTANCE" &&
    rsiCondition === "OVERBOUGHT"
  ) {
    signal = "STRONG_SELL";
    confidence = 85;
  } else if (
    pricePosition.position === "NEAR_RESISTANCE" &&
    rsiCondition === "OVERBOUGHT"
  ) {
    signal = "SELL";
    confidence = 70;
  } else if (rsiCondition === "OVERSOLD" && rsiMomentum > 5) {
    signal = "BUY";
    confidence = 65;
  } else if (rsiCondition === "OVERBOUGHT" && rsiMomentum < -5) {
    signal = "SELL";
    confidence = 65;
  } else if (
    pricePosition.position === "AT_SUPPORT" &&
    rsiCondition !== "OVERBOUGHT"
  ) {
    signal = "BUY";
    confidence = 60;
  } else if (
    pricePosition.position === "AT_RESISTANCE" &&
    rsiCondition !== "OVERSOLD"
  ) {
    signal = "SELL";
    confidence = 60;
  }

  // Generate market condition description
  let marketCondition = "";
  if (
    pricePosition.position === "AT_SUPPORT" ||
    pricePosition.position === "NEAR_SUPPORT"
  ) {
    marketCondition = `Price is ${pricePosition.position === "AT_SUPPORT" ? "at" : "approaching"} key support level (${pricePosition.nearestSupport.toFixed(2)}). `;
  } else if (
    pricePosition.position === "AT_RESISTANCE" ||
    pricePosition.position === "NEAR_RESISTANCE"
  ) {
    marketCondition = `Price is ${pricePosition.position === "AT_RESISTANCE" ? "at" : "approaching"} key resistance level (${pricePosition.nearestResistance.toFixed(2)}). `;
  } else {
    marketCondition = `Price is trading in the middle zone between support (${pricePosition.nearestSupport.toFixed(2)}) and resistance (${pricePosition.nearestResistance.toFixed(2)}). `;
  }

  // Add trend information
  const priceChange =
    ((currentCandle.close - marketData[0].close) / marketData[0].close) * 100;
  if (priceChange > 0.5) {
    marketCondition += "Strong bullish momentum observed.";
  } else if (priceChange < -0.5) {
    marketCondition += "Strong bearish momentum observed.";
  } else {
    marketCondition += "Consolidation phase detected.";
  }

  // Generate RSI analysis
  let rsiAnalysis = "";
  if (rsiCondition === "OVERBOUGHT") {
    rsiAnalysis = `RSI is in overbought territory at ${currentRSI.toFixed(2)}, suggesting potential selling pressure. `;
    if (rsiMomentum < 0) {
      rsiAnalysis += "Momentum is turning negative, increasing reversal probability.";
    } else {
      rsiAnalysis += "However, strong momentum may push prices higher before reversal.";
    }
  } else if (rsiCondition === "OVERSOLD") {
    rsiAnalysis = `RSI is in oversold territory at ${currentRSI.toFixed(2)}, suggesting potential buying opportunity. `;
    if (rsiMomentum > 0) {
      rsiAnalysis += "Momentum is turning positive, increasing bounce probability.";
    } else {
      rsiAnalysis += "However, continued weakness may push prices lower before bounce.";
    }
  } else {
    rsiAnalysis = `RSI is at ${currentRSI.toFixed(2)}, indicating balanced market conditions. `;
    if (Math.abs(rsiMomentum) > 3) {
      rsiAnalysis += `${rsiMomentum > 0 ? "Bullish" : "Bearish"} momentum building.`;
    } else {
      rsiAnalysis += "Limited directional momentum at present.";
    }
  }

  // Confluence zone analysis
  let confluenceZone = "";
  if (
    (pricePosition.position === "AT_SUPPORT" ||
      pricePosition.position === "AT_RESISTANCE") &&
    (rsiCondition === "OVERSOLD" || rsiCondition === "OVERBOUGHT")
  ) {
    confluenceZone = `Strong confluence detected! Price at key level with ${rsiCondition.toLowerCase()} RSI creates high-probability setup.`;
  } else if (
    pricePosition.position === "AT_SUPPORT" ||
    pricePosition.position === "AT_RESISTANCE"
  ) {
    confluenceZone = `Price at key level. Watch for RSI confirmation for stronger signal.`;
  } else if (rsiCondition === "OVERSOLD" || rsiCondition === "OVERBOUGHT") {
    confluenceZone = `RSI ${rsiCondition.toLowerCase()}. Wait for price to reach key level for better entry.`;
  } else {
    confluenceZone = "No strong confluence zone identified. Wait for clearer setup.";
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (signal === "STRONG_BUY" || signal === "BUY") {
    recommendations.push(
      `Consider long position near ${pricePosition.nearestSupport.toFixed(2)}`
    );
    recommendations.push(
      `Set stop loss below ${(pricePosition.nearestSupport * 0.995).toFixed(2)}`
    );
    recommendations.push(
      `Target resistance at ${pricePosition.nearestResistance.toFixed(2)}`
    );
  } else if (signal === "STRONG_SELL" || signal === "SELL") {
    recommendations.push(
      `Consider short position near ${pricePosition.nearestResistance.toFixed(2)}`
    );
    recommendations.push(
      `Set stop loss above ${(pricePosition.nearestResistance * 1.005).toFixed(2)}`
    );
    recommendations.push(
      `Target support at ${pricePosition.nearestSupport.toFixed(2)}`
    );
  } else {
    recommendations.push("Wait for clearer signal before entering");
    recommendations.push(
      `Watch ${pricePosition.nearestSupport.toFixed(2)} and ${pricePosition.nearestResistance.toFixed(2)}`
    );
    recommendations.push("Monitor RSI for divergence patterns");
  }

  // Calculate breakout probability
  let breakoutProbability = 50;
  let breakoutDirection = "Neutral - monitoring for directional move";

  if (rsiCondition === "OVERBOUGHT" && rsiMomentum > 5) {
    breakoutProbability = 75;
    breakoutDirection = "High probability of upside breakout through resistance";
  } else if (rsiCondition === "OVERSOLD" && rsiMomentum < -5) {
    breakoutProbability = 75;
    breakoutDirection = "High probability of downside breakdown through support";
  } else if (
    pricePosition.position === "AT_RESISTANCE" &&
    currentRSI > 60
  ) {
    breakoutProbability = 65;
    breakoutDirection = "Moderate probability of resistance breakout";
  } else if (pricePosition.position === "AT_SUPPORT" && currentRSI < 40) {
    breakoutProbability = 65;
    breakoutDirection = "Moderate probability of support breakdown";
  } else if (Math.abs(rsiMomentum) > 7) {
    breakoutProbability = 60;
    breakoutDirection = `Building momentum for ${rsiMomentum > 0 ? "upside" : "downside"} move`;
  }

  return {
    signal,
    confidence,
    marketCondition,
    rsiAnalysis,
    currentRSI: parseFloat(currentRSI.toFixed(2)),
    nearestResistance: pricePosition.nearestResistance,
    nearestSupport: pricePosition.nearestSupport,
    confluenceZone,
    recommendations,
    breakoutProbability,
    breakoutDirection,
  };
}

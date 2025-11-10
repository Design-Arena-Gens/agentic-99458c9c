import { UTCTimestamp } from "lightweight-charts";

export interface CandlestickData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SupportResistanceLevels {
  A: number;
  B: number;
  A1: number;
  A2: number;
  A3: number;
  A4: number;
  B1: number;
  B2: number;
  B3: number;
  B4: number;
}

// Generate simulated market data for Nifty 50
export function generateMarketData(): CandlestickData[] {
  const data: CandlestickData[] = [];
  const basePrice = 24500; // Nifty 50 approximate value
  let currentPrice = basePrice;

  // Generate data for a full trading day (9:15 AM to 3:30 PM = 375 minutes / 5 = 75 candles)
  const startTime = new Date();
  startTime.setHours(9, 15, 0, 0);

  for (let i = 0; i < 75; i++) {
    const time = (Math.floor(startTime.getTime() / 1000) + i * 300) as UTCTimestamp; // 5-minute intervals

    // Add some realistic volatility
    const volatility = 0.002;
    const change = (Math.random() - 0.5) * basePrice * volatility;
    currentPrice += change;

    const open = currentPrice;
    const high = currentPrice + Math.random() * basePrice * 0.001;
    const low = currentPrice - Math.random() * basePrice * 0.001;
    const close = low + Math.random() * (high - low);

    data.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });

    currentPrice = close;
  }

  return data;
}

// Calculate support and resistance levels based on first 5-minute candle
export function calculateLevels(A: number, B: number): SupportResistanceLevels {
  // Resistance levels
  const A1 = A + A * 0.0009;
  const A2 = A1 + A1 * 0.0018;
  const A3 = A2 + A2 * 0.0036;
  const A4 = A3 + A3 * 0.0072;

  // Support levels
  const B1 = B - B * 0.0009;
  const B2 = B1 - B1 * 0.0018;
  const B3 = B2 - B2 * 0.0036;
  const B4 = B3 - B3 * 0.0072;

  return {
    A,
    B,
    A1: parseFloat(A1.toFixed(2)),
    A2: parseFloat(A2.toFixed(2)),
    A3: parseFloat(A3.toFixed(2)),
    A4: parseFloat(A4.toFixed(2)),
    B1: parseFloat(B1.toFixed(2)),
    B2: parseFloat(B2.toFixed(2)),
    B3: parseFloat(B3.toFixed(2)),
    B4: parseFloat(B4.toFixed(2)),
  };
}

// Calculate RSI
export function calculateRSI(
  data: CandlestickData[],
  period: number = 14,
  smoothing: number = 1
): Array<{ time: UTCTimestamp; value: number }> {
  if (data.length < period + 1) return [];

  const rsiData: Array<{ time: UTCTimestamp; value: number }> = [];

  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }

  // Calculate initial average gain and loss
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // Calculate RSI for remaining periods
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];

    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    rsiData.push({
      time: data[i + 1].time,
      value: parseFloat(rsi.toFixed(2)),
    });
  }

  // Apply smoothing if needed
  if (smoothing > 1) {
    const smoothedData: Array<{ time: UTCTimestamp; value: number }> = [];
    for (let i = 0; i < rsiData.length; i++) {
      if (i < smoothing - 1) {
        smoothedData.push(rsiData[i]);
      } else {
        let sum = 0;
        for (let j = 0; j < smoothing; j++) {
          sum += rsiData[i - j].value;
        }
        smoothedData.push({
          time: rsiData[i].time,
          value: parseFloat((sum / smoothing).toFixed(2)),
        });
      }
    }
    return smoothedData;
  }

  return rsiData;
}

// Calculate current price relative to levels
export function getPricePosition(
  currentPrice: number,
  levels: SupportResistanceLevels
): {
  nearestSupport: number;
  nearestResistance: number;
  position: string;
} {
  const resistanceLevels = [levels.A1, levels.A2, levels.A3, levels.A4];
  const supportLevels = [levels.B1, levels.B2, levels.B3, levels.B4];

  let nearestResistance = resistanceLevels[0];
  for (const level of resistanceLevels) {
    if (level > currentPrice) {
      nearestResistance = level;
      break;
    }
  }

  let nearestSupport = supportLevels[0];
  for (const level of supportLevels.reverse()) {
    if (level < currentPrice) {
      nearestSupport = level;
      break;
    }
  }

  const distanceToResistance = Math.abs(currentPrice - nearestResistance);
  const distanceToSupport = Math.abs(currentPrice - nearestSupport);

  let position = "NEUTRAL";
  if (distanceToResistance < currentPrice * 0.001) {
    position = "AT_RESISTANCE";
  } else if (distanceToSupport < currentPrice * 0.001) {
    position = "AT_SUPPORT";
  } else if (distanceToResistance < distanceToSupport) {
    position = "NEAR_RESISTANCE";
  } else {
    position = "NEAR_SUPPORT";
  }

  return {
    nearestSupport,
    nearestResistance,
    position,
  };
}

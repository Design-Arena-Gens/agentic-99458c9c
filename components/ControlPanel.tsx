"use client";

interface ControlPanelProps {
  rsiPeriod: number;
  setRsiPeriod: (value: number) => void;
  rsiOverbought: number;
  setRsiOverbought: (value: number) => void;
  rsiOversold: number;
  setRsiOversold: (value: number) => void;
  rsiSmoothing: number;
  setRsiSmoothing: (value: number) => void;
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;
}

export default function ControlPanel({
  rsiPeriod,
  setRsiPeriod,
  rsiOverbought,
  setRsiOverbought,
  rsiOversold,
  setRsiOversold,
  rsiSmoothing,
  setRsiSmoothing,
  autoRefresh,
  setAutoRefresh,
}: ControlPanelProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">RSI Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Period: {rsiPeriod}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            value={rsiPeriod}
            onChange={(e) => setRsiPeriod(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5</span>
            <span>50</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Overbought: {rsiOverbought}
          </label>
          <input
            type="range"
            min="60"
            max="90"
            value={rsiOverbought}
            onChange={(e) => setRsiOverbought(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>60</span>
            <span>90</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Oversold: {rsiOversold}
          </label>
          <input
            type="range"
            min="10"
            max="40"
            value={rsiOversold}
            onChange={(e) => setRsiOversold(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10</span>
            <span>40</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Smoothing: {rsiSmoothing}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={rsiSmoothing}
            onChange={(e) => setRsiSmoothing(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium">Auto Refresh (5s)</span>
          </label>
        </div>
      </div>

      <div className="mt-6 p-3 bg-blue-900/20 rounded border border-blue-500/30">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">Formula Info</h3>
        <div className="text-xs text-gray-300 space-y-1">
          <p><strong>Resistance:</strong></p>
          <p>R1 = A + (A × 0.0009)</p>
          <p>R2 = R1 + (R1 × 0.0018)</p>
          <p>R3 = R2 + (R2 × 0.0036)</p>
          <p>R4 = R3 + (R3 × 0.0072)</p>
          <p className="mt-2"><strong>Support:</strong></p>
          <p>S1 = B - (B × 0.0009)</p>
          <p>S2 = S1 - (S1 × 0.0018)</p>
          <p>S3 = S2 - (S2 × 0.0036)</p>
          <p>S4 = S3 - (S3 × 0.0072)</p>
        </div>
      </div>
    </div>
  );
}

import { memo } from "react";

/* ── Crypto coin data: symbol, color, background ── */
const coins = [
  { symbol: "₿", color: "#f7931a", bg: "rgba(247,147,26,0.10)" },
  { symbol: "Ξ", color: "#627eea", bg: "rgba(98,126,234,0.10)" },
  { symbol: "◎", color: "#14f195", bg: "rgba(20,241,149,0.10)" },
  { symbol: "$", color: "#2775ca", bg: "rgba(39,117,202,0.10)" },
  { symbol: "₮", color: "#26a17b", bg: "rgba(38,161,123,0.10)" },
  { symbol: "◆", color: "#4da2ff", bg: "rgba(77,162,255,0.10)" },
];

/* ── Predefined coin placements (12 coins, each unique row + timing) ── */
const coinInstances = [
  { coinIdx: 0, top: "62%", size: 38, duration: 22, delay: 0,   bobDur: 4.0 },
  { coinIdx: 1, top: "70%", size: 32, duration: 26, delay: -4,  bobDur: 3.5 },
  { coinIdx: 2, top: "78%", size: 28, duration: 20, delay: -9,  bobDur: 4.5 },
  { coinIdx: 3, top: "66%", size: 34, duration: 28, delay: -14, bobDur: 3.8 },
  { coinIdx: 4, top: "74%", size: 30, duration: 24, delay: -2,  bobDur: 4.2 },
  { coinIdx: 5, top: "82%", size: 26, duration: 21, delay: -7,  bobDur: 3.6 },
  { coinIdx: 0, top: "68%", size: 24, duration: 30, delay: -11, bobDur: 4.8 },
  { coinIdx: 1, top: "76%", size: 36, duration: 19, delay: -16, bobDur: 3.3 },
  { coinIdx: 3, top: "84%", size: 22, duration: 25, delay: -6,  bobDur: 4.4 },
  { coinIdx: 2, top: "60%", size: 30, duration: 27, delay: -13, bobDur: 3.7 },
  { coinIdx: 4, top: "72%", size: 26, duration: 23, delay: -18, bobDur: 4.1 },
  { coinIdx: 5, top: "80%", size: 20, duration: 32, delay: -3,  bobDur: 3.9 },
];

/**
 * A beautiful infinite water-flow background effect
 * with crypto coins gently drifting along the current.
 */
function WaterFlow() {
  return (
    <div className="water-flow-container" aria-hidden="true">
      {/* Layer 1 – slowest, deepest, most transparent */}
      <svg
        className="water-wave water-wave-1"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,192 C120,230 240,140 360,180 C480,220 600,130 720,170 C840,210 960,120 1080,160 C1200,200 1320,140 1440,180 L1440,320 L0,320 Z"
          fill="url(#wave1)"
        />
        <path
          d="M1440,192 C1560,230 1680,140 1800,180 C1920,220 2040,130 2160,170 C2280,210 2400,120 2520,160 C2640,200 2760,140 2880,180 L2880,320 L1440,320 Z"
          fill="url(#wave1)"
        />
        <defs>
          <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.03" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.03" />
          </linearGradient>
        </defs>
      </svg>

      {/* Layer 2 – medium speed */}
      <svg
        className="water-wave water-wave-2"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,224 C160,260 280,180 400,210 C520,240 640,160 760,200 C880,240 1000,170 1120,195 C1240,220 1360,170 1440,200 L1440,320 L0,320 Z"
          fill="url(#wave2)"
        />
        <path
          d="M1440,224 C1600,260 1720,180 1840,210 C1960,240 2080,160 2200,200 C2320,240 2440,170 2560,195 C2680,220 2800,170 2880,200 L2880,320 L1440,320 Z"
          fill="url(#wave2)"
        />
        <defs>
          <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.04" />
            <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.04" />
          </linearGradient>
        </defs>
      </svg>

      {/* Layer 3 – fastest, most visible */}
      <svg
        className="water-wave water-wave-3"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,256 C180,280 300,220 420,245 C540,270 660,210 780,240 C900,270 1020,215 1140,235 C1260,255 1380,220 1440,240 L1440,320 L0,320 Z"
          fill="url(#wave3)"
        />
        <path
          d="M1440,256 C1620,280 1740,220 1860,245 C1980,270 2100,210 2220,240 C2340,270 2460,215 2580,235 C2700,255 2820,220 2880,240 L2880,320 L1440,320 Z"
          fill="url(#wave3)"
        />
        <defs>
          <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.03" />
            <stop offset="50%" stopColor="#bfdbfe" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.03" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── Floating crypto coins ── */}
      {coinInstances.map((inst, i) => {
        const coin = coins[inst.coinIdx];
        return (
          <div
            key={i}
            className="crypto-coin"
            style={
              {
                top: inst.top,
                "--drift-duration": `${inst.duration}s`,
                "--drift-delay": `${inst.delay}s`,
                "--bob-duration": `${inst.bobDur}s`,
                width: inst.size,
                height: inst.size,
                fontSize: inst.size * 0.48,
              } as React.CSSProperties
            }
          >
            <span
              className="crypto-coin-inner"
              style={{ color: coin.color, backgroundColor: coin.bg }}
            >
              {coin.symbol}
            </span>
          </div>
        );
      })}

      {/* Shimmering light reflection layer */}
      <div className="water-shimmer" />
    </div>
  );
}

export default memo(WaterFlow);

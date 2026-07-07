import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Animated glowing node visualization representing encrypted wrappers.
 * Pure SVG + motion — no crypto coin imagery. This is the identity mark
 * for the project.
 */
export function HeroNodes() {
  const nodes = useMemo(
    () => [
      { id: "a", x: 200, y: 90, r: 8, color: "#5EEAD4", label: "ERC20" },
      { id: "b", x: 90, y: 220, r: 6, color: "#60A5FA" },
      { id: "c", x: 320, y: 210, r: 10, color: "#8B5CF6", label: "Registry" },
      { id: "d", x: 200, y: 300, r: 14, color: "#5EEAD4", label: "ERC7984" },
      { id: "e", x: 60, y: 380, r: 6, color: "#8B5CF6" },
      { id: "f", x: 350, y: 380, r: 7, color: "#60A5FA" },
      { id: "g", x: 210, y: 460, r: 5, color: "#5EEAD4" },
    ],
    []
  );

  const links: Array<[string, string]> = [
    ["a", "c"],
    ["a", "b"],
    ["c", "d"],
    ["b", "d"],
    ["d", "e"],
    ["d", "f"],
    ["d", "g"],
    ["c", "f"],
  ];

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="relative aspect-square w-full max-w-[540px]">
      {/* Aurora glow behind */}
      <div className="aurora" />

      {/* Rotating rings */}
      <motion.div
        className="absolute inset-6 rounded-full border border-white/[0.06]"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-16 rounded-full border border-white/[0.05]"
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-28 rounded-full border border-primary/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      <svg
        viewBox="0 0 420 540"
        className="relative h-full w-full"
        fill="none"
      >
        <defs>
          <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.9" />
          </linearGradient>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {links.map(([from, to], i) => {
          const a = byId[from];
          const b = byId[to];
          return (
            <g key={`${from}-${to}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="url(#edge)"
                strokeWidth="1"
                strokeOpacity="0.35"
              />
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="url(#edge)"
                strokeWidth="1.5"
                strokeDasharray="4 8"
                className="animate-dash-flow"
                style={{ animationDelay: `${i * 0.25}s` }}
              />
            </g>
          );
        })}

        {nodes.map((n, i) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r * 3}
              fill={n.color}
              opacity="0.18"
              filter="url(#soft)"
            >
              <animate
                attributeName="opacity"
                values="0.1;0.3;0.1"
                dur={`${3 + (i % 3)}s`}
                repeatCount="indefinite"
              />
            </circle>
            <motion.circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={n.color}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            />
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r + 4}
              fill="none"
              stroke={n.color}
              strokeOpacity="0.4"
            >
              <animate
                attributeName="r"
                values={`${n.r + 2};${n.r + 12};${n.r + 2}`}
                dur={`${3 + i * 0.3}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                values="0.5;0;0.5"
                dur={`${3 + i * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
            {n.label && (
              <text
                x={n.x + n.r + 12}
                y={n.y + 4}
                fill="#94A3B8"
                fontFamily="Geist Mono Variable, monospace"
                fontSize="10"
                letterSpacing="0.15em"
              >
                {n.label.toUpperCase()}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Floating cipher chip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass absolute bottom-4 left-4 rounded-2xl px-3 py-2 font-mono text-[10px] text-muted-foreground"
      >
        <span className="text-primary">euint256</span> 0x9f…c1a3
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass absolute right-4 top-6 rounded-2xl px-3 py-2 font-mono text-[10px] text-muted-foreground"
      >
        <span className="text-secondary">shield()</span> ✓ verified
      </motion.div>
    </div>
  );
}

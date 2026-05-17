import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  color?: string;
}

export function ScoreRing({ score, size = 96, strokeWidth = 8, label, color = "hsl(217, 95%, 60%)" }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const controls = useAnimation();
  const hasAnimated = useRef(false);

  const getScoreColor = (s: number) => {
    if (s >= 80) return "hsl(160, 80%, 45%)";
    if (s >= 60) return color;
    if (s >= 40) return "hsl(40, 100%, 55%)";
    return "hsl(0, 85%, 60%)";
  };

  const scoreColor = getScoreColor(score);

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      controls.start({ strokeDashoffset: circumference - (score / 100) * circumference });
    }
  }, [score, circumference, controls]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(224, 30%, 15%)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={controls}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-xl font-bold font-mono" style={{ color: scoreColor }}>
            {score}
          </span>
        </motion.div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

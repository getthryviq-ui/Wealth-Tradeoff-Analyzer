import { motion } from "framer-motion";

interface Props {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
  neutral?: boolean;
  index?: number;
}

export default function MetricCard({ label, value, sub, positive, negative, neutral, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card border border-card-border rounded-lg p-4"
      data-testid={`metric-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">
        {label}
      </p>
      <p
        className={`text-xl font-semibold font-mono leading-none ${
          positive
            ? "text-emerald-600 dark:text-emerald-400"
            : negative
            ? "text-rose-600 dark:text-rose-400"
            : neutral
            ? "text-primary"
            : "text-foreground"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">{sub}</p>
      )}
    </motion.div>
  );
}

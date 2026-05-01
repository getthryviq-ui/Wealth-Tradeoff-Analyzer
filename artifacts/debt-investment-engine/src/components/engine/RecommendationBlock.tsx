import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ShieldCheck, Scale, ArrowRight, AlertTriangle } from "lucide-react";
import type { EngineResults, EngineInputs } from "@/lib/calculations";
import { formatPercent, formatCurrency, formatMonths } from "@/lib/calculations";

interface Props {
  results: EngineResults;
  inputs: EngineInputs;
}

const configs = {
  debt: {
    icon: ShieldCheck,
    label: "Priority: Debt Elimination",
    accent: "from-rose-500/10 to-rose-600/5 dark:from-rose-500/15 dark:to-rose-600/10",
    accentBorder: "border-rose-200 dark:border-rose-800/60",
    accentText: "text-rose-600 dark:text-rose-400",
    accentBadge: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-700/50",
    dot: "bg-rose-500",
  },
  invest: {
    icon: TrendingUp,
    label: "Priority: Capital Deployment",
    accent: "from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/15 dark:to-emerald-600/10",
    accentBorder: "border-emerald-200 dark:border-emerald-800/60",
    accentText: "text-emerald-600 dark:text-emerald-400",
    accentBadge: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-700/50",
    dot: "bg-emerald-500",
  },
  balanced: {
    icon: Scale,
    label: "Priority: Balanced Allocation",
    accent: "from-primary/10 to-primary/5 dark:from-primary/15 dark:to-primary/10",
    accentBorder: "border-primary/20 dark:border-primary/30",
    accentText: "text-primary dark:text-primary",
    accentBadge: "bg-primary/8 text-primary border border-primary/20 dark:bg-primary/15 dark:border-primary/30",
    dot: "bg-primary",
  },
};

const strengthLabel: Record<string, string> = {
  strong: "High Conviction",
  moderate: "Moderate Conviction",
  marginal: "Marginal — Context Dependent",
};

function generateNarrative(results: EngineResults, inputs: EngineInputs): string {
  const { priority, priorityStrength, effectiveDebtRate, effectiveInvestmentReturn, netBenefit, debtFreeMonth } = results;
  const { debtInterestRate, expectedMarketReturn, taxBracket, investmentType } = inputs;

  const debtStr = `${debtInterestRate.toFixed(1)}%`;
  const marketStr = `${expectedMarketReturn.toFixed(2)}%`;
  const taxStr = `${taxBracket.toFixed(0)}%`;
  const effInvStr = formatPercent(effectiveInvestmentReturn);

  if (priority === "debt") {
    return `At a ${debtStr} obligation rate, the cost of carrying this debt exceeds the after-tax return available in the market. With a ${taxStr} marginal tax bracket and ${marketStr} gross market assumption, the effective investment yield is ${effInvStr} — insufficient to overcome the guaranteed drag of ${formatPercent(effectiveDebtRate)} interest. Directing surplus capital toward debt service delivers a risk-free, guaranteed return equivalent to the debt's APR, which no liquid market instrument reliably offers at this spread. ${priorityStrength === "strong" ? "The mathematical case is unambiguous." : "While the margin is not extreme, the risk-adjusted calculus favors elimination."}`;
  }

  if (priority === "invest") {
    return `The after-tax investment return of ${effInvStr} materially exceeds the ${formatPercent(effectiveDebtRate)} cost of debt, creating a positive net financial benefit of ${formatPercent(Math.abs(netBenefit))}. ${investmentType === "tax_advantaged" ? "The tax-advantaged structure further amplifies the compounding advantage, as deferred taxation allows the full gross return to compound uninterrupted." : "Even accounting for annual tax drag, the market return profile holds a structural advantage."} Minimum debt service should be maintained while directing discretionary surplus toward capital accumulation. ${debtFreeMonth > 0 && isFinite(debtFreeMonth) ? `The debt resolves within ${formatMonths(debtFreeMonth)} under minimum payment assumptions.` : ""}`;
  }

  return `The spread between the effective debt rate (${formatPercent(effectiveDebtRate)}) and after-tax investment return (${effInvStr}) is within ${formatPercent(Math.abs(netBenefit))} — a zone where non-quantitative factors assume significance. Behavioral risk tolerance, liquidity constraints, psychological debt aversion, and portfolio concentration should inform the allocation split. A 50/50 or debt-weighted split is analytically defensible at this margin.`;
}

export default function RecommendationBlock({ results, inputs }: Props) {
  const config = configs[results.priority];
  const Icon = config.icon;
  const narrative = generateNarrative(results, inputs);

  const isDebt = results.priority === "debt";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={results.priority + results.priorityStrength}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className={`rounded-xl border bg-gradient-to-br ${config.accent} ${config.accentBorder} p-6`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-lg bg-card border ${config.accentBorder}`}>
            <Icon className={`w-5 h-5 ${config.accentText}`} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h3 className={`text-base font-semibold ${config.accentText}`}>
                {config.label}
              </h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${config.accentBadge}`}>
                {strengthLabel[results.priorityStrength]}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${isDebt ? "bg-rose-500" : "bg-emerald-500"}`} />
                Debt Rate: {formatPercent(results.effectiveDebtRate)}
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
              <div className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${!isDebt ? "bg-emerald-500" : "bg-rose-500"}`} />
                Eff. Invest Return: {formatPercent(results.effectiveInvestmentReturn)}
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
              <div className={`text-xs font-mono font-semibold ${results.netBenefit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                Net Benefit: {results.netBenefit >= 0 ? "+" : ""}{formatPercent(results.netBenefit)}
              </div>
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed">
              {narrative}
            </p>

            {results.priorityStrength === "marginal" && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-700/40">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <span className="font-semibold">Marginal Zone Advisory:</span> When the spread is within 1%, behavioral and liquidity factors dominate the decision. Consider client-specific risk tolerance, emergency fund status, and psychological cost of debt before committing to a single path.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-black/8 dark:border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCell
            label="Total Interest Cost"
            value={formatCurrency(results.totalInterestCost)}
            sub="if debt carried full term"
            negative
          />
          <StatCell
            label="Projected Market Gain"
            value={formatCurrency(results.totalProjectedGrowth)}
            sub="net growth on surplus"
            positive
          />
          <StatCell
            label="Opportunity Cost"
            value={formatCurrency(results.opportunityCost)}
            sub="difference between paths"
          />
          <StatCell
            label="Debt-Free Estimate"
            value={formatMonths(results.debtFreeMonth)}
            sub="at full surplus allocation"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatCell({
  label,
  value,
  sub,
  positive,
  negative,
}: {
  label: string;
  value: string;
  sub: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
        {label}
      </p>
      <p
        className={`text-base font-semibold font-mono ${
          positive
            ? "text-emerald-600 dark:text-emerald-400"
            : negative
            ? "text-rose-600 dark:text-rose-400"
            : "text-foreground"
        }`}
        data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>
    </div>
  );
}

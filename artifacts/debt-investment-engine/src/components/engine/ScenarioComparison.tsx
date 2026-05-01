import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check, TrendingUp, ShieldCheck, Scale, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EngineInputs, EngineResults } from "@/lib/calculations";
import { calculate, formatCurrency, formatPercent, formatMonths } from "@/lib/calculations";

export interface Scenario {
  id: string;
  name: string;
  inputs: EngineInputs;
  results: EngineResults;
  color: string;
}

const SCENARIO_COLORS = [
  { bg: "bg-primary/10 dark:bg-primary/20", border: "border-primary/30", text: "text-primary", dot: "#3F4CEB" },
  { bg: "bg-emerald-50 dark:bg-emerald-500/15", border: "border-emerald-200 dark:border-emerald-700/40", text: "text-emerald-700 dark:text-emerald-400", dot: "#10b981" },
  { bg: "bg-amber-50 dark:bg-amber-500/12", border: "border-amber-200 dark:border-amber-700/40", text: "text-amber-700 dark:text-amber-400", dot: "#f59e0b" },
];

const PRIORITY_ICON: Record<string, typeof TrendingUp> = {
  debt: ShieldCheck,
  invest: TrendingUp,
  balanced: Scale,
};

const PRIORITY_LABEL: Record<string, string> = {
  debt: "Debt Elimination",
  invest: "Capital Deployment",
  balanced: "Balanced",
};

const PRIORITY_COLOR: Record<string, string> = {
  debt: "text-rose-600 dark:text-rose-400",
  invest: "text-emerald-600 dark:text-emerald-400",
  balanced: "text-primary",
};

interface Props {
  currentInputs: EngineInputs;
}

const METRIC_ROWS: {
  key: string;
  label: string;
  getValue: (r: EngineResults) => number;
  format: (v: number) => string;
  higherIsBetter: boolean;
}[] = [
  {
    key: "effectiveDebtRate",
    label: "Effective Debt Rate",
    getValue: (r) => r.effectiveDebtRate,
    format: (v) => formatPercent(v),
    higherIsBetter: false,
  },
  {
    key: "effectiveInvestmentReturn",
    label: "After-Tax Invest Return",
    getValue: (r) => r.effectiveInvestmentReturn,
    format: (v) => formatPercent(v),
    higherIsBetter: true,
  },
  {
    key: "netBenefit",
    label: "Net Financial Benefit",
    getValue: (r) => r.netBenefit,
    format: (v) => (v >= 0 ? "+" : "") + formatPercent(v),
    higherIsBetter: true,
  },
  {
    key: "totalInterestCost",
    label: "Total Interest Cost",
    getValue: (r) => r.totalInterestCost,
    format: (v) => formatCurrency(v),
    higherIsBetter: false,
  },
  {
    key: "totalProjectedGrowth",
    label: "Projected Market Gain",
    getValue: (r) => r.totalProjectedGrowth,
    format: (v) => formatCurrency(v),
    higherIsBetter: true,
  },
  {
    key: "opportunityCost",
    label: "Opportunity Cost",
    getValue: (r) => r.opportunityCost,
    format: (v) => formatCurrency(v),
    higherIsBetter: false,
  },
  {
    key: "debtFreeMonth",
    label: "Debt-Free Timeline",
    getValue: (r) => r.debtFreeMonth,
    format: (v) => formatMonths(v),
    higherIsBetter: false,
  },
];

export default function ScenarioComparison({ currentInputs }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const addScenario = () => {
    if (scenarios.length >= 3) return;
    const results = calculate(currentInputs);
    const id = crypto.randomUUID();
    const defaultNames = ["Scenario A", "Scenario B", "Scenario C"];
    const name = defaultNames[scenarios.length] ?? `Scenario ${scenarios.length + 1}`;
    setScenarios((prev) => [
      ...prev,
      { id, name, inputs: { ...currentInputs }, results, color: String(scenarios.length) },
    ]);
  };

  const removeScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const startRename = (s: Scenario) => {
    setEditingId(s.id);
    setEditName(s.name);
  };

  const commitRename = (id: string) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: editName.trim() || s.name } : s))
    );
    setEditingId(null);
  };

  const getBestIdx = (metric: typeof METRIC_ROWS[0]): number => {
    if (scenarios.length < 2) return -1;
    const values = scenarios.map((s) => metric.getValue(s.results));
    const best = metric.higherIsBetter ? Math.max(...values) : Math.min(...values);
    return values.indexOf(best);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Scenario Comparison</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Save up to 3 named scenarios and compare them side-by-side
          </p>
        </div>
        <Button
          size="sm"
          onClick={addScenario}
          disabled={scenarios.length >= 3}
          className="h-8 gap-1.5 text-xs thryviq-btn"
          data-testid="button-add-scenario"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Save Current
        </Button>
      </div>

      {scenarios.length === 0 && (
        <div className="border border-dashed border-border rounded-lg p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-3">
            <Plus className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No scenarios saved</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Adjust the parameters on the left, then click "Save Current" to snapshot a scenario. Save up to 3 to compare side-by-side.
          </p>
        </div>
      )}

      {scenarios.length > 0 && (
        <div className="space-y-4">
          {/* Scenario cards */}
          <div className={`grid gap-3 ${scenarios.length === 1 ? "grid-cols-1 max-w-sm" : scenarios.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            <AnimatePresence>
              {scenarios.map((s, i) => {
                const color = SCENARIO_COLORS[i % SCENARIO_COLORS.length];
                const Icon = PRIORITY_ICON[s.results.priority];
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-lg border p-4 ${color.bg} ${color.border}`}
                    data-testid={`scenario-card-${i}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: color.dot }}
                        />
                        {editingId === s.id ? (
                          <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => commitRename(s.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitRename(s.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="text-xs font-semibold bg-transparent border-b border-border outline-none w-full text-foreground"
                            data-testid={`input-scenario-name-${i}`}
                          />
                        ) : (
                          <button
                            onClick={() => startRename(s)}
                            className={`text-xs font-semibold ${color.text} flex items-center gap-1 group truncate`}
                            data-testid={`button-rename-scenario-${i}`}
                          >
                            {s.name}
                            <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 shrink-0 transition-opacity" />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => removeScenario(s.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-2 shrink-0"
                        data-testid={`button-remove-scenario-${i}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 mb-3">
                      <Icon className={`w-3.5 h-3.5 ${PRIORITY_COLOR[s.results.priority]}`} strokeWidth={1.75} />
                      <span className={`text-[10px] font-semibold ${PRIORITY_COLOR[s.results.priority]}`}>
                        {PRIORITY_LABEL[s.results.priority]}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Debt APR</span>
                        <span className="font-mono font-semibold text-foreground">{s.inputs.debtInterestRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Market Return</span>
                        <span className="font-mono font-semibold text-foreground">{s.inputs.expectedMarketReturn.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Net Benefit</span>
                        <span className={`font-mono font-semibold ${s.results.netBenefit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {s.results.netBenefit >= 0 ? "+" : ""}{formatPercent(s.results.netBenefit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Surplus</span>
                        <span className="font-mono font-semibold text-foreground">{formatCurrency(s.inputs.monthlySurplus)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Horizon</span>
                        <span className="font-mono font-semibold text-foreground">{s.inputs.timeHorizonYears}yr</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Detailed comparison table */}
          {scenarios.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border border-border overflow-hidden"
            >
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                  Side-by-Side Metric Comparison
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
                        Metric
                      </th>
                      {scenarios.map((s, i) => {
                        const color = SCENARIO_COLORS[i % SCENARIO_COLORS.length];
                        return (
                          <th
                            key={s.id}
                            className={`text-right px-4 py-3 font-semibold text-[10px] uppercase tracking-wider ${color.text}`}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <span
                                className="w-1.5 h-1.5 rounded-full inline-block"
                                style={{ backgroundColor: color.dot }}
                              />
                              {s.name}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {METRIC_ROWS.map((metric) => {
                      const bestIdx = getBestIdx(metric);
                      return (
                        <tr
                          key={metric.key}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                          data-testid={`comparison-row-${metric.key}`}
                        >
                          <td className="px-4 py-2.5 text-muted-foreground font-medium">
                            {metric.label}
                          </td>
                          {scenarios.map((s, i) => {
                            const isBest = i === bestIdx && scenarios.length >= 2;
                            const val = metric.getValue(s.results);
                            const isPositive = metric.key === "netBenefit" && val > 0;
                            const isNegative = metric.key === "netBenefit" && val < 0;
                            return (
                              <td
                                key={s.id}
                                className={`px-4 py-2.5 text-right font-mono font-semibold ${
                                  isPositive
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : isNegative
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-foreground"
                                }`}
                              >
                                <span className="inline-flex items-center justify-end gap-1.5">
                                  {isBest && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 px-1 py-0.5 rounded">
                                      <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                                      Best
                                    </span>
                                  )}
                                  {metric.format(val)}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary verdict */}
              <div className="px-4 py-3 bg-muted/20 border-t border-border">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Interpretation: </span>
                  {(() => {
                    const wins = scenarios.map((_, i) =>
                      METRIC_ROWS.filter((m) => getBestIdx(m) === i).length
                    );
                    const maxWins = Math.max(...wins);
                    const winnerIdx = wins.indexOf(maxWins);
                    if (wins.every((w) => w === wins[0])) {
                      return "Scenarios are statistically equivalent across all metrics. Non-quantitative factors should determine allocation.";
                    }
                    return `${scenarios[winnerIdx]?.name} holds the strongest mathematical position, leading on ${maxWins} of ${METRIC_ROWS.length} metrics. Review conviction level and risk tolerance before committing.`;
                  })()}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InputPanel from "@/components/engine/InputPanel";
import RecommendationBlock from "@/components/engine/RecommendationBlock";
import TrajectoryChart from "@/components/engine/TrajectoryChart";
import ComparisonTable from "@/components/engine/ComparisonTable";
import MetricCard from "@/components/engine/MetricCard";
import { calculate, formatPercent, formatCurrency, formatMonths } from "@/lib/calculations";
import type { EngineInputs } from "@/lib/calculations";

const DEFAULT_INPUTS: EngineInputs = {
  debtBalance: 85000,
  debtInterestRate: 7.5,
  expectedMarketReturn: 9.0,
  taxBracket: 32,
  monthlySurplus: 3000,
  timeHorizonYears: 10,
  investmentType: "taxable",
  debtType: "compound",
};

interface Props {
  darkMode: boolean;
  toggleDark: () => void;
}

export default function Engine({ darkMode, toggleDark }: Props) {
  const [inputs, setInputs] = useState<EngineInputs>(DEFAULT_INPUTS);

  const results = useMemo(() => calculate(inputs), [inputs]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-primary-foreground" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground tracking-tight">
                Debt-to-Investment Tradeoff Engine
              </h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                Capital Allocation Decision Framework · Private Client Advisory
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 py-1 rounded border border-border bg-muted/40">
              Analytical Engine v2
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleDark}
              data-testid="button-toggle-theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" strokeWidth={1.75} />
              ) : (
                <Moon className="w-4 h-4" strokeWidth={1.75} />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] gap-6 lg:gap-8">
          <aside className="space-y-0">
            <div className="bg-card border border-card-border rounded-xl p-5 sticky top-20">
              <InputPanel inputs={inputs} onChange={setInputs} />
            </div>
          </aside>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <RecommendationBlock results={results} inputs={inputs} />
            </motion.div>

            <section>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-3">
                Key Metrics
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                <MetricCard
                  label="Effective Debt Rate"
                  value={formatPercent(results.effectiveDebtRate)}
                  sub="Annual cost of carry"
                  negative={results.priority === "debt"}
                  index={0}
                />
                <MetricCard
                  label="Eff. Invest Return"
                  value={formatPercent(results.effectiveInvestmentReturn)}
                  sub="After-tax market yield"
                  positive={results.priority === "invest"}
                  index={1}
                />
                <MetricCard
                  label="Net Benefit"
                  value={(results.netBenefit >= 0 ? "+" : "") + formatPercent(results.netBenefit)}
                  sub="Invest minus debt rate"
                  positive={results.netBenefit > 0.005}
                  negative={results.netBenefit < -0.005}
                  index={2}
                />
                <MetricCard
                  label="Break-Even Rate"
                  value={formatPercent(results.breakEvenRate)}
                  sub="Min return to favor investing"
                  neutral
                  index={3}
                />
                <MetricCard
                  label="Opportunity Cost"
                  value={formatCurrency(results.opportunityCost)}
                  sub="Delta between both paths"
                  index={4}
                />
                <MetricCard
                  label="Debt-Free Timeline"
                  value={formatMonths(results.debtFreeMonth)}
                  sub="At full surplus allocation"
                  index={5}
                />
              </div>
            </section>

            <section>
              <Tabs defaultValue="chart">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                    Analysis View
                  </p>
                  <TabsList className="h-8">
                    <TabsTrigger value="chart" className="text-xs h-7 px-3" data-testid="tab-chart">
                      Trajectory Chart
                    </TabsTrigger>
                    <TabsTrigger value="table" className="text-xs h-7 px-3" data-testid="tab-table">
                      Comparison Table
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="chart">
                  <div className="bg-card border border-card-border rounded-xl p-5">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          Wealth Trajectory Projection
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Investment accumulation vs. debt reduction over {inputs.timeHorizonYears}-year horizon
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-1 rounded border border-border font-mono">
                        {inputs.timeHorizonYears}yr
                      </span>
                    </div>
                    <TrajectoryChart snapshots={results.yearlySnapshots} />
                    <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-4">
                      <LegendItem color="hsl(160 60% 40%)" label="Investment Value" value={formatCurrency(results.yearlySnapshots[results.yearlySnapshots.length - 1]?.investmentValue ?? 0)} />
                      <LegendItem color="hsl(0 65% 55%)" label="Debt Balance" value={formatCurrency(results.yearlySnapshots[results.yearlySnapshots.length - 1]?.debtBalance ?? 0)} />
                      <LegendItem color="hsl(35 85% 50%)" label="Interest Paid" value={formatCurrency(results.yearlySnapshots[results.yearlySnapshots.length - 1]?.debtInterestPaid ?? 0)} dashed />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="table">
                  <div className="bg-card border border-card-border rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-card-border">
                      <h3 className="text-sm font-semibold text-foreground">
                        Interest Cost vs. Projected Growth
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Year-by-year comparison across both allocation scenarios
                      </p>
                    </div>
                    <ComparisonTable
                      snapshots={results.yearlySnapshots}
                      initialDebt={inputs.debtBalance}
                      monthlySurplus={inputs.monthlySurplus}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </section>

            <section className="bg-card border border-card-border rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-4">
                Formula Reference
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormulaCard
                  title="Net Financial Benefit"
                  formula="NFB = R_invest × (1 – t) – R_debt"
                  description="Where R_invest is gross expected return, t is the marginal tax rate, and R_debt is the annual debt APR. A positive NFB favors investment; negative favors debt payoff."
                />
                <FormulaCard
                  title="After-Tax Investment Return"
                  formula="R_eff = R_market × (1 – t_bracket)"
                  description="For taxable accounts, capital gains and dividends reduce the effective compounding rate. Tax-advantaged accounts use full gross return."
                />
                <FormulaCard
                  title="Total Interest Cost"
                  formula="TIC = P × (1 + R_debt)^n – P"
                  description="Compound basis. The full cost of carrying debt to maturity at the stated APR, assuming no additional principal payments."
                />
                <FormulaCard
                  title="Investment Future Value"
                  formula="FV = PMT × [(1 + r/12)^n – 1] / (r/12)"
                  description="Monthly surplus compounded at the effective return over the full horizon. Net growth equals FV minus total contributions."
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
                <span className="font-semibold">Disclaimer:</span> This engine is an analytical decision-support tool. Projections are based on static assumptions and do not account for market volatility, tax law changes, debt refinancing, or behavioral factors. All outputs should be reviewed alongside a qualified financial advisor before acting on recommendations.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function LegendItem({
  color,
  label,
  value,
  dashed,
}: {
  color: string;
  label: string;
  value: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-1 flex items-center gap-0.5 shrink-0">
        {dashed ? (
          <>
            <div className="h-0.5 w-2 rounded-full" style={{ backgroundColor: color }} />
            <div className="h-0.5 w-1 rounded-full opacity-40" style={{ backgroundColor: color }} />
            <div className="h-0.5 w-2 rounded-full" style={{ backgroundColor: color }} />
          </>
        ) : (
          <div className="h-0.5 w-5 rounded-full" style={{ backgroundColor: color }} />
        )}
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-mono font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function FormulaCard({
  title,
  formula,
  description,
}: {
  title: string;
  formula: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4 bg-muted/20">
      <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">
        {title}
      </p>
      <code className="block text-xs font-mono text-primary bg-primary/8 px-3 py-2 rounded-md mb-2 font-medium">
        {formula}
      </code>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

import { useState } from "react";
import { FileDown, Copy, Check, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { EngineResults, EngineInputs } from "@/lib/calculations";
import { formatCurrency, formatPercent, formatMonths } from "@/lib/calculations";

interface Props {
  results: EngineResults;
  inputs: EngineInputs;
}

const PRIORITY_LABEL: Record<string, string> = {
  debt: "Priority: Debt Elimination",
  invest: "Priority: Capital Deployment",
  balanced: "Priority: Balanced Allocation",
};

const STRENGTH_LABEL: Record<string, string> = {
  strong: "High Conviction",
  moderate: "Moderate Conviction",
  marginal: "Marginal — Context Dependent",
};

function buildNotionText(results: EngineResults, inputs: EngineInputs): string {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const priority = PRIORITY_LABEL[results.priority];
  const strength = STRENGTH_LABEL[results.priorityStrength];

  const rows = results.yearlySnapshots
    .filter((s) => [1, 2, 3, 5, 7, 10, 15, 20, 25, 30].includes(s.year))
    .map(
      (s) =>
        `| ${s.year} | ${formatCurrency(s.debtBalance)} | ${formatCurrency(s.debtInterestPaid)} | ${formatCurrency(s.investmentValue)} | ${formatCurrency(s.investmentGain)} | ${formatCurrency(s.investmentValue - s.debtBalance)} |`
    )
    .join("\n");

  return `# Debt-to-Investment Tradeoff Analysis
*ThryvIQ — Capital Allocation Decision Framework · Private Client Advisory*
*GetThryvIQ.com · Generated: ${today}*

---

## Strategic Recommendation

**${priority}** — ${strength}

**Effective Debt Rate:** ${formatPercent(results.effectiveDebtRate)}
**After-Tax Investment Return:** ${formatPercent(results.effectiveInvestmentReturn)}
**Net Financial Benefit:** ${results.netBenefit >= 0 ? "+" : ""}${formatPercent(results.netBenefit)}

---

## Input Parameters

| Parameter | Value |
|-----------|-------|
| Debt Balance | ${formatCurrency(inputs.debtBalance)} |
| Debt Interest Rate (APR) | ${inputs.debtInterestRate.toFixed(1)}% |
| Expected Market Return | ${inputs.expectedMarketReturn.toFixed(2)}% |
| Marginal Tax Rate | ${inputs.taxBracket.toFixed(0)}% |
| Monthly Surplus | ${formatCurrency(inputs.monthlySurplus)} |
| Time Horizon | ${inputs.timeHorizonYears} years |
| Investment Account Type | ${inputs.investmentType === "tax_advantaged" ? "Tax-Advantaged (IRA/401k)" : "Taxable Brokerage"} |
| Interest Compounding | ${inputs.debtType === "compound" ? "Compound" : "Simple"} |

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Effective Debt Rate | ${formatPercent(results.effectiveDebtRate)} |
| Effective Investment Return | ${formatPercent(results.effectiveInvestmentReturn)} |
| Net Financial Benefit | ${results.netBenefit >= 0 ? "+" : ""}${formatPercent(results.netBenefit)} |
| Break-Even Investment Rate | ${formatPercent(results.breakEvenRate)} |
| Total Interest Cost (full term) | ${formatCurrency(results.totalInterestCost)} |
| Projected Market Gain | ${formatCurrency(results.totalProjectedGrowth)} |
| Opportunity Cost | ${formatCurrency(results.opportunityCost)} |
| Debt-Free Timeline | ${formatMonths(results.debtFreeMonth)} |

---

## Interest Cost vs. Projected Growth

| Year | Debt Balance | Cumulative Interest | Investment Value | Net Gain | Net Position |
|------|-------------|---------------------|-----------------|---------|-------------|
${rows}

---

## Formula Reference

**Net Financial Benefit:** \`NFB = R_invest × (1 – t) – R_debt\`

**After-Tax Investment Return:** \`R_eff = R_market × (1 – t_bracket)\`

**Total Interest Cost:** \`TIC = P × (1 + R_debt)^n – P\`

**Investment Future Value:** \`FV = PMT × [(1 + r/12)^n – 1] / (r/12)\`

---

*This analysis is provided by ThryvIQ (GetThryvIQ.com) for informational purposes only and does not constitute financial advice. All projections are based on static assumptions. Consult a qualified financial advisor before making capital allocation decisions.*`;
}

export default function ExportReport({ results, inputs }: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopyNotion = async () => {
    const text = buildNotionText(results, inputs);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintPDF = () => {
    setOpen(false);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-xs"
          data-testid="button-export"
        >
          <FileDown className="w-3.5 h-3.5" strokeWidth={1.75} />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Export Analysis Report</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Export your current analysis as a PDF or copy the formatted output
            for embedding in Notion.
          </p>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <button
            onClick={handlePrintPDF}
            className="w-full flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors text-left group"
            data-testid="button-export-pdf"
          >
            <div className="p-2 rounded-md bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
              <Printer className="w-4 h-4 text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Save as PDF
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                Opens the browser print dialog. Select "Save as PDF" as the
                destination for a clean, client-ready report.
              </p>
            </div>
          </button>

          <button
            onClick={handleCopyNotion}
            className="w-full flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors text-left group"
            data-testid="button-export-notion"
          >
            <div className="p-2 rounded-md bg-accent border border-accent-border group-hover:bg-accent/80 transition-colors">
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              ) : (
                <Copy className="w-4 h-4 text-accent-foreground" strokeWidth={1.75} />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {copied ? "Copied to clipboard" : "Copy for Notion"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                Copies the full analysis as Markdown — paste directly into a
                Notion page. Includes inputs, recommendation, table, and formulas.
              </p>
            </div>
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground pt-1 leading-relaxed">
          The report reflects the current parameter state. Adjust inputs before
          exporting to capture the desired scenario.
        </p>
      </DialogContent>
    </Dialog>
  );
}

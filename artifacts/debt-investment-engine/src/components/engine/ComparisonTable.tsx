import { motion } from "framer-motion";
import type { YearlySnapshot } from "@/lib/calculations";
import { formatCurrency, formatPercent } from "@/lib/calculations";

interface Props {
  snapshots: YearlySnapshot[];
  initialDebt: number;
  monthlySurplus: number;
}

export default function ComparisonTable({ snapshots, initialDebt, monthlySurplus }: Props) {
  const display = snapshots.filter((s) =>
    [1, 2, 3, 5, 7, 10, 15, 20, 25, 30].includes(s.year)
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
              Year
            </th>
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
              Debt Balance
            </th>
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
              Cumulative Interest
            </th>
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
              Interest % of Principal
            </th>
            <th className="text-right px-4 py-3 font-semibold text-rose-400 uppercase tracking-wider text-[10px]">
              Total Interest Cost
            </th>
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
              Portfolio Value
            </th>
            <th className="text-right px-4 py-3 font-semibold text-emerald-500 uppercase tracking-wider text-[10px]">
              Projected Growth
            </th>
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
              Net Position
            </th>
          </tr>
        </thead>
        <tbody>
          {display.map((row, i) => {
            const netPosition = row.investmentValue - row.debtBalance;
            const pctInterest = initialDebt > 0 ? row.debtInterestPaid / initialDebt : 0;
            const isPositive = netPosition >= 0;

            return (
              <motion.tr
                key={row.year}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors duration-100"
                data-testid={`table-row-${row.year}`}
              >
                <td className="px-4 py-3 font-mono font-semibold text-foreground">
                  {row.year}
                </td>
                <td className="px-4 py-3 text-right font-mono text-foreground">
                  {formatCurrency(row.debtBalance)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-rose-600 dark:text-rose-400">
                  {formatCurrency(row.debtInterestPaid)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                  {formatPercent(pctInterest, 1)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-rose-600 dark:text-rose-400 font-semibold">
                  {formatCurrency(row.debtInterestPaid)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-foreground">
                  {formatCurrency(row.investmentValue)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {formatCurrency(row.investmentGain)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      isPositive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                    }`}
                    data-testid={`net-position-${row.year}`}
                  >
                    {isPositive ? "+" : ""}
                    {formatCurrency(netPosition)}
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

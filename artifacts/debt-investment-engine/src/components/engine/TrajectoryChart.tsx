import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { YearlySnapshot } from "@/lib/calculations";
import { formatCurrency } from "@/lib/calculations";

interface Props {
  snapshots: YearlySnapshot[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string | number;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-card-border rounded-lg shadow-lg p-3 text-xs min-w-[180px]">
      <p className="font-semibold text-foreground mb-2">Year {label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-4 mb-1">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-mono font-semibold text-foreground">
            {formatCurrency(Math.abs(entry.value))}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function TrajectoryChart({ snapshots }: Props) {
  const data = snapshots.map((s) => ({
    year: s.year,
    "Investment Value": s.investmentValue,
    "Debt Balance": s.debtBalance,
    "Interest Paid": s.debtInterestPaid,
  }));

  return (
    <div className="w-full h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160 60% 40%)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(160 60% 40%)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0 65% 55%)" stopOpacity={0.22} />
              <stop offset="95%" stopColor="hsl(0 65% 55%)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(35 85% 50%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(35 85% 50%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(215 15% 86% / 0.5)"
            vertical={false}
          />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "hsl(215 15% 50%)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `Yr ${v}`}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(215 15% 50%)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              v >= 1000000
                ? `$${(v / 1000000).toFixed(1)}M`
                : v >= 1000
                ? `$${(v / 1000).toFixed(0)}K`
                : `$${v}`
            }
            width={64}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="circle"
            iconSize={7}
          />
          <ReferenceLine y={0} stroke="hsl(215 15% 70%)" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="Investment Value"
            stroke="hsl(160 60% 40%)"
            strokeWidth={2}
            fill="url(#investGrad)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="Debt Balance"
            stroke="hsl(0 65% 55%)"
            strokeWidth={2}
            fill="url(#debtGrad)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="Interest Paid"
            stroke="hsl(35 85% 50%)"
            strokeWidth={1.5}
            fill="url(#interestGrad)"
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface EngineInputs {
  debtBalance: number;
  debtInterestRate: number;
  expectedMarketReturn: number;
  taxBracket: number;
  monthlySurplus: number;
  timeHorizonYears: number;
  investmentType: "taxable" | "tax_advantaged";
  debtType: "simple" | "compound";
}

export interface YearlySnapshot {
  year: number;
  debtBalance: number;
  debtInterestPaid: number;
  investmentValue: number;
  investmentGain: number;
  netWorthDebtPath: number;
  netWorthInvestPath: number;
}

export interface EngineResults {
  effectiveDebtRate: number;
  effectiveInvestmentReturn: number;
  netBenefit: number;
  priority: "debt" | "invest" | "balanced";
  priorityStrength: "strong" | "moderate" | "marginal";
  totalInterestCost: number;
  totalProjectedGrowth: number;
  opportunityCost: number;
  breakEvenRate: number;
  debtFreeMonth: number;
  yearlySnapshots: YearlySnapshot[];
  monthlySurplusToDebt: number;
  monthlySurplusToInvest: number;
}

export function calculate(inputs: EngineInputs): EngineResults {
  const {
    debtBalance,
    debtInterestRate,
    expectedMarketReturn,
    taxBracket,
    monthlySurplus,
    timeHorizonYears,
    investmentType,
    debtType,
  } = inputs;

  const r_debt = debtInterestRate / 100;
  const r_market = expectedMarketReturn / 100;
  const t = taxBracket / 100;

  const effectiveDebtRate = r_debt;

  const effectiveInvestmentReturn =
    investmentType === "taxable"
      ? r_market * (1 - t)
      : r_market;

  const netBenefit = effectiveInvestmentReturn - effectiveDebtRate;

  let priority: "debt" | "invest" | "balanced";
  let priorityStrength: "strong" | "moderate" | "marginal";

  const absDiff = Math.abs(netBenefit);
  if (netBenefit < -0.005) {
    priority = "debt";
  } else if (netBenefit > 0.005) {
    priority = "invest";
  } else {
    priority = "balanced";
  }

  if (absDiff >= 0.03) {
    priorityStrength = "strong";
  } else if (absDiff >= 0.01) {
    priorityStrength = "moderate";
  } else {
    priorityStrength = "marginal";
  }

  const breakEvenRate = effectiveDebtRate;
  const monthlyRate = r_debt / 12;

  let debtFreeMonth = 0;
  if (monthlySurplus > 0 && r_debt > 0) {
    if (monthlyRate > 0) {
      const num = Math.log(monthlySurplus / (monthlySurplus - monthlyRate * debtBalance));
      const den = Math.log(1 + monthlyRate);
      debtFreeMonth = isFinite(num / den) ? Math.ceil(num / den) : timeHorizonYears * 12;
    } else {
      debtFreeMonth = Math.ceil(debtBalance / monthlySurplus);
    }
  }

  const months = timeHorizonYears * 12;

  let totalInterestCost = 0;
  if (debtType === "compound") {
    totalInterestCost =
      debtBalance * Math.pow(1 + r_debt, timeHorizonYears) - debtBalance;
  } else {
    totalInterestCost = debtBalance * r_debt * timeHorizonYears;
  }

  const monthlyInvestRate = effectiveInvestmentReturn / 12;
  const totalProjectedGrowth =
    monthlySurplus *
      ((Math.pow(1 + monthlyInvestRate, months) - 1) / monthlyInvestRate) -
    monthlySurplus * months;

  const opportunityCost = Math.abs(totalInterestCost - totalProjectedGrowth);

  const yearlySnapshots: YearlySnapshot[] = [];
  let runningDebtBalance = debtBalance;
  let runningInvestmentValue = 0;
  let cumulativeInterest = 0;
  let cumulativeGain = 0;

  for (let y = 1; y <= timeHorizonYears; y++) {
    const yearStart = runningDebtBalance;
    let yearInterest = 0;

    if (priority === "debt" || priority === "balanced") {
      const monthlyPayment = monthlySurplus;
      for (let m = 0; m < 12; m++) {
        if (runningDebtBalance <= 0) break;
        const interest = runningDebtBalance * (r_debt / 12);
        yearInterest += interest;
        runningDebtBalance = Math.max(
          0,
          runningDebtBalance + interest - monthlyPayment
        );
      }

      const monthlyInvest = priority === "balanced" ? monthlySurplus * 0 : 0;
      runningInvestmentValue =
        runningInvestmentValue * (1 + effectiveInvestmentReturn) +
        monthlyInvest * 12;
    } else {
      const annualInterest = yearStart * r_debt;
      yearInterest = annualInterest;
      runningDebtBalance = runningDebtBalance + annualInterest;

      for (let m = 0; m < 12; m++) {
        runningInvestmentValue =
          (runningInvestmentValue + monthlySurplus) *
          (1 + monthlyInvestRate);
      }
    }

    cumulativeInterest += yearInterest;
    const prevInvestValue =
      y === 1 ? 0 : yearlySnapshots[y - 2].investmentValue;
    const yearGain = runningInvestmentValue - prevInvestValue - monthlySurplus * 12;
    cumulativeGain += Math.max(0, yearGain);

    yearlySnapshots.push({
      year: y,
      debtBalance: Math.max(0, runningDebtBalance),
      debtInterestPaid: cumulativeInterest,
      investmentValue: runningInvestmentValue,
      investmentGain: cumulativeGain,
      netWorthDebtPath: -Math.max(0, runningDebtBalance),
      netWorthInvestPath: runningInvestmentValue - debtBalance,
    });
  }

  const debtPath =
    priority === "debt"
      ? monthlySurplus
      : priority === "balanced"
      ? monthlySurplus / 2
      : 0;
  const investPath = monthlySurplus - debtPath;

  return {
    effectiveDebtRate,
    effectiveInvestmentReturn,
    netBenefit,
    priority,
    priorityStrength,
    totalInterestCost,
    totalProjectedGrowth,
    opportunityCost,
    breakEvenRate,
    debtFreeMonth,
    yearlySnapshots,
    monthlySurplusToDebt: debtPath,
    monthlySurplusToInvest: investPath,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatMonths(months: number): string {
  if (months <= 0 || !isFinite(months)) return "N/A";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem}mo`;
  if (rem === 0) return `${years}yr`;
  return `${years}yr ${rem}mo`;
}

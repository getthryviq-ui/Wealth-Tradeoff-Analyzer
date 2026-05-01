import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EngineInputs } from "@/lib/calculations";

interface Props {
  inputs: EngineInputs;
  onChange: (inputs: EngineInputs) => void;
}

interface FieldConfig {
  key: keyof EngineInputs;
  label: string;
  sublabel: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  unit: string;
}

const fields: FieldConfig[] = [
  {
    key: "debtBalance",
    label: "Debt Balance",
    sublabel: "Total outstanding principal",
    min: 1000,
    max: 2000000,
    step: 1000,
    format: (v) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(v),
    unit: "$",
  },
  {
    key: "debtInterestRate",
    label: "Debt Interest Rate",
    sublabel: "Annual percentage rate (APR)",
    min: 0.5,
    max: 30,
    step: 0.1,
    format: (v) => `${v.toFixed(1)}%`,
    unit: "%",
  },
  {
    key: "expectedMarketReturn",
    label: "Expected Market Return",
    sublabel: "Annual pre-tax investment growth",
    min: 1,
    max: 20,
    step: 0.25,
    format: (v) => `${v.toFixed(2)}%`,
    unit: "%",
  },
  {
    key: "taxBracket",
    label: "Marginal Tax Rate",
    sublabel: "Federal + state effective bracket",
    min: 0,
    max: 55,
    step: 1,
    format: (v) => `${v.toFixed(0)}%`,
    unit: "%",
  },
  {
    key: "monthlySurplus",
    label: "Monthly Surplus",
    sublabel: "Available capital after living expenses",
    min: 100,
    max: 50000,
    step: 100,
    format: (v) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(v),
    unit: "$",
  },
  {
    key: "timeHorizonYears",
    label: "Time Horizon",
    sublabel: "Analysis period in years",
    min: 1,
    max: 30,
    step: 1,
    format: (v) => `${v} yr${v !== 1 ? "s" : ""}`,
    unit: "yrs",
  },
];

export default function InputPanel({ inputs, onChange }: Props) {
  const [focused, setFocused] = useState<string | null>(null);

  const update = (key: keyof EngineInputs, value: number | string) => {
    onChange({ ...inputs, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Parameters
        </p>
      </div>

      {fields.map((field) => {
        const val = inputs[field.key] as number;
        const isFocused = focused === field.key;
        return (
          <div
            key={field.key}
            className="group"
            onMouseEnter={() => setFocused(field.key)}
            onMouseLeave={() => setFocused(null)}
            data-testid={`field-${field.key}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <Label className="text-sm font-medium text-foreground">
                  {field.label}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {field.sublabel}
                </p>
              </div>
              <span
                className={`font-mono text-sm font-semibold transition-colors duration-200 ${
                  isFocused ? "text-primary" : "text-foreground"
                }`}
                data-testid={`value-${field.key}`}
              >
                {field.format(val)}
              </span>
            </div>
            <Slider
              min={field.min}
              max={field.max}
              step={field.step}
              value={[val]}
              onValueChange={([v]) => update(field.key, v)}
              className="cursor-pointer"
              data-testid={`slider-${field.key}`}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground/60">
                {field.format(field.min)}
              </span>
              <span className="text-[10px] text-muted-foreground/60">
                {field.format(field.max)}
              </span>
            </div>
          </div>
        );
      })}

      <div className="pt-2 space-y-4 border-t border-border">
        <div data-testid="field-investmentType">
          <Label className="text-sm font-medium text-foreground">
            Investment Account Type
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">
            Determines tax treatment of returns
          </p>
          <Select
            value={inputs.investmentType}
            onValueChange={(v) =>
              update("investmentType", v as EngineInputs["investmentType"])
            }
          >
            <SelectTrigger data-testid="select-investmentType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="taxable">
                Taxable Brokerage (returns taxed annually)
              </SelectItem>
              <SelectItem value="tax_advantaged">
                Tax-Advantaged (IRA / 401k — deferred)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div data-testid="field-debtType">
          <Label className="text-sm font-medium text-foreground">
            Interest Compounding
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">
            How interest accrues on outstanding debt
          </p>
          <Select
            value={inputs.debtType}
            onValueChange={(v) =>
              update("debtType", v as EngineInputs["debtType"])
            }
          >
            <SelectTrigger data-testid="select-debtType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compound">Compound (mortgage, student loans)</SelectItem>
              <SelectItem value="simple">Simple (personal lines of credit)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

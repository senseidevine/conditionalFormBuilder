import { Select } from "../components/Select";
import "./AttributeRule.css";

interface AttributeRuleProps {
  field: string;
  cond: string;
  value: string;
  onChange: (key: "field" | "cond" | "value", v: string) => void;
}

/** The atomic Field / Condition / Value row — no chrome, no title. */
export function AttributeRule({ field, cond, value, onChange }: AttributeRuleProps) {
  return (
    <div className="arule">
      <Select
        value={field}
        placeholder="Field"
        onChange={(v) => onChange("field", v)}
        options={["Name", "Email", "Plan", "Country"]}
      />
      <Select
        value={cond}
        placeholder="Condition"
        onChange={(v) => onChange("cond", v)}
        options={["equals", "not equals", "contains"]}
      />
      <Select
        value={value}
        placeholder="Value"
        onChange={(v) => onChange("value", v)}
        options={["true", "false", "any"]}
      />
    </div>
  );
}

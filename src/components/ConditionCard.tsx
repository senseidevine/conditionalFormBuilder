import type { ReactNode } from "react";
import { Select } from "./Select";
import { IconGroup, IconReturn } from "./Icons";
import "./ConditionCard.css";

interface Row {
  id: string;
  field: string;
  cond: string;
  value: string;
}

interface ConditionCardProps {
  title?: string;
  rows: Row[];
  onChange: (id: string, key: "field" | "cond" | "value", v: string) => void;
  onAddCondition: () => void;
  onAddGroup: () => void;
}

export function ConditionCard({
  title = "Title",
  rows,
  onChange,
  onAddCondition,
  onAddGroup,
}: ConditionCardProps) {
  return (
    <section className="ccard" aria-label={title}>
      <div className="ccard-title">{title}</div>
      <div className="ccard-rows">
        {rows.map((r) => (
          <div key={r.id} className="ccard-row">
            <Select
              value={r.field}
              placeholder="Field"
              onChange={(v) => onChange(r.id, "field", v)}
              options={["Name", "Email", "Plan", "Country"]}
            />
            <Select
              value={r.cond}
              placeholder="Condition"
              onChange={(v) => onChange(r.id, "cond", v)}
              options={["equals", "not equals", "contains"]}
            />
            <Select
              value={r.value}
              placeholder="Value"
              onChange={(v) => onChange(r.id, "value", v)}
              options={["true", "false", "any"]}
            />
          </div>
        ))}
      </div>

      <div className="ccard-actions">
        <ActionPill icon={<IconReturn />} onClick={onAddCondition}>
          Condition
        </ActionPill>
        <ActionPill icon={<IconGroup />} onClick={onAddGroup}>
          Group
        </ActionPill>
      </div>
    </section>
  );
}

function ActionPill({
  icon,
  children,
  onClick,
}: {
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="apill" onClick={onClick}>
      <span className="apill-icon" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </button>
  );
}

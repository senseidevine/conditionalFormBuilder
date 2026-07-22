import type { Operator } from "./types";
import "./OperatorBadge.css";

interface OperatorBadgeProps {
  operator: Operator;
  onToggle?: () => void;
}

/** The AND/OR pill that sits on the vertical bracket connector to the left
 *  of a group's children. */
export function OperatorBadge({ operator, onToggle }: OperatorBadgeProps) {
  return (
    <button
      type="button"
      className="cfb-op-badge"
      onClick={onToggle}
      aria-label={`Toggle operator, currently ${operator}`}
      data-op={operator}
    >
      {operator}
    </button>
  );
}

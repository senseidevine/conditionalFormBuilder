import type { Operator } from "./types";
import "./OperatorToggle.css";

interface OperatorToggleProps {
  operator: Operator;
  onToggle?: () => void;
}

/** The AND/OR pill that floats over a group's bracket connector.
 *  Click to flip between AND and OR. */
export function OperatorToggle({ operator, onToggle }: OperatorToggleProps) {
  return (
    <button
      type="button"
      className="optog"
      onClick={onToggle}
      aria-label={`Toggle operator, currently ${operator}`}
      data-op={operator}
    >
      {operator}
    </button>
  );
}

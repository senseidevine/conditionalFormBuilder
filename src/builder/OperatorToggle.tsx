import type { Operator } from "./types";
import "./OperatorToggle.css";

interface OperatorToggleProps {
  operator: Operator;
  /** Called when the badge acts as a click-to-toggle button (menuMode
   *  off). Undefined in menu mode. */
  onToggle?: () => void;
  /** Called when the user picks an operator from the hover menu
   *  (menuMode on). */
  onSet?: (op: Operator) => void;
  /** When true, hovering the badge reveals a two-option dropdown
   *  (And / Or) and click-to-toggle is suppressed. When false, the
   *  badge stays a click-toggle. */
  menuMode?: boolean;
}

/** The AND/OR pill that floats over a group's bracket connector.
 *  Two modes:
 *  - Off (default): click flips between AND and OR.
 *  - On: hovering reveals a small And/Or menu the user picks from,
 *    and click does nothing on the badge itself. */
export function OperatorToggle({
  operator,
  onToggle,
  onSet,
  menuMode,
}: OperatorToggleProps) {
  if (menuMode) {
    return (
      <div className="optog-wrap">
        <span
          className="optog"
          role="button"
          tabIndex={0}
          aria-haspopup="menu"
          aria-label={`Operator, currently ${operator}`}
          data-op={operator}
        >
          {operator}
        </span>
        <div className="optog-menu" role="menu">
          <button
            type="button"
            role="menuitem"
            className={`optog-option ${operator === "AND" ? "is-active" : ""}`}
            onClick={() => onSet?.("AND")}
          >
            And
          </button>
          <button
            type="button"
            role="menuitem"
            className={`optog-option ${operator === "OR" ? "is-active" : ""}`}
            onClick={() => onSet?.("OR")}
          >
            Or
          </button>
        </div>
      </div>
    );
  }
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

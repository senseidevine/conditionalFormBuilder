import { useState } from "react";
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
  /** When true, hovering the badge reveals a three-option dropdown
   *  (And / Or / Not) and click-to-toggle is suppressed. When false,
   *  the badge stays a click-toggle that cycles the three options. */
  menuMode?: boolean;
  /** When false, the NOT option is not offered (menu hides it, click
   *  cycle skips it). Useful for condition-level operators, which only
   *  join property rows and have no meaningful NOT. Default true. */
  allowNot?: boolean;
}

const LABEL: Record<Operator, string> = { AND: "AND", OR: "OR", NOT: "NOT" };

/** The AND/OR/NOT pill that floats over a group's bracket connector.
 *  Two modes:
 *  - Off (default): click cycles AND -> OR -> NOT -> AND.
 *  - On: hovering reveals a small And/Or/Not menu the user picks from,
 *    and click does nothing on the badge itself. */
export function OperatorToggle({
  operator,
  onToggle,
  onSet,
  menuMode,
  allowNot = true,
}: OperatorToggleProps) {
  /* Once the user picks an option we suppress the hover-reveal until
   * their cursor actually leaves the wrap — otherwise the popover
   * keeps sitting under the cursor and reads as "did nothing". */
  const [dismissed, setDismissed] = useState(false);
  if (menuMode) {
    const pick = (op: Operator) => {
      onSet?.(op);
      setDismissed(true);
    };
    return (
      <div
        className={`optog-wrap ${dismissed ? "is-dismissed" : ""}`}
        onMouseLeave={() => setDismissed(false)}
      >
        <span
          className="optog"
          role="button"
          tabIndex={0}
          aria-haspopup="menu"
          aria-label={`Operator, currently ${operator}`}
          data-op={operator}
        >
          {LABEL[operator]}
        </span>
        <div className="optog-menu" role="menu">
          <button
            type="button"
            role="menuitem"
            className={`optog-option ${operator === "AND" ? "is-active" : ""}`}
            onClick={() => pick("AND")}
          >
            And (Require all)
          </button>
          <button
            type="button"
            role="menuitem"
            className={`optog-option ${operator === "OR" ? "is-active" : ""}`}
            onClick={() => pick("OR")}
          >
            Or (Require at least one)
          </button>
          {allowNot ? (
            <button
              type="button"
              role="menuitem"
              className={`optog-option ${operator === "NOT" ? "is-active" : ""}`}
              onClick={() => pick("NOT")}
            >
              Not (Negate the child)
            </button>
          ) : null}
        </div>
      </div>
    );
  }
  const handleClick = () => {
    if (!allowNot) {
      /* Two-way toggle for condition-level operators — NOT isn't
       * offered here, so the 3-way cycle in `onToggle` would visit a
       * dead state. Jump between AND and OR directly instead. */
      onSet?.(operator === "AND" ? "OR" : "AND");
      return;
    }
    onToggle?.();
  };
  return (
    <button
      type="button"
      className="optog"
      onClick={handleClick}
      aria-label={`Toggle operator, currently ${operator}`}
      data-op={operator}
    >
      {LABEL[operator]}
    </button>
  );
}

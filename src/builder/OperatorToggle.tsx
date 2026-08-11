import { useState } from "react";
import type { Operator } from "./types";
import "./OperatorToggle.css";

interface OperatorToggleProps {
  operator: Operator;
  /** True when the group is negated (NAND/NOR). Only meaningful when
   *  `allowNot` is true, i.e. on group-level toggles — conditions have
   *  no negation. */
  negated?: boolean;
  /** Called when the badge acts as a click-to-toggle button (menuMode
   *  off). Undefined in menu mode. */
  onToggle?: () => void;
  /** Called when the user picks an operator from the hover menu
   *  (menuMode on). */
  onSet?: (op: Operator) => void;
  /** Called when the user clicks the NOT chip. Toggles the `negated`
   *  flag on the group. */
  onToggleNegated?: () => void;
  /** When true, hovering the badge reveals a two-option And/Or dropdown
   *  and click-to-toggle is suppressed. When false, the badge stays a
   *  click-toggle. NOT is now an orthogonal modifier and is offered on
   *  a separate chip in both modes. */
  menuMode?: boolean;
  /** When false, the NOT chip is not offered. Used by conditions,
   *  which only join property rows and have no meaningful negation. */
  allowNot?: boolean;
}

/** Stacked toggle: a small NOT chip on top and the AND/OR badge below.
 *  The NOT chip stays hidden until the user hovers the stack (or the
 *  group is already negated, in which case it stays visible so the
 *  state is legible at a glance). Click the NOT chip to toggle the
 *  group's `negated` flag; click the AND/OR badge to flip the
 *  combinator (or open the menu in menuMode). */
export function OperatorToggle({
  operator,
  negated,
  onToggle,
  onSet,
  onToggleNegated,
  menuMode,
  allowNot = true,
}: OperatorToggleProps) {
  /* Once the user picks an option from the And/Or menu we suppress the
   * hover-reveal until their cursor actually leaves the wrap — otherwise
   * the popover keeps sitting under the cursor and reads as "did
   * nothing". */
  const [dismissed, setDismissed] = useState(false);

  const notChip = allowNot ? (
    <button
      type="button"
      className={`optog-neg ${negated ? "is-on" : ""}`}
      onClick={onToggleNegated}
      aria-pressed={negated || false}
      aria-label={negated ? "Remove NOT modifier" : "Add NOT modifier"}
      tabIndex={negated ? 0 : -1}
    >
      NOT
    </button>
  ) : null;

  if (menuMode) {
    const pick = (op: Operator) => {
      onSet?.(op);
      setDismissed(true);
    };
    return (
      <div
        className={`optog-stack ${dismissed ? "is-dismissed" : ""}`}
        data-negated={negated ? "true" : undefined}
        onMouseLeave={() => setDismissed(false)}
      >
        {notChip}
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="optog-stack"
      data-negated={negated ? "true" : undefined}
    >
      {notChip}
      <button
        type="button"
        className="optog"
        onClick={onToggle}
        aria-label={`Toggle operator, currently ${operator}`}
        data-op={operator}
      >
        {operator}
      </button>
    </div>
  );
}

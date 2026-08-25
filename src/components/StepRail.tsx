import { IconCircle } from "./Icons";
import { LogoMenu } from "./LogoMenu";
import "./StepRail.css";

interface StepRailProps {
  steps: { id: string; label: string }[];
  activeId: string;
  completedIds: string[];
  onSelect?: (id: string) => void;
  /** Which step is currently open — used to scope the config popover
   *  down to the toggles that apply to the visible view. */
  activeStep: string;
  swapButtons: boolean;
  onToggleSwapButtons: (v: boolean) => void;
  showLoneBracket: boolean;
  onToggleLoneBracket: (v: boolean) => void;
  showBrackets: boolean;
  onToggleShowBrackets: (v: boolean) => void;
  nestedBgDark: boolean;
  onToggleNestedBgDark: (v: boolean) => void;
  smoothAnim: boolean;
  onToggleSmoothAnim: (v: boolean) => void;
  operatorMenu: boolean;
  onToggleOperatorMenu: (v: boolean) => void;
  bracketDottedOr: boolean;
  onToggleBracketDottedOr: (v: boolean) => void;
  bareCblocks: boolean;
  onToggleBareCblocks: (v: boolean) => void;
  colorTagPills: boolean;
  onToggleColorTagPills: (v: boolean) => void;
  alwaysShowCtas: boolean;
  onToggleAlwaysShowCtas: (v: boolean) => void;
}

export function StepRail({
  steps,
  activeId,
  completedIds,
  onSelect,
  activeStep,
  swapButtons,
  onToggleSwapButtons,
  showLoneBracket,
  onToggleLoneBracket,
  showBrackets,
  onToggleShowBrackets,
  nestedBgDark,
  onToggleNestedBgDark,
  smoothAnim,
  onToggleSmoothAnim,
  operatorMenu,
  onToggleOperatorMenu,
  bracketDottedOr,
  onToggleBracketDottedOr,
  bareCblocks,
  onToggleBareCblocks,
  colorTagPills,
  onToggleColorTagPills,
  alwaysShowCtas,
  onToggleAlwaysShowCtas,
}: StepRailProps) {
  return (
    <aside className="rail" aria-label="Wizard steps">
      <LogoMenu
        activeStep={activeStep}
        swapButtons={swapButtons}
        onToggleSwapButtons={onToggleSwapButtons}
        showLoneBracket={showLoneBracket}
        onToggleLoneBracket={onToggleLoneBracket}
        showBrackets={showBrackets}
        onToggleShowBrackets={onToggleShowBrackets}
        nestedBgDark={nestedBgDark}
        onToggleNestedBgDark={onToggleNestedBgDark}
        smoothAnim={smoothAnim}
        onToggleSmoothAnim={onToggleSmoothAnim}
        operatorMenu={operatorMenu}
        onToggleOperatorMenu={onToggleOperatorMenu}
        bracketDottedOr={bracketDottedOr}
        onToggleBracketDottedOr={onToggleBracketDottedOr}
        bareCblocks={bareCblocks}
        onToggleBareCblocks={onToggleBareCblocks}
        colorTagPills={colorTagPills}
        onToggleColorTagPills={onToggleColorTagPills}
        alwaysShowCtas={alwaysShowCtas}
        onToggleAlwaysShowCtas={onToggleAlwaysShowCtas}
      />
      <ul className="rail-list">
        {steps.map((s) => {
          const isActive = s.id === activeId;
          const isDone = completedIds.includes(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                className={`rail-step ${isActive ? "is-active" : ""} ${
                  isDone ? "is-done" : ""
                }`}
                onClick={() => onSelect?.(s.id)}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="rail-step-icon" aria-hidden>
                  <IconCircle />
                </span>
                <span className="rail-step-label">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

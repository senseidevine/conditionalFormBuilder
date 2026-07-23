import { IconCircle } from "./Icons";
import { LogoMenu } from "./LogoMenu";
import "./StepRail.css";

interface StepRailProps {
  steps: { id: string; label: string }[];
  activeId: string;
  completedIds: string[];
  onSelect?: (id: string) => void;
  showConnectors: boolean;
  onToggleConnectors: (v: boolean) => void;
}

export function StepRail({
  steps,
  activeId,
  completedIds,
  onSelect,
  showConnectors,
  onToggleConnectors,
}: StepRailProps) {
  return (
    <aside className="rail" aria-label="Wizard steps">
      <LogoMenu
        showConnectors={showConnectors}
        onToggleConnectors={onToggleConnectors}
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

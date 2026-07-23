import { IconCheck, IconCircle, IconCircleDashed } from "./Icons";
import "./TabStrip.css";

export interface TabItem {
  id: string;
  label: string;
}

interface TabStripProps {
  items: TabItem[];
  activeId: string;
  completedIds: string[];
  onSelect: (id: string) => void;
}

export function TabStrip({
  items,
  activeId,
  completedIds,
  onSelect,
}: TabStripProps) {
  return (
    <nav className="tabs" role="tablist" aria-label="Wizard sections">
      {items.map((it) => {
        const isActive = it.id === activeId;
        const isDone = completedIds.includes(it.id);
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={isActive}
            className={`tab ${isActive ? "is-active" : ""} ${
              isDone ? "is-done" : ""
            }`}
            onClick={() => onSelect(it.id)}
            type="button"
          >
            <span className="tab-icon" aria-hidden>
              {isDone ? (
                <span className="tab-check">
                  <IconCheck />
                </span>
              ) : isActive ? (
                <IconCircleDashed />
              ) : (
                <IconCircle />
              )}
            </span>
            <span>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

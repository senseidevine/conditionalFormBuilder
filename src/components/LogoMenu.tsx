import { useEffect, useRef, useState } from "react";
import { LogoR } from "./Icons";
import { Switch } from "./Switch";
import "./LogoMenu.css";

interface LogoMenuProps {
  showConnectors: boolean;
  onToggleConnectors: (v: boolean) => void;
}

/** The top-left "R" logo, now a menu trigger. Opens a small config
 *  popover with the form configuration toggles. */
export function LogoMenu({ showConnectors, onToggleConnectors }: LogoMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="logomenu" ref={wrapRef}>
      <button
        type="button"
        className="logomenu-btn"
        aria-label="Form configuration"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <LogoR />
      </button>

      {open ? (
        <div className="logomenu-pop" role="menu">
          <div className="logomenu-title">Form configuration</div>
          <div className="logomenu-row">
            <div className="logomenu-row-text">
              <div className="logomenu-row-title">Connectors</div>
              <div className="logomenu-row-desc">
                Show AND / OR brackets and the Condition action
              </div>
            </div>
            <Switch
              checked={showConnectors}
              onChange={onToggleConnectors}
              ariaLabel="Toggle connectors"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

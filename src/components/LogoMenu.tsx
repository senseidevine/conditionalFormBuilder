import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LogoR } from "./Icons";
import { SegmentedTabs } from "./SegmentedTabs";
import "./LogoMenu.css";

interface LogoMenuProps {
  swapButtons: boolean;
  onToggleSwapButtons: (v: boolean) => void;
  showLoneBracket: boolean;
  onToggleLoneBracket: (v: boolean) => void;
}

type Anchor = { top: number; left: number };

/** The top-left "R" logo, now a menu trigger. Renders the popover into
 *  document.body via a portal + fixed positioning so it's never clipped
 *  by a parent stacking context. */
export function LogoMenu({
  swapButtons,
  onToggleSwapButtons,
  showLoneBracket,
  onToggleLoneBracket,
}: LogoMenuProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const placePopover = () => {
    const b = btnRef.current?.getBoundingClientRect();
    if (!b) return;
    setAnchor({ top: b.bottom + 10, left: b.left });
  };

  useLayoutEffect(() => {
    if (open) placePopover();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = () => placePopover();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  return (
    <div className="logomenu">
      <button
        ref={btnRef}
        type="button"
        className="logomenu-btn"
        aria-label="Form configuration"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <LogoR />
      </button>

      {open
        ? createPortal(
            <div
              ref={popRef}
              className="logomenu-pop"
              role="menu"
              style={{ top: anchor.top, left: anchor.left }}
            >
              <div className="logomenu-title">Form configuration</div>

              <div className="logomenu-row">
                <div className="logomenu-row-text">
                  <div className="logomenu-row-title">Swap buttons</div>
                  <div className="logomenu-row-desc">
                    Swap the position of the Section and Group actions
                  </div>
                </div>
                <SegmentedTabs
                  ariaLabel="Swap buttons"
                  value={swapButtons ? "on" : "off"}
                  onChange={(v) => onToggleSwapButtons(v === "on")}
                  options={[
                    { value: "off", label: "Off" },
                    { value: "on", label: "On" },
                  ]}
                />
              </div>

              <div className="logomenu-row">
                <div className="logomenu-row-text">
                  <div className="logomenu-row-title">Single-section bracket</div>
                  <div className="logomenu-row-desc">
                    Show the bracket when a group has only one section.
                    Groups with two or more always show it.
                  </div>
                </div>
                <SegmentedTabs
                  ariaLabel="Single-section bracket"
                  value={showLoneBracket ? "on" : "off"}
                  onChange={(v) => onToggleLoneBracket(v === "on")}
                  options={[
                    { value: "off", label: "Off" },
                    { value: "on", label: "On" },
                  ]}
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

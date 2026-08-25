import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LogoR } from "./Icons";
import { SegmentedTabs } from "./SegmentedTabs";
import "./LogoMenu.css";

interface LogoMenuProps {
  /** Currently visible view — scopes the popover rows so only toggles
   *  relevant to the active view are shown. `s3` is the rules editor
   *  (Build v2); everything else uses the recursive Group builder. */
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

type Anchor = { top: number; left: number };

/** The top-left "R" logo, now a menu trigger. Renders the popover into
 *  document.body via a portal + fixed positioning so it's never clipped
 *  by a parent stacking context. */
export function LogoMenu({
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

              {/* Group-builder toggles — visible on every step except
               * the rules editor (Build v2, s3). */}
              {activeStep !== "s3" ? (
                <>
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
                  <div className="logomenu-row-title">Brackets</div>
                  <div className="logomenu-row-desc">
                    Show the bracket connector at every level
                  </div>
                </div>
                <SegmentedTabs
                  ariaLabel="Brackets"
                  value={showBrackets ? "on" : "off"}
                  onChange={(v) => onToggleShowBrackets(v === "on")}
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

              <div className="logomenu-row">
                <div className="logomenu-row-text">
                  <div className="logomenu-row-title">Dotted OR bracket</div>
                  <div className="logomenu-row-desc">
                    Render the bracket line dashed when the group's
                    operator is OR; solid for AND.
                  </div>
                </div>
                <SegmentedTabs
                  ariaLabel="Dotted OR bracket"
                  value={bracketDottedOr ? "on" : "off"}
                  onChange={(v) => onToggleBracketDottedOr(v === "on")}
                  options={[
                    { value: "off", label: "Off" },
                    { value: "on", label: "On" },
                  ]}
                />
              </div>

              <div className="logomenu-row">
                <div className="logomenu-row-text">
                  <div className="logomenu-row-title">Bare cblocks</div>
                  <div className="logomenu-row-desc">
                    Strip all backgrounds off section and group cards so
                    only the bracket lines structure the tree.
                  </div>
                </div>
                <SegmentedTabs
                  ariaLabel="Bare cblocks"
                  value={bareCblocks ? "on" : "off"}
                  onChange={(v) => onToggleBareCblocks(v === "on")}
                  options={[
                    { value: "off", label: "Off" },
                    { value: "on", label: "On" },
                  ]}
                />
              </div>

              <div className="logomenu-row">
                <div className="logomenu-row-text">
                  <div className="logomenu-row-title">Nested background</div>
                  <div className="logomenu-row-desc">
                    Off: 10 % white. On: 15 % black.
                  </div>
                </div>
                <SegmentedTabs
                  ariaLabel="Nested background"
                  value={nestedBgDark ? "on" : "off"}
                  onChange={(v) => onToggleNestedBgDark(v === "on")}
                  options={[
                    { value: "off", label: "Off" },
                    { value: "on", label: "On" },
                  ]}
                />
              </div>

              <div className="logomenu-row">
                <div className="logomenu-row-text">
                  <div className="logomenu-row-title">Smooth animations</div>
                  <div className="logomenu-row-desc">
                    Animate the bracket appearing and the property row's
                    empty-space collapse.
                  </div>
                </div>
                <SegmentedTabs
                  ariaLabel="Smooth animations"
                  value={smoothAnim ? "on" : "off"}
                  onChange={(v) => onToggleSmoothAnim(v === "on")}
                  options={[
                    { value: "off", label: "Off" },
                    { value: "on", label: "On" },
                  ]}
                />
              </div>

              <div className="logomenu-row">
                <div className="logomenu-row-text">
                  <div className="logomenu-row-title">Operator menu</div>
                  <div className="logomenu-row-desc">
                    On: hover the AND/OR badge to pick from a dropdown.
                    Off: tap to toggle between AND and OR.
                  </div>
                </div>
                <SegmentedTabs
                  ariaLabel="Operator menu"
                  value={operatorMenu ? "on" : "off"}
                  onChange={(v) => onToggleOperatorMenu(v === "on")}
                  options={[
                    { value: "off", label: "Off" },
                    { value: "on", label: "On" },
                  ]}
                />
              </div>
                </>
              ) : null}

              {/* Rules-editor toggles — visible only on the rules
               * editor (Build v2, s3). */}
              {activeStep === "s3" ? (
                <>
                  <div className="logomenu-row">
                    <div className="logomenu-row-text">
                      <div className="logomenu-row-title">Color tag pills</div>
                      <div className="logomenu-row-desc">
                        On: Operator #FF5777 (coral), Condition #6790B8
                        (steel-blue), Value white. Off: neutral white
                        palette.
                      </div>
                    </div>
                    <SegmentedTabs
                      ariaLabel="Color tag pills"
                      value={colorTagPills ? "on" : "off"}
                      onChange={(v) => onToggleColorTagPills(v === "on")}
                      options={[
                        { value: "off", label: "Off" },
                        { value: "on", label: "On" },
                      ]}
                    />
                  </div>

                  <div className="logomenu-row">
                    <div className="logomenu-row-text">
                      <div className="logomenu-row-title">Always show CTAs</div>
                      <div className="logomenu-row-desc">
                        On: keep the +Connector and +Subset rows
                        visible below every block. Off: reveal them
                        only when the block is hovered or focused.
                      </div>
                    </div>
                    <SegmentedTabs
                      ariaLabel="Always show CTAs"
                      value={alwaysShowCtas ? "on" : "off"}
                      onChange={(v) => onToggleAlwaysShowCtas(v === "on")}
                      options={[
                        { value: "off", label: "Off" },
                        { value: "on", label: "On" },
                      ]}
                    />
                  </div>
                </>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

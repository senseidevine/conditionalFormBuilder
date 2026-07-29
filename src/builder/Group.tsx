import type { GroupNode } from "./types";
import { ConditionBlock } from "./ConditionBlock";
import { OperatorToggle } from "./OperatorToggle";
import { ReorderControls } from "./ReorderControls";
import { IconGroup, IconReturn, IconTrash } from "../components/Icons";
import "./Group.css";

export type Mutation =
  | "toggle"
  | "removeChild"
  | "addCondition"
  | "addGroup"
  | "setTitle"
  | "addProperty"
  | "setPropertyValue"
  | "removeProperty"
  | "moveUp"
  | "moveDown"
  | "moveTo";

interface GroupProps {
  group: GroupNode;
  depth: number;
  /** "root" — no outer chrome / bracket; renders like a flat form area.
   *  "nested" — wrapped in a bracket connector with an operator toggle. */
  variant: "root" | "nested";
  /** When true, the Section and Group action pills swap positions
   *  (Group on the left, Section on the right). */
  swapButtons: boolean;
  /** When false, the bracket is hidden for groups that have only one
   *  section (nothing to AND/OR yet). Groups with 2+ sections always
   *  show the bracket. */
  showLoneBracket: boolean;
  /** When false, the bracket line does not brighten on hover. */
  connectorHover: boolean;
  /** Master toggle for bracket visibility across the whole builder. */
  showBrackets: boolean;
  /** When true, nested groups switch from the subtle white lift to
   *  15% black. */
  nestedBgDark: boolean;
  /** Sibling reorder handlers — undefined when this cblock is at the
   *  edge of its parent (top → no up, bottom → no down). Root Groups
   *  receive nothing since they have no siblings. */
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  /** True when this cblock has siblings to swap with — enables the
   *  drag grip in ReorderControls even when it's currently first or
   *  last (both up and down would otherwise be undefined). */
  canDrag?: boolean;
  onMutate: (id: string, mut: Mutation, payload?: unknown) => void;
}

export function Group({
  group,
  depth,
  variant,
  swapButtons,
  showLoneBracket,
  connectorHover,
  showBrackets,
  nestedBgDark,
  onMoveUp,
  onMoveDown,
  canDrag,
  onMutate,
}: GroupProps) {
  const hasMany = group.children.length > 1;
  const showBracket = showBrackets && (hasMany || showLoneBracket);
  const showToggle = showBracket && hasMany;

  const sectionPill = (
    <ActionPill
      key="section"
      icon={<IconGroup />}
      onClick={() => onMutate(group.id, "addCondition")}
    >
      Section
    </ActionPill>
  );
  const groupPill = (
    <ActionPill
      key="group"
      icon={<IconReturn />}
      onClick={() => onMutate(group.id, "addGroup")}
    >
      Group
    </ActionPill>
  );
  const actionOrder = swapButtons
    ? [groupPill, sectionPill]
    : [sectionPill, groupPill];

  return (
    <div
      className={variant === "nested" ? "cblock" : "grp grp--root"}
      data-depth={depth}
      data-hover-off={!connectorHover}
      data-bg-dark={nestedBgDark}
    >
      {variant === "nested" ? (
        <div className="grp-head">
          <input
            className="grp-title"
            value={group.title ?? ""}
            onChange={(e) => onMutate(group.id, "setTitle", e.target.value)}
            placeholder="Group"
            aria-label="Group title"
            spellCheck={false}
          />
          <ReorderControls
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canDrag={!!canDrag}
          />
          <button
            type="button"
            className="grp-remove"
            aria-label="Remove group"
            onClick={() => onMutate(group.id, "removeChild")}
          >
            <IconTrash />
          </button>
        </div>
      ) : null}
      <div className="grp-body">
        {/* Always rendered so its width + opacity can transition when
         * `showBracket` flips (e.g. when a 2nd section is added and the
         * bracket appears). */}
        <div
          className={`grp-bracket ${showBracket ? "" : "is-hidden"}`}
          aria-hidden
        >
          {showToggle ? (
            <OperatorToggle
              operator={group.operator}
              onToggle={() => onMutate(group.id, "toggle")}
            />
          ) : null}
        </div>

        <div className="grp-children">
          {group.children.map((child, i) => {
            /* Sibling reorder scope: only within this group's children.
             * First child can't move up; last can't move down. Single
             * children get neither handler and ReorderControls renders
             * nothing. */
            const canMoveUp = i > 0;
            const canMoveDown = i < group.children.length - 1;
            const childCanDrag = group.children.length > 1;
            const childMoveUp = canMoveUp
              ? () => onMutate(child.id, "moveUp")
              : undefined;
            const childMoveDown = canMoveDown
              ? () => onMutate(child.id, "moveDown")
              : undefined;
            return (
              <div
                key={child.id}
                className="cblock-slot"
                data-child-id={child.id}
                onPointerDown={(e) =>
                  startDrag(e, child.id, group.id, onMutate)
                }
              >
                {child.kind === "condition" ? (
                  <ConditionBlock
                    node={child}
                    onSetTitle={(v) => onMutate(child.id, "setTitle", v)}
                    onSetProperty={(propertyId, key, val) =>
                      onMutate(child.id, "setPropertyValue", {
                        propertyId,
                        key,
                        val,
                      })
                    }
                    onAddProperty={() => onMutate(child.id, "addProperty")}
                    onRemoveProperty={(propertyId) =>
                      onMutate(child.id, "removeProperty", { propertyId })
                    }
                    onRemove={
                      group.children.length > 1 || variant !== "root"
                        ? () => onMutate(child.id, "removeChild")
                        : undefined
                    }
                    onMoveUp={childMoveUp}
                    onMoveDown={childMoveDown}
                    canDrag={childCanDrag}
                  />
                ) : (
                  <Group
                    group={child}
                    depth={depth + 1}
                    variant="nested"
                    swapButtons={swapButtons}
                    showLoneBracket={showLoneBracket}
                    connectorHover={connectorHover}
                    showBrackets={showBrackets}
                    nestedBgDark={nestedBgDark}
                    onMoveUp={childMoveUp}
                    onMoveDown={childMoveDown}
                    canDrag={childCanDrag}
                    onMutate={onMutate}
                  />
                )}
              </div>
            );
          })}

          <div className="grp-actions">{actionOrder}</div>
        </div>
      </div>
    </div>
  );
}

/** Pointer-drag reorder delegate. Fires from the child's cblock-slot
 *  wrapper's onPointerDown but only takes action when the pointer went
 *  down on an element carrying `data-drag-handle` (the grip inside
 *  ReorderControls). While the pointer is held, we walk the slot's
 *  parent to find the sibling under the cursor and dispatch a moveTo
 *  mutation whenever the target index changes — the tree re-renders
 *  the child into its new slot, keeping React keys stable so pointer
 *  capture stays with the same DOM node. */
function startDrag(
  e: React.PointerEvent<HTMLDivElement>,
  childId: string,
  parentId: string,
  onMutate: (id: string, mut: Mutation, payload?: unknown) => void
) {
  const target = e.target as HTMLElement;
  if (!target.closest("[data-drag-handle]")) return;
  const slot = e.currentTarget;
  const parentEl = slot.parentElement;
  if (!parentEl) return;
  e.preventDefault();
  slot.setPointerCapture(e.pointerId);
  slot.classList.add("is-dragging");

  const handleMove = (ev: PointerEvent) => {
    const y = ev.clientY;
    const slots = Array.from(
      parentEl.querySelectorAll<HTMLElement>(":scope > .cblock-slot")
    );
    const currentIdx = slots.findIndex(
      (s) => s.dataset.childId === childId
    );
    if (currentIdx === -1) return;
    let targetIdx = slots.length - 1;
    for (let i = 0; i < slots.length; i++) {
      const rect = slots[i].getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (y < mid) {
        targetIdx = i;
        break;
      }
    }
    if (targetIdx !== currentIdx) {
      onMutate(childId, "moveTo", targetIdx);
    }
  };
  const cleanup = () => {
    slot.removeEventListener("pointermove", handleMove);
    slot.removeEventListener("pointerup", cleanup);
    slot.removeEventListener("pointercancel", cleanup);
    slot.classList.remove("is-dragging");
    try {
      slot.releasePointerCapture(e.pointerId);
    } catch {
      /* capture may already be released */
    }
  };
  slot.addEventListener("pointermove", handleMove);
  slot.addEventListener("pointerup", cleanup);
  slot.addEventListener("pointercancel", cleanup);

  /* parentId isn't used here — drag is scoped to same parent by the
   * fact that we query siblings from the wrapper's own parentEl. */
  void parentId;
}

function ActionPill({
  icon,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="apill" onClick={onClick}>
      <span className="apill-icon" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </button>
  );
}

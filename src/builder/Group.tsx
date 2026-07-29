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
  | "moveDown";

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
          <ReorderControls onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
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
            const childMoveUp = canMoveUp
              ? () => onMutate(child.id, "moveUp")
              : undefined;
            const childMoveDown = canMoveDown
              ? () => onMutate(child.id, "moveDown")
              : undefined;
            return child.kind === "condition" ? (
              <ConditionBlock
                key={child.id}
                node={child}
                onSetTitle={(v) => onMutate(child.id, "setTitle", v)}
                onSetProperty={(propertyId, key, val) =>
                  onMutate(child.id, "setPropertyValue", { propertyId, key, val })
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
              />
            ) : (
              <Group
                key={child.id}
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
                onMutate={onMutate}
              />
            );
          })}

          <div className="grp-actions">{actionOrder}</div>
        </div>
      </div>
    </div>
  );
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

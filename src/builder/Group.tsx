import type { GroupNode } from "./types";
import { ConditionBlock } from "./ConditionBlock";
import { OperatorToggle } from "./OperatorToggle";
import { IconGroup, IconReturn, IconTrash } from "../components/Icons";
import "./Group.css";

export type Mutation =
  | "toggle"
  | "setOperator"
  | "toggleNegated"
  | "removeChild"
  | "addCondition"
  | "addGroup"
  | "setTitle"
  | "addProperty"
  | "setPropertyValue"
  | "removeProperty";

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
  /** Master toggle for bracket visibility across the whole builder. */
  showBrackets: boolean;
  /** When true, nested groups switch from the subtle white lift to
   *  15% black. */
  nestedBgDark: boolean;
  /** When true, the AND/OR badge behaves as a hover dropdown with two
   *  options instead of a click-to-toggle button. */
  operatorMenu: boolean;
  onMutate: (id: string, mut: Mutation, payload?: unknown) => void;
}

export function Group({
  group,
  depth,
  variant,
  swapButtons,
  showLoneBracket,
  showBrackets,
  nestedBgDark,
  operatorMenu,
  onMutate,
}: GroupProps) {
  const hasMany = group.children.length > 1;
  const isNegated = !!group.negated;
  /* When the group is negated, the bracket + badge must appear even
   * on a single child — the NOT chip lives on the badge, and hiding
   * the badge would hide the only cue that the group is negated. */
  const showBracket =
    isNegated || (showBrackets && (hasMany || showLoneBracket));
  const showToggle = isNegated || (showBracket && hasMany);

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
          data-op={group.operator}
          aria-hidden
        >
          {showToggle ? (
            <OperatorToggle
              operator={group.operator}
              negated={isNegated}
              onToggle={() => onMutate(group.id, "toggle")}
              onSet={(op) => onMutate(group.id, "setOperator", op)}
              onToggleNegated={() => onMutate(group.id, "toggleNegated")}
              menuMode={operatorMenu}
            />
          ) : null}
        </div>

        <div className="grp-children">
          {group.children.map((child) =>
            child.kind === "condition" ? (
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
                showBrackets={showBrackets}
                onToggleOperator={() => onMutate(child.id, "toggle")}
                onSetOperator={(op) =>
                  onMutate(child.id, "setOperator", op)
                }
                operatorMenu={operatorMenu}
              />
            ) : (
              <Group
                key={child.id}
                group={child}
                depth={depth + 1}
                variant="nested"
                swapButtons={swapButtons}
                showLoneBracket={showLoneBracket}
                showBrackets={showBrackets}
                nestedBgDark={nestedBgDark}
                operatorMenu={operatorMenu}
                onMutate={onMutate}
              />
            )
          )}

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

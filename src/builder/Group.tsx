import type { GroupNode } from "./types";
import { ConditionBlock } from "./ConditionBlock";
import { OperatorToggle } from "./OperatorToggle";
import { IconGroup, IconReturn } from "../components/Icons";
import "./Group.css";

export type Mutation =
  | "toggle"
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
  /** Config from the logo menu — when false, the AND/OR bracket and the
   *  "Condition" action pill are hidden across the whole builder. */
  showConnectors: boolean;
  /** When false, the bracket is hidden for groups that have only one
   *  section (nothing to AND/OR yet). Groups with 2+ sections always
   *  show the bracket. */
  showLoneBracket: boolean;
  onMutate: (id: string, mut: Mutation, payload?: unknown) => void;
}

export function Group({
  group,
  depth,
  variant,
  showConnectors,
  showLoneBracket,
  onMutate,
}: GroupProps) {
  /* Rule: 2+ sections always show the bracket. A group of one shows the
   * bracket only when the Single-section bracket config is on. The
   * AND / OR badge additionally requires 2+ children to have something
   * to operate on. */
  const hasMany = group.children.length > 1;
  const showBracket = showConnectors && (hasMany || showLoneBracket);
  const showToggle = showBracket && hasMany;

  return (
    <div className={`grp grp--${variant}`} data-depth={depth}>
      <div className="grp-body">
        {showBracket ? (
          <div className="grp-bracket" aria-hidden>
            {showToggle ? (
              <OperatorToggle
                operator={group.operator}
                onToggle={() => onMutate(group.id, "toggle")}
              />
            ) : null}
          </div>
        ) : null}

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
              />
            ) : (
              <Group
                key={child.id}
                group={child}
                depth={depth + 1}
                variant="nested"
                showConnectors={showConnectors}
                showLoneBracket={showLoneBracket}
                onMutate={onMutate}
              />
            )
          )}

          <div className="grp-actions">
            {showConnectors ? (
              <ActionPill
                icon={<IconReturn />}
                onClick={() => onMutate(group.id, "addCondition")}
              >
                Condition
              </ActionPill>
            ) : null}
            <ActionPill
              icon={<IconGroup />}
              onClick={() => onMutate(group.id, "addGroup")}
            >
              Group
            </ActionPill>
          </div>
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

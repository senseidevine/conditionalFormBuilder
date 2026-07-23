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
  /** When false, the AND/OR badge is hidden at the root level even when
   *  there are 2+ children. Nested groups still show their badge. */
  showRootOperator: boolean;
  onMutate: (id: string, mut: Mutation, payload?: unknown) => void;
}

export function Group({
  group,
  depth,
  variant,
  showConnectors,
  showRootOperator,
  onMutate,
}: GroupProps) {
  /* The bracket connector renders whenever connectors are enabled — even
   * for a single-child group — so the group is visually contained from
   * the moment it exists. The AND / OR toggle badge, however, only
   * appears once there are two or more children to operate on, and can
   * be suppressed at the root level by the Root operator config. */
  const showBracket = showConnectors;
  const showToggle =
    showConnectors &&
    group.children.length > 1 &&
    (variant !== "root" || showRootOperator);

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
                showRootOperator={showRootOperator}
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

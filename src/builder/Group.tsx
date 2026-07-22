import type { GroupNode } from "./types";
import { ConditionRow } from "./ConditionRow";
import { OperatorBadge } from "./OperatorBadge";
import { ActionPill } from "./Buttons";
import "./Group.css";

interface GroupProps {
  group: GroupNode;
  depth: number;
  /** "root" — root shell (thin border, wide padding).
   *  "nested" — sub-group inside another group.
   *  "properties" — property-list block inside a condition (has a Title header). */
  variant: "root" | "nested" | "properties";
  /** Extra content rendered inside the group at the bottom of its children column
   *  (used for the "+ Property" button in property groups). */
  footer?: import("react").ReactNode;
  onGroupChange: (
    gid: string,
    mut:
      | "toggle"
      | "removeChild"
      | "addCondition"
      | "addGroup"
      | "addProperty"
      | "setField",
    payload?: unknown
  ) => void;
}

export function Group({ group, depth, variant, footer, onGroupChange }: GroupProps) {
  const showOperatorPill = variant !== "properties" && group.children.length > 1;

  return (
    <div
      className={`cfb-group cfb-group--${variant}`}
      data-op={group.operator}
      data-depth={depth}
    >
      {group.title ? <div className="cfb-group-title">{group.title}</div> : null}

      <div className="cfb-group-body">
        {showOperatorPill ? (
          <div className="cfb-group-connector" aria-hidden>
            <div className="cfb-group-bracket" />
            <OperatorBadge
              operator={group.operator}
              onToggle={() => onGroupChange(group.id, "toggle")}
            />
          </div>
        ) : null}

        <div className="cfb-group-children">
          {group.children.map((child) =>
            child.kind === "condition" ? (
              <ConditionRow
                key={child.id}
                node={child}
                depth={depth}
                onChangeField={(v) =>
                  onGroupChange(child.id, "setField", { key: "field", val: v })
                }
                onChangeCond={(v) =>
                  onGroupChange(child.id, "setField", { key: "cond", val: v })
                }
                onChangeValue={(v) =>
                  onGroupChange(child.id, "setField", { key: "value", val: v })
                }
                onRemove={
                  group.children.length > 1 || variant !== "root"
                    ? () => onGroupChange(child.id, "removeChild")
                    : undefined
                }
                onAddProperty={() => onGroupChange(child.id, "addProperty")}
                onGroupChange={onGroupChange}
              />
            ) : (
              <Group
                key={child.id}
                group={child}
                depth={depth + 1}
                variant="nested"
                onGroupChange={onGroupChange}
              />
            )
          )}

          {variant !== "properties" ? (
            <div className="cfb-group-actions">
              <ActionPill
                icon="return"
                onClick={() => onGroupChange(group.id, "addCondition")}
              >
                Condition
              </ActionPill>
              {variant !== "root" || group.children.length > 0 ? (
                <ActionPill
                  icon="group"
                  onClick={() => onGroupChange(group.id, "addGroup")}
                >
                  Group
                </ActionPill>
              ) : null}
            </div>
          ) : null}

          {footer ? <div className="cfb-group-footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

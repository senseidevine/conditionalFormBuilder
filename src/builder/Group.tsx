import type { GroupNode } from "./types";
import { ConditionBlock } from "./ConditionBlock";
import { OperatorToggle } from "./OperatorToggle";
import { IconGroup, IconReturn } from "../components/Icons";
import "./Group.css";

interface GroupProps {
  group: GroupNode;
  depth: number;
  /** "root" — no outer chrome / bracket; renders like a flat form area.
   *  "nested" — wrapped in a bracket connector with an operator toggle. */
  variant: "root" | "nested";
  onMutate: (
    id: string,
    mut:
      | "toggle"
      | "removeChild"
      | "addCondition"
      | "addGroup"
      | "setField",
    payload?: unknown
  ) => void;
}

export function Group({ group, depth, variant, onMutate }: GroupProps) {
  /* Toggle only shows when there's actually something to AND/OR — a group
   * with a single child has no operator meaning. Uniform across root and
   * nested variants. */
  const showBracket = group.children.length > 1;

  return (
    <div className={`grp grp--${variant}`} data-depth={depth}>
      <div className="grp-body">
        {showBracket ? (
          <div className="grp-bracket" aria-hidden>
            <OperatorToggle
              operator={group.operator}
              onToggle={() => onMutate(group.id, "toggle")}
            />
          </div>
        ) : null}

        <div className="grp-children">
          {group.children.map((child) =>
            child.kind === "condition" ? (
              <ConditionBlock
                key={child.id}
                node={child}
                onChange={(k, v) =>
                  onMutate(child.id, "setField", { key: k, val: v })
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
                onMutate={onMutate}
              />
            )
          )}

          <div className="grp-actions">
            <ActionPill
              icon={<IconReturn />}
              onClick={() => onMutate(group.id, "addCondition")}
            >
              Condition
            </ActionPill>
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

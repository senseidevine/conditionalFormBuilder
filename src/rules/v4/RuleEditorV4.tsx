import { useState, type ReactNode } from "react";
import {
  seedRules,
  setGroupOperator,
  addCondition,
  addSubset,
  removeNode,
  setConditionField,
  type GroupNode,
  type ConditionNode,
} from "./types";
import { TagPill } from "../TagPill";
import { IconTrash } from "../../components/Icons";
import "./RuleEditorV4.css";

/** Max nesting depth. Root Group is depth 0; nested Subsets 1, 2. */
const MAX_DEPTH = 3;

export function RuleEditorV4() {
  const [root, setRoot] = useState<GroupNode>(() => seedRules());

  const patch = (fn: (g: GroupNode) => GroupNode) => setRoot((r) => fn(r));

  return (
    <div className="v4-rules">
      {root.children.map((child) =>
        child.kind === "group" ? (
          <GroupView
            key={child.id}
            node={child}
            depth={0}
            canRemove={false}
            onToggleOp={(op) => patch((r) => setGroupOperator(r, child.id, op))}
            onAddCondition={() => patch((r) => addCondition(r, child.id))}
            onAddSubset={() => patch((r) => addSubset(r, child.id))}
            onRemoveNode={(id) => patch((r) => removeNode(r, id))}
            onSetField={(id, p) => patch((r) => setConditionField(r, id, p))}
            onSetGroupOp={(id, op) => patch((r) => setGroupOperator(r, id, op))}
            onAddCondTo={(id) => patch((r) => addCondition(r, id))}
            onAddSubsetTo={(id) => patch((r) => addSubset(r, id))}
          />
        ) : null
      )}
    </div>
  );
}

interface GroupProps {
  node: GroupNode;
  depth: number;
  canRemove: boolean;
  onToggleOp: (op: "and" | "or") => void;
  onAddCondition: () => void;
  onAddSubset: () => void;
  onRemoveNode: (id: string) => void;
  onSetField: (
    id: string,
    patch: Partial<Pick<ConditionNode, "field" | "op" | "value">>
  ) => void;
  onSetGroupOp: (id: string, op: "and" | "or") => void;
  onAddCondTo: (id: string) => void;
  onAddSubsetTo: (id: string) => void;
}

function GroupView(props: GroupProps) {
  const {
    node,
    depth,
    canRemove,
    onToggleOp,
    onAddCondition,
    onAddSubset,
    onRemoveNode,
    onSetField,
    onSetGroupOp,
    onAddCondTo,
    onAddSubsetTo,
  } = props;

  /* Group's operator badge only lights once there are 2+ children —
   * a solo child doesn't have a join to describe, so we save the
   * visual weight for the moment it matters. */
  const isMulti = node.children.length > 1;
  const canSubset = depth < MAX_DEPTH - 1;

  const isTitled = node.title !== undefined;

  return (
    <div
      className={`v4-group ${isMulti ? "is-multi" : ""} ${isTitled ? "is-titled" : ""}`}
      data-depth={depth}
    >
      {isTitled ? <div className="v4-group-title">{node.title}</div> : null}
      <div className="v4-group-bracket">
        {isMulti ? (
          <button
            type="button"
            className="v4-group-badge"
            data-op={node.operator}
            aria-label={`Toggle group operator, currently ${node.operator}`}
            onClick={() =>
              onToggleOp(node.operator === "and" ? "or" : "and")
            }
          >
            {node.operator.toUpperCase()}
          </button>
        ) : null}
      </div>
      <div className="v4-group-body">
        {node.children.map((child): ReactNode => {
          if (child.kind === "condition") {
            return (
              <ConditionRow
                key={child.id}
                node={child}
                onSet={(p) => onSetField(child.id, p)}
                onRemove={() => onRemoveNode(child.id)}
                canRemove={node.children.length > 1 || canRemove}
              />
            );
          }
          return (
            <GroupView
              key={child.id}
              node={child}
              depth={depth + 1}
              canRemove
              onToggleOp={(op) => onSetGroupOp(child.id, op)}
              onAddCondition={() => onAddCondTo(child.id)}
              onAddSubset={() => onAddSubsetTo(child.id)}
              onRemoveNode={onRemoveNode}
              onSetField={onSetField}
              onSetGroupOp={onSetGroupOp}
              onAddCondTo={onAddCondTo}
              onAddSubsetTo={onAddSubsetTo}
            />
          );
        })}
        <div className="v4-group-cta">
          <AutoAdd label="Condition" onClick={onAddCondition} />
          {canSubset ? (
            <AutoAdd label="Subset" onClick={onAddSubset} />
          ) : null}
        </div>
      </div>
      {canRemove ? (
        <button
          type="button"
          className="v4-group-remove"
          aria-label="Remove subset"
          onClick={() => onRemoveNode(node.id)}
        >
          <IconTrash />
        </button>
      ) : null}
    </div>
  );
}

function ConditionRow({
  node,
  onSet,
  onRemove,
  canRemove,
}: {
  node: ConditionNode;
  onSet: (patch: Partial<Pick<ConditionNode, "field" | "op" | "value">>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  /* Reuse the existing TagPill for pill styling / dropdown behavior.
   * Each slot is a synthetic tag whose id is derived from the
   * condition's id so React keeps identity stable across renders. */
  const fieldTag = { id: `${node.id}-field`, type: "condition" as const, value: node.field };
  const opTag = { id: `${node.id}-op`, type: "conditional" as const, value: node.op };
  const valueTag = { id: `${node.id}-value`, type: "value" as const, value: node.value };

  return (
    <div className="v4-condition">
      <TagPill
        tag={fieldTag}
        onChange={(v) => onSet({ field: v })}
      />
      <TagPill
        tag={opTag}
        onChange={(v) => onSet({ op: v })}
      />
      <TagPill
        tag={valueTag}
        onChange={(v) => onSet({ value: v })}
      />
      {canRemove ? (
        <button
          type="button"
          className="v4-condition-remove"
          aria-label="Remove condition"
          onClick={onRemove}
        >
          <IconTrash />
        </button>
      ) : null}
    </div>
  );
}

function AutoAdd({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="v4-cta" onClick={onClick}>
      <span className="v4-cta-plus" aria-hidden>
        +
      </span>
      <span>{label}</span>
    </button>
  );
}


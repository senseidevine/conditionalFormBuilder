import type { ConditionNode } from "./types";
import { Select } from "./Select";
import { RemoveButton, AddPropertyButton } from "./Buttons";
import { IconInfo } from "./Icons";
import { Group } from "./Group";
import "./ConditionRow.css";

interface ConditionRowProps {
  node: ConditionNode;
  onChangeField: (v: string) => void;
  onChangeCond: (v: string) => void;
  onChangeValue: (v: string) => void;
  onRemove?: () => void;
  onAddProperty: () => void;
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
  /* depth: 0 = at group root, 1 = nested one level, etc. Used for background shading. */
  depth: number;
}

export function ConditionRow(props: ConditionRowProps) {
  const { node, depth } = props;
  return (
    <div className="cfb-condition" data-depth={depth}>
      <div className="cfb-condition-header">
        {node.label ? (
          <span className="cfb-condition-label">
            <span>{node.label}</span>
            {node.label === "User attribute" ? (
              <IconInfo className="cfb-condition-info" />
            ) : null}
          </span>
        ) : (
          <span aria-hidden />
        )}
        {props.onRemove ? <RemoveButton onClick={props.onRemove} /> : null}
      </div>

      <div className="cfb-condition-row">
        <Select
          value={node.field}
          placeholder="Field"
          onChange={props.onChangeField}
          options={["Name", "Email", "Plan", "Signup date"]}
        />
        <Select
          value={node.cond}
          placeholder="Condition"
          onChange={props.onChangeCond}
          options={["equals", "not equals", "contains", "greater than", "less than"]}
        />
        <Select
          value={node.value}
          placeholder="Value"
          onChange={props.onChangeValue}
          options={["true", "false", "any"]}
        />
      </div>

      {node.properties ? (
        <div className="cfb-condition-nested">
          <Group
            group={node.properties}
            depth={depth + 1}
            variant="properties"
            onGroupChange={props.onGroupChange}
            footer={<AddPropertyButton onClick={props.onAddProperty} />}
          />
        </div>
      ) : null}
    </div>
  );
}

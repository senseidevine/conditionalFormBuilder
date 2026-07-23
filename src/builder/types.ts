export type Operator = "AND" | "OR";

export interface PropertyRow {
  id: string;
  field: string;
  cond: string;
  value: string;
}

export interface ConditionNode {
  id: string;
  kind: "condition";
  /** Label above the property list — the "Title" text in the spec sheet. */
  title: string;
  /** One or more attribute rules attached to this condition. */
  properties: PropertyRow[];
}

export interface GroupNode {
  id: string;
  kind: "group";
  operator: Operator;
  /** Optional title label displayed at the top of a nested group card. */
  title?: string;
  children: Node[];
}

export type Node = ConditionNode | GroupNode;

let __id = 0;
const uid = () => `n${++__id}`;

export function makeProperty(): PropertyRow {
  return { id: uid(), field: "", cond: "", value: "" };
}

export function makeCondition(title = "Title"): ConditionNode {
  return {
    id: uid(),
    kind: "condition",
    title,
    properties: [makeProperty()],
  };
}

export function makeGroup(operator: Operator = "AND"): GroupNode {
  return {
    id: uid(),
    kind: "group",
    operator,
    children: [makeCondition()],
  };
}

/** Root group for the Configuration step. */
export function seedRoot(): GroupNode {
  return {
    id: "root",
    kind: "group",
    operator: "AND",
    children: [makeCondition()],
  };
}

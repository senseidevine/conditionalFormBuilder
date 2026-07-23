export type Operator = "AND" | "OR";

export interface ConditionNode {
  id: string;
  kind: "condition";
  /** Label above the attribute rule — the "Title" text in the spec sheet. */
  title: string;
  field: string;
  cond: string;
  value: string;
}

export interface GroupNode {
  id: string;
  kind: "group";
  operator: Operator;
  children: Node[];
}

export type Node = ConditionNode | GroupNode;

let __id = 0;
const uid = () => `n${++__id}`;

export function makeCondition(title = "Title"): ConditionNode {
  return {
    id: uid(),
    kind: "condition",
    title,
    field: "",
    cond: "",
    value: "",
  };
}

export function makeGroup(operator: Operator = "AND"): GroupNode {
  return {
    id: uid(),
    kind: "group",
    operator,
    /* Seed with two conditions so the operator toggle is meaningful from
     * the moment the group is created — a group with one child has
     * nothing to AND/OR. */
    children: [makeCondition(), makeCondition()],
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

export type Operator = "AND" | "OR";

export interface ConditionNode {
  id: string;
  kind: "condition";
  /** Label above the row, e.g. "User attribute" or "Title" */
  label: string;
  field: string;
  cond: string;
  value: string;
  /** Optional nested property group (matches the "Title / +Property" block in the reference) */
  properties?: GroupNode;
}

export interface GroupNode {
  id: string;
  kind: "group";
  title?: string;
  operator: Operator;
  children: Node[];
}

export type Node = ConditionNode | GroupNode;

/* ------------------------------------------------------------------ */
/* Factories                                                          */
/* ------------------------------------------------------------------ */

let __id = 0;
const uid = () => `n${++__id}`;

export function makeCondition(label = "User attribute"): ConditionNode {
  return {
    id: uid(),
    kind: "condition",
    label,
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
    children: [makeCondition()],
  };
}

export function makePropertyGroup(): GroupNode {
  return {
    id: uid(),
    kind: "group",
    title: "Title",
    operator: "AND",
    children: [makeCondition(""), makeCondition("")],
  };
}

export type Combinator = "All" | "Any" | "Not";

export interface CriteriaRow {
  label: string;
  value: string;
}

export interface CriteriaCondition {
  kind: "condition";
  title: string;
  rows: CriteriaRow[];
}

export interface CriteriaGroup {
  kind: "group";
  op: Combinator;
  children: CriteriaNode[];
}

export type CriteriaNode = CriteriaGroup | CriteriaCondition;

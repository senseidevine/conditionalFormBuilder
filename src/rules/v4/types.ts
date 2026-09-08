/* Build v4 — Group-tree data model.
 *
 * A rule is a recursive tree of Groups; every Group carries its own
 * AND/OR operator and holds a list of children (Conditions or nested
 * Groups). Connectors between siblings are NOT a separate concept —
 * the enclosing Group's operator IS the connector. */

export type GroupOp = "and" | "or";

export interface ConditionNode {
  id: string;
  kind: "condition";
  field: string;
  op: string;
  value: string;
}

export interface GroupNode {
  id: string;
  kind: "group";
  operator: GroupOp;
  /** Optional heading shown above the group's bracket. Used for the
   *  fixed `if` / `then` frame blocks; nested subsets go untitled. */
  title?: string;
  children: TreeNode[];
}

export type TreeNode = ConditionNode | GroupNode;

let __uid = 0;
export const uid = () => `v4_${++__uid}`;

export function makeCondition(): ConditionNode {
  return { id: uid(), kind: "condition", field: "", op: "", value: "" };
}

export function makeGroup(operator: GroupOp = "and", title?: string): GroupNode {
  const g: GroupNode = { id: uid(), kind: "group", operator, children: [makeCondition()] };
  if (title !== undefined) g.title = title;
  return g;
}

/* --- Immutable tree helpers ----------------------------------------
 * Every mutation returns a new root; internal nodes are re-created
 * only along the path to the change so React's identity-based memoisation
 * can skip untouched branches. */

function map(node: GroupNode, targetId: string, fn: (g: GroupNode) => GroupNode): GroupNode {
  if (node.id === targetId) return fn(node);
  let changed = false;
  const nextChildren = node.children.map((c) => {
    if (c.kind !== "group") return c;
    const nc = map(c, targetId, fn);
    if (nc !== c) changed = true;
    return nc;
  });
  return changed ? { ...node, children: nextChildren } : node;
}

export function setGroupOperator(root: GroupNode, groupId: string, op: GroupOp): GroupNode {
  return map(root, groupId, (g) => (g.operator === op ? g : { ...g, operator: op }));
}

export function addCondition(root: GroupNode, groupId: string): GroupNode {
  return map(root, groupId, (g) => ({ ...g, children: [...g.children, makeCondition()] }));
}

export function addSubset(root: GroupNode, groupId: string): GroupNode {
  return map(root, groupId, (g) => ({ ...g, children: [...g.children, makeGroup("and")] }));
}

export function removeNode(root: GroupNode, nodeId: string): GroupNode {
  const walk = (g: GroupNode): GroupNode => {
    const filtered: TreeNode[] = [];
    let changed = false;
    for (const c of g.children) {
      if (c.id === nodeId) {
        changed = true;
        continue;
      }
      if (c.kind === "group") {
        const nc = walk(c);
        if (nc !== c) changed = true;
        filtered.push(nc);
      } else {
        filtered.push(c);
      }
    }
    return changed ? { ...g, children: filtered } : g;
  };
  return walk(root);
}

export function setConditionField(
  root: GroupNode,
  condId: string,
  patch: Partial<Pick<ConditionNode, "field" | "op" | "value">>
): GroupNode {
  const walk = (g: GroupNode): GroupNode => {
    let changed = false;
    const next = g.children.map((c): TreeNode => {
      if (c.kind === "condition") {
        if (c.id !== condId) return c;
        changed = true;
        return { ...c, ...patch };
      }
      const nc = walk(c);
      if (nc !== c) changed = true;
      return nc;
    });
    return changed ? { ...g, children: next } : g;
  };
  return walk(root);
}

/** Root frame — two pinned top-level Groups labelled `if` and `then`,
 *  each starting with one empty Condition. +Subset on either creates
 *  a nested Group inside that frame. */
export function seedRules(): GroupNode {
  return {
    id: uid(),
    kind: "group",
    operator: "and",
    children: [
      makeGroup("and", "if"),
      makeGroup("and", "then"),
    ],
  };
}

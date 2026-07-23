import type { ConditionNode, GroupNode, Node, Operator } from "./types";
import { makeCondition, makeGroup } from "./types";

type Updater = (n: Node) => Node;

function update(root: Node, id: string, up: Updater): Node {
  if (root.id === id) return up(root);
  if (root.kind === "group") {
    return { ...root, children: root.children.map((c) => update(c, id, up)) };
  }
  return root;
}

function removeById(root: Node, id: string): Node {
  if (root.kind === "group") {
    return {
      ...root,
      children: root.children.filter((c) => c.id !== id).map((c) => removeById(c, id)),
    };
  }
  return root;
}

export const T = {
  addCondition(root: GroupNode, parentId: string): GroupNode {
    return update(root, parentId, (n) =>
      n.kind === "group"
        ? { ...n, children: [...n.children, makeCondition()] }
        : n
    ) as GroupNode;
  },
  addGroup(root: GroupNode, parentId: string, operator: Operator = "AND"): GroupNode {
    return update(root, parentId, (n) =>
      n.kind === "group"
        ? { ...n, children: [...n.children, makeGroup(operator)] }
        : n
    ) as GroupNode;
  },
  toggleOperator(root: GroupNode, id: string): GroupNode {
    return update(root, id, (n) =>
      n.kind === "group"
        ? { ...n, operator: n.operator === "AND" ? "OR" : "AND" }
        : n
    ) as GroupNode;
  },
  setField(
    root: GroupNode,
    id: string,
    key: keyof Pick<ConditionNode, "field" | "cond" | "value" | "title">,
    val: string
  ): GroupNode {
    return update(root, id, (n) =>
      n.kind === "condition" ? { ...n, [key]: val } : n
    ) as GroupNode;
  },
  remove(root: GroupNode, id: string): GroupNode {
    return removeById(root, id) as GroupNode;
  },
};

import type { GroupNode, Node, Operator, PropertyRow } from "./types";
import { makeCondition, makeGroup, makeProperty } from "./types";

type Updater = (n: Node) => Node;

function update(root: Node, id: string, up: Updater): Node {
  if (root.id === id) return up(root);
  if (root.kind === "group") {
    return { ...root, children: root.children.map((c) => update(c, id, up)) };
  }
  return root;
}

function removeById(root: Node, id: string): Node {
  if (root.kind !== "group") return root;
  const kept = root.children
    .filter((c) => c.id !== id)
    .map((c) => removeById(c, id));
  return { ...root, children: kept };
}

/** Walk the tree and drop any non-root group whose children array is empty. */
function pruneEmptyGroups(node: Node, isRoot: boolean): Node | null {
  if (node.kind !== "group") return node;
  const kept: Node[] = [];
  for (const c of node.children) {
    const pruned = pruneEmptyGroups(c, false);
    if (pruned) kept.push(pruned);
  }
  if (!isRoot && kept.length === 0) return null;
  return { ...node, children: kept };
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
  setTitle(root: GroupNode, id: string, title: string): GroupNode {
    /* Both conditions and groups can carry a title now. */
    return update(root, id, (n) => ({ ...n, title })) as GroupNode;
  },
  addProperty(root: GroupNode, conditionId: string): GroupNode {
    return update(root, conditionId, (n) =>
      n.kind === "condition"
        ? { ...n, properties: [...n.properties, makeProperty()] }
        : n
    ) as GroupNode;
  },
  setPropertyValue(
    root: GroupNode,
    conditionId: string,
    propertyId: string,
    key: keyof Pick<PropertyRow, "field" | "cond" | "value">,
    val: string
  ): GroupNode {
    return update(root, conditionId, (n) =>
      n.kind === "condition"
        ? {
            ...n,
            properties: n.properties.map((p) =>
              p.id === propertyId ? { ...p, [key]: val } : p
            ),
          }
        : n
    ) as GroupNode;
  },
  removeProperty(root: GroupNode, conditionId: string, propertyId: string): GroupNode {
    return update(root, conditionId, (n) => {
      if (n.kind !== "condition") return n;
      /* Never let a condition drop to zero properties — a condition
       * with no rules would have nothing to configure. */
      if (n.properties.length <= 1) return n;
      return {
        ...n,
        properties: n.properties.filter((p) => p.id !== propertyId),
      };
    }) as GroupNode;
  },
  remove(root: GroupNode, id: string): GroupNode {
    const removed = removeById(root, id) as GroupNode;
    const pruned = pruneEmptyGroups(removed, true) as GroupNode;
    return pruned;
  },
  /** Swap the target child with its previous (delta=-1) or next (+1)
   *  sibling inside whichever group directly contains it. Cross-group
   *  moves are not supported — the child stays in its parent. */
  moveSibling(root: GroupNode, id: string, delta: -1 | 1): GroupNode {
    function walk(node: Node): Node {
      if (node.kind !== "group") return node;
      let children = node.children.map(walk);
      const idx = children.findIndex((c) => c.id === id);
      if (idx !== -1) {
        const target = idx + delta;
        if (target >= 0 && target < children.length) {
          children = [...children];
          [children[idx], children[target]] = [children[target], children[idx]];
        }
      }
      return { ...node, children };
    }
    return walk(root) as GroupNode;
  },
  /** Move the target child to a specific index inside its parent group.
   *  Used by pointer-drag reorder; targetIndex is clamped to the valid
   *  range and cross-group moves are not supported. */
  moveSiblingTo(root: GroupNode, id: string, targetIndex: number): GroupNode {
    function walk(node: Node): Node {
      if (node.kind !== "group") return node;
      let children = node.children.map(walk);
      const idx = children.findIndex((c) => c.id === id);
      if (idx !== -1) {
        children = [...children];
        const [item] = children.splice(idx, 1);
        const clamped = Math.max(0, Math.min(children.length, targetIndex));
        children.splice(clamped, 0, item);
      }
      return { ...node, children };
    }
    return walk(root) as GroupNode;
  },
};

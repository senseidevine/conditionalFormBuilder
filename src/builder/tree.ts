import type { Node, GroupNode, ConditionNode, Operator } from "./types";
import { makeCondition, makeGroup, makePropertyGroup } from "./types";

/* Immutable tree helpers. Every mutation returns a new root. */

type Updater<T extends Node> = (n: T) => T;

function updateNode(root: Node, id: string, update: Updater<Node>): Node {
  if (root.id === id) return update(root);
  if (root.kind === "group") {
    return {
      ...root,
      children: root.children.map((c) => updateNode(c, id, update)),
    };
  }
  if (root.properties) {
    return {
      ...root,
      properties: updateNode(root.properties, id, update) as GroupNode,
    };
  }
  return root;
}

function removeById(root: Node, id: string): Node {
  if (root.kind === "group") {
    return {
      ...root,
      children: root.children
        .filter((c) => c.id !== id)
        .map((c) => removeById(c, id)),
    };
  }
  if (root.properties) {
    return {
      ...root,
      properties: removeById(root.properties, id) as GroupNode,
    };
  }
  return root;
}

export const T = {
  addCondition(root: Node, parentId: string, label?: string): Node {
    return updateNode(root, parentId, (n) => {
      if (n.kind !== "group") return n;
      return { ...n, children: [...n.children, makeCondition(label)] };
    });
  },
  addGroup(root: Node, parentId: string, operator: Operator = "OR"): Node {
    return updateNode(root, parentId, (n) => {
      if (n.kind !== "group") return n;
      return { ...n, children: [...n.children, makeGroup(operator)] };
    });
  },
  addProperty(root: Node, conditionId: string): Node {
    return updateNode(root, conditionId, (n) => {
      if (n.kind !== "condition") return n;
      const props = n.properties ?? makePropertyGroup();
      return {
        ...n,
        properties: { ...props, children: [...props.children, makeCondition("")] },
      };
    });
  },
  toggleOperator(root: Node, id: string): Node {
    return updateNode(root, id, (n) => {
      if (n.kind !== "group") return n;
      return { ...n, operator: n.operator === "AND" ? "OR" : "AND" };
    });
  },
  setField(root: Node, id: string, key: keyof Pick<ConditionNode, "field" | "cond" | "value">, val: string): Node {
    return updateNode(root, id, (n) => {
      if (n.kind !== "condition") return n;
      return { ...n, [key]: val };
    });
  },
  remove(root: Node, id: string): Node {
    return removeById(root, id);
  },
};

/* Seed tree that mirrors the reference mockup:
 * Root (AND)
 *   ├── User attribute
 *   ├── User attribute (with property sub-group: Title + 2 rows + +Property)
 *   └── Group (OR)
 *         ├── Title
 *         └── Title
 */
export function seedTree(): GroupNode {
  const attrA = makeCondition("User attribute");
  const attrB = makeCondition("User attribute");
  attrB.properties = makePropertyGroup();

  const orGroup = makeGroup("OR");
  orGroup.children = [makeCondition("Title"), makeCondition("Title")];

  return {
    id: "root",
    kind: "group",
    operator: "AND",
    children: [attrA, attrB, orGroup],
  };
}

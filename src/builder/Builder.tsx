import { useState } from "react";
import { Group } from "./Group";
import { seedTree, T } from "./tree";
import type { GroupNode } from "./types";
import "./Builder.css";

export function ConditionalFormBuilder() {
  const [root, setRoot] = useState<GroupNode>(() => seedTree());

  const onGroupChange = (
    id: string,
    mut:
      | "toggle"
      | "removeChild"
      | "addCondition"
      | "addGroup"
      | "addProperty"
      | "setField",
    payload?: unknown
  ) => {
    setRoot((r) => {
      switch (mut) {
        case "toggle":
          return T.toggleOperator(r, id) as GroupNode;
        case "removeChild":
          return T.remove(r, id) as GroupNode;
        case "addCondition":
          return T.addCondition(r, id) as GroupNode;
        case "addGroup":
          return T.addGroup(r, id, "OR") as GroupNode;
        case "addProperty":
          return T.addProperty(r, id) as GroupNode;
        case "setField": {
          const p = payload as { key: "field" | "cond" | "value"; val: string };
          return T.setField(r, id, p.key, p.val) as GroupNode;
        }
      }
    });
  };

  return (
    <div className="cfb-shell">
      <div className="cfb-shell-inner">
        <Group group={root} depth={0} variant="root" onGroupChange={onGroupChange} />
      </div>
    </div>
  );
}

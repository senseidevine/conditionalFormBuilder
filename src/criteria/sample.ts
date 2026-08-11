import type { GroupNode, Node, Operator, PropertyRow } from "../builder/types";

/* Local id counter so the sample tree doesn't collide with the ids used
 * by the primary builder (which counts from its own module state). */
let __id = 0;
const uid = () => `s${++__id}`;

function prop(key: string, value: string): PropertyRow {
  return { id: uid(), key, value };
}

function cond(title: string, ...rows: [string, string][]): Node {
  return {
    id: uid(),
    kind: "condition",
    title,
    operator: "AND",
    properties: rows.length
      ? rows.map(([k, v]) => prop(k, v))
      : [prop("", "")],
  };
}

function grp(op: Operator, ...children: Node[]): GroupNode {
  return { id: uid(), kind: "group", operator: op, children };
}

/** The criteria tree from the reference screenshot, encoded so the
 *  regular Group builder can render and edit it directly. */
export function seedSample(): GroupNode {
  return grp(
    "AND",
    grp(
      "NOT",
      cond(
        "Collection attribute",
        ["Name", "wallet.limit.exempt"],
        ["Value", "ANNUAL_INBOUND"]
      )
    ),
    cond("Transaction type", ["Direction", "IN"]),
    grp(
      "AND",
      grp("NOT", cond("Transaction type", ["Type", "TRADE"], ["Direction", "IN"])),
      grp(
        "NOT",
        grp(
          "AND",
          cond("Attribute", ["Type", "UUID"], ["Name", "loyalty.transaction.id"]),
          cond("Transaction type", ["Type", "REWARD"])
        )
      ),
      grp(
        "NOT",
        grp(
          "AND",
          cond("Transaction type", ["Type", "TRANSFER"], ["Direction", "IN"]),
          grp(
            "OR",
            cond("Attribute", ["Type", "UUID"], ["Name", "trading.portfolio.id"]),
            cond("Attribute", ["Type", "UUID"], ["Name", "vault.id"])
          )
        )
      ),
      grp(
        "NOT",
        grp(
          "AND",
          cond(
            "Attribute",
            ["Type", "String"],
            ["Name", "topup.type"],
            ["Match", "Exactly"],
            ["Value", "INVESTMENT_WALLET"]
          )
        )
      )
    )
  );
}

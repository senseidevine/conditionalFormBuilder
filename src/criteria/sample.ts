import type { CriteriaNode } from "./types";

const g = (op: "All" | "Any" | "Not", ...children: CriteriaNode[]): CriteriaNode => ({
  kind: "group",
  op,
  children,
});
const c = (title: string, ...rows: [string, string][]): CriteriaNode => ({
  kind: "condition",
  title,
  rows: rows.map(([label, value]) => ({ label, value })),
});

export const SAMPLE_TREE: CriteriaNode = g(
  "All",
  g(
    "Not",
    c("Collection attribute", ["Name", "wallet.limit.exempt"], ["Value", "ANNUAL_INBOUND"])
  ),
  c("Transaction type", ["Direction", "IN"]),
  g(
    "All",
    g("Not", c("Transaction type", ["Type", "TRADE"], ["Direction", "IN"])),
    g(
      "Not",
      g(
        "All",
        c("Attribute", ["Type", "UUID"], ["Name", "loyalty.transaction.id"]),
        c("Transaction type", ["Type", "REWARD"])
      )
    ),
    g(
      "Not",
      g(
        "All",
        c("Transaction type", ["Type", "TRANSFER"], ["Direction", "IN"]),
        g(
          "Any",
          c("Attribute", ["Type", "UUID"], ["Name", "trading.portfolio.id"]),
          c("Attribute", ["Type", "UUID"], ["Name", "vault.id"])
        )
      )
    ),
    g(
      "Not",
      g(
        "All",
        c(
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

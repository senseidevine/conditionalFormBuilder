export type TagType = "operator" | "condition" | "conditional" | "value";

export interface Tag {
  id: string;
  type: TagType;
  value: string;
  /** Indent level for Connector tags — 0 for a sibling connector, 1+
   *  for a subset nested that many levels under the previous line.
   *  Only meaningful on `operator` tags (the first tag of each row);
   *  the whole row inherits its leading Connector's depth. */
  depth?: number;
}

export interface RuleBlock {
  id: string;
  tags: Tag[];
}

export const OPERATOR_OPTIONS = ["and", "or", "not", "nor", "if", "then"];
export const CONDITION_OPTIONS = [
  "String",
  "Trade Sweep",
  "Trade liquidation fund operation",
  "PNL",
  "SOURCE",
  "COLLATERAL",
  "Exactly",
];
export const CONDITIONAL_OPTIONS = ["Is", "Is not", "In", "Not in"];
/** Suggestions shown for Value tags — the input itself is freeform so
 *  the user can type any custom value, but these seed the dropdown. */
export const VALUE_SUGGESTIONS = [
  "Transaction type",
  "Attribute Name",
  "Direction",
  "Amount",
  "Country",
  "User",
];

let __id = 0;
export const uid = () => `t${++__id}`;

export function makeTag(type: TagType, value = "", depth?: number): Tag {
  return depth !== undefined
    ? { id: uid(), type, value, depth }
    : { id: uid(), type, value };
}

/** Value tags may hold multiple picks; the tag stores them as a
 *  comma-separated string so the underlying Tag stays a flat
 *  { key, value } pair. These helpers parse/serialise around that. */
export function parseValueList(value: string): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}
export function serializeValueList(values: string[]): string {
  return values.join(", ");
}

export function makeBlock(startOperator = "if"): RuleBlock {
  /* Every block opens with a leading operator so the CTA can
   * immediately prompt the user for the first condition. The first
   * block on the page starts with `if`; subsequent blocks default to
   * `and` since they chain onto the previous rule. */
  return { id: uid(), tags: [makeTag("operator", startOperator)] };
}

/** The block's sequence is fixed: after the initial `if`, tags cycle
 *  Condition -> Conditional -> Value -> Operator -> ... so the editor
 *  can hand-hold a rule like `if Transaction type is UUID and Amount
 *  is 100`. Given the current tag count, this returns the type the
 *  next CTA should add. */
export function nextTagType(count: number): TagType {
  if (count === 0) return "operator";
  const offset = (count - 1) % 4;
  if (offset === 0) return "condition";
  if (offset === 1) return "conditional";
  if (offset === 2) return "value";
  return "operator";
}

/** Human-readable label for the single CTA — matches the tag type
 *  the CTA is about to add. Note: the display copy diverges from the
 *  internal type names — `operator` shows as "Connector",
 *  `conditional` shows as "Operator", `condition` shows as "Field". */
export function nextCtaLabel(tags: Tag[]): string {
  const next = nextTagType(tags.length);
  if (next === "operator") return "Connector";
  if (next === "conditional") return "Operator";
  if (next === "condition") return "Field";
  return "Value";
}

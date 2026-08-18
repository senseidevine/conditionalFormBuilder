export type TagType = "operator" | "condition" | "conditional" | "value";

export interface Tag {
  id: string;
  type: TagType;
  value: string;
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

export function makeTag(type: TagType, value = ""): Tag {
  return { id: uid(), type, value };
}

export function makeBlock(): RuleBlock {
  /* Every block opens with an `if` operator so the CTA can immediately
   * prompt the user for the first condition value. */
  return { id: uid(), tags: [makeTag("operator", "if")] };
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
 *  the CTA is about to add. */
export function nextCtaLabel(tags: Tag[]): string {
  const next = nextTagType(tags.length);
  if (next === "operator") return "Operator";
  if (next === "conditional") return "Conditional";
  if (next === "condition") return "Condition";
  return "Value";
}

export type TagType = "operator" | "conditional" | "value";

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
 *  Value -> Conditional -> Value -> Operator -> ... so the editor can
 *  hand-hold a rule like `if Transaction type is UUID and Amount is
 *  100`. Given the current tag count, this returns the type the next
 *  CTA should add. */
export function nextTagType(count: number): TagType {
  if (count === 0) return "operator";
  const offset = (count - 1) % 4;
  if (offset === 0 || offset === 2) return "value";
  if (offset === 1) return "conditional";
  return "operator";
}

/** Human-readable label for the single CTA. The type says what will be
 *  added; the label matches the wording the spec uses — "Condition"
 *  for the value slot that follows an operator, "Value" for the value
 *  slot that follows a conditional. */
export function nextCtaLabel(tags: Tag[]): string {
  const next = nextTagType(tags.length);
  if (next === "operator") return "Operator";
  if (next === "conditional") return "Conditional";
  const prev = tags[tags.length - 1];
  return prev && prev.type === "conditional" ? "Value" : "Condition";
}

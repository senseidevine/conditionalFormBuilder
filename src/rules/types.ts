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
  return { id: uid(), tags: [] };
}

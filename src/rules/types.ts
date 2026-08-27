export type TagType =
  | "operator"
  | "scope"
  | "condition"
  | "conditional"
  | "value";

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
  /** Optional heading rendered above the block's rows — used for the
   *  fixed `if` and `then` blocks. Untitled blocks (added via
   *  +Block) skip the heading and show their leading Connector as an
   *  inline `and` pill instead. */
  title?: string;
  tags: Tag[];
}

export const OPERATOR_OPTIONS = ["and", "or", "not", "nor"];
export const SCOPE_OPTIONS = ["Side", "Opposite"];
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

export function makeBlock(
  opts: { title?: string; seedValue?: string } = {}
): RuleBlock {
  /* Every block seeds with a leading operator so the row-of-4
   * chunking stays intact. Titled blocks (if / then) hide their
   * seed inline and lift the label into a heading; untitled blocks
   * (added via +Block) show it as a normal Connector pill with the
   * `seedValue` (usually "and") already picked. */
  const { title, seedValue = "" } = opts;
  const block: RuleBlock = {
    id: uid(),
    tags: [makeTag("operator", seedValue, 0)],
  };
  if (title !== undefined) block.title = title;
  return block;
}

/** The block's sequence is now Connector -> Scope -> Field ->
 *  Operator -> Value -> Connector -> ... — Scope lets each
 *  condition target the current side, the opposite side, or a
 *  future scope (`Side · TradeType is X`). Given the current tag
 *  count, this returns the type the next CTA should add. */
export function nextTagType(count: number): TagType {
  if (count === 0) return "operator";
  const offset = (count - 1) % 5;
  if (offset === 0) return "scope";
  if (offset === 1) return "condition";
  if (offset === 2) return "conditional";
  if (offset === 3) return "value";
  return "operator";
}

/** Human-readable label for the single CTA — matches the tag type
 *  the CTA is about to add. Note: the display copy diverges from the
 *  internal type names — `operator` shows as "Connector",
 *  `conditional` shows as "Operator", `condition` shows as "Field". */
export function nextCtaLabel(tags: Tag[]): string {
  const next = nextTagType(tags.length);
  if (next === "operator") return "Connector";
  if (next === "scope") return "Scope";
  if (next === "conditional") return "Operator";
  if (next === "condition") return "Field";
  return "Value";
}

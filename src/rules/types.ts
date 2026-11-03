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
  /** Optional heading rendered above the block's rows — used for the
   *  fixed `if` and `then` blocks. Untitled blocks (added via
   *  +Block) skip the heading and show their leading Connector as an
   *  inline `and` pill instead. */
  title?: string;
  tags: Tag[];
}

export const OPERATOR_OPTIONS = ["and", "or"];
export const CONDITION_OPTIONS = [
  "String",
  "Number",
  "Really long field value",
  "input",
];

/** The data type a Field holds. Drives which Operators the Conditional
 *  picker offers for that Field. `any` opts out of filtering — used
 *  for runtime values like `input` where the compatible operators
 *  can't be known until eval time. */
export type FieldType = "string" | "number" | "any";

export const FIELD_TYPES: Record<string, FieldType> = {
  String: "string",
  Number: "number",
  "Really long field value": "string",
  input: "any",
};

export const CONDITIONAL_OPTIONS = [
  "is",
  "is not",
  "in",
  "not in",
  ">",
  ">=",
  "<",
  "<=",
  "between",
  "with",
  "contains",
];

/** Which Conditional operators make sense for each FieldType. The
 *  picker filters its options through this map so a String Field
 *  can't be compared with `>` and a Number Field can't be used with
 *  `contains`. */
export const OPERATORS_BY_TYPE: Record<FieldType, string[]> = {
  string: ["is", "is not", "in", "not in", "with", "contains"],
  number: ["is", "is not", "in", "not in", ">", ">=", "<", "<=", "between"],
  any: CONDITIONAL_OPTIONS,
};

/** Resolve a Field value (name string) to the list of Conditional
 *  operators valid for its type. Unknown or missing names fall back
 *  to the full list so a half-built row doesn't lock the user out. */
export function operatorsForField(fieldName: string | undefined): string[] {
  if (!fieldName) return CONDITIONAL_OPTIONS;
  const type = FIELD_TYPES[fieldName];
  if (!type) return CONDITIONAL_OPTIONS;
  return OPERATORS_BY_TYPE[type];
}
/** Suggestions shown for Value tags — the input itself is freeform so
 *  the user can type any custom value, but these seed the dropdown. */
export const VALUE_SUGGESTIONS = ["one", "two", "three", "four", "five"];

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

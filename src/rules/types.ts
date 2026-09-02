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
  "Trade Sweep",
  "Trade liquidation fund operation",
  "PNL",
  "SOURCE",
  "COLLATERAL",
  "Exactly",
];
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

/* -----------------------------------------------------------------
 * Preview — flatten a block's tag list into a parenthesized string
 * so the reader has an unambiguous linear reading of the rule.
 * ----------------------------------------------------------------- */

interface RowParts {
  depth: number;
  connector: string;
  field: string;
  op: string;
  value: string;
}

function rowsFromTags(tags: Tag[]): RowParts[] {
  const rows: RowParts[] = [];
  for (let i = 0; i < tags.length; i += 4) {
    const chunk = tags.slice(i, i + 4);
    const [conn, field, op, val] = chunk;
    rows.push({
      depth: conn?.depth ?? 0,
      connector: conn?.value ?? "",
      field: field?.value ?? "",
      op: op?.value ?? "",
      value: val?.value ?? "",
    });
  }
  return rows;
}

function fmtRow(r: RowParts): string {
  const field = r.field || "?";
  const op = r.op || "?";
  const value = r.value || "?";
  return `${field} ${op} ${value}`;
}

/* Recursive walker — pulls a chain of rows whose depth is exactly
 * `atDepth`, folds nested subsets (rows at depth > atDepth) in as
 * parenthesized terms, and returns the resulting expression plus
 * the next unread row index. */
function foldRows(
  rows: RowParts[],
  startI: number,
  atDepth: number
): [string, number] {
  const parts: string[] = [];
  let i = startI;
  let first = true;
  while (i < rows.length && rows[i].depth >= atDepth) {
    const rd = rows[i].depth;
    if (rd === atDepth) {
      if (!first) parts.push(rows[i].connector || "and");
      parts.push(fmtRow(rows[i]));
      first = false;
      i += 1;
    } else {
      /* Nested subset — join it to the parent chain with the
       * subset's first row's connector. */
      if (!first) parts.push(rows[i].connector || "and");
      const [subExpr, next] = foldRows(rows, i, rd);
      parts.push(subExpr);
      first = false;
      i = next;
    }
  }
  const expr = parts.join(" ");
  /* Wrap in parens only when there are multiple terms at this depth
   * — a lone term reads cleaner without them. */
  return [parts.length > 1 ? `(${expr})` : expr, i];
}

/** Renders a block's tag list as a single parenthesized expression.
 *  Titled blocks prefix the heading, so a completed `if` block might
 *  read `if (String is not One and String is Two and (String is
 *  Three or String is Four))`. Missing values render as `?`. */
export function blockToPreview(block: RuleBlock): string {
  const rows = rowsFromTags(block.tags);
  /* Titled blocks lift their seed operator into the heading, so its
   * value is empty; skip it when computing the expression. */
  const bodyRows = block.title !== undefined ? rows.slice(1) : rows;
  if (bodyRows.length === 0) {
    return block.title ?? "";
  }
  /* Bump the depth floor to whatever the first row is at so we don't
   * add a spurious outer wrap. */
  const [expr] = foldRows(bodyRows, 0, bodyRows[0]?.depth ?? 0);
  return block.title ? `${block.title} ${expr}` : expr;
}

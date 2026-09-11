import { useEffect, useRef, useState } from "react";
import type { RuleBlock, Tag, TagType } from "./types";
import {
  CONDITION_OPTIONS,
  CONDITIONAL_OPTIONS,
  OPERATOR_OPTIONS,
  VALUE_SUGGESTIONS,
  makeBlock,
  makeTag,
  nextCtaLabel,
  nextTagType,
  serializeValueList,
} from "./types";
import { TagPill } from "./TagPill";
import { IconTrash } from "../components/Icons";
import "./RuleEditor.css";

export function RuleEditor({
  alwaysShowCtas,
  showAddBlock,
}: {
  alwaysShowCtas: boolean;
  showAddBlock: boolean;
}) {
  /* The editor is always framed by two fixed blocks — `if` at the top
   * and `then` at the bottom. +Block inserts a new untitled block
   * between them; the untitled ones open with an inline `and`
   * Connector pill instead of a heading. */
  const [blocks, setBlocks] = useState<RuleBlock[]>(() => [
    makeBlock({ title: "if" }),
    makeBlock({ title: "then" }),
  ]);

  const addNextTag = (
    blockId: string,
    value: string,
    atDepth?: number
  ) => {
    setBlocks((bs) => {
      const target = bs.find((b) => b.id === blockId);
      if (!target) return bs;

      /* An explicit depth means the user clicked a +Connector /
       * +Subset CTA. That may fire while the current row is only
       * half-built, so pad the partial row up to a Connector
       * boundary with empty typed tags before appending the new
       * Connector — keeps the row-of-4 chunking invariant intact. */
      if (atDepth !== undefined) {
        const padTypesByPosition: TagType[] = [
          "condition",
          "conditional",
          "value",
        ];
        const padded = [...target.tags];
        let remainder = padded.length % 4;
        while (remainder !== 0) {
          padded.push(makeTag(padTypesByPosition[remainder - 1], ""));
          remainder = padded.length % 4;
        }
        padded.push(makeTag("operator", value, atDepth));
        /* Sync the whole subset's Connectors at atDepth to `value`
         * so an operator picked (or auto-inherited) for a new
         * sibling propagates to every existing sibling at the same
         * depth — one subset, one operator. */
        const newTagIdx = padded.length - 1;
        const newRowIdx = Math.floor(newTagIdx / 4);
        const totalRows = Math.ceil(padded.length / 4);
        const targetIds = new Set<string>();
        for (let i = newRowIdx; i >= 0; i -= 1) {
          const c = padded[i * 4];
          if (!c || c.type !== "operator") continue;
          const cd = c.depth ?? 0;
          if (cd < atDepth) break;
          if (cd === atDepth) targetIds.add(c.id);
        }
        for (let i = newRowIdx + 1; i < totalRows; i += 1) {
          const c = padded[i * 4];
          if (!c || c.type !== "operator") continue;
          const cd = c.depth ?? 0;
          if (cd < atDepth) break;
          if (cd === atDepth) targetIds.add(c.id);
        }
        const synced = padded.map((t) =>
          targetIds.has(t.id) ? { ...t, value } : t
        );
        return bs.map((b) =>
          b.id === blockId ? { ...b, tags: synced } : b
        );
      }

      /* No depth passed — this is a Field / Operator / Value pick
       * for the currently building row. */
      const type = nextTagType(target.tags.length);
      return bs.map((b) =>
        b.id === blockId
          ? { ...b, tags: [...b.tags, makeTag(type, value)] }
          : b
      );
    });
  };

  const setTagValue = (blockId: string, tagId: string, value: string) => {
    setBlocks((bs) =>
      bs.map((b) => {
        if (b.id !== blockId) return b;
        const tagIdx = b.tags.findIndex((t) => t.id === tagId);
        if (tagIdx === -1) return b;
        const tag = b.tags[tagIdx];
        /* Non-operator tags: update in place. */
        if (tag.type !== "operator") {
          return {
            ...b,
            tags: b.tags.map((t) => (t.id === tagId ? { ...t, value } : t)),
          };
        }
        /* Operator tags: propagate the change to every Connector at
         * the same depth in the SAME subset — the contiguous run of
         * rows where depth never drops below this one. Keeps the
         * subset's shared operator consistent so flipping any pill
         * flips the group. */
        const rowIdx = Math.floor(tagIdx / 4);
        const depth = tag.depth ?? 0;
        const totalRows = Math.ceil(b.tags.length / 4);
        const targetIds = new Set<string>();
        for (let i = rowIdx; i >= 0; i -= 1) {
          const c = b.tags[i * 4];
          if (!c || c.type !== "operator") continue;
          const cd = c.depth ?? 0;
          if (cd < depth) break;
          if (cd === depth) targetIds.add(c.id);
        }
        for (let i = rowIdx + 1; i < totalRows; i += 1) {
          const c = b.tags[i * 4];
          if (!c || c.type !== "operator") continue;
          const cd = c.depth ?? 0;
          if (cd < depth) break;
          if (cd === depth) targetIds.add(c.id);
        }
        return {
          ...b,
          tags: b.tags.map((t) =>
            targetIds.has(t.id) ? { ...t, value } : t
          ),
        };
      })
    );
  };

  const removeRow = (blockId: string, startIdx: number, count: number) => {
    setBlocks((bs) =>
      bs.map((b) => {
        if (b.id !== blockId) return b;
        const next = [...b.tags];
        next.splice(startIdx, count);
        return { ...b, tags: next };
      })
    );
  };

  const addBlock = () =>
    setBlocks((bs) => {
      /* Splice a new untitled `and` block in just before the trailing
       * `then` block so the two headings stay pinned at top and
       * bottom. */
      const untitled = makeBlock({ seedValue: "and" });
      return [...bs.slice(0, -1), untitled, bs[bs.length - 1]];
    });

  const removeBlock = (blockId: string) => {
    setBlocks((bs) => {
      /* The `if` and `then` blocks are permanent frame; only the
       * user-added untitled blocks in between can be removed. */
      return bs.filter((b) => b.id !== blockId || b.title !== undefined);
    });
  };

  const randomizeIf = () => {
    setBlocks((bs) =>
      bs.map((b) =>
        b.title === "if" ? { ...b, tags: generateRandomTags() } : b
      )
    );
    setDiffSlots(null);
  };

  /* Side-by-side diff (option 3). The reviewer sees two aligned
   * columns under the live editor:
   *   Left  = before → unchanged + removed + updated rows.
   *   Right = after  → unchanged + added   + updated rows.
   * Unchanged and updated rows appear on both sides at the same
   * slot index. Updated rows carry per-pill change markers so the
   * viewer sees exactly which cell of the condition changed —
   * git-style word highlighting inside an already-highlighted line.
   * Added rows leave a placeholder on the left and removed rows one
   * on the right to keep the columns line-locked. */
  type DiffSlot =
    | { kind: "unchanged"; tags: Tag[] }
    | { kind: "added"; tags: Tag[] }
    | { kind: "removed"; tags: Tag[] }
    | {
        kind: "updated";
        before: Tag[];
        after: Tag[];
        /* Which of the rendered pill columns changed. 1 = Field,
         * 2 = Operator (Conditional), 3 = Value — matches the row's
         * tag indices so a single set can drive both sides. */
        changed: Set<number>;
      };
  const [diffSlots, setDiffSlots] = useState<DiffSlot[] | null>(null);

  const simulateDiff = () => {
    /* Roll up a plausible before/after: build a random rule and
     * randomly mark each row as added / removed / updated /
     * unchanged. Updated rows get 1-2 pills mutated to a different
     * value from the same option set. */
    const tags = generateRandomTags();
    const totalRows = Math.ceil(tags.length / 4);
    const slots: DiffSlot[] = [];
    const pickDifferent = (options: string[], current: string): string => {
      if (options.length <= 1) return current;
      let next = current;
      let guard = 0;
      while (next === current && guard < 12) {
        next = options[Math.floor(Math.random() * options.length)];
        guard += 1;
      }
      return next;
    };
    for (let i = 0; i < totalRows; i += 1) {
      const rowTags = tags.slice(i * 4, i * 4 + 4);
      if (rowTags.length !== 4) continue;
      rowTags[0] = { ...rowTags[0], depth: 0 };
      const r = Math.random();
      if (r < 0.15) {
        slots.push({ kind: "removed", tags: rowTags });
      } else if (r < 0.30) {
        slots.push({ kind: "added", tags: rowTags });
      } else if (r < 0.50) {
        /* Build the "after" version by copying and mutating 1-2 of
         * the three content pills (Field/Operator/Value) so the
         * per-pill highlight has something to point at. */
        const after = rowTags.map((t) => ({ ...t }));
        const columns = [1, 2, 3];
        const changeCount = 1 + Math.floor(Math.random() * 2);
        const changed = new Set<number>();
        for (let n = 0; n < changeCount && columns.length; n += 1) {
          const pickIdx = Math.floor(Math.random() * columns.length);
          const idx = columns.splice(pickIdx, 1)[0];
          const opts =
            idx === 1
              ? CONDITION_OPTIONS
              : idx === 2
              ? CONDITIONAL_OPTIONS
              : VALUE_SUGGESTIONS;
          after[idx].value = pickDifferent(opts, after[idx].value);
          changed.add(idx);
        }
        slots.push({ kind: "updated", before: rowTags, after, changed });
      } else {
        slots.push({ kind: "unchanged", tags: rowTags });
      }
    }
    /* Ensure the palette always has at least one of each so the
     * demo doesn't roll an all-unchanged diff. */
    const kinds = new Set(slots.map((s) => s.kind));
    const forceKind = (kind: "added" | "removed") => {
      const extra = generateRandomTags().slice(0, 4);
      if (extra.length !== 4) return;
      extra[0] = { ...extra[0], depth: 0 };
      slots.splice(
        Math.floor(Math.random() * (slots.length + 1)),
        0,
        { kind, tags: extra }
      );
    };
    if (!kinds.has("added")) forceKind("added");
    if (!kinds.has("removed")) forceKind("removed");
    if (!kinds.has("updated")) {
      const extra = generateRandomTags().slice(0, 4);
      if (extra.length === 4) {
        extra[0] = { ...extra[0], depth: 0 };
        const after = extra.map((t) => ({ ...t }));
        after[3].value = pickDifferent(VALUE_SUGGESTIONS, after[3].value);
        slots.splice(
          Math.floor(Math.random() * (slots.length + 1)),
          0,
          {
            kind: "updated",
            before: extra,
            after,
            changed: new Set([3]),
          }
        );
      }
    }
    setDiffSlots(slots);
  };

  const clearDiff = () => {
    setDiffSlots(null);
  };

  /* The trailing `then` block always sits UNDER the +Block CTA; each
   * of the leading blocks (the `if` heading and any user-added
   * untitled blocks) render above the CTA. Untitled blocks are the
   * only ones that can be removed on their own. */
  const trailing = blocks[blocks.length - 1];
  const leading = blocks.slice(0, -1);
  const renderBlock = (block: RuleBlock) => (
    <BlockView
      key={block.id}
      block={block}
      canRemove={block.title === undefined}
      alwaysShowCtas={alwaysShowCtas}
      onAddNext={(v, atDepth) => addNextTag(block.id, v, atDepth)}
      onSetTagValue={(tagId, v) => setTagValue(block.id, tagId, v)}
      onRemoveRow={(startIdx, count) =>
        removeRow(block.id, startIdx, count)
      }
      onRemoveBlock={() => removeBlock(block.id)}
    />
  );
  return (
    <div className="rules">
      {leading.map(renderBlock)}
      {showAddBlock ? (
        <button type="button" className="rules-add-block" onClick={addBlock}>
          <span className="rules-add-block-icon" aria-hidden>+</span>
          <span>Block</span>
        </button>
      ) : null}
      {renderBlock(trailing)}
      {diffSlots ? <SideBySideDiff slots={diffSlots} /> : null}
      <div className="rules-devtools">
        <button
          type="button"
          className="rules-randomize"
          onClick={randomizeIf}
        >
          Generate random rule
        </button>
        <button
          type="button"
          className="rules-randomize"
          onClick={simulateDiff}
        >
          Simulate review diff
        </button>
        {diffSlots ? (
          <button
            type="button"
            className="rules-randomize"
            onClick={clearDiff}
          >
            Clear diff
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Side-by-side diff view. Two aligned columns render below the
 *  live editor: LEFT is the "before" state (unchanged + removed +
 *  updated), RIGHT is the "after" state (unchanged + added +
 *  updated). Unchanged and updated rows appear at the same slot
 *  index on both sides; updated rows carry per-pill markers so the
 *  reader sees exactly which cell changed, git-word-style, inside
 *  the already-highlighted row. Added rows leave a placeholder on
 *  the left; removed rows leave one on the right. */
type SideBySideSlot =
  | { kind: "unchanged"; tags: Tag[] }
  | { kind: "added"; tags: Tag[] }
  | { kind: "removed"; tags: Tag[] }
  | {
      kind: "updated";
      before: Tag[];
      after: Tag[];
      changed: Set<number>;
    };

function SideBySideDiff({ slots }: { slots: SideBySideSlot[] }) {
  const renderRow = (slot: SideBySideSlot, side: "left" | "right") => {
    /* Added rows only render on the right; removed rows only on
     * the left. The other side gets a same-height placeholder so
     * the two columns stay row-aligned. */
    if (slot.kind === "added" && side === "left") {
      return (
        <div className="rules-block-row rules-sbs-placeholder" aria-hidden />
      );
    }
    if (slot.kind === "removed" && side === "right") {
      return (
        <div className="rules-block-row rules-sbs-placeholder" aria-hidden />
      );
    }
    /* Choose which tag list to render per side. Updated rows pull
     * from `before` on the left and `after` on the right so the
     * two columns each show their own snapshot of the row. */
    const tags =
      slot.kind === "updated"
        ? side === "left"
          ? slot.before
          : slot.after
        : slot.tags;
    /* On the left, an updated row reads as a "removed-flavoured"
     * highlight; on the right it reads as "added-flavoured".
     * Unchanged / added / removed rows just carry their own kind. */
    const rowDiff =
      slot.kind === "updated"
        ? side === "left"
          ? "updated-before"
          : "updated-after"
        : slot.kind;
    const changed = slot.kind === "updated" ? slot.changed : null;
    return (
      <div className="rules-block-row" data-diff={rowDiff}>
        {[1, 2, 3].map((idx) => {
          const t = tags[idx];
          if (!t) return null;
          const isChanged = changed?.has(idx) ?? false;
          return (
            <span
              key={t.id}
              className={`tagpill-wrap ${isChanged ? "is-diff-changed" : ""}`}
              data-type={t.type}
              data-diff-cell={isChanged ? rowDiff : undefined}
            >
              <span className="tagpill">
                <span className="tagpill-label">{t.value || t.type}</span>
              </span>
            </span>
          );
        })}
      </div>
    );
  };
  return (
    <div className="rules-sbs">
      <div className="rules-sbs-col">
        <div className="rules-sbs-heading">before</div>
        <div className="rules-block rules-sbs-block">
          <div className="rules-block-title">if</div>
          <div className="rules-block-body">
            {slots.map((s, i) => (
              <div key={`L-${i}`}>{renderRow(s, "left")}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="rules-sbs-col">
        <div className="rules-sbs-heading">after</div>
        <div className="rules-block rules-sbs-block">
          <div className="rules-block-title">if</div>
          <div className="rules-block-body">
            {slots.map((s, i) => (
              <div key={`R-${i}`}>{renderRow(s, "right")}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Build a plausible rule of 3–12 rows for the `if` block. Depth walks
 * randomly (up 1, stay, or drop back to any shallower level) so we
 * see a mix of siblings and nested subsets. All tags are non-empty
 * so guides / badges / bracket lines all light up. */
function generateRandomTags(): Tag[] {
  const pick = <T,>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];
  const rowCount = 3 + Math.floor(Math.random() * 10);
  const tags: Tag[] = [];
  let depth = 0;
  /* ops[d] = the operator chosen for the currently active subset at
   * depth d. When we OPEN a new subset (depth increases from the
   * previous row), a fresh op is picked for each new level; siblings
   * inside that subset reuse it so every same-level pill matches. */
  const ops: string[] = [pick(OPERATOR_OPTIONS)];
  for (let i = 0; i < rowCount; i += 1) {
    let newDepth: number;
    if (i === 0) {
      newDepth = 0;
    } else {
      const options: number[] = [depth];
      if (depth < MAX_DEPTH) options.push(depth + 1);
      for (let d = 0; d < depth; d += 1) options.push(d);
      newDepth = pick(options);
    }
    if (newDepth > depth) {
      for (let d = depth + 1; d <= newDepth; d += 1) {
        ops[d] = pick(OPERATOR_OPTIONS);
      }
    }
    depth = newDepth;
    const op = ops[depth];
    const field = pick(CONDITION_OPTIONS);
    const cond = pick(CONDITIONAL_OPTIONS);
    const nValues = 1 + Math.floor(Math.random() * 3);
    const values: string[] = [];
    for (let v = 0; v < nValues; v += 1) {
      const val = pick(VALUE_SUGGESTIONS);
      if (!values.includes(val)) values.push(val);
    }
    tags.push(makeTag("operator", op, depth));
    tags.push(makeTag("condition", field));
    tags.push(makeTag("conditional", cond));
    tags.push(makeTag("value", values.join(", ")));
  }
  return tags;
}

const MAX_DEPTH = 2;

function BlockView({
  block,
  canRemove,
  onAddNext,
  onSetTagValue,
  onRemoveRow,
  onRemoveBlock,
}: {
  block: RuleBlock;
  canRemove: boolean;
  alwaysShowCtas: boolean;
  onAddNext: (value: string, atDepth?: number) => void;
  onSetTagValue: (tagId: string, v: string) => void;
  onRemoveRow: (startIdx: number, count: number) => void;
  onRemoveBlock: () => void;
}) {
  /* Chunk the tags into rows of four — Connector + Field + Operator +
   * Value forms one complete condition. */
  const rows: Tag[][] = [];
  for (let i = 0; i < block.tags.length; i += 4) {
    rows.push(block.tags.slice(i, i + 4));
  }
  /* Depth-lookup for row indent — a row's leading Connector holds
   * its depth. */
  const rowDepth = (rowIdx: number): number => {
    const row = rows[rowIdx];
    if (row.length > 0 && row[0].type === "operator") return row[0].depth ?? 0;
    return 0;
  };
  const nextType = nextTagType(block.tags.length);
  const isNextOperator = nextType === "operator";
  const lastRowIdx = rows.length - 1;
  const currentDepth = lastRowIdx >= 0 ? rowDepth(lastRowIdx) : 0;
  /* Two Connector CTAs sit side-by-side on one line: `Connector` at
   * the current depth and (when the MAX_DEPTH cap allows) `Subset` at
   * currentDepth + 1. The whole row is indented to the current depth
   * so +Connector lines up with the parent chain's left edge. */
  const canSubset = currentDepth < MAX_DEPTH;
  /* How many rows already sit at currentDepth in the SAME subset —
   * walk back from the last row until we hit a shallower depth
   * (which marks the boundary of this subset). If we only find the
   * current row (count 1), the next +Connector adds the very first
   * sibling in this subset, so we open the and/or picker. If there
   * are already siblings (count >= 2), auto-add using the last
   * sibling's operator — the whole subset shares one operator. */
  let currentSiblingCount = 0;
  for (let i = lastRowIdx; i >= 0; i -= 1) {
    const d = rowDepth(i);
    if (d < currentDepth) break;
    if (d === currentDepth) currentSiblingCount += 1;
  }
  const lastSiblingOp = (rows[lastRowIdx]?.[0]?.value || "and").toLowerCase();
  /* Last operator used at each ancestor depth, so ancestor +
   * Connector pills inherit that subset's shared op instead of
   * defaulting to `and`. */
  const lastOpAtDepth = (d: number): string => {
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      if (rowDepth(i) === d) return (rows[i][0]?.value || "and").toLowerCase();
    }
    return "and";
  };
  return (
    <div className="rules-block">
      {block.title ? (
        <div className="rules-block-title">{block.title}</div>
      ) : null}
      <div className="rules-block-body">
        {rows.map((row, i) => {
          const isLast = i === lastRowIdx;
          const depth = rowDepth(i);
          /* Row-level delete drops the whole condition line at once.
           * The first row holds the block's seed Connector and can't
           * be removed on its own — the whole block's Remove control
           * handles that. */
          const canDeleteRow = i > 0 && row.length > 0;
          const rowStartIdx = i * 4;
          /* Titled blocks (`if` / `then`) hide the first row's
           * leading Connector — the heading above the rows already
           * fills that slot. Untitled blocks show it inline as an
           * `and` pill on the first row.
           *
           * Nested subsets also hide their first row's Connector so
           * the first child of a subset lands straight on Field
           * instead of the operator — the subset's grouping is
           * already visible from the indent + subset guideline. */
          const isSubsetOpening = i > 0 && depth > rowDepth(i - 1);
          const hideLeadingConnector =
            (i === 0 && block.title !== undefined) || isSubsetOpening;
          const renderedTags = hideLeadingConnector ? row.slice(1) : row;
          /* Look for a same-depth sibling below to steal its
           * operator value from. When the first row's Connector is
           * hidden, we insert an invisible pill of the same text as
           * the sibling's op so the Field on this row lines up
           * horizontally with the Field on every sibling below —
           * and stays aligned as the op flips between and / or. */
          /* Row's Field value drives the Value slot's UX: when the
           * user picks the "input" field, Value renders as a plain
           * text input instead of the suggestion dropdown. */
          const rowFieldValue =
            row[1]?.type === "condition" ? row[1].value : "";
          let siblingOpForAlignment: string | null = null;
          if (hideLeadingConnector) {
            for (let k = i + 1; k < rows.length; k += 1) {
              const kd = rowDepth(k);
              if (kd < depth) break;
              if (kd === depth) {
                siblingOpForAlignment = (rows[k][0]?.value || "and").toLowerCase();
                break;
              }
            }
          }
          return (
            <div
              className="rules-block-row"
              style={{ paddingLeft: depth * 40 }}
              data-depth={depth}
              key={i}
            >
              {/* Subset guidelines — one vertical bar per ancestor
               * depth. Adjacent rows' bars overlap into a continuous
               * line, giving each nested subset a clear left edge so
               * the reader can see which rows are grouped together.
               *
               * Guide-x for ancestor depth gi:
               *   paddingLeft         = gi * 40
               * + indent-spacer + gap = 22 (only for gi > 0)
               * + operator pill centre = ~20 for "and", ~16 for "or"
               * We read the ancestor subset's current shared op via
               * lastOpAtDepth(gi) so the bar shifts when the op is
               * flipped and stays centred on the pill above. */}
              {Array.from({ length: depth }, (_, gi) => {
                const ancestorOp = lastOpAtDepth(gi);
                const centreOffset = ancestorOp === "or" ? 16 : 20;
                return (
                  <span
                    key={`guide-${gi}`}
                    className="rules-row-guide"
                    style={{ left: gi * 40 + (gi > 0 ? 22 : 0) + centreOffset }}
                    aria-hidden
                  />
                );
              })}
              {/* First row of the block: once a same-depth sibling
               * lands below, drop a guide bar in the operator column
               * so the top row visually ties into the operator pill
               * on the row that follows. */}
              {/* 40px spacer at the start of every nested row so
               * each child row of a subset visually steps in even
               * further past the depth-based paddingLeft. */}
              {depth > 0 ? (
                <span className="rules-row-indent" aria-hidden />
              ) : null}
              {siblingOpForAlignment ? (
                /* Op-spacer stays invisible for alignment, but hosts
                 * a visible guide bar centred on its column so the
                 * operator pill on the sibling below reads as
                 * continuous with the opener. */
                <span className="tagpill rules-op-spacer" aria-hidden>
                  {siblingOpForAlignment}
                  <span
                    className="rules-row-guide rules-op-spacer-guide"
                    style={{ left: "50%", top: 10, bottom: -7 }}
                    aria-hidden
                  />
                </span>
              ) : null}
              {renderedTags.map((t: Tag) => (
                <TagPill
                  key={t.id}
                  tag={t}
                  fieldValue={rowFieldValue}
                  onChange={(v) => onSetTagValue(t.id, v)}
                />
              ))}
              {/* Non-operator CTAs sit inline at the end of the row
               * still being filled so the condition reads left to
               * right. Operator CTAs move to their own rows below. */}
              {isLast && !isNextOperator ? (
                <InlineAddCta
                  tags={block.tags}
                  onAdd={onAddNext}
                  fieldValue={rowFieldValue}
                />
              ) : null}
              {canDeleteRow ? (
                <button
                  type="button"
                  className="rules-row-remove"
                  aria-label="Remove this condition"
                  onClick={() => onRemoveRow(rowStartIdx, row.length)}
                >
                  <IconTrash />
                </button>
              ) : null}
            </div>
          );
        })}
        {/* Connector / Subset CTAs — all on ONE row now. Ancestor
         * levels render as icon-only "+" pills; the current-depth
         * pill carries the full "+ Connector" label; a final "+
         * Subset" pill (when the depth cap allows) sits on the right
         * for nesting one deeper. Order reads left-to-right root →
         * current → subset.
         *
         * When Always show CTAs is on the row renders even while a
         * later chain is still being built; the initial condition
         * (Field + Operator + Value) still has to be completed once
         * — the CTAs only appear once the first row hits four tags.
         * Clicking a pill mid-chain pads the partial row first (see
         * addNextTag). */}
        {isNextOperator ? (
          <div className="rules-block-row rules-block-row--cta">
            {/* Ancestor +Connector pills — always auto-add, using
             * whatever operator that ancestor subset already uses so
             * the new sibling matches its group. */}
            {Array.from({ length: currentDepth }, (_, d) => d).map((d) => (
              <AutoAddButton
                key={`ancestor-${d}`}
                label="Connector"
                iconOnly
                onClick={() => onAddNext(lastOpAtDepth(d), d)}
              />
            ))}
            {/* Current-depth +Connector: the very first sibling in a
             * subset opens the and/or picker so the user picks the
             * shared operator once. Every subsequent +Connector auto-
             * inherits the last sibling's op — one subset, one op. */}
            {currentSiblingCount === 1 ? (
              <PickerCta
                label="Connector"
                options={OPERATOR_OPTIONS}
                onPick={(v) => onAddNext(v, currentDepth)}
              />
            ) : (
              <AutoAddButton
                label="Connector"
                onClick={() => onAddNext(lastSiblingOp, currentDepth)}
              />
            )}
            {canSubset ? (
              /* Subset creates a nested group — always seeded with
               * `and`, no and/or picker. The user picks the Field
               * next; the subset's shared operator can be flipped
               * from any of its rows' Connector pills later. */
              <AutoAddButton
                label="Subset"
                onClick={() => onAddNext("and", currentDepth + 1)}
              />
            ) : null}
          </div>
        ) : null}
      </div>
      {canRemove ? (
        <div className="rules-block-actions">
          <button
            type="button"
            className="rules-block-remove"
            aria-label="Remove group"
            onClick={onRemoveBlock}
          >
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Auto-commit pill — fires `onClick` directly without opening a
 *  picker. Used for +Subset (always) and for +Connector after the
 *  first sibling exists, so the new Connector inherits the last
 *  sibling's op. `iconOnly` collapses to just a `+` for ancestor-
 *  level shortcuts. */
function AutoAddButton({
  label,
  onClick,
  iconOnly = false,
}: {
  label: string;
  onClick: () => void;
  iconOnly?: boolean;
}) {
  return (
    <div className="rules-add-inline-wrap">
      <button
        type="button"
        className={`rules-add-inline ${iconOnly ? "is-icon-only" : ""}`}
        aria-label={iconOnly ? `Add ${label}` : undefined}
        onClick={onClick}
      >
        <span className="rules-add-inline-plus" aria-hidden>+</span>
        {iconOnly ? null : <span>{label}</span>}
      </button>
    </div>
  );
}

/** Inline next-step CTA for Field / Operator / Value slots — sits at
 *  the end of the row currently being built. Connector CTAs render
 *  outside this component (one per depth, on their own rows) so this
 *  path only handles the three non-operator types. */
function InlineAddCta({
  tags,
  onAdd,
  fieldValue,
}: {
  tags: Tag[];
  onAdd: (value: string, atDepth?: number) => void;
  fieldValue?: string;
}) {
  const type = nextTagType(tags.length);
  if (type === "operator") return null;
  return (
    <FullCta tags={tags} type={type} onAdd={onAdd} fieldValue={fieldValue} />
  );
}

/** Small pick-only CTA — the pattern used for Connector, Field, and
 *  Operator. Dropdown lists the options; picking commits and closes.
 *  `indent` renders leading tree-marker bars before the `+` so a row
 *  of Connector pills reads as a set of depth choices. `iconOnly`
 *  drops the label text so the pill collapses to just a `+`. */
function PickerCta({
  label,
  options,
  onPick,
  indent = 0,
  iconOnly = false,
}: {
  label: string;
  options: string[];
  onPick: (value: string) => void;
  indent?: number;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="rules-add-inline-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`rules-add-inline ${iconOnly ? "is-icon-only" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={iconOnly ? `Add ${label}` : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {indent > 0 ? (
          <span className="rules-add-inline-guides" aria-hidden>
            {Array.from({ length: indent }).map((_, i) => (
              <span key={i} />
            ))}
          </span>
        ) : null}
        <span className="rules-add-inline-plus" aria-hidden>+</span>
        {iconOnly ? null : <span>{label}</span>}
      </button>
      {open ? (
        <div className="rules-add-menu" role="listbox">
          <div className="rules-add-options">
            {options.map((o) => (
              <button
                key={o}
                type="button"
                role="option"
                className="rules-add-option"
                onClick={() => {
                  onPick(o);
                  setOpen(false);
                }}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** The Field / Operator / Value CTA. Field and Operator are pick-only
 *  (delegated to PickerCta); Value carries the multi-select flow with
 *  a freeform text input, chip preview and a Done commit. */
function FullCta({
  tags,
  type,
  onAdd,
  fieldValue,
}: {
  tags: Tag[];
  type: ReturnType<typeof nextTagType>;
  onAdd: (value: string) => void;
  fieldValue?: string;
}) {
  const label = nextCtaLabel(tags);
  const isValue = type === "value";

  if (!isValue) {
    const options =
      type === "condition" ? CONDITION_OPTIONS : CONDITIONAL_OPTIONS;
    return <PickerCta label={label} options={options} onPick={onAdd} />;
  }

  return <ValueCta label={label} onAdd={onAdd} fieldValue={fieldValue} />;
}

/** Value-tag CTA: multi-select from suggestions plus a freeform text
 *  input. Picks commit together as a comma-separated tag on Done, on
 *  Enter with an empty input, or on outside click.
 *
 *  When the row's Field is the special "input" option, the CTA
 *  switches to plain-text mode: a single-line input replaces the
 *  suggestion dropdown, and Enter (or an outside click) commits the
 *  typed string as-is. */
function ValueCta({
  label,
  onAdd,
  fieldValue,
}: {
  label: string;
  onAdd: (value: string) => void;
  fieldValue?: string;
}) {
  const isInputMode = fieldValue === "input";
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [picks, setPicks] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        /* Commit any pending picks / typed text before dismissing so
         * the user doesn't lose their selection to an accidental
         * outside click. Input-mode commits the raw draft as-is. */
        if (isInputMode) {
          const v = draft.trim();
          if (v) {
            onAdd(v);
            setDraft("");
          }
        } else if (picks.length > 0) {
          onAdd(serializeValueList(picks));
          setPicks([]);
          setDraft("");
        }
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setPicks([]);
        setDraft("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, picks, draft, isInputMode, onAdd]);

  const options = VALUE_SUGGESTIONS;

  const togglePick = (v: string) => {
    setPicks((ps) => (ps.includes(v) ? ps.filter((x) => x !== v) : [...ps, v]));
  };

  const appendDraft = () => {
    const v = draft.trim();
    if (!v) return;
    setPicks((ps) => (ps.includes(v) ? ps : [...ps, v]));
    setDraft("");
  };

  const commitPicks = () => {
    if (picks.length === 0) return;
    onAdd(serializeValueList(picks));
    setPicks([]);
    setDraft("");
    setOpen(false);
  };

  return (
    <div className="rules-add-inline-wrap" ref={wrapRef}>
      <button
        type="button"
        className="rules-add-inline"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="rules-add-inline-plus" aria-hidden>+</span>
        <span>{label}</span>
      </button>
      {open ? (
        <div className="rules-add-menu" role="group">
          {isInputMode ? (
            /* Input mode — a single-line freeform text field replaces
             * the suggestion dropdown. Enter (or clicking outside)
             * commits the raw string as the tag's value. */
            <input
              ref={inputRef}
              className="rules-add-input"
              value={draft}
              placeholder="Type a value and press Enter"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const v = draft.trim();
                  if (v) {
                    onAdd(v);
                    setDraft("");
                    setOpen(false);
                  }
                }
              }}
              aria-label="Value"
              spellCheck={false}
            />
          ) : (
            <>
              {picks.length > 0 ? (
                <div className="tagpill-chips">
                  {picks.map((v) => (
                    <span key={v} className="tagpill-chip">
                      {v}
                      <button
                        type="button"
                        className="tagpill-chip-x"
                        aria-label={`Remove ${v}`}
                        onClick={() => togglePick(v)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              <input
                ref={inputRef}
                className="rules-add-input"
                value={draft}
                placeholder="Type any value and press Enter"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (draft.trim()) appendDraft();
                    else commitPicks();
                  }
                }}
                aria-label="Value"
                spellCheck={false}
              />
              <div className="rules-add-options">
                {options.map((o) => {
                  const selected = picks.includes(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`rules-add-option ${selected ? "is-selected" : ""}`}
                      onClick={() => togglePick(o)}
                    >
                      <span className="tagpill-check" aria-hidden>
                        {selected ? "✓" : ""}
                      </span>
                      <span>{o}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="rules-add-done"
                onClick={commitPicks}
                disabled={picks.length === 0}
              >
                Done
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

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
    </div>
  );
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
          /* For a subset-opening row, insert a spacer whose width
           * matches the operator pill that the next sibling in this
           * subset shows — so the row's Field lines up under the
           * siblings' Field. The spacer text mirrors the sibling's
           * op ("and" / "or") so the width tracks with whichever
           * operator that subset is using. */
          let siblingOpForSpacer: string | null = null;
          if (isSubsetOpening) {
            for (let j = i + 1; j < rows.length; j += 1) {
              const jd = rowDepth(j);
              if (jd < depth) break;
              if (jd === depth) {
                siblingOpForSpacer = (rows[j][0]?.value || "and").toLowerCase();
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
               * the reader can see which rows are grouped together. */}
              {Array.from({ length: depth }, (_, gi) => (
                <span
                  key={`guide-${gi}`}
                  className="rules-row-guide"
                  style={{ left: gi * 40 + 19 }}
                  aria-hidden
                />
              ))}
              {siblingOpForSpacer ? (
                <span className="rules-op-spacer" aria-hidden>
                  {siblingOpForSpacer}
                </span>
              ) : null}
              {renderedTags.map((t: Tag) => (
                <TagPill
                  key={t.id}
                  tag={t}
                  onChange={(v) => onSetTagValue(t.id, v)}
                />
              ))}
              {/* Non-operator CTAs sit inline at the end of the row
               * still being filled so the condition reads left to
               * right. Operator CTAs move to their own rows below. */}
              {isLast && !isNextOperator ? (
                <InlineAddCta tags={block.tags} onAdd={onAddNext} />
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
}: {
  tags: Tag[];
  onAdd: (value: string, atDepth?: number) => void;
}) {
  const type = nextTagType(tags.length);
  if (type === "operator") return null;
  return <FullCta tags={tags} type={type} onAdd={onAdd} />;
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
}: {
  tags: Tag[];
  type: ReturnType<typeof nextTagType>;
  onAdd: (value: string) => void;
}) {
  const label = nextCtaLabel(tags);
  const isValue = type === "value";

  if (!isValue) {
    const options =
      type === "condition" ? CONDITION_OPTIONS : CONDITIONAL_OPTIONS;
    return <PickerCta label={label} options={options} onPick={onAdd} />;
  }

  return <ValueCta label={label} onAdd={onAdd} />;
}

/** Value-tag CTA: multi-select from suggestions plus a freeform text
 *  input. Picks commit together as a comma-separated tag on Done, on
 *  Enter with an empty input, or on outside click. */
function ValueCta({
  label,
  onAdd,
}: {
  label: string;
  onAdd: (value: string) => void;
}) {
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
        /* Commit any pending picks before dismissing so the user
         * doesn't lose their selection to an accidental outside click. */
        if (picks.length > 0) {
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
  }, [open, picks, onAdd]);

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
        </div>
      ) : null}
    </div>
  );
}

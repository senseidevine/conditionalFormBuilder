import { useEffect, useRef, useState, type ReactNode } from "react";
import type { RuleBlock, Tag, TagType } from "./types";
import {
  CONDITION_OPTIONS,
  CONDITIONAL_OPTIONS,
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
        return bs.map((b) =>
          b.id === blockId ? { ...b, tags: padded } : b
        );
      }

      /* No depth passed — this is a Field / Operator / Value pick
       * for the currently building row. When the pick is a Value the
       * row is now complete, so auto-append a Connector tag for the
       * next sibling at the same depth (and matching the current
       * row's operator so a flipped subgroup badge stays coherent).
       * The trailing Connector is hidden inline; its +Field / +Subset
       * CTAs render at the end of the row that just completed. */
      const type = nextTagType(target.tags.length);
      const rowStart = Math.floor(target.tags.length / 4) * 4;
      const rowConnector = target.tags[rowStart];
      const rowDepth = rowConnector?.depth ?? 0;
      const rowOp = rowConnector?.value || "and";
      const newTags = [...target.tags, makeTag(type, value)];
      if (type === "value") {
        newTags.push(makeTag("operator", rowOp, rowDepth));
      }
      return bs.map((b) =>
        b.id === blockId ? { ...b, tags: newTags } : b
      );
    });
  };

  const setTrailingDepth = (blockId: string, depth: number) => {
    setBlocks((bs) =>
      bs.map((b) => {
        if (b.id !== blockId) return b;
        const lastIdx = b.tags.length - 1;
        if (lastIdx < 0) return b;
        const last = b.tags[lastIdx];
        if (last.type !== "operator") return b;
        const tags = [...b.tags];
        tags[lastIdx] = { ...last, depth };
        return { ...b, tags };
      })
    );
  };

  const setTagValue = (blockId: string, tagId: string, value: string) => {
    setBlocks((bs) =>
      bs.map((b) =>
        b.id === blockId
          ? {
              ...b,
              tags: b.tags.map((t) => (t.id === tagId ? { ...t, value } : t)),
            }
          : b
      )
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
      onSetTrailingDepth={(d) => setTrailingDepth(block.id, d)}
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
  onSetTrailingDepth,
  onRemoveRow,
  onRemoveBlock,
}: {
  block: RuleBlock;
  canRemove: boolean;
  alwaysShowCtas: boolean;
  onAddNext: (value: string, atDepth?: number) => void;
  onSetTagValue: (tagId: string, v: string) => void;
  onSetTrailingDepth: (depth: number) => void;
  onRemoveRow: (startIdx: number, count: number) => void;
  onRemoveBlock: () => void;
}) {
  /* Chunk the tags into rows of four — Connector + Field + Operator +
   * Value forms one complete condition. */
  const rows: Tag[][] = [];
  for (let i = 0; i < block.tags.length; i += 4) {
    rows.push(block.tags.slice(i, i + 4));
  }
  /* Depth-lookup — a row's leading Connector holds its depth. */
  const rowDepth = (rowIdx: number): number => {
    const row = rows[rowIdx];
    if (row.length > 0 && row[0].type === "operator") return row[0].depth ?? 0;
    return 0;
  };
  /* After a Value pick the editor auto-appends a Connector for the
   * next sibling row. That trailing Connector sits alone in a fresh
   * chunk (row of length 1). We hide that row and instead paint its
   * +Field / +Subset CTAs inline at the tail of the row that just
   * completed. */
  const lastRow = rows[rows.length - 1];
  const hasTrailingAnd =
    rows.length > 1 &&
    lastRow.length === 1 &&
    lastRow[0].type === "operator";
  const trailingDepth = hasTrailingAnd ? lastRow[0].depth ?? 0 : 0;
  const lastVisibleIdx = hasTrailingAnd ? rows.length - 2 : rows.length - 1;
  const nextType = nextTagType(block.tags.length);
  const isNextOperator = nextType === "operator";
  const canSubset = trailingDepth < MAX_DEPTH;

  const renderRow = (row: Tag[], rowIdx: number) => {
    const isTrailingAndRow =
      hasTrailingAnd && rowIdx === rows.length - 1;
    const isLast = rowIdx === lastVisibleIdx;
    const canDeleteRow = !isTrailingAndRow && rowIdx > 0 && row.length > 0;
    const rowStartIdx = rowIdx * 4;
    /* The leading Connector is captured by the enclosing subgroup's
     * badge (or is redundant for a single-row subgroup), so we always
     * hide it inline. */
    const renderedTags = row.slice(1);
    return (
      <div className="rules-block-row" key={`row-${rowIdx}`}>
        {renderedTags.map((t: Tag) => (
          <TagPill
            key={t.id}
            tag={t}
            onChange={(v) => onSetTagValue(t.id, v)}
          />
        ))}
        {isLast && !hasTrailingAnd && !isNextOperator ? (
          <InlineAddCta tags={block.tags} onAdd={onAddNext} />
        ) : null}
        {isTrailingAndRow ? (
          <>
            <PickerCta
              label="Field"
              options={CONDITION_OPTIONS}
              onPick={(v) => onAddNext(v)}
            />
            {canSubset ? (
              <PickerCta
                label="Subset"
                options={CONDITION_OPTIONS}
                onPick={(v) => {
                  onSetTrailingDepth(trailingDepth + 1);
                  onAddNext(v);
                }}
              />
            ) : null}
          </>
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
  };

  /* Recursively render a subgroup at `atDepth`: collect its same-
   * depth rows and recurse into any deeper subgroups that sit in
   * between. Every subgroup renders as a `[bracket column][rows
   * column]` pair — the bracket column is always present (so the
   * layout never jumps when a second sibling is added), but the
   * line + AND/OR badge only paint when the subgroup has more than
   * one same-depth row. Because a subgroup's items include its
   * nested subgroups too, the bracket visually spans through any
   * children as well. */
  const renderTree = (fromIdx: number, atDepth: number): [ReactNode, number] => {
    const sameDepthRows: Tag[][] = [];
    const items: ReactNode[] = [];
    let i = fromIdx;
    while (i < rows.length && rowDepth(i) >= atDepth) {
      if (rowDepth(i) === atDepth) {
        sameDepthRows.push(rows[i]);
        items.push(renderRow(rows[i], i));
        i += 1;
      } else {
        const [nested, next] = renderTree(i, rowDepth(i));
        items.push(nested);
        i = next;
      }
    }
    /* Count only rows whose value has been picked (length 4) as
     * "real" — partial rows (Field-only, Field+Operator) don't yet
     * carry a condition, so the AND/OR badge stays hidden until the
     * first value lands. */
    const realRows = sameDepthRows.filter((r) => r.length === 4);
    const isMulti = realRows.length > 0;
    const sharedOp =
      isMulti
        ? (realRows[0][0]?.value || "and").toLowerCase()
        : "and";
    const cycleOp = () => {
      const nextOp = sharedOp === "and" ? "or" : "and";
      for (const r of sameDepthRows) {
        if (r[0]) onSetTagValue(r[0].id, nextOp);
      }
    };
    return [
      <div
        className={`rules-subgroup ${isMulti ? "is-multi" : ""}`}
        data-depth={atDepth}
        key={`sg-${atDepth}-${fromIdx}`}
      >
        <div className="rules-subgroup-bracket">
          {isMulti ? (
            <button
              type="button"
              className="rules-subgroup-badge"
              data-op={sharedOp}
              aria-label={`Toggle subgroup operator, currently ${sharedOp}`}
              onClick={cycleOp}
            >
              {sharedOp.toUpperCase()}
            </button>
          ) : null}
        </div>
        <div className="rules-subgroup-rows">
          {items}
          {/* Each is-multi subgroup that doesn't already own the
           * trailing-and row (whose CTAs are shown inline there)
           * appends its own "+" pill so the user can add a sibling
           * at that subgroup's depth without hunting through the
           * deeper level. */}
          {isMulti && !(hasTrailingAnd && trailingDepth === atDepth) ? (
            <div className="rules-block-row rules-subgroup-add">
              <PickerCta
                label="Field"
                options={CONDITION_OPTIONS}
                onPick={(v) => {
                  onSetTrailingDepth(atDepth);
                  onAddNext(v);
                }}
              />
              {atDepth < MAX_DEPTH ? (
                <PickerCta
                  label="Subset"
                  options={CONDITION_OPTIONS}
                  onPick={(v) => {
                    onSetTrailingDepth(atDepth + 1);
                    onAddNext(v);
                  }}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>,
      i,
    ];
  };
  const [tree] = rows.length > 0 ? renderTree(0, 0) : [null, 0];

  return (
    <div className="rules-block">
      {block.title ? (
        <div className="rules-block-title">{block.title}</div>
      ) : null}
      <div className="rules-block-body">{tree}</div>
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

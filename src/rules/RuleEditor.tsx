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
}: {
  alwaysShowCtas: boolean;
}) {
  const [blocks, setBlocks] = useState<RuleBlock[]>(() => [makeBlock()]);

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
    setBlocks((bs) => [...bs, makeBlock(bs.length === 0 ? "if" : "and")]);

  const removeBlock = (blockId: string) => {
    setBlocks((bs) =>
      bs.length > 1 ? bs.filter((b) => b.id !== blockId) : bs
    );
  };

  return (
    <div className="rules">
      {blocks.map((block) => (
        <BlockView
          key={block.id}
          block={block}
          canRemove={blocks.length > 1}
          alwaysShowCtas={alwaysShowCtas}
          onAddNext={(v, atDepth) => addNextTag(block.id, v, atDepth)}
          onSetTagValue={(tagId, v) => setTagValue(block.id, tagId, v)}
          onRemoveRow={(startIdx, count) =>
            removeRow(block.id, startIdx, count)
          }
          onRemoveBlock={() => removeBlock(block.id)}
        />
      ))}
      <button type="button" className="rules-add-block" onClick={addBlock}>
        <span className="rules-add-block-icon" aria-hidden>+</span>
        <span>Block</span>
      </button>
    </div>
  );
}

const MAX_DEPTH = 2;

function BlockView({
  block,
  canRemove,
  alwaysShowCtas,
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
  return (
    <div className="rules-block">
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
          return (
            <div
              className="rules-block-row"
              style={{ paddingLeft: depth * 40 }}
              key={i}
            >
              {row.map((t: Tag) => (
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
        {/* Connector / Subset CTAs — the current-depth row carries
         * +Connector (sibling at the current level) and +Subset (one
         * level deeper, when the depth cap allows). Below it, one
         * extra row per ancestor level offers a +Connector aligned to
         * that parent's depth so users can add a sibling at any
         * outer chain without losing the option to nest first.
         *
         * When Always show CTAs is on the rows render even while a
         * chain is still being built; clicking one pads the current
         * partial row with empty tags first (see addNextTag) so the
         * row-of-4 chunking stays intact. */}
        {isNextOperator || alwaysShowCtas ? (
          <>
            <div
              className="rules-block-row rules-block-row--cta"
              style={{ paddingLeft: currentDepth * 40 }}
            >
              <PickerCta
                label="Connector"
                options={OPERATOR_OPTIONS}
                onPick={(v) => onAddNext(v, currentDepth)}
              />
              {canSubset ? (
                <PickerCta
                  label="Subset"
                  options={OPERATOR_OPTIONS}
                  onPick={(v) => onAddNext(v, currentDepth + 1)}
                />
              ) : null}
            </div>
            {Array.from(
              { length: currentDepth },
              (_, k) => currentDepth - 1 - k
            ).map((d) => (
              <div
                className="rules-block-row rules-block-row--cta"
                style={{ paddingLeft: d * 40 }}
                key={`parent-${d}`}
              >
                <PickerCta
                  label="Connector"
                  options={OPERATOR_OPTIONS}
                  onPick={(v) => onAddNext(v, d)}
                />
              </div>
            ))}
          </>
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
 *  of Connector pills reads as a set of depth choices. */
function PickerCta({
  label,
  options,
  onPick,
  indent = 0,
}: {
  label: string;
  options: string[];
  onPick: (value: string) => void;
  indent?: number;
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
        className="rules-add-inline"
        aria-haspopup="listbox"
        aria-expanded={open}
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
        <span>{label}</span>
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

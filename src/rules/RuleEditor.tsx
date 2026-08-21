import { useEffect, useRef, useState } from "react";
import type { RuleBlock, Tag } from "./types";
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

export function RuleEditor() {
  const [blocks, setBlocks] = useState<RuleBlock[]>(() => [makeBlock()]);

  const addNextTag = (blockId: string, value: string, subset = false) => {
    setBlocks((bs) => {
      const target = bs.find((b) => b.id === blockId);
      if (!target) return bs;
      const type = nextTagType(target.tags.length);
      let depth: number | undefined;
      if (type === "operator") {
        /* A new Connector inherits the depth of the previous line's
         * Connector; +Subset bumps that depth by one so its whole row
         * indents 20 px further right of the parent. */
        const prevOp = [...target.tags]
          .reverse()
          .find((t) => t.type === "operator");
        const baseDepth = prevOp?.depth ?? 0;
        depth = subset ? baseDepth + 1 : baseDepth;
      }
      return bs.map((b) =>
        b.id === blockId
          ? { ...b, tags: [...b.tags, makeTag(type, value, depth)] }
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

  const removeLastTag = (blockId: string) => {
    setBlocks((bs) =>
      bs.map((b) =>
        /* Keep the leading `if` — a block always opens with an operator
         * so the guided CTA has a starting point. */
        b.id === blockId && b.tags.length > 1
          ? { ...b, tags: b.tags.slice(0, -1) }
          : b
      )
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
          onAddNext={(v, subset) => addNextTag(block.id, v, subset)}
          onSetTagValue={(tagId, v) => setTagValue(block.id, tagId, v)}
          onRemoveLastTag={() => removeLastTag(block.id)}
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

function BlockView({
  block,
  canRemove,
  onAddNext,
  onSetTagValue,
  onRemoveLastTag,
  onRemoveBlock,
}: {
  block: RuleBlock;
  canRemove: boolean;
  onAddNext: (value: string, subset?: boolean) => void;
  onSetTagValue: (tagId: string, v: string) => void;
  onRemoveLastTag: () => void;
  onRemoveBlock: () => void;
}) {
  const canRemoveTag = block.tags.length > 1;
  /* Chunk the tags into rows of four — Connector + Field + Operator +
   * Value forms one complete condition. When the last row is exactly
   * full, an empty trailing row is added so the CTA (which lives in
   * the last row) starts the next condition on a fresh line. */
  const rows: Tag[][] = [];
  for (let i = 0; i < block.tags.length; i += 4) {
    rows.push(block.tags.slice(i, i + 4));
  }
  if (rows.length === 0 || rows[rows.length - 1].length === 4) {
    rows.push([]);
  }
  /* Depth-lookup for row indent — a row's leading Connector holds
   * its depth. Empty trailing rows carry the depth of the previous
   * row so the CTA sits under the current chain instead of jumping
   * back to the block's left edge. */
  const rowDepth = (i: number): number => {
    const row = rows[i];
    if (row.length > 0 && row[0].type === "operator") return row[0].depth ?? 0;
    for (let j = i - 1; j >= 0; j--) {
      const prev = rows[j];
      if (prev.length > 0 && prev[0].type === "operator") {
        return prev[0].depth ?? 0;
      }
    }
    return 0;
  };
  return (
    <div className="rules-block">
      <div className="rules-block-body">
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1;
          const depth = rowDepth(i);
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
              {isLast ? (
                <>
                  {/* Inline next-step CTA — sits after the last tag in
                   * the current row. `canSubset` caps subset nesting
                   * at three levels deep so users can't burrow past a
                   * legible indent. */}
                  <InlineAddCta
                    tags={block.tags}
                    onAdd={onAddNext}
                    canSubset={depth < 3}
                  />
                  {canRemoveTag ? (
                    <button
                      type="button"
                      className="rules-row-remove"
                      aria-label="Remove last tag"
                      onClick={onRemoveLastTag}
                    >
                      <IconTrash />
                    </button>
                  ) : null}
                </>
              ) : null}
            </div>
          );
        })}
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

/** Inline next-step CTA. Revealed on block hover. When the next tag
 *  is a Connector it renders TWO CTAs — "+Connector" (same-level) and
 *  "+Subset" (nested one deeper); otherwise a single CTA whose
 *  dropdown is scoped to the next type. Value tags get multi-select
 *  with a freeform text input; other types are pick-only. */
function InlineAddCta({
  tags,
  onAdd,
  canSubset,
}: {
  tags: Tag[];
  onAdd: (value: string, subset?: boolean) => void;
  /** When false, the +Subset CTA is hidden — used at max nesting
   *  depth so users can't push subsets past three levels. */
  canSubset: boolean;
}) {
  const type = nextTagType(tags.length);

  if (type === "operator") {
    return (
      <>
        <PickerCta
          label="Connector"
          options={OPERATOR_OPTIONS}
          onPick={(v) => onAdd(v, false)}
        />
        {canSubset ? (
          <PickerCta
            label="Subset"
            options={OPERATOR_OPTIONS}
            onPick={(v) => onAdd(v, true)}
          />
        ) : null}
      </>
    );
  }

  return <FullCta tags={tags} type={type} onAdd={onAdd} />;
}

/** Small pick-only CTA — the pattern used for Connector, Subset,
 *  Field, and Operator. Dropdown lists the options; picking commits
 *  and closes. */
function PickerCta({
  label,
  options,
  onPick,
}: {
  label: string;
  options: string[];
  onPick: (value: string) => void;
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

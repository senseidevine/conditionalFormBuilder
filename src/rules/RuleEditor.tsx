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

  const addNextTag = (blockId: string, value: string) => {
    setBlocks((bs) => {
      const target = bs.find((b) => b.id === blockId);
      if (!target) return bs;
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

  const addBlock = () => setBlocks((bs) => [...bs, makeBlock()]);

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
          onAddNext={(v) => addNextTag(block.id, v)}
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
  onAddNext: (value: string) => void;
  onSetTagValue: (tagId: string, v: string) => void;
  onRemoveLastTag: () => void;
  onRemoveBlock: () => void;
}) {
  const canRemoveTag = block.tags.length > 1;
  return (
    <div className="rules-block">
      <div className="rules-block-body">
        {block.tags.map((t: Tag) => (
          <TagPill
            key={t.id}
            tag={t}
            onChange={(v) => onSetTagValue(t.id, v)}
          />
        ))}
        {/* Inline next-step CTA — sits right after the last tag so the
         * chain reads left-to-right; hidden by default and revealed
         * when the block is hovered or focused, so the row stays clean
         * once the rule is filled in. */}
        <InlineAddCta tags={block.tags} onAdd={onAddNext} />
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

/** Inline next-step CTA. Renders as a primary white pill (revealed on
 *  block hover). Clicking opens a dropdown pre-scoped to the next
 *  tag type in the grammar — Value tags include a freeform text
 *  input, Operator/Conditional tags are picklists. Picking a value
 *  emits it via `onAdd`, which the parent turns into a new tag. */
function InlineAddCta({
  tags,
  onAdd,
}: {
  tags: Tag[];
  onAdd: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  /* Multi-select draft for Value tags. Suggestions toggle in/out and
   * the text input appends custom entries; the whole set commits as
   * one comma-separated tag when the user clicks Done or hits Enter
   * on the text input while it's empty. */
  const [picks, setPicks] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const type = nextTagType(tags.length);
  const label = nextCtaLabel(tags);
  const isValue = type === "value";

  useEffect(() => {
    if (!open) return;
    if (isValue) inputRef.current?.focus();
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        /* Commit any pending Value picks before dismissing so the user
         * doesn't lose their selection to an accidental outside click. */
        if (isValue && picks.length > 0) {
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
  }, [open, isValue, picks, onAdd]);

  const options =
    type === "operator"
      ? OPERATOR_OPTIONS
      : type === "condition"
      ? CONDITION_OPTIONS
      : type === "conditional"
      ? CONDITIONAL_OPTIONS
      : VALUE_SUGGESTIONS;

  /* Single-select commit — used by the three pick-only tag types.
   * Adds the tag and closes the dropdown. */
  const commitSingle = (v: string) => {
    if (!v) return;
    onAdd(v);
    setOpen(false);
    setDraft("");
  };

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
        <div className="rules-add-menu" role={isValue ? "group" : "listbox"}>
          {isValue ? (
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
            </>
          ) : null}
          <div className="rules-add-options">
            {options.map((o) => {
              const selected = isValue ? picks.includes(o) : false;
              return (
                <button
                  key={o}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`rules-add-option ${selected ? "is-selected" : ""}`}
                  onClick={() =>
                    isValue ? togglePick(o) : commitSingle(o)
                  }
                >
                  {isValue ? (
                    <span className="tagpill-check" aria-hidden>
                      {selected ? "✓" : ""}
                    </span>
                  ) : null}
                  <span>{o}</span>
                </button>
              );
            })}
          </div>
          {isValue ? (
            <button
              type="button"
              className="rules-add-done"
              onClick={commitPicks}
              disabled={picks.length === 0}
            >
              Done
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

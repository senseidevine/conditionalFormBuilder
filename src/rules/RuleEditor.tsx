import { useEffect, useRef, useState } from "react";
import type { RuleBlock, Tag } from "./types";
import {
  CONDITIONAL_OPTIONS,
  OPERATOR_OPTIONS,
  VALUE_SUGGESTIONS,
  makeBlock,
  makeTag,
  nextCtaLabel,
  nextTagType,
} from "./types";
import { TagPill } from "./TagPill";
import { IconReturn, IconTrash } from "../components/Icons";
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
        <span className="rules-add-block-icon" aria-hidden>
          <IconReturn />
        </span>
        <span>Group</span>
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const type = nextTagType(tags.length);
  const label = nextCtaLabel(tags);

  useEffect(() => {
    if (!open) return;
    if (type === "value") {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
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
  }, [open, type]);

  const options =
    type === "operator"
      ? OPERATOR_OPTIONS
      : type === "conditional"
      ? CONDITIONAL_OPTIONS
      : VALUE_SUGGESTIONS;

  const commit = (v: string) => {
    if (!v) return;
    onAdd(v);
    setOpen(false);
    setDraft("");
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
        <div className="rules-add-menu" role="listbox">
          {type === "value" ? (
            <input
              ref={inputRef}
              className="rules-add-input"
              value={draft}
              placeholder="Type any value"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit(draft);
              }}
              aria-label="Value"
              spellCheck={false}
            />
          ) : null}
          <div className="rules-add-options">
            {options.map((o) => (
              <button
                key={o}
                type="button"
                role="option"
                className="rules-add-option"
                onClick={() => commit(o)}
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

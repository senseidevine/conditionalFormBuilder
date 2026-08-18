import { useState } from "react";
import type { RuleBlock, Tag, TagType } from "./types";
import { makeBlock, makeTag, nextCtaLabel, nextTagType } from "./types";
import { TagPill } from "./TagPill";
import { IconGroup, IconReturn, IconTrash } from "../components/Icons";
import "./RuleEditor.css";

export function RuleEditor() {
  const [blocks, setBlocks] = useState<RuleBlock[]>(() => [makeBlock()]);
  /* Tag ids that just got created via the CTA and should open their
   * dropdown on first render. Cleared as soon as the render is
   * committed so a later reopen behaves normally. */
  const [autoOpen, setAutoOpen] = useState<Set<string>>(() => new Set());

  const addNextTag = (blockId: string) => {
    setBlocks((bs) => {
      const target = bs.find((b) => b.id === blockId);
      if (!target) return bs;
      const type: TagType = nextTagType(target.tags.length);
      const t = makeTag(type);
      /* Queue the auto-open outside the setter — React 18 batches this
       * with the block update so the pill lands with its dropdown open. */
      queueMicrotask(() => {
        setAutoOpen((s) => new Set(s).add(t.id));
        queueMicrotask(() => {
          setAutoOpen((s) => {
            if (!s.has(t.id)) return s;
            const n = new Set(s);
            n.delete(t.id);
            return n;
          });
        });
      });
      return bs.map((b) =>
        b.id === blockId ? { ...b, tags: [...b.tags, t] } : b
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
          autoOpen={autoOpen}
          canRemove={blocks.length > 1}
          onAddNext={() => addNextTag(block.id)}
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
  autoOpen,
  canRemove,
  onAddNext,
  onSetTagValue,
  onRemoveLastTag,
  onRemoveBlock,
}: {
  block: RuleBlock;
  autoOpen: Set<string>;
  canRemove: boolean;
  onAddNext: () => void;
  onSetTagValue: (tagId: string, v: string) => void;
  onRemoveLastTag: () => void;
  onRemoveBlock: () => void;
}) {
  const canRemoveTag = block.tags.length > 1;
  const ctaLabel = nextCtaLabel(block.tags);
  return (
    <div className="rules-block">
      <div className="rules-block-body">
        {block.tags.map((t: Tag) => (
          <TagPill
            key={t.id}
            tag={t}
            autoOpen={autoOpen.has(t.id)}
            onChange={(v) => onSetTagValue(t.id, v)}
          />
        ))}
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
      <div className="rules-block-actions">
        <button
          type="button"
          className="rules-add-pill is-primary"
          onClick={onAddNext}
        >
          <span className="rules-add-pill-icon" aria-hidden>
            <IconGroup />
          </span>
          <span>{ctaLabel}</span>
        </button>
        {canRemove ? (
          <button
            type="button"
            className="rules-block-remove"
            aria-label="Remove group"
            onClick={onRemoveBlock}
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

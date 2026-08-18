import { useState } from "react";
import type { RuleBlock, Tag, TagType } from "./types";
import { makeBlock, makeTag } from "./types";
import { TagPill } from "./TagPill";
import { IconGroup, IconReturn, IconTrash } from "../components/Icons";
import "./RuleEditor.css";

export function RuleEditor() {
  const [blocks, setBlocks] = useState<RuleBlock[]>(() => [makeBlock()]);
  /* Tag ids that just got created via an add-tag button and should open
   * their dropdown on first render. Cleared as soon as the render is
   * committed so a later reopen behaves normally. */
  const [autoOpen, setAutoOpen] = useState<Set<string>>(() => new Set());

  const addTag = (blockId: string, type: TagType) => {
    const t = makeTag(type);
    setBlocks((bs) =>
      bs.map((b) => (b.id === blockId ? { ...b, tags: [...b.tags, t] } : b))
    );
    setAutoOpen((s) => new Set(s).add(t.id));
    /* Drop the auto-open flag once the caller-driven render has landed
     * so re-clicking the pill later toggles as usual. */
    queueMicrotask(() => {
      setAutoOpen((s) => {
        if (!s.has(t.id)) return s;
        const n = new Set(s);
        n.delete(t.id);
        return n;
      });
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
        b.id === blockId ? { ...b, tags: b.tags.slice(0, -1) } : b
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
          onAddTag={(type) => addTag(block.id, type)}
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
  onAddTag,
  onSetTagValue,
  onRemoveLastTag,
  onRemoveBlock,
}: {
  block: RuleBlock;
  autoOpen: Set<string>;
  canRemove: boolean;
  onAddTag: (type: TagType) => void;
  onSetTagValue: (tagId: string, v: string) => void;
  onRemoveLastTag: () => void;
  onRemoveBlock: () => void;
}) {
  const hasTags = block.tags.length > 0;
  return (
    <div className="rules-block">
      <div className="rules-block-body">
        {hasTags ? null : (
          <span className="rules-empty">Empty block — add a condition to get started.</span>
        )}
        {block.tags.map((t: Tag) => (
          <TagPill
            key={t.id}
            tag={t}
            autoOpen={autoOpen.has(t.id)}
            onChange={(v) => onSetTagValue(t.id, v)}
          />
        ))}
        {hasTags ? (
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
        <AddPill onClick={() => onAddTag("operator")} label="Operator" />
        <AddPill onClick={() => onAddTag("conditional")} label="Conditional" />
        <AddPill onClick={() => onAddTag("value")} label="Condition" primary />
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

function AddPill({
  onClick,
  label,
  primary,
}: {
  onClick: () => void;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={`rules-add-pill ${primary ? "is-primary" : ""}`}
      onClick={onClick}
    >
      <span className="rules-add-pill-icon" aria-hidden>
        <IconGroup />
      </span>
      <span>{label}</span>
    </button>
  );
}

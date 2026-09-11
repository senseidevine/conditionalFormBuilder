import { useEffect, useRef, useState } from "react";
import type { Tag } from "./types";
import {
  OPERATOR_OPTIONS,
  CONDITION_OPTIONS,
  CONDITIONAL_OPTIONS,
  VALUE_SUGGESTIONS,
  parseValueList,
  serializeValueList,
} from "./types";

interface TagPillProps {
  tag: Tag;
  autoOpen?: boolean;
  /** When this tag sits on a row whose Field is the special "input"
   *  option, the Value pill switches to plain-text input mode — a
   *  single-line freeform text field instead of the suggestion
   *  dropdown. Only meaningful for `value` tags. */
  fieldValue?: string;
  onChange: (value: string) => void;
}

/* Display labels for an empty tag. The copy diverges from the internal
 * type names — see nextCtaLabel in types.ts for the mapping. */
const TYPE_LABEL: Record<Tag["type"], string> = {
  operator: "Connector",
  condition: "Field",
  conditional: "Operator",
  value: "Value",
};

/** A single inline tag pill. Click to open a dropdown of options for
 *  the tag's type. Operator / Condition / Conditional are pick-only
 *  single-select. Value is multi-select: suggestions toggle in and
 *  out, and Enter in the text input appends a custom value. */
export function TagPill({ tag, autoOpen, fieldValue, onChange }: TagPillProps) {
  const [open, setOpen] = useState(!!autoOpen);
  const [draft, setDraft] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isValue = tag.type === "value";
  const isInputMode = isValue && fieldValue === "input";

  useEffect(() => {
    if (!open) return;
    if (isValue) inputRef.current?.focus();
    /* Input mode seeds the draft with the tag's current value so the
     * user can edit in place; other modes keep draft as the "new
     * value being composed" scratch buffer. */
    if (isInputMode) setDraft(tag.value);
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        if (isInputMode) {
          const v = draft.trim();
          if (v !== tag.value) onChange(v);
        }
        setOpen(false);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isValue, isInputMode, draft, tag.value, onChange]);

  const options =
    tag.type === "operator"
      ? OPERATOR_OPTIONS
      : tag.type === "condition"
      ? CONDITION_OPTIONS
      : tag.type === "conditional"
      ? CONDITIONAL_OPTIONS
      : VALUE_SUGGESTIONS;

  /* Single-select — commits and closes. Used for the three
   * pick-only tag types. */
  const pickSingle = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  /* Multi-select — toggles `v` in the tag's comma-separated value
   * and keeps the dropdown open so the user can pick more. */
  const toggleValue = (v: string) => {
    const list = parseValueList(tag.value);
    const has = list.includes(v);
    const next = has ? list.filter((x) => x !== v) : [...list, v];
    onChange(serializeValueList(next));
  };

  const commitDraft = () => {
    const v = draft.trim();
    if (!v) return;
    const list = parseValueList(tag.value);
    if (!list.includes(v)) onChange(serializeValueList([...list, v]));
    setDraft("");
  };

  const selectedValues = isValue ? parseValueList(tag.value) : [];
  const display = tag.value || TYPE_LABEL[tag.type];

  return (
    <div className="tagpill-wrap" ref={wrapRef} data-type={tag.type}>
      <button
        type="button"
        className={`tagpill ${tag.value ? "" : "is-empty"}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="tagpill-label">{display}</span>
      </button>

      {open ? (
        <div className="tagpill-menu" role={isValue ? "group" : "listbox"}>
          {isInputMode ? (
            /* Input-mode Value pill — a single-line freeform input
             * seeded with the current value. Enter commits and
             * closes; clicking outside also commits. */
            <input
              ref={inputRef}
              className="tagpill-input"
              value={draft}
              placeholder="Type a value"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const v = draft.trim();
                  if (v !== tag.value) onChange(v);
                  setOpen(false);
                }
              }}
              aria-label="Value"
              spellCheck={false}
            />
          ) : isValue ? (
            <>
              {selectedValues.length > 0 ? (
                <div className="tagpill-chips">
                  {selectedValues.map((v) => (
                    <span key={v} className="tagpill-chip">
                      {v}
                      <button
                        type="button"
                        className="tagpill-chip-x"
                        aria-label={`Remove ${v}`}
                        onClick={() => toggleValue(v)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              <input
                ref={inputRef}
                className="tagpill-input"
                value={draft}
                placeholder="Type any value and press Enter"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitDraft();
                  }
                }}
                aria-label="Value"
                spellCheck={false}
              />
            </>
          ) : null}
          {isInputMode ? null : (
          <div className="tagpill-options">
            {options.map((o) => {
              const selected = isValue
                ? selectedValues.includes(o)
                : o === tag.value;
              return (
                <button
                  key={o}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`tagpill-option ${selected ? "is-selected" : ""}`}
                  onClick={() =>
                    isValue ? toggleValue(o) : pickSingle(o)
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
          )}
        </div>
      ) : null}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import type { Tag } from "./types";
import {
  OPERATOR_OPTIONS,
  CONDITION_OPTIONS,
  CONDITIONAL_OPTIONS,
  VALUE_SUGGESTIONS,
} from "./types";

interface TagPillProps {
  tag: Tag;
  autoOpen?: boolean;
  onChange: (value: string) => void;
}

const TYPE_LABEL: Record<Tag["type"], string> = {
  operator: "Operator",
  condition: "Condition",
  conditional: "Conditional",
  value: "Value",
};

/** A single inline tag pill. Click to open a dropdown of options for
 *  the tag's type (operator and conditional dropdowns are picklists;
 *  the value dropdown is a freeform text input with suggestions). */
export function TagPill({ tag, autoOpen, onChange }: TagPillProps) {
  const [open, setOpen] = useState(!!autoOpen);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (tag.type === "value") {
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
  }, [open, tag.type]);

  const options =
    tag.type === "operator"
      ? OPERATOR_OPTIONS
      : tag.type === "condition"
      ? CONDITION_OPTIONS
      : tag.type === "conditional"
      ? CONDITIONAL_OPTIONS
      : VALUE_SUGGESTIONS;

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

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
        <div className="tagpill-menu" role="listbox">
          {tag.type === "value" ? (
            <input
              ref={inputRef}
              className="tagpill-input"
              value={tag.value}
              placeholder="Type any value"
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setOpen(false);
              }}
              aria-label="Value"
              spellCheck={false}
            />
          ) : null}
          <div className="tagpill-options">
            {options.map((o) => {
              const selected = o === tag.value;
              return (
                <button
                  key={o}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`tagpill-option ${selected ? "is-selected" : ""}`}
                  onClick={() => pick(o)}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

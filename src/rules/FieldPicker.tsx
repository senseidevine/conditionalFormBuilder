import { useState } from "react";
import {
  BASE_FIELD_OPTIONS,
  CONDITION_OPTIONS,
  COMPUTED_FIELDS,
  formatComputedField,
  parseComputedField,
  type ComputedField,
} from "./types";

/** Menu content for picking a Field, including computed-field
 *  functions like coalesce(...). Rendered inside an already-open
 *  dropdown (rules-add-menu or tagpill-menu) — the caller owns the
 *  open state and the click-outside handling.
 *
 *  A base field commits immediately. A computed field opens a
 *  second-mode arg picker that lets the user pick each argument
 *  from BASE_FIELD_OPTIONS, then commits the composed value like
 *  `coalesce(String, Number)` when the user hits Done. Re-opening
 *  an existing computed field jumps straight to arg-mode so the
 *  user can edit its args. */
export function FieldPickerMenu({
  current,
  onCommit,
}: {
  /** The tag's current value — a bare base name, a computed
   *  expression, or an empty string for the CTA case. */
  current: string;
  onCommit: (value: string) => void;
}) {
  const parsed = current ? parseComputedField(current) : null;
  const [mode, setMode] = useState<"pick" | "args">(parsed ? "args" : "pick");
  const [fn, setFn] = useState<ComputedField | null>(parsed?.fn ?? null);
  const [args, setArgs] = useState<string[]>(parsed?.args ?? []);

  if (mode === "pick") {
    return (
      <div className="rules-field-picker">
        <div className="rules-field-picker-options">
          {CONDITION_OPTIONS.map((o) => {
            const selected = o === current;
            return (
              <button
                key={o}
                type="button"
                role="option"
                aria-selected={selected}
                className={`rules-add-option ${selected ? "is-selected" : ""}`}
                onClick={() => onCommit(o)}
              >
                {o}
              </button>
            );
          })}
        </div>
        <div className="rules-field-picker-section">Computed</div>
        <div className="rules-field-picker-options">
          {COMPUTED_FIELDS.map((cf) => (
            <button
              key={cf.name}
              type="button"
              className="rules-add-option rules-add-option-computed"
              onClick={() => {
                setFn(cf);
                setArgs(new Array(cf.minArgs).fill(BASE_FIELD_OPTIONS[0]));
                setMode("args");
              }}
            >
              <span>{cf.label}</span>
              <span className="rules-field-picker-chevron" aria-hidden>
                ›
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!fn) return null;
  const canDone = args.length >= fn.minArgs && args.every((a) => a);
  return (
    <div className="rules-field-picker">
      <div className="rules-field-picker-func-header">
        <button
          type="button"
          className="rules-field-picker-back"
          onClick={() => setMode("pick")}
          aria-label="Back"
        >
          ‹
        </button>
        <span className="rules-field-picker-func-name">{fn.name}</span>
      </div>
      <div className="rules-field-picker-args">
        {args.map((arg, i) => (
          <div className="rules-field-picker-arg" key={i}>
            <span className="rules-field-picker-arg-label">arg {i + 1}</span>
            <select
              className="rules-field-picker-arg-select"
              value={arg}
              onChange={(e) =>
                setArgs((as) =>
                  as.map((x, j) => (j === i ? e.target.value : x))
                )
              }
              aria-label={`Argument ${i + 1}`}
            >
              {BASE_FIELD_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            {args.length > fn.minArgs ? (
              <button
                type="button"
                className="rules-field-picker-arg-remove"
                aria-label={`Remove argument ${i + 1}`}
                onClick={() =>
                  setArgs((as) => as.filter((_, j) => j !== i))
                }
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
        {args.length < fn.maxArgs ? (
          <button
            type="button"
            className="rules-field-picker-add-arg"
            onClick={() =>
              setArgs((as) => [...as, BASE_FIELD_OPTIONS[0]])
            }
          >
            + arg
          </button>
        ) : null}
      </div>
      <button
        type="button"
        className="rules-add-done"
        disabled={!canDone}
        onClick={() => onCommit(formatComputedField(fn.name, args))}
      >
        Done
      </button>
    </div>
  );
}

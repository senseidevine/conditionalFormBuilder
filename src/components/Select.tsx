import { useEffect, useRef, useState } from "react";
import { IconChevronDown } from "./Icons";
import "./Select.css";

interface SelectProps {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  options?: string[];
}

export function Select({ value, placeholder, onChange, options = [] }: SelectProps) {
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

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="select" ref={wrapRef}>
      <button
        type="button"
        className="select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={placeholder}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`select-value ${value ? "" : "is-placeholder"}`}>
          {value || placeholder}
        </span>
        <IconChevronDown
          className={`select-chevron ${open ? "is-open" : ""}`}
        />
      </button>

      {open ? (
        <div className="select-menu" role="listbox">
          {options.map((o) => {
            const selected = o === value;
            return (
              <button
                key={o}
                type="button"
                role="option"
                aria-selected={selected}
                className={`select-option ${selected ? "is-selected" : ""}`}
                onClick={() => pick(o)}
              >
                {o}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

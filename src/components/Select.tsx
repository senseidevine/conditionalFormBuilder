import { IconChevronDown } from "./Icons";
import "./Select.css";

interface SelectProps {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  options?: string[];
}

export function Select({ value, placeholder, onChange, options = [] }: SelectProps) {
  const hasValue = Boolean(value);
  return (
    <label className={`select ${hasValue ? "is-filled" : ""}`}>
      <span className="select-label">{placeholder}</span>
      <span className="select-value" aria-hidden={!hasValue}>
        {value || " "}
      </span>
      <IconChevronDown className="select-chevron" />
      <select
        className="select-native"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

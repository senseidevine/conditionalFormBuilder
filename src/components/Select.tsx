import { IconChevronDown } from "./Icons";
import "./Select.css";

interface SelectProps {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  options?: string[];
}

export function Select({ value, placeholder, onChange, options = [] }: SelectProps) {
  return (
    <label className="select">
      <span className={`select-value ${value ? "" : "is-placeholder"}`}>
        {value || placeholder}
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

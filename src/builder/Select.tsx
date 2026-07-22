import { IconChevronDown } from "./Icons";
import "./Select.css";

interface SelectProps {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  options?: string[];
}

/** A dropdown-styled input. Uses a native <select> so we get free a11y
 *  and keyboard support without wiring a popover. */
export function Select({
  value,
  placeholder,
  onChange,
  options = [],
}: SelectProps) {
  return (
    <label className="cfb-select">
      <span className={`cfb-select-value ${value ? "" : "cfb-select-value--placeholder"}`}>
        {value || placeholder}
      </span>
      <IconChevronDown className="cfb-select-chevron" />
      <select
        className="cfb-select-native"
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

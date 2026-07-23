import "./Switch.css";

interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}

export function Switch({ checked, onChange, ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className="sw"
      data-on={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="sw-thumb" />
    </button>
  );
}

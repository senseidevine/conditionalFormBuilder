import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import "./IconButton.css";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  ariaLabel: string;
  shortcut?: string;
  tooltip?: ReactNode;
}

export function IconButton({
  icon,
  ariaLabel,
  shortcut,
  tooltip,
  className = "",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      data-shortcut={shortcut}
      className={`rui-iconbtn ${className}`}
      {...rest}
    >
      <span data-rui="state-layer" className="rui-state-layer" />
      <span className="rui-iconbtn-stack">
        <Icon name={icon} size={20} />
        {tooltip ? <span className="rui-tooltip">{tooltip}</span> : null}
      </span>
    </button>
  );
}

import type { ReactNode } from "react";
import { IconGroup, IconPlus, IconReturn, IconClose } from "./Icons";
import "./Buttons.css";

interface ActionButtonProps {
  icon: "return" | "group" | "plus";
  children: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

const iconMap = {
  return: <IconReturn />,
  group: <IconGroup />,
  plus: <IconPlus />,
};

export function ActionPill({ icon, children, onClick, ariaLabel }: ActionButtonProps) {
  return (
    <button
      type="button"
      className="cfb-action-pill"
      onClick={onClick}
      aria-label={ariaLabel ?? (typeof children === "string" ? children : undefined)}
    >
      <span className="cfb-action-pill-icon">{iconMap[icon]}</span>
      <span>{children}</span>
    </button>
  );
}

interface AddPropertyProps {
  onClick?: () => void;
}

export function AddPropertyButton({ onClick }: AddPropertyProps) {
  return (
    <button type="button" className="cfb-add-property" onClick={onClick}>
      <IconPlus />
      <span>Property</span>
    </button>
  );
}

interface RemoveButtonProps {
  onClick?: () => void;
  ariaLabel?: string;
}

export function RemoveButton({ onClick, ariaLabel = "Remove" }: RemoveButtonProps) {
  return (
    <button
      type="button"
      className="cfb-remove-btn"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <IconClose />
    </button>
  );
}

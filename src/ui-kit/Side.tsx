import type { ReactNode } from "react";
import { Icon } from "./Icon";
import "./Side.css";

export interface SideProps {
  open: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

export function Side({ open, onClose, children }: SideProps) {
  return (
    <div className={`rv-side ${open ? "rv-side--open" : ""}`} aria-hidden={!open}>
      {children ?? (
        <Header>
          <Header.CloseButton onClose={onClose} />
        </Header>
      )}
    </div>
  );
}

export interface HeaderProps {
  children?: ReactNode;
}
export function Header({ children }: HeaderProps) {
  return <div className="rv-side-header">{children}</div>;
}

function CloseButton({ onClose }: { onClose?: () => void }) {
  return (
    <button
      className="rv-side-close"
      aria-label="Close"
      onClick={onClose}
      type="button"
    >
      <Icon name="Close" size={20} />
    </button>
  );
}

Header.CloseButton = CloseButton;

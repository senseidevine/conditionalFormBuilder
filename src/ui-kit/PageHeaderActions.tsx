import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import "./PageHeaderActions.css";

interface IconButtonProps {
  useIcon: string;
  children?: ReactNode;
  onClick?: () => void;
}

function IconButton({ useIcon, children, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      className="rv-pha-item"
      aria-label={typeof children === "string" ? children : undefined}
      onClick={onClick}
    >
      <span className="rv-pha-icon">
        <Icon name={useIcon} size={18} />
      </span>
      {children ? <span className="rv-pha-label">{children}</span> : null}
    </button>
  );
}

function Separator() {
  return <span className="rv-pha-sep" aria-hidden />;
}

interface PageHeaderActionsProps {
  children: ReactNode;
}

export function PageHeaderActions({ children }: PageHeaderActionsProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 720px)");
    const update = () => setCollapsed(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  if (collapsed) {
    return (
      <div className="rv-pha" ref={ref}>
        <button
          type="button"
          className="rv-pha-item rv-pha-item--menu"
          aria-label="Actions"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="rv-pha-icon">
            <Icon name="More" size={18} />
          </span>
        </button>
        {menuOpen ? (
          <div className="rv-pha-menu" role="menu">
            {children}
          </div>
        ) : null}
      </div>
    );
  }

  return <div className="rv-pha rv-pha--inline">{children}</div>;
}

PageHeaderActions.IconButton = IconButton;
PageHeaderActions.Separator = Separator;

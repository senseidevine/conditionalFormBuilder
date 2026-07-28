import { useEffect, useState, type ReactNode } from "react";
import "./Slot.css";

interface SlotProps {
  children: ReactNode;
  className?: string;
  leaving?: boolean;
}

/** A wrapper that animates its child in on mount and out when `leaving`
 *  flips to true. Uses grid-template-rows 1fr↔0fr + opacity so the
 *  surrounding layout smoothly collapses the row instead of snapping. */
export function Slot({ children, className, leaving }: SlotProps) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div
      className={`slot ${entered ? "is-entered" : ""} ${
        leaving ? "is-leaving" : ""
      } ${className ?? ""}`}
    >
      <div className="slot-inner">{children}</div>
    </div>
  );
}

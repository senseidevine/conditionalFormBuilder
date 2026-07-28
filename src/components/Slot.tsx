import { useEffect, useRef, useState, type ReactNode } from "react";
import "./Slot.css";

interface SlotProps {
  children: ReactNode;
  className?: string;
  leaving?: boolean;
}

const ANIM_MS = 200;

/** A wrapper that animates its child in on mount and out when `leaving`
 *  flips to true. Uses a JS-measured explicit height so the row's
 *  actual pixel height transitions to/from 0 — meaning surrounding
 *  layout (e.g. sibling bracket columns) follows the collapse smoothly
 *  instead of snapping at unmount. */
export function Slot({ children, className, leaving }: SlotProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [height, setHeight] = useState<number | "auto">(0);

  useEffect(() => {
    if (!innerRef.current) return;
    const measured = innerRef.current.offsetHeight;
    const raf = requestAnimationFrame(() => {
      setEntered(true);
      setHeight(measured);
    });
    const settle = window.setTimeout(() => setHeight("auto"), ANIM_MS + 40);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
  }, []);

  useEffect(() => {
    if (!leaving || !innerRef.current) return;
    const measured = innerRef.current.offsetHeight;
    setHeight(measured);
    const raf = requestAnimationFrame(() => setHeight(0));
    return () => cancelAnimationFrame(raf);
  }, [leaving]);

  return (
    <div
      className={`slot ${entered ? "is-entered" : ""} ${
        leaving ? "is-leaving" : ""
      } ${className ?? ""}`}
      style={{ height: height === "auto" ? "auto" : `${height}px` }}
    >
      <div className="slot-inner" ref={innerRef}>
        {children}
      </div>
    </div>
  );
}

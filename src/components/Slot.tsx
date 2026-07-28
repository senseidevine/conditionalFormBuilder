import { useEffect, useRef, useState, type ReactNode } from "react";
import "./Slot.css";

interface SlotProps {
  children: ReactNode;
  className?: string;
  leaving?: boolean;
}

/** Wraps a child so its enter/leave transitions to and from height 0
 *  smoothly, taking the child's actual pixel height. The transition
 *  durations key off the page-level `--anim-dur` CSS variable, so the
 *  Smooth animations toggle can flip everything to instant with no
 *  component logic change. */
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
    /* After the enter transition settles, drop back to auto so later
     * content changes inside the row aren't clipped by the fixed
     * pixel height we set for the animation. */
    const settle = window.setTimeout(() => setHeight("auto"), 260);
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

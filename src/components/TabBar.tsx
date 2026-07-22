import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import "./TabBar.css";

interface Ctx {
  value: string;
  onChange: (v: string) => void;
}
const TabCtx = createContext<Ctx | null>(null);

interface TabBarProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  variant?: "navigation" | "underline";
  children: ReactNode;
}

export function TabBar({
  defaultValue,
  value,
  onValueChange,
  variant = "navigation",
  children,
}: TabBarProps) {
  const first = (() => {
    const arr = Children.toArray(children).filter(isValidElement) as ReactElement<{ to: string }>[];
    return arr[0]?.props?.to ?? "";
  })();
  const [internal, setInternal] = useState<string>(defaultValue ?? first);
  const current = value ?? internal;

  return (
    <TabCtx.Provider
      value={{
        value: current,
        onChange: (v) => {
          setInternal(v);
          onValueChange?.(v);
        },
      }}
    >
      <div
        role="tablist"
        data-variant={variant}
        data-behaviour="auto"
        aria-orientation="horizontal"
        className="rui-tabbar"
      >
        {Children.map(children, (c) =>
          isValidElement(c) ? cloneElement(c) : c
        )}
      </div>
    </TabCtx.Provider>
  );
}

interface TabBarItemProps {
  to: string;
  children: ReactNode;
}

function TabBarItem({ to, children }: TabBarItemProps) {
  const ctx = useContext(TabCtx);
  const active = ctx?.value === to;
  return (
    <button
      role="tab"
      aria-selected={active}
      className={`rui-tab ${active ? "rui-tab--active" : ""}`}
      onClick={() => ctx?.onChange(to)}
      type="button"
    >
      <span data-rui="state-layer" className="rui-state-layer" />
      {children}
    </button>
  );
}

TabBar.Item = TabBarItem;

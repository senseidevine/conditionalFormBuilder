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

export interface TabBarProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
}

export function TabBar({
  defaultValue,
  value,
  onValueChange,
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
      <div role="tablist" className="rv-tabbar">
        {Children.map(children, (c) =>
          isValidElement(c) ? cloneElement(c) : c
        )}
      </div>
    </TabCtx.Provider>
  );
}

export interface TabBarItemProps {
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
      className={`rv-tab ${active ? "rv-tab--active" : ""}`}
      onClick={() => ctx?.onChange(to)}
      type="button"
    >
      {children}
    </button>
  );
}

TabBar.Item = TabBarItem;

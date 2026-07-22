import type { CSSProperties, ElementType, ReactNode } from "react";

type Space =
  | "sp100"
  | "sp150"
  | "sp200"
  | "sp300"
  | "sp400"
  | "sp500"
  | "sp600"
  | "sp700"
  | "sp800"
  | "sp900";

const spaceVar = (v?: Space | number | string) => {
  if (v == null) return undefined;
  if (typeof v === "number") return `${v}px`;
  if (typeof v === "string" && v.startsWith("sp"))
    return `var(--rv-${v.replace("sp", "sp-")})`;
  return v;
};

const bgVar = (v?: string) => {
  if (!v) return undefined;
  if (v.startsWith("grey-tone-")) return `var(--rv-${v})`;
  if (v === "canvas-light" || v === "canvas-dark") return `var(--rv-${v})`;
  return v;
};

const radiusVar = (v?: string) => {
  if (!v) return undefined;
  if (v === "widget") return "var(--rv-radius-widget)";
  if (v === "pill") return "var(--rv-radius-pill)";
  if (v === "md") return "var(--rv-radius-md)";
  return v;
};

export interface BoxProps {
  as?: ElementType;
  children?: ReactNode;
  bg?: string;
  borderRadius?: string;
  width?: number | string;
  height?: number | string;
  p?: Space | number | string;
  px?: Space | number | string;
  py?: Space | number | string;
  m?: Space | number | string;
  mt?: Space | number | string;
  mb?: Space | number | string;
  style?: CSSProperties;
  className?: string;
}

export function Box({
  as: Tag = "div",
  children,
  bg,
  borderRadius,
  width,
  height,
  p,
  px,
  py,
  m,
  mt,
  mb,
  style,
  className,
}: BoxProps) {
  const s: CSSProperties = {
    background: bgVar(bg),
    borderRadius: radiusVar(borderRadius),
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    padding: spaceVar(p),
    paddingInline: spaceVar(px),
    paddingBlock: spaceVar(py),
    margin: spaceVar(m),
    marginTop: spaceVar(mt),
    marginBottom: spaceVar(mb),
    ...style,
  };
  return (
    <Tag className={className} style={s}>
      {children}
    </Tag>
  );
}

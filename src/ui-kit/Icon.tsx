import type { CSSProperties } from "react";

type IconName =
  | "Plus"
  | "Statement"
  | "Pencil"
  | "Chat"
  | "ListBullet"
  | "BulkSelection"
  | "RadiobuttonOff"
  | "Close"
  | "ArrowLeft"
  | "More";

const paths: Record<IconName, string> = {
  Plus: "M12 5v14M5 12h14",
  Statement:
    "M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5M8 12h8M8 16h5",
  Pencil:
    "M4 20h4L20 8l-4-4L4 16zM14 6l4 4",
  Chat: "M4 5h16v10H8l-4 4z",
  ListBullet: "M8 6h13M8 12h13M8 18h13M4 6h.01M4 12h.01M4 18h.01",
  BulkSelection: "M9 11l3 3 8-8M4 7l3 3 8-8M4 15l3 3 8-8",
  RadiobuttonOff: "M12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16z",
  Close: "M6 6l12 12M18 6L6 18",
  ArrowLeft: "M15 6l-6 6 6 6",
  More: "M6 12h.01M12 12h.01M18 12h.01",
};

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 20, color = "currentColor", style }: IconProps) {
  const cleaned = name.replace(/^\d+\//, "") as IconName;
  const d = paths[cleaned] ?? paths.RadiobuttonOff;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={d} />
    </svg>
  );
}

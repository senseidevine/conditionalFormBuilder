import type { CSSProperties } from "react";

/* Inline SVGs mirroring the Revolut icon shapes referenced in the DOM
 * (assets.revolut.com/assets/icons/*.svg). Drawn from scratch since the CDN
 * is not reachable from this session. */

export type IconName =
  | "Home"
  | "ArrowRightLeft"
  | "Profile"
  | "Document"
  | "Search"
  | "Bell"
  | "AvatarGrid"
  | "ChevronDown"
  | "SidePanelLeft"
  | "Cross"
  | "Plus";

const paths: Record<IconName, string> = {
  Home: "M3 11.2 12 4l9 7.2V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  ArrowRightLeft: "M4 9h13m0 0-3-3m3 3-3 3M20 15H7m0 0 3 3m-3-3 3-3",
  Profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  Document:
    "M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm8 0v5h5M8 12h8M8 16h5",
  Search: "M10 4a6 6 0 1 0 3.9 10.6L20 20l-1.4 1.4-6.1-6.1A6 6 0 0 0 10 4Z",
  Bell:
    "M12 4a5 5 0 0 0-5 5v3l-2 3h14l-2-3V9a5 5 0 0 0-5-5Zm-2 15a2 2 0 0 0 4 0",
  AvatarGrid:
    "M6 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm12 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM6 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm12 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM6 16a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm12 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z",
  ChevronDown: "m6 9 6 6 6-6",
  SidePanelLeft:
    "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm5 0v14",
  Cross: "M6 6l12 12M18 6 6 18",
  Plus: "M12 5v14M5 12h14",
};

interface IconProps {
  name: IconName;
  size?: number;
  style?: CSSProperties;
  className?: string;
  "aria-hidden"?: boolean;
}

export function Icon({
  name,
  size = 20,
  style,
  className,
  "aria-hidden": ah = true,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={name === "ArrowRightLeft" || name === "ChevronDown" || name === "Cross" || name === "SidePanelLeft" || name === "Search" || name === "Bell" ? "none" : "currentColor"}
      stroke="currentColor"
      strokeWidth={name === "AvatarGrid" || name === "Profile" ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ah}
      className={className}
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}

/* Small inline GB flag stripe icon */
export function FlagGB({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden>
      <clipPath id="rui-flag-gb-clip">
        <circle cx="30" cy="30" r="30" />
      </clipPath>
      <g clipPath="url(#rui-flag-gb-clip)">
        <rect width="60" height="60" fill="#012169" />
        <path d="M0 0L60 60M60 0L0 60" stroke="#fff" strokeWidth="12" />
        <path
          d="M0 0L60 60M60 0L0 60"
          stroke="#C8102E"
          strokeWidth="6"
          clipPath="polygon(0 0, 50% 0, 0 50%)"
        />
        <path d="M30 0V60M0 30H60" stroke="#fff" strokeWidth="18" />
        <path d="M30 0V60M0 30H60" stroke="#C8102E" strokeWidth="10" />
      </g>
    </svg>
  );
}

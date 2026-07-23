import type { SVGProps } from "react";

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconArrowLeft = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M10 4 6 8l4 4" />
  </svg>
);

export const IconChevronDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="m4 6 4 4 4-4" />
  </svg>
);

export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="m4 8 3 3 5-6" />
  </svg>
);

export const IconCircle = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="6" />
  </svg>
);

/** Dotted / current-step circle */
export const IconCircleDashed = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="6" strokeDasharray="2 2.4" />
  </svg>
);

/** Corner-return arrow — used for "↳ Condition" */
export const IconReturn = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 4v3.5a1.5 1.5 0 0 0 1.5 1.5H12" />
    <path d="m9.5 6.5 2.5 2.5-2.5 2.5" />
  </svg>
);

/** Stacked lines — "≡ Group" */
export const IconGroup = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M3 5h10M3 8h10M3 11h10" />
  </svg>
);

/** The "R" logotype glyph — inline so we don't fetch anything */
export const LogoR = (p: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 32 32"
    width={32}
    height={32}
    aria-hidden
    {...p}
  >
    <rect width="32" height="32" rx="8" fill="#ffffff" />
    <path
      d="M11.4 24V8h6.15c2.1 0 3.7.53 4.8 1.6 1.12 1.05 1.68 2.44 1.68 4.15
         0 1.24-.32 2.32-.95 3.24-.6.9-1.46 1.55-2.58 1.94L24.9 24h-3.72l-4.14-4.68h-3.02V24H11.4z
         m2.62-6.94h3.24c1.1 0 1.95-.28 2.55-.83.6-.55.9-1.31.9-2.28
         0-.96-.3-1.7-.9-2.24-.6-.55-1.44-.82-2.55-.82H14.02v6.17z"
      fill="#0a0b0e"
    />
  </svg>
);

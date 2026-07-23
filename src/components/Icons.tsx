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

/** The "R" logotype — the brand's real mark, inline so nothing external
 *  is fetched. IDs are suffixed with a stable string in case the logo is
 *  ever rendered more than once on a page. */
export const LogoR = (p: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={36}
    height={36}
    viewBox="0 0 36 36"
    fill="none"
    aria-hidden
    {...p}
  >
    <g clipPath="url(#logo-r-clip-outer)">
      <g clipPath="url(#logo-r-clip-inner)">
        <rect
          width="51.5676"
          height="51.5676"
          transform="translate(-7.78369 -7.7832)"
          fill="white"
        />
        <rect
          width="23.8739"
          height="23.8739"
          transform="translate(6.06323 6.06445)"
          fill="white"
          fillOpacity="0.01"
        />
        <path
          d="M14.5799 12.7121H10.6887V28.4463H14.5799V12.7121Z"
          fill="#191C1F"
        />
        <path
          d="M21.0288 19.6607C24.2169 19.5007 26.7825 16.8221 26.7825 13.6118C26.7825 10.273 24.0637 7.55664 20.7216 7.55664H10.6887V10.9169H20.2445C21.757 10.9169 23.0098 12.1051 23.0375 13.5655C23.0513 14.2968 22.7769 14.9869 22.2648 15.5087C21.7524 16.0308 21.0678 16.3184 20.3373 16.3184H16.6148C16.4826 16.3184 16.375 16.4258 16.375 16.558V19.5444C16.375 19.5952 16.3907 19.6438 16.4202 19.6847L22.736 28.4462H27.3593L21.0288 19.6607Z"
          fill="#191C1F"
        />
      </g>
    </g>
    <defs>
      <clipPath id="logo-r-clip-outer">
        <path
          d="M0 12C0 5.37258 5.37258 0 12 0H24C30.6274 0 36 5.37258 36 12V24C36 30.6274 30.6274 36 24 36H12C5.37258 36 0 30.6274 0 24V12Z"
          fill="white"
        />
      </clipPath>
      <clipPath id="logo-r-clip-inner">
        <rect width="36" height="36" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

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

/** Return / enter icon — used for the Condition action. */
export const IconReturn = (p: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 13 13"
    fill="currentColor"
    aria-hidden
    {...p}
  >
    <path d="M0 0.666667V4.1849C0 7.62747 2.79076 10.4182 6.23333 10.4182H7.90755V11.9085C7.90755 12.7854 8.69734 13.0543 9.33139 12.5515L12.3904 10.1314C12.8131 9.80405 12.8131 9.18441 12.3904 8.84535L9.33139 6.43691C8.68621 5.92249 7.90755 6.22647 7.90755 7.06825V8.61823H6.23333C3.78487 8.61823 1.8 6.63336 1.8 4.1849V0.666667C1.8 0.298477 1.50152 0 1.13333 0H0.666667C0.298477 0 0 0.298477 0 0.666667Z" />
  </svg>
);

/** Two stacked filled pills — the Group action icon. */
export const IconGroup = (p: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 10 10"
    fill="currentColor"
    aria-hidden
    {...p}
  >
    <path d="M0 0.866666C0 0.388019 0.38802 0 0.866667 0H9.13334C9.61199 0 10 0.38802 10 0.866667V3.33333C10 3.81198 9.61199 4.2 9.13334 4.2H0.866667C0.388021 4.2 0 3.81198 0 3.33333V0.866666Z" />
    <path d="M0 6.00013C0 5.52148 0.38802 5.13346 0.866667 5.13346H9.13334C9.61199 5.13346 10 5.52148 10 6.00013V8.4668C10 8.94544 9.61199 9.33346 9.13334 9.33346H0.866667C0.388021 9.33346 0 8.94544 0 8.4668V6.00013Z" />
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

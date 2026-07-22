import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Avatar } from "../Avatar";
import { Icon } from "../Icon";
import "./Page.css";

/* ------------------------------------------------------------------ */
/* Variants & tokens                                                  */
/* ------------------------------------------------------------------ */

export const PageVariant = {
  DEFAULT: "default",
  FOCUSED: "focused",
  FOCUSED_WIDE: "focused-wide",
  CONTAINED: "contained",
  SETTINGS: "settings",
  SETTINGS_WIDE: "settings-wide",
  CHAT: "chat",
} as const;
export type PageVariantValue = (typeof PageVariant)[keyof typeof PageVariant];

export const PageMainSize = {
  FULL: "full",
  WIDE: "wide",
  NARROW: "narrow",
} as const;
export type PageMainSizeValue = (typeof PageMainSize)[keyof typeof PageMainSize];

export const PageMainVariant = {
  FULL: "full",
  WIDE: "wide",
  NARROW: "narrow",
  MULTI_PANES: "multi-panes",
} as const;
export type PageMainVariantValue =
  (typeof PageMainVariant)[keyof typeof PageMainVariant];

export const PageSideBehaviour = {
  PUSH: "push",
  COVER: "cover",
} as const;
export type PageSideBehaviourValue =
  (typeof PageSideBehaviour)[keyof typeof PageSideBehaviour];

/* ------------------------------------------------------------------ */
/* Context                                                            */
/* ------------------------------------------------------------------ */

interface PageCtx {
  variant: PageVariantValue;
  sideBehaviour: PageSideBehaviourValue;
  sideOpen: boolean;
  setSideBehaviour: (v: PageSideBehaviourValue) => void;
  setSideOpen: (v: boolean) => void;
  registerMainNode: (node: HTMLElement | null) => void;
  mainNode: HTMLElement | null;
}

const Ctx = createContext<PageCtx | null>(null);
const usePage = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("Page subcomponents must be rendered inside <Page>");
  return v;
};

/* ------------------------------------------------------------------ */
/* Root                                                               */
/* ------------------------------------------------------------------ */

export interface PageRootProps {
  variant?: PageVariantValue;
  children?: ReactNode;
}

function PageRoot({ variant = "default", children }: PageRootProps) {
  const [sideBehaviour, setSideBehaviour] =
    useState<PageSideBehaviourValue>("push");
  const [sideOpen, setSideOpen] = useState(false);
  const [mainNode, setMainNode] = useState<HTMLElement | null>(null);

  const value = useMemo<PageCtx>(
    () => ({
      variant,
      sideBehaviour,
      sideOpen,
      setSideBehaviour,
      setSideOpen,
      registerMainNode: setMainNode,
      mainNode,
    }),
    [variant, sideBehaviour, sideOpen, mainNode]
  );

  return (
    <Ctx.Provider value={value}>
      <div
        className={`rv-page rv-page--${variant} ${
          sideOpen && sideBehaviour === "push" ? "rv-page--side-push" : ""
        } ${sideOpen && sideBehaviour === "cover" ? "rv-page--side-cover" : ""}`}
        data-variant={variant}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                             */
/* ------------------------------------------------------------------ */

export interface PageHeaderProps {
  children?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  placeholder?: ReactNode;
  avatar?: ReactNode;
  loading?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  labelButtonBack?: ReactNode;
  labelButtonClose?: ReactNode;
}

function PageHeader({
  children,
  subtitle,
  description,
  meta,
  actions,
  placeholder,
  avatar,
  loading,
  onBack,
  onClose,
  labelButtonBack = "Back",
  labelButtonClose = "Close",
}: PageHeaderProps) {
  const { variant } = usePage();
  const secondary = Boolean(onBack || onClose);
  const large =
    variant === "focused" ||
    variant === "focused-wide" ||
    variant === "settings" ||
    variant === "settings-wide";

  return (
    <header
      className={`rv-header ${secondary ? "rv-header--secondary" : ""} ${
        large ? "rv-header--large" : ""
      }`}
    >
      <div className="rv-header-nav">
        {onBack ? (
          <button
            type="button"
            className="rv-header-navbtn"
            onClick={onBack}
            aria-label={typeof labelButtonBack === "string" ? labelButtonBack : "Back"}
          >
            <Icon name="ArrowLeft" size={20} />
            <span>{labelButtonBack}</span>
          </button>
        ) : null}
        {onClose ? (
          <button
            type="button"
            className="rv-header-navbtn"
            onClick={onClose}
            aria-label={typeof labelButtonClose === "string" ? labelButtonClose : "Close"}
          >
            <Icon name="Close" size={20} />
            <span>{labelButtonClose}</span>
          </button>
        ) : null}
        <div className="rv-header-spacer" />
        {actions ? <div className="rv-header-actions">{actions}</div> : null}
      </div>

      <div className={`rv-header-body ${avatar ? "rv-header-body--profile" : ""}`}>
        {avatar ? <div className="rv-header-avatar">{avatar}</div> : null}
        <div className="rv-header-text">
          {subtitle !== undefined ? (
            <div className="rv-header-subtitle">
              {loading || subtitle === null ? (
                <span className="rv-skel rv-skel--sm" />
              ) : (
                subtitle
              )}
            </div>
          ) : null}

          {loading ? (
            <h1 className="rv-header-title">
              <span className="rv-skel rv-skel--lg" />
            </h1>
          ) : children ? (
            <h1 className="rv-header-title">{children}</h1>
          ) : null}

          {description !== undefined ? (
            <div className="rv-header-desc">
              {loading || description === null ? (
                <span className="rv-skel rv-skel--md" />
              ) : (
                description
              )}
            </div>
          ) : null}

          {placeholder ? (
            <div className="rv-header-placeholder">{placeholder}</div>
          ) : null}
        </div>
      </div>

      {meta ? <div className="rv-header-meta">{meta}</div> : null}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* CompactHeader                                                      */
/* ------------------------------------------------------------------ */

export interface PageCompactHeaderProps {
  children?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  loading?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  labelButtonBack?: ReactNode;
  labelButtonClose?: ReactNode;
}

function PageCompactHeader({
  children,
  description,
  actions,
  loading,
  onBack,
  onClose,
  labelButtonBack = "Back",
  labelButtonClose = "Close",
}: PageCompactHeaderProps) {
  const { variant } = usePage();
  if (variant !== "focused" && variant !== "focused-wide") {
    if (typeof console !== "undefined") {
      console.warn(
        `Page.CompactHeader is only supported when Page variant is "focused" or "focused-wide" (got "${variant}").`
      );
    }
    return null;
  }
  return (
    <header className="rv-cheader">
      <div className="rv-cheader-lead">
        {onBack ? (
          <button
            type="button"
            className="rv-cheader-navbtn"
            onClick={onBack}
            aria-label={typeof labelButtonBack === "string" ? labelButtonBack : "Back"}
          >
            <Icon name="ArrowLeft" size={18} />
            <span>{labelButtonBack}</span>
          </button>
        ) : null}
        {onClose ? (
          <button
            type="button"
            className="rv-cheader-navbtn"
            onClick={onClose}
            aria-label={typeof labelButtonClose === "string" ? labelButtonClose : "Close"}
          >
            <Icon name="Close" size={18} />
            <span>{labelButtonClose}</span>
          </button>
        ) : null}
      </div>
      <div className="rv-cheader-center">
        {loading ? (
          <span className="rv-skel rv-skel--md" />
        ) : (
          <h1 className="rv-cheader-title">{children}</h1>
        )}
        {description ? <div className="rv-cheader-desc">{description}</div> : null}
      </div>
      <div className="rv-cheader-trail">{actions}</div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs                                                               */
/* ------------------------------------------------------------------ */

function PageTabs({ children }: { children?: ReactNode }) {
  return <div className="rv-page-tabs">{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

export interface PageMainProps {
  size?: PageMainSizeValue;
  variant?: PageMainVariantValue;
  use?: "form" | "div" | "section";
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  children?: ReactNode;
}

const PageMain = forwardRef<HTMLElement, PageMainProps>(function PageMain(
  { size = "full", variant, use, onSubmit, children },
  _ref
) {
  const effectiveVariant = (variant ?? size) as PageMainVariantValue;
  const { registerMainNode } = usePage();
  const isMulti = effectiveVariant === "multi-panes";
  const Tag = (use === "form" ? "form" : use === "section" ? "section" : "main") as
    | "main"
    | "form"
    | "section";

  const props = {
    ref: (n: HTMLElement | null) => registerMainNode(n),
    className: `rv-main rv-main--${effectiveVariant}${isMulti ? "" : ` rv-main--size-${effectiveVariant}`}`,
    onSubmit,
    role: use === "form" ? undefined : "main",
  } as const;

  if (isMulti) return <Tag {...props}>{children}</Tag>;

  return (
    <Tag {...props}>
      <div className="rv-main-inner">{children}</div>
    </Tag>
  );
});

/* ------------------------------------------------------------------ */
/* MainActions                                                        */
/* ------------------------------------------------------------------ */

export interface PageMainActionsProps {
  gradient?: "none" | "low" | "high" | "full";
  children?: ReactNode;
}

function PageMainActions({
  gradient = "low",
  children,
}: PageMainActionsProps) {
  return (
    <div
      className={`rv-main-actions rv-main-actions--grad-${gradient}`}
      role="toolbar"
    >
      <div className="rv-main-actions-inner">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Side                                                               */
/* ------------------------------------------------------------------ */

export interface PageSideProps {
  behaviour?: PageSideBehaviourValue;
  usePortal?: boolean;
  children?: ReactNode;
}

function PageSide({
  behaviour = "cover",
  usePortal: portal,
  children,
}: PageSideProps) {
  const { setSideBehaviour, setSideOpen, mainNode } = usePage();

  useMemo(() => {
    setSideBehaviour(behaviour);
    // Track whether Side is currently open via a data attribute on children;
    // for simplicity, assume presence of Side.open truthiness by inspecting child props.
    return null;
  }, [behaviour, setSideBehaviour]);

  // Best-effort: mark side as open when the first React element child has `open` truthy
  useMemo(() => {
    let anyOpen = false;
    const walk = (node: ReactNode) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) node.forEach(walk);
      else if ("props" in (node as object)) {
        const p = (node as { props?: { open?: boolean; children?: ReactNode } }).props;
        if (p?.open) anyOpen = true;
        if (p?.children) walk(p.children);
      }
    };
    walk(children);
    setSideOpen(anyOpen);
  }, [children, setSideOpen]);

  const content = <div className="rv-page-side">{children}</div>;
  if (portal && mainNode) return createPortal(content, mainNode);
  return content;
}

/* ------------------------------------------------------------------ */
/* Feed                                                               */
/* ------------------------------------------------------------------ */

function PageFeed({ children }: { children?: ReactNode }) {
  return (
    <aside className="rv-page-feed" aria-label="Feed">
      <div className="rv-page-feed-inner">{children}</div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Pane                                                               */
/* ------------------------------------------------------------------ */

export interface PagePaneProps {
  position?: "main" | "leading" | "trailing";
  scrollRef?: React.Ref<HTMLDivElement>;
  header?: ReactNode;
  footer?: ReactNode;
  defaultSize?: number;
  onResize?: (size: number) => void;
  children?: ReactNode;
}

function PagePane({
  position = "main",
  scrollRef,
  header,
  footer,
  defaultSize,
  children,
}: PagePaneProps) {
  const style =
    position !== "main" && defaultSize
      ? ({ flex: `0 0 ${defaultSize}px`, width: defaultSize } as const)
      : undefined;
  return (
    <section
      className={`rv-pane rv-pane--${position}`}
      style={style}
      aria-label={`${position} pane`}
    >
      {header ? <div className="rv-pane-header">{header}</div> : null}
      <div className="rv-pane-scroll" ref={scrollRef}>
        {children}
      </div>
      {footer ? <div className="rv-pane-footer">{footer}</div> : null}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Compose                                                            */
/* ------------------------------------------------------------------ */

export const Page = Object.assign(PageRoot, {
  Header: PageHeader,
  CompactHeader: PageCompactHeader,
  Tabs: PageTabs,
  Main: PageMain,
  MainActions: PageMainActions,
  Side: PageSide,
  Feed: PageFeed,
  Pane: PagePane,
  STICKY_OFFSET: "var(--rv-page-sticky-offset)" as const,
});

export { Avatar };

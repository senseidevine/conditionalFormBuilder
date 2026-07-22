import type { ReactNode } from "react";
import { SideNav } from "./SideNav";
import { TopNav } from "./TopNav";
import { TabBar } from "./TabBar";
import { Icon } from "./Icon";
import "./Page.css";

/* Mirrors the outer DOM from the Revolut docs canvas — Backoffice chrome
 * (TopNav + SideNav) wrapping a Page with title, subtitle, description,
 * tabs and main. */

interface PageDemoProps {
  title: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  tabs?: ReactNode;
  children?: ReactNode;
  secondary?: boolean;
  variant?: "full" | "narrow" | "wide";
  onClose?: () => void;
}

export function PageDemo({
  title,
  subtitle,
  description,
  tabs,
  children,
  secondary = false,
  variant = "full",
  onClose,
}: PageDemoProps) {
  return (
    <div className="rui-shell">
      <TopNav />
      <div className="rui-shell-body">
        <SideNav />
        <div
          className="rui-page"
          data-rui="page"
          data-is-secondary={String(secondary)}
          style={
            {
              ["--rui-page-nav-width" as string]: "294.5px",
              ["--rui-page-header-meta-height" as string]: "47.484375px",
              ["--rui-page-tabs-height" as string]: "44px",
            } as React.CSSProperties
          }
        >
          <span className="rui-page-title-wrap">
            <span className="rui-page-title-row">
              <h1 className="rui-page-title">
                <span className="rui-ellipsis">{title}</span>
              </h1>
            </span>
          </span>

          <div className="rui-page-headmeta">
            {subtitle ? (
              <div className="rui-page-subtitle-wrap">
                <span className="rui-page-subtitle">{subtitle}</span>
              </div>
            ) : null}
            {description ? (
              <div className="rui-page-desc-wrap">
                <span className="rui-page-desc">{description}</span>
              </div>
            ) : null}
          </div>

          <div className="rui-page-tabmask" data-mask="page-tabs" />
          <div className="rui-page-tabs-area">
            <div className="rui-page-tabs-inner">
              <div className="rui-page-tabs-scroller">
                {tabs ?? (
                  <TabBar defaultValue="one" variant="navigation">
                    <TabBar.Item to="one">One</TabBar.Item>
                    <TabBar.Item to="two">Two</TabBar.Item>
                  </TabBar>
                )}
              </div>
            </div>
          </div>

          <main className="rui-page-main" data-variant={variant}>
            <div className="rui-page-main-top" />
            <div className="rui-page-main-body">
              <div className="rui-page-toasts" />
              {children}
            </div>
          </main>
        </div>
      </div>

      {onClose ? (
        <div className="rui-close-fab">
          <button
            type="button"
            aria-label="Close demo"
            className="rui-close-fab-btn"
            onClick={onClose}
          >
            <span data-rui="state-layer" className="rui-state-layer" />
            <span className="rui-close-fab-stack">
              <Icon name="Cross" size={20} />
              <span className="rui-tooltip">Close demo</span>
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

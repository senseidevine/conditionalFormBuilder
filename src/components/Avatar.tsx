import type { CSSProperties, ReactNode } from "react";
import "./Avatar.css";

interface AvatarProps {
  glow?: string;
  iconSize?: number;
  size?: number;
  initials?: string;
  imageUrl?: string;
  bg?: string;
  color?: string;
  children?: ReactNode;
  ariaLabel?: string;
}

export function Avatar({
  glow,
  iconSize = 24,
  size = 40,
  initials,
  imageUrl,
  bg,
  color,
  children,
  ariaLabel,
}: AvatarProps) {
  const style: CSSProperties = {
    // Mirror --rui-avatar-* variables seen on the real DOM
    // @ts-expect-error CSS variable
    "--rui-avatar-glow": glow ?? "var(--rui-color-light-blue)",
    "--rui-avatar-icon-size": `${iconSize}px`,
    width: size,
    height: size,
  };
  return (
    <span
      data-rui="avatar"
      data-glow={glow ? "true" : undefined}
      className="rui-avatar"
      style={style}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
    >
      <span className="rui-avatar-mask">
        <span className="rui-avatar-inner">
          <span
            className="rui-avatar-bg"
            style={{ background: bg ?? "var(--rui-color-canvas-alt)" }}
          />
          {imageUrl ? (
            <span
              className="rui-avatar-image"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          ) : initials ? (
            <span
              className="rui-avatar-text"
              style={{ color: color ?? "var(--rui-color-ink)" }}
            >
              {initials}
            </span>
          ) : (
            children
          )}
        </span>
      </span>
    </span>
  );
}

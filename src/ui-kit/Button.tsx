import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";
import "./Button.css";

type Variant = "primary" | "secondary" | "accent" | "bar" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  useIcon?: string;
  elevated?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  useIcon,
  elevated,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`rv-btn rv-btn--${variant} ${
        elevated ? "rv-btn--elevated" : ""
      } ${className}`}
      {...rest}
    >
      {useIcon ? <Icon name={useIcon} size={18} /> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}

export interface ActionButtonProps extends ButtonProps {}

export function ActionButton(props: ActionButtonProps) {
  return <Button variant={props.variant ?? "secondary"} {...props} />;
}

export function Bar({
  children,
  mt,
}: {
  children: ReactNode;
  mt?: string | number;
}) {
  const style =
    typeof mt === "number"
      ? { marginTop: `${mt}px` }
      : typeof mt === "string" && mt.startsWith("sp")
        ? { marginTop: `var(--rv-${mt.replace("sp", "sp-")})` }
        : undefined;
  return (
    <div className="rv-bar" style={style}>
      {children}
    </div>
  );
}

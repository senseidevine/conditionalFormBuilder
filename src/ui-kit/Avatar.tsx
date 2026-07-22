import { Icon } from "./Icon";

export interface AvatarProps {
  useIcon?: string;
  src?: string;
  size?: number;
  label?: string;
}

export function Avatar({ useIcon, src, size = 56, label }: AvatarProps) {
  return (
    <div
      className="rv-avatar"
      style={{
        width: size,
        height: size,
        borderRadius: "var(--rv-radius-pill)",
        background: "var(--rv-grey-tone-10)",
        color: "var(--rv-ink)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontWeight: 600,
      }}
      aria-label={label}
    >
      {src ? (
        <img
          src={src}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Icon name={useIcon ?? "RadiobuttonOff"} size={size * 0.5} />
      )}
    </div>
  );
}

import { Icon, type IconName } from "./Icon";
import { Avatar } from "./Avatar";
import "./SideNav.css";

interface NavItem {
  label: string;
  icon: IconName;
  href: string;
  shortcut: string;
  active?: boolean;
}

const items: NavItem[] = [
  { label: "Home", icon: "Home", href: "#", shortcut: "Alt+1" },
  { label: "Payments", icon: "ArrowRightLeft", href: "#", shortcut: "Alt+2", active: true },
  { label: "Customers", icon: "Profile", href: "#", shortcut: "Alt+3" },
  { label: "Reports", icon: "Document", href: "#", shortcut: "Alt+4" },
];

export function SideNav() {
  return (
    <div className="rui-sidenav-wrap">
      <nav className="rui-sidenav" data-collapsed="true">
        <div className="rui-sidenav-inner">
          <div className="rui-sidenav-top">
            <div className="rui-sidenav-logo">
              <button className="rui-logobtn rui-logobtn--stack" type="button">
                <span data-rui="state-layer" className="rui-state-layer" />
                <Avatar
                  glow="var(--rui-color-light-blue)"
                  size={40}
                  iconSize={36}
                  bg="#e8f4ff"
                >
                  <span className="rui-logo-glyph" aria-hidden />
                </Avatar>
              </button>
            </div>

            <div className="rui-sidenav-scroll" data-scrollbar="custom">
              <div className="rui-sidenav-list">
                {items.map((it) => (
                  <a
                    key={it.label}
                    className={`rui-navitem ${it.active ? "rui-navitem--active" : ""}`}
                    href={it.href}
                    data-shortcut={it.shortcut}
                    aria-current={it.active ? "page" : undefined}
                  >
                    <span data-rui="state-layer" className="rui-state-layer" />
                    <span className="rui-navitem-inner">
                      <span className="rui-navitem-icon">
                        <Icon name={it.icon} size={22} />
                      </span>
                      <span className="rui-navitem-label" data-single-word="true">
                        {it.label}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="rui-sidenav-bottom">
              <button
                type="button"
                className="rui-navitem rui-navitem--utility"
                aria-label="Expand menu"
                data-shortcut="["
              >
                <span data-rui="state-layer" className="rui-state-layer" />
                <span className="rui-navitem-icon">
                  <Icon name="SidePanelLeft" size={20} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

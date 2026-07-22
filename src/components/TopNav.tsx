import { Avatar } from "./Avatar";
import { Icon, FlagGB } from "./Icon";
import { IconButton } from "./IconButton";
import "./TopNav.css";

/* Mirrors the DOM structure ._5hpwdf0 → ._5hpwdf1 + ._5hpwdf2(._5hpwdf3, account switcher, profile) */

export function TopNav() {
  return (
    <header className="rui-topnav">
      <div className="rui-topnav-lead" data-collapsed="true">
        <BackofficeLogo />
      </div>

      <div className="rui-topnav-trail">
        <div className="rui-topnav-iconrow">
          <IconButton
            icon="Search"
            ariaLabel="Open global search"
            shortcut="Mod+K"
            data-rui-part="top-nav-global-search"
            tooltip="Search"
          />
          <IconButton
            icon="Bell"
            ariaLabel="Open notifications"
            shortcut="Alt+N"
            data-rui-part="top-nav-notifications"
          />
          <IconButton
            icon="AvatarGrid"
            ariaLabel="Open app switcher"
            shortcut="Alt+H"
            data-rui-part="top-nav-app-switcher"
            tooltip="Backoffice apps"
          />
        </div>

        <AccountSwitcher />
        <ProfileButton />
      </div>
    </header>
  );
}

function BackofficeLogo() {
  return (
    <button className="rui-logobtn" type="button">
      <span data-rui="state-layer" className="rui-state-layer" />
      <span className="rui-logobtn-inner">
        <Avatar
          glow="var(--rui-color-light-blue)"
          size={36}
          iconSize={36}
          bg="#e8f4ff"
        >
          <span className="rui-logo-glyph" aria-hidden />
        </Avatar>
        <span className="rui-logobtn-label">Backoffice</span>
      </span>
    </button>
  );
}

function AccountSwitcher() {
  return (
    <button
      type="button"
      className="rui-accsw"
      data-rui-part="top-nav-account-switcher"
      data-shortcut="Alt+O"
      data-variant="semantic"
      data-has-avatar="true"
    >
      <span data-rui="state-layer" className="rui-state-layer" />
      <div className="rui-accsw-content">
        <span className="rui-accsw-flag">
          <FlagGB size={24} />
        </span>
        <span className="rui-accsw-lines">
          <span className="rui-accsw-name">Apple Inc</span>
          <span className="rui-accsw-code">GB</span>
        </span>
      </div>
      <span className="rui-accsw-chevron">
        <Icon name="ChevronDown" size={16} />
      </span>
    </button>
  );
}

function ProfileButton() {
  return (
    <button
      type="button"
      aria-label="Open profile"
      data-shortcut="Alt+P"
      className="rui-profilebtn"
    >
      <span data-rui="state-layer" className="rui-state-layer" />
      <Avatar
        glow="rgb(var(--rui-color-channel-accent-neutral) / 0.1)"
        size={32}
        iconSize={24}
        initials="RB"
        ariaLabel="Robert Braileanu"
        bg="linear-gradient(135deg, #d0d4dc, #b6b6bc)"
      />
    </button>
  );
}

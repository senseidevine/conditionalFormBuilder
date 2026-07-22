import { useState } from "react";
import {
  ActionButton,
  Avatar,
  Bar,
  Box,
  Button,
  Page,
  PageHeaderActions,
  PageMainSize,
  PageMainVariant,
  PageSideBehaviour,
  PageVariant,
  Side,
  TabBar,
  type PageMainSizeValue,
  type PageSideBehaviourValue,
  type PageVariantValue,
} from "./ui-kit";
import "./App.css";

type Demo =
  | "default"
  | "focused"
  | "focused-wide"
  | "chat"
  | "profile"
  | "form"
  | "compact"
  | "loading";

export default function App() {
  const [demo, setDemo] = useState<Demo>("default");

  return (
    <div className="rv-app">
      <TopBar demo={demo} onDemo={setDemo} />
      <div className="rv-app-canvas">{renderDemo(demo)}</div>
    </div>
  );
}

function TopBar({
  demo,
  onDemo,
}: {
  demo: Demo;
  onDemo: (d: Demo) => void;
}) {
  const items: { id: Demo; label: string }[] = [
    { id: "default", label: "Default" },
    { id: "focused", label: "Focused" },
    { id: "focused-wide", label: "Focused wide" },
    { id: "chat", label: "Chat / multi-panes" },
    { id: "profile", label: "Profile header" },
    { id: "form", label: "Submit form" },
    { id: "compact", label: "Compact header" },
    { id: "loading", label: "Loading" },
  ];
  return (
    <header className="rv-topnav">
      <div className="rv-topnav-brand">
        <span className="rv-topnav-glyph" aria-hidden />
        <span>Revolut · Page</span>
      </div>
      <nav className="rv-topnav-nav" aria-label="Demos">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`rv-topnav-item ${
              demo === it.id ? "rv-topnav-item--active" : ""
            }`}
            onClick={() => onDemo(it.id)}
          >
            {it.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

function renderDemo(d: Demo) {
  switch (d) {
    case "focused":
      return <FocusedDemo variant="focused" />;
    case "focused-wide":
      return <FocusedDemo variant="focused-wide" />;
    case "chat":
      return <ChatDemo />;
    case "profile":
      return <ProfileDemo />;
    case "form":
      return <FormDemo />;
    case "compact":
      return <CompactDemo />;
    case "loading":
      return <LoadingDemo />;
    default:
      return <DefaultDemo />;
  }
}

function DefaultDemo() {
  const [pageVariant, setPageVariant] = useState<PageVariantValue>(
    PageVariant.DEFAULT
  );
  const [mainSize, setMainSize] = useState<PageMainSizeValue>(PageMainSize.FULL);
  const [sideBehaviour, setSideBehaviour] =
    useState<PageSideBehaviourValue>(PageSideBehaviour.PUSH);
  const [sideOpen, setSideOpen] = useState(false);

  return (
    <Page variant={pageVariant}>
      <Page.Header
        subtitle="GBP account"
        description="Recent payments and balances"
        actions={
          <PageHeaderActions>
            <PageHeaderActions.IconButton
              useIcon="Pencil"
              onClick={() => setSideOpen(true)}
            >
              Edit
            </PageHeaderActions.IconButton>
            <PageHeaderActions.IconButton
              useIcon="Chat"
              onClick={() => setSideOpen(true)}
            >
              Message
            </PageHeaderActions.IconButton>
            <PageHeaderActions.Separator />
            <PageHeaderActions.IconButton
              useIcon="ListBullet"
              onClick={() => setSideOpen(true)}
            >
              Tasks
            </PageHeaderActions.IconButton>
            <PageHeaderActions.IconButton
              useIcon="BulkSelection"
              onClick={() => setSideOpen(true)}
            >
              Select
            </PageHeaderActions.IconButton>
          </PageHeaderActions>
        }
      >
        Payments
      </Page.Header>

      <Page.Tabs>
        <TabBar defaultValue="overview">
          <TabBar.Item to="overview">Overview</TabBar.Item>
          <TabBar.Item to="transactions">Transactions</TabBar.Item>
          <TabBar.Item to="statements">Statements</TabBar.Item>
        </TabBar>
      </Page.Tabs>

      <Page.Main size={mainSize}>
        <Widget>
          <h2>Controls</h2>
          <p className="rv-hint">Tweak how the page composes itself.</p>

          <div className="rv-controls">
            <ControlGroup label="Page variant">
              {Object.values(PageVariant).map((v) => (
                <Toggle
                  key={v}
                  checked={v === pageVariant}
                  onClick={() => setPageVariant(v as PageVariantValue)}
                >
                  {v}
                </Toggle>
              ))}
            </ControlGroup>

            <ControlGroup label="Main size">
              {Object.values(PageMainSize).map((v) => (
                <Toggle
                  key={v}
                  checked={v === mainSize}
                  onClick={() => setMainSize(v as PageMainSizeValue)}
                >
                  {v}
                </Toggle>
              ))}
            </ControlGroup>

            <ControlGroup label="Side">
              <Toggle
                checked={sideOpen}
                onClick={() => setSideOpen((v) => !v)}
              >
                {sideOpen ? "Open" : "Closed"}
              </Toggle>
              {Object.values(PageSideBehaviour).map((v) => (
                <Toggle
                  key={v}
                  checked={v === sideBehaviour}
                  onClick={() =>
                    setSideBehaviour(v as PageSideBehaviourValue)
                  }
                >
                  {v}
                </Toggle>
              ))}
            </ControlGroup>
          </div>
        </Widget>

        <SkeletonWidget height={480} />
        <SkeletonWidget height={640} />
      </Page.Main>

      <Page.Feed>
        <Widget>
          <h3>Feed</h3>
          <p className="rv-hint">Supplementary content scrolls independently.</p>
        </Widget>
        <SkeletonWidget height={280} />
        <SkeletonWidget height={340} />
      </Page.Feed>

      <Page.Side behaviour={sideBehaviour}>
        <Side open={sideOpen} onClose={() => setSideOpen(false)}>
          <div className="rv-side-body">
            <h3>Details</h3>
            <p className="rv-hint">Any panel content goes here.</p>
          </div>
        </Side>
      </Page.Side>
    </Page>
  );
}

function FocusedDemo({ variant }: { variant: PageVariantValue }) {
  return (
    <Page variant={variant}>
      <Page.Header
        subtitle="GBP account"
        description="Recent payments and balances"
        onBack={() => {}}
        actions={
          <Bar>
            <ActionButton variant="primary" useIcon="Plus">
              Add business
            </ActionButton>
            <ActionButton variant="accent" useIcon="Statement">
              Statements
            </ActionButton>
          </Bar>
        }
      >
        Payments
      </Page.Header>
      <Page.Tabs>
        <TabBar defaultValue="one">
          <TabBar.Item to="one">One</TabBar.Item>
          <TabBar.Item to="two">Two</TabBar.Item>
        </TabBar>
      </Page.Tabs>
      <Page.Main>
        <SkeletonWidget height={520} />
        <SkeletonWidget height={640} />
      </Page.Main>
    </Page>
  );
}

function ChatDemo() {
  return (
    <Page variant={PageVariant.CHAT}>
      <Page.Main variant={PageMainVariant.MULTI_PANES}>
        <Page.Pane
          position="leading"
          defaultSize={280}
          header={<PaneHeader title="Inbox" />}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <ChatRow
              key={i}
              name={`Conversation ${i + 1}`}
              preview="Draft message…"
            />
          ))}
        </Page.Pane>
        <Page.Pane header={<PaneHeader title="Alex Adams" subtitle="Online" />}>
          <div className="rv-chat">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`rv-msg ${i % 2 ? "rv-msg--me" : ""}`}
              >
                {i % 2
                  ? "On it — will confirm shortly."
                  : "Hey, can you take a look at the September statement?"}
              </div>
            ))}
          </div>
        </Page.Pane>
        <Page.Pane
          position="trailing"
          defaultSize={320}
          header={<PaneHeader title="Details" />}
        >
          <SkeletonWidget height={220} />
          <SkeletonWidget height={160} />
        </Page.Pane>
      </Page.Main>
    </Page>
  );
}

function ProfileDemo() {
  return (
    <Page>
      <Page.Header
        onBack={() => {}}
        subtitle="Premium customer"
        description="Joined in 2022"
        avatar={<Avatar useIcon="RadiobuttonOff" size={72} />}
        meta={
          <Bar>
            <ActionButton useIcon="Plus">Send</ActionButton>
            <ActionButton useIcon="Chat">Message</ActionButton>
            <ActionButton useIcon="More">More</ActionButton>
          </Bar>
        }
      >
        Alex Adams
      </Page.Header>
      <Page.Tabs>
        <TabBar defaultValue="one">
          <TabBar.Item to="one">Activity</TabBar.Item>
          <TabBar.Item to="two">Statements</TabBar.Item>
        </TabBar>
      </Page.Tabs>
      <Page.Main>
        <SkeletonWidget height={520} />
        <SkeletonWidget height={640} />
      </Page.Main>
    </Page>
  );
}

function FormDemo() {
  const [submitted, setSubmitted] = useState<Record<string, string>>({});
  return (
    <Page>
      <Page.Header onBack={() => {}}>Create report</Page.Header>
      <Page.Main
        size="narrow"
        use="form"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.target as HTMLFormElement);
          setSubmitted(
            Object.fromEntries(data.entries()) as Record<string, string>
          );
        }}
      >
        <h3 className="rv-subhead">Details</h3>
        <div className="rv-inputgroup">
          <Field name="title" label="Report title" />
          <Field name="description" label="Notes" />
        </div>

        <Page.MainActions>
          <Button type="submit" variant="accent" elevated>
            Create
          </Button>
        </Page.MainActions>
      </Page.Main>
      <Page.Feed>
        <Widget>
          <h3>Submission</h3>
          <pre className="rv-pre">
            {JSON.stringify(submitted, null, 2) || "// nothing yet"}
          </pre>
        </Widget>
      </Page.Feed>
    </Page>
  );
}

function CompactDemo() {
  return (
    <Page variant="focused">
      <Page.CompactHeader
        onBack={() => {}}
        labelButtonBack="Back"
        actions={
          <Button variant="bar" useIcon="Plus">
            New
          </Button>
        }
      >
        Title
      </Page.CompactHeader>
      <Page.Tabs>
        <TabBar defaultValue="one">
          <TabBar.Item to="one">One</TabBar.Item>
          <TabBar.Item to="two">Two</TabBar.Item>
        </TabBar>
      </Page.Tabs>
      <Page.Main>
        <SkeletonWidget height={520} />
        <SkeletonWidget height={640} />
      </Page.Main>
    </Page>
  );
}

function LoadingDemo() {
  return (
    <Page>
      <Page.Header
        loading
        onBack={() => {}}
        subtitle={null}
        description="Recent payments and balances"
      />
      <Page.Main>
        <SkeletonWidget height={520} />
      </Page.Main>
    </Page>
  );
}

function Widget({ children }: { children: React.ReactNode }) {
  return <div className="rv-widget">{children}</div>;
}

function SkeletonWidget({ height }: { height: number }) {
  return (
    <Box bg="grey-tone-10" borderRadius="widget" width="100%" height={height} />
  );
}

function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rv-cgroup">
      <span className="rv-cgroup-label">{label}</span>
      <div className="rv-cgroup-row">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onClick,
  children,
}: {
  checked?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`rv-toggle ${checked ? "rv-toggle--on" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function PaneHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="rv-panehead">
      <h4 className="rv-panehead-title">{title}</h4>
      {subtitle ? <span className="rv-panehead-sub">{subtitle}</span> : null}
    </div>
  );
}

function ChatRow({ name, preview }: { name: string; preview: string }) {
  return (
    <div className="rv-chatrow">
      <Avatar useIcon="RadiobuttonOff" size={40} />
      <div className="rv-chatrow-body">
        <div className="rv-chatrow-name">{name}</div>
        <div className="rv-chatrow-preview">{preview}</div>
      </div>
    </div>
  );
}

function Field({ name, label }: { name: string; label: string }) {
  return (
    <label className="rv-field">
      <span className="rv-field-label">{label}</span>
      <input name={name} className="rv-field-input" placeholder=" " />
    </label>
  );
}

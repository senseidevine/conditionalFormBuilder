import { useMemo, useState } from "react";
import { StepRail } from "./components/StepRail";
import { TabStrip, type TabItem } from "./components/TabStrip";
import { IconArrowLeft } from "./components/Icons";
import { Group, type Mutation } from "./builder/Group";
import { T } from "./builder/tree";
import { seedRoot, type GroupNode } from "./builder/types";
import "./App.css";

const SECTIONS: TabItem[] = [
  { id: "general", label: "General" },
  { id: "configuration", label: "Configuration" },
  { id: "recording", label: "Recording" },
  { id: "review", label: "Review" },
];

const RAIL_STEPS = [
  { id: "s1", label: "Label" },
  { id: "s2", label: "Label" },
  { id: "s3", label: "Label" },
  { id: "s4", label: "Label" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("configuration");
  const [completed, setCompleted] = useState<string[]>(["general"]);
  const [tree, setTree] = useState<GroupNode>(() => seedRoot());
  const [swapButtons, setSwapButtons] = useState<boolean>(false);
  const [showLoneBracket, setShowLoneBracket] = useState<boolean>(true);
  const [connectorHover, setConnectorHover] = useState<boolean>(true);
  const [showBrackets, setShowBrackets] = useState<boolean>(true);
  const [nestedBgDark, setNestedBgDark] = useState<boolean>(false);

  const activeIndex = useMemo(
    () => SECTIONS.findIndex((s) => s.id === activeTab),
    [activeTab]
  );
  const isLast = activeIndex === SECTIONS.length - 1;

  const onMutate: (id: string, mut: Mutation, payload?: unknown) => void = (
    id,
    mut,
    payload
  ) => {
    setTree((r) => {
      switch (mut) {
        case "toggle":
          return T.toggleOperator(r, id);
        case "removeChild":
          return T.remove(r, id);
        case "addCondition":
          return T.addCondition(r, id);
        case "addGroup":
          return T.addGroup(r, id, "AND");
        case "setTitle":
          return T.setTitle(r, id, payload as string);
        case "addProperty":
          return T.addProperty(r, id);
        case "setPropertyValue": {
          const p = payload as {
            propertyId: string;
            key: "field" | "cond" | "value";
            val: string;
          };
          return T.setPropertyValue(r, id, p.propertyId, p.key, p.val);
        }
        case "removeProperty": {
          const p = payload as { propertyId: string };
          return T.removeProperty(r, id, p.propertyId);
        }
      }
    });
  };

  const handleContinue = () => {
    if (!completed.includes(activeTab)) setCompleted((c) => [...c, activeTab]);
    const next = SECTIONS[activeIndex + 1];
    if (next) setActiveTab(next.id);
  };

  const handleBack = () => {
    const prev = SECTIONS[activeIndex - 1];
    if (prev) setActiveTab(prev.id);
  };

  return (
    <div className="page">
      <div className="page-glow" aria-hidden />

      <StepRail
        steps={RAIL_STEPS}
        activeId="s1"
        completedIds={[]}
        swapButtons={swapButtons}
        onToggleSwapButtons={setSwapButtons}
        showLoneBracket={showLoneBracket}
        onToggleLoneBracket={setShowLoneBracket}
        connectorHover={connectorHover}
        onToggleConnectorHover={setConnectorHover}
        showBrackets={showBrackets}
        onToggleShowBrackets={setShowBrackets}
        nestedBgDark={nestedBgDark}
        onToggleNestedBgDark={setNestedBgDark}
      />

      <main className="main">
        <div className="main-inner">
          <button
            className="backbtn"
            type="button"
            onClick={handleBack}
            aria-label="Back"
            disabled={activeIndex === 0}
          >
            <IconArrowLeft />
          </button>

          <h1 className="h1">Create a test</h1>
          <p className="subtitle">Configure a new test case</p>

          <TabStrip
            items={SECTIONS}
            activeId={activeTab}
            completedIds={completed}
            onSelect={setActiveTab}
          />

          <div className="content">
            {activeTab === "configuration" ? (
              <div className="form-frame">
                <Group
                  group={tree}
                  depth={1}
                  variant="root"
                  swapButtons={swapButtons}
                  showLoneBracket={showLoneBracket}
                  connectorHover={connectorHover}
                  showBrackets={showBrackets}
                  nestedBgDark={nestedBgDark}
                  onMutate={onMutate}
                />
              </div>
            ) : (
              <div className="placeholder">
                <p>{SECTIONS.find((s) => s.id === activeTab)?.label} step</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="cta-dock">
        <button className="cta" type="button" onClick={handleContinue}>
          {isLast ? "Create" : "Continue"}
        </button>
      </div>
    </div>
  );
}

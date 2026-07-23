import { useMemo, useState } from "react";
import { StepRail } from "./components/StepRail";
import { TabStrip, type TabItem } from "./components/TabStrip";
import { IconArrowLeft } from "./components/Icons";
import { Group } from "./builder/Group";
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

  const activeIndex = useMemo(
    () => SECTIONS.findIndex((s) => s.id === activeTab),
    [activeTab]
  );
  const isLast = activeIndex === SECTIONS.length - 1;

  const onMutate = (
    id: string,
    mut:
      | "toggle"
      | "removeChild"
      | "addCondition"
      | "addGroup"
      | "setField",
    payload?: unknown
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
        case "setField": {
          const p = payload as {
            key: "field" | "cond" | "value" | "title";
            val: string;
          };
          return T.setField(r, id, p.key, p.val);
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

      <StepRail steps={RAIL_STEPS} activeId="s1" completedIds={[]} />

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

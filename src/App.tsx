import { useMemo, useState } from "react";
import { StepRail } from "./components/StepRail";
import { TabStrip, type TabItem } from "./components/TabStrip";
import { ConditionCard } from "./components/ConditionCard";
import { IconArrowLeft } from "./components/Icons";
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

interface Row {
  id: string;
  field: string;
  cond: string;
  value: string;
}

let __id = 0;
const uid = () => `r${++__id}`;

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("configuration");
  const [completed, setCompleted] = useState<string[]>(["general"]);
  const [rows, setRows] = useState<Row[]>(() => [
    { id: uid(), field: "", cond: "", value: "" },
  ]);

  const activeIndex = useMemo(
    () => SECTIONS.findIndex((s) => s.id === activeTab),
    [activeTab]
  );
  const isLast = activeIndex === SECTIONS.length - 1;

  const handleChange = (id: string, key: "field" | "cond" | "value", v: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: v } : r)));
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
              <ConditionCard
                rows={rows}
                onChange={handleChange}
                onAddCondition={() =>
                  setRows((rs) => [
                    ...rs,
                    { id: uid(), field: "", cond: "", value: "" },
                  ])
                }
                onAddGroup={() =>
                  setRows((rs) => [
                    ...rs,
                    { id: uid(), field: "", cond: "", value: "" },
                  ])
                }
              />
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

import { useState } from "react";
import { StepRail } from "./components/StepRail";
import { Group, type Mutation } from "./builder/Group";
import { T } from "./builder/tree";
import { seedRoot, type GroupNode, type Operator } from "./builder/types";
import { seedSample } from "./criteria/sample";
import "./App.css";

const RAIL_STEPS = [
  { id: "s1", label: "Label" },
  { id: "s2", label: "Label" },
  { id: "s3", label: "Label" },
  { id: "s4", label: "Label" },
];

export default function App() {
  const [treeS1, setTreeS1] = useState<GroupNode>(() => seedRoot());
  const [treeS2, setTreeS2] = useState<GroupNode>(() => seedSample());
  const [activeStep, setActiveStep] = useState<string>("s1");
  const [swapButtons, setSwapButtons] = useState<boolean>(false);
  const [showLoneBracket, setShowLoneBracket] = useState<boolean>(true);
  const [showBrackets, setShowBrackets] = useState<boolean>(true);
  const [nestedBgDark, setNestedBgDark] = useState<boolean>(true);
  const [smoothAnim, setSmoothAnim] = useState<boolean>(true);
  const [operatorMenu, setOperatorMenu] = useState<boolean>(true);
  const [bracketDottedOr, setBracketDottedOr] = useState<boolean>(false);
  const [bareCblocks, setBareCblocks] = useState<boolean>(false);

  const activeTree = activeStep === "s2" ? treeS2 : treeS1;
  const setActiveTree = activeStep === "s2" ? setTreeS2 : setTreeS1;

  const onMutate: (id: string, mut: Mutation, payload?: unknown) => void = (
    id,
    mut,
    payload
  ) => {
    setActiveTree((r) => {
      switch (mut) {
        case "toggle":
          return T.toggleOperator(r, id);
        case "setOperator":
          return T.setOperator(r, id, payload as Operator);
        case "toggleNegated":
          return T.toggleNegated(r, id);
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
            key: "key" | "value";
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

  return (
    <div
      className="page"
      data-smooth-anim={smoothAnim}
      data-bracket-dotted-or={bracketDottedOr}
      data-bare-cblocks={bareCblocks}
    >
      <div className="page-glow" aria-hidden />

      <StepRail
        steps={RAIL_STEPS}
        activeId={activeStep}
        completedIds={[]}
        onSelect={setActiveStep}
        swapButtons={swapButtons}
        onToggleSwapButtons={setSwapButtons}
        showLoneBracket={showLoneBracket}
        onToggleLoneBracket={setShowLoneBracket}
        showBrackets={showBrackets}
        onToggleShowBrackets={setShowBrackets}
        nestedBgDark={nestedBgDark}
        onToggleNestedBgDark={setNestedBgDark}
        smoothAnim={smoothAnim}
        onToggleSmoothAnim={setSmoothAnim}
        operatorMenu={operatorMenu}
        onToggleOperatorMenu={setOperatorMenu}
        bracketDottedOr={bracketDottedOr}
        onToggleBracketDottedOr={setBracketDottedOr}
        bareCblocks={bareCblocks}
        onToggleBareCblocks={setBareCblocks}
      />

      <main className="main">
        <div className="main-inner">
          <h1 className="h1">Conditional form builder</h1>
          <p className="subtitle">
            Designed to create complicated rule building in web application.
          </p>

          <div className="content">
            <div className="form-frame">
              <Group
                group={activeTree}
                depth={1}
                variant="root"
                swapButtons={swapButtons}
                showLoneBracket={showLoneBracket}
                showBrackets={showBrackets}
                nestedBgDark={nestedBgDark}
                operatorMenu={operatorMenu}
                onMutate={onMutate}
              />
            </div>
          </div>
        </div>
      </main>

      <div className="cta-dock">
        <button className="cta" type="button">
          Create
        </button>
      </div>
    </div>
  );
}

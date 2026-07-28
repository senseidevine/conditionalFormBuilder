import { useState } from "react";
import { StepRail } from "./components/StepRail";
import { Group, type Mutation } from "./builder/Group";
import { T } from "./builder/tree";
import { seedRoot, type GroupNode } from "./builder/types";
import "./App.css";

const RAIL_STEPS = [
  { id: "s1", label: "Label" },
  { id: "s2", label: "Label" },
  { id: "s3", label: "Label" },
  { id: "s4", label: "Label" },
];

export default function App() {
  const [tree, setTree] = useState<GroupNode>(() => seedRoot());
  const [swapButtons, setSwapButtons] = useState<boolean>(false);
  const [showLoneBracket, setShowLoneBracket] = useState<boolean>(false);
  const [connectorHover, setConnectorHover] = useState<boolean>(false);
  const [showBrackets, setShowBrackets] = useState<boolean>(true);
  const [nestedBgDark, setNestedBgDark] = useState<boolean>(true);

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
          <h1 className="h1">Conditional form builder</h1>
          <p className="subtitle">
            Designed to create complicated rule building in web application.
          </p>

          <div className="content">
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

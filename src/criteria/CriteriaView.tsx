import type { CriteriaNode } from "./types";
import { IconChevronDown } from "../components/Icons";
import "./CriteriaView.css";

interface CriteriaViewProps {
  node: CriteriaNode;
}

export function CriteriaView({ node }: CriteriaViewProps) {
  return (
    <div className="cv">
      <div className="cv-heading">Criteria</div>
      <CriteriaNodeView node={node} depth={0} />
    </div>
  );
}

function CriteriaNodeView({
  node,
  depth,
}: {
  node: CriteriaNode;
  depth: number;
}) {
  if (node.kind === "condition") {
    return (
      <div className="cv-card" data-depth={depth}>
        <div className="cv-card-title">{node.title}</div>
        {node.rows.length > 0 ? (
          <div className="cv-card-rows">
            {node.rows.map((r, i) => (
              <div className="cv-card-row" key={i}>
                <span className="cv-card-label">{r.label}:</span>
                <span className="cv-card-value">{r.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div className="cv-grp" data-depth={depth}>
      <div className="cv-grp-bar">
        <span className="cv-grp-chev" aria-hidden>
          <IconChevronDown />
        </span>
        {node.op === "Not" ? (
          <span className="cv-grp-not" aria-hidden>
            <NotIcon />
          </span>
        ) : null}
        <span className="cv-grp-label">{node.op}</span>
      </div>
      <div className="cv-grp-body">
        {node.children.map((child, i) => (
          <CriteriaNodeView node={child} depth={depth + 1} key={i} />
        ))}
      </div>
    </div>
  );
}

function NotIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <circle cx="8" cy="8" r="6.25" />
      <line x1="3.6" y1="12.4" x2="12.4" y2="3.6" />
    </svg>
  );
}

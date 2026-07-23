import type { ConditionNode } from "./types";
import { AttributeRule } from "./AttributeRule";
import "./ConditionBlock.css";

interface ConditionBlockProps {
  node: ConditionNode;
  onChange: (key: "field" | "cond" | "value" | "title", v: string) => void;
  onRemove?: () => void;
}

/** Title label sitting on top of an AttributeRule, all wrapped in a
 *  dark rounded card. */
export function ConditionBlock({ node, onChange, onRemove }: ConditionBlockProps) {
  return (
    <div className="cblock">
      <div className="cblock-head">
        <input
          className="cblock-title"
          value={node.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Title"
          aria-label="Condition title"
          spellCheck={false}
        />
        {onRemove ? (
          <button
            type="button"
            className="cblock-remove"
            aria-label="Remove condition"
            onClick={onRemove}
          >
            ×
          </button>
        ) : null}
      </div>
      <AttributeRule
        field={node.field}
        cond={node.cond}
        value={node.value}
        onChange={(k, v) => onChange(k, v)}
      />
    </div>
  );
}

import type { ConditionNode, PropertyRow } from "./types";
import { AttributeRule } from "./AttributeRule";
import { IconTrash } from "../components/Icons";
import "./ConditionBlock.css";

interface ConditionBlockProps {
  node: ConditionNode;
  onSetTitle: (v: string) => void;
  onSetProperty: (
    propertyId: string,
    key: "field" | "cond" | "value",
    v: string
  ) => void;
  onAddProperty: () => void;
  onRemoveProperty: (propertyId: string) => void;
  onRemove?: () => void;
}

/** Title label sitting on top of one or more AttributeRules, wrapped in a
 *  dark rounded card. A "+ Property" text link at the bottom adds another
 *  rule to this condition. */
export function ConditionBlock({
  node,
  onSetTitle,
  onSetProperty,
  onAddProperty,
  onRemoveProperty,
  onRemove,
}: ConditionBlockProps) {
  const canRemoveProperty = node.properties.length > 1;
  return (
    <div className="cblock">
      <div className="cblock-head">
        <input
          className="cblock-title"
          value={node.title}
          onChange={(e) => onSetTitle(e.target.value)}
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
            <IconTrash />
          </button>
        ) : null}
      </div>

      <div className="cblock-props">
        {node.properties.map((p) => (
          <PropertyRowView
            key={p.id}
            property={p}
            canRemove={canRemoveProperty}
            onChange={(k, v) => onSetProperty(p.id, k, v)}
            onRemove={() => onRemoveProperty(p.id)}
          />
        ))}
      </div>

      <button
        type="button"
        className="cblock-add-property"
        onClick={onAddProperty}
      >
        <span className="cblock-add-property-plus" aria-hidden>
          +
        </span>
        <span>Property</span>
      </button>
    </div>
  );
}

function PropertyRowView({
  property,
  canRemove,
  onChange,
  onRemove,
}: {
  property: PropertyRow;
  canRemove: boolean;
  onChange: (key: "field" | "cond" | "value", v: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="cblock-prop">
      <AttributeRule
        field={property.field}
        cond={property.cond}
        value={property.value}
        onChange={onChange}
      />
      {canRemove ? (
        <button
          type="button"
          className="cblock-prop-remove"
          aria-label="Remove property"
          onClick={onRemove}
        >
          <IconTrash />
        </button>
      ) : null}
    </div>
  );
}

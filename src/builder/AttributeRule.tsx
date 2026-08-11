import "./AttributeRule.css";

interface AttributeRuleProps {
  attrKey: string;
  value: string;
  onChange: (key: "key" | "value", v: string) => void;
}

/** A single key/value pair — two freeform inputs with a colon separator,
 *  reading as "Label: value" once populated. */
export function AttributeRule({ attrKey, value, onChange }: AttributeRuleProps) {
  return (
    <div className="arule">
      <input
        className="arule-input arule-input--key"
        value={attrKey}
        placeholder="Key"
        onChange={(e) => onChange("key", e.target.value)}
        aria-label="Attribute key"
        spellCheck={false}
      />
      <span className="arule-sep" aria-hidden>
        :
      </span>
      <input
        className="arule-input arule-input--value"
        value={value}
        placeholder="Value"
        onChange={(e) => onChange("value", e.target.value)}
        aria-label="Attribute value"
        spellCheck={false}
      />
    </div>
  );
}

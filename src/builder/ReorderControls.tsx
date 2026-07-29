import {
  IconChevronDown,
  IconChevronUp,
  IconGrip,
} from "../components/Icons";
import "./ReorderControls.css";

interface ReorderControlsProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  /** Whether this cblock has any siblings — if not, hide the grip too
   *  since there's nowhere to drag to. */
  canDrag: boolean;
}

/** Up chevron / grip drag-handle / down chevron, centred in the cblock
 *  header, revealed on hover. The grip carries `data-drag-handle` so
 *  the enclosing Group's pointerdown delegate can start a drag from it
 *  without triggering when the user clicks an input or button. */
export function ReorderControls({
  onMoveUp,
  onMoveDown,
  canDrag,
}: ReorderControlsProps) {
  if (!onMoveUp && !onMoveDown && !canDrag) return null;
  return (
    <div className="reorder">
      <button
        type="button"
        className="reorder-btn"
        aria-label="Move up"
        onClick={onMoveUp}
        disabled={!onMoveUp}
      >
        <IconChevronUp />
      </button>
      {canDrag ? (
        <span
          className="reorder-grip"
          data-drag-handle
          aria-label="Drag to reorder"
          role="button"
          tabIndex={-1}
        >
          <IconGrip />
        </span>
      ) : null}
      <button
        type="button"
        className="reorder-btn"
        aria-label="Move down"
        onClick={onMoveDown}
        disabled={!onMoveDown}
      >
        <IconChevronDown />
      </button>
    </div>
  );
}

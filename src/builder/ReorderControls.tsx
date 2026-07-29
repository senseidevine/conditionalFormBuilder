import { IconChevronDown, IconChevronUp } from "../components/Icons";
import "./ReorderControls.css";

interface ReorderControlsProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

/** Twin up/down buttons that live in the centre of a cblock/grp header
 *  and appear on hover. Passing `undefined` for either handler disables
 *  that direction — used by the first and last siblings. */
export function ReorderControls({ onMoveUp, onMoveDown }: ReorderControlsProps) {
  /* If neither move is possible (single-child group), don't render — the
   * hover reveal would just show two disabled buttons with no purpose. */
  if (!onMoveUp && !onMoveDown) return null;
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

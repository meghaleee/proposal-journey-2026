import { ReactNode } from "react";

/* ================================================================
   Accordion — a free-standing expand/collapse section, matching the
   "Accordion" component that already exists in Molecules (Collapsed /
   Expanded variants). Used on the Preview & E-sign page.

   Interaction contract (per HX's annotations):
   - Fully controlled by the parent: `open` + `onToggle`. The parent
     owns a Record<sectionKey, boolean>, so any number of sections can
     be open at once and opening one never touches the others' state.
   - "Edit" is a SEPARATE action from the chevron. Tapping it does NOT
     expand/collapse this accordion — it's meant to navigate away to
     the real edit page (Policyholder Details), matching the existing
     product convention ("Edit = navigate, not inline-edit").
   - `editDisabled` + `editDisabledReason` cover the "nominee equals
     proposer" case: Edit is visibly present but disabled, with the
     reason available as a title/tooltip.

   NOTE: the real "Accordion" component in Molecules (State=Collapsed,
   node 1038:2627) has only a heading + Edit link + chevron in its
   collapsed bar — no summary/subtext slot. An earlier pass here added
   an invented summary line; removed to match the actual component.
================================================================ */

const NAVY = "#280071";
const BORDER = "#e6e6e6";
const GRAY = "#6f6f6f";
const HEAD_BG = "#f4f2f8"; /* pale lavender — matches the real Preview & E-sign screen's collapsed rows */

export interface AccordionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  editDisabled?: boolean;
  editDisabledReason?: string;
  children: ReactNode;
}

export default function Accordion({
  title,
  open,
  onToggle,
  onEdit,
  editDisabled,
  editDisabledReason,
  children,
}: AccordionProps) {
  return (
    <div className="acc" data-open={open ? "true" : undefined}>
      <style>{`
        .acc { border: 1px solid ${BORDER}; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }

        .acc-head {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 14px 16px;
          background: ${HEAD_BG};   /* collapsed fill — Inky Blue 5% */
          color: ${NAVY};           /* collapsed text — matches the real design (bold navy, not black) */
          border: none; text-align: left; cursor: pointer;
        }
        /* Expanded header flips to the dark "primary button" fill, matching
           the Accordion component's Expanded variant. */
        .acc[data-open="true"] > .acc-head { background: ${NAVY}; color: #fff; }

        .acc-title-wrap { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .acc-title { font-size: 15px; font-weight: 700; color: inherit; line-height: 1.3; }

        .acc-actions { display: flex; align-items: center; gap: 6px; flex: none; }
        .acc-edit {
          display: inline-flex; align-items: center; gap: 4px;
          background: none; border: none; padding: 0; font-size: 13px; font-weight: 600;
          color: inherit; cursor: pointer;
        }
        .acc-edit:disabled { opacity: .55; cursor: not-allowed; }

        .acc-chevron { width: 10px; height: 10px; flex: none; margin-left: 10px; transition: transform .2s ease; }
        .acc[data-open="true"] .acc-chevron { transform: rotate(180deg); }

        /* Smooth open/close: content stays mounted and animates via a
           0fr → 1fr grid row instead of appearing/disappearing instantly.
           Avoids the abrupt page-height jump on toggle. */
        .acc-body-wrap {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows .28s ease;
        }
        .acc[data-open="true"] .acc-body-wrap { grid-template-rows: 1fr; }
        .acc-body-inner { overflow: hidden; min-height: 0; }
        .acc-body { padding: 16px; background: #fff; border-top: 1px solid ${BORDER}; }
      `}</style>

      {/* HEADER ROW — the whole button toggles expand/collapse (onToggle)
          EXCEPT the "Edit" span inside it, which calls e.stopPropagation()
          so clicking Edit navigates away (onEdit) WITHOUT also toggling
          this accordion open/closed. */}
      <button type="button" className="acc-head" onClick={onToggle} aria-expanded={open}>
        <span className="acc-title-wrap">
          <span className="acc-title">{title}</span>
        </span>
        <span className="acc-actions">
          {/* Edit link — only rendered if the parent passed onEdit.
              editDisabled greys it out + adds a tooltip (used for the
              "nominee = proposer" case) without removing it entirely. */}
          {onEdit ? (
            <span
              className="acc-edit"
              role="button"
              tabIndex={editDisabled ? -1 : 0}
              aria-disabled={editDisabled || undefined}
              title={editDisabled ? editDisabledReason : undefined}
              onClick={(e) => {
                e.stopPropagation();
                if (!editDisabled) onEdit();
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !editDisabled) {
                  e.stopPropagation();
                  onEdit();
                }
              }}
            >
              ✎ Edit
            </span>
          ) : null}
          {/* Chevron — CSS flips it 180° when data-open="true" (see
              .acc[data-open="true"] .acc-chevron above). */}
          <svg className="acc-chevron" viewBox="0 0 12 8" fill="none" aria-hidden="true">
            <path
              d="M1 1l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* Always mounted (not conditionally rendered) so the CSS grid-row
          transition above has something to animate between states. */}
      <div className="acc-body-wrap">
        <div className="acc-body-inner">
          <div className="acc-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

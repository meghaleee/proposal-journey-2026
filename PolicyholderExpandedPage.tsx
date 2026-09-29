/* ================================================================
   Policyholder Expanded — the page "Edit" on the Preview & E-sign
   accordion navigates to.

   Per HX: keep this screen, but no actions inside it need to work yet
   — only "Save & Exit" (back to Preview) is wired up. Every per-
   subsection "Edit" pencil below is decorative for this prototype.

   Content is the same placeholder field set reused from
   PreviewEsignPage, split across a few sub-cards (Personal,
   Communication, Address, Occupation) to match the real page's shape,
   plus flat rows for the other top-level sections (Health & Lifestyle,
   Nominee, Existing Insurance, Bank Details) shown collapsed here,
   since this prototype is only testing that Edit lands you HERE and
   Save & Exit takes you back — not this page's own content or flows.
================================================================ */

const NAVY = "#280071";
const BORDER = "#e6e6e6";
const GRAY = "#6f6f6f";
const HEAD_BG = "#f4f2f8";

const PLACEHOLDER_FIELDS: { label: string; value: string }[] = [
  { label: "First Name", value: "Kallara" },
  { label: "Middle Name", value: "Jay" },
  { label: "Last Name", value: "Chithra" },
  { label: "Gender", value: "Male" },
  { label: "Date of Birth", value: "26/11/1994" },
  { label: "Mobile Number", value: "+91 98765 43210" },
  { label: "Email ID", value: "kallarac@gmail.com" },
];

function FieldGrid() {
  return (
    <div className="field-grid">
      {PLACEHOLDER_FIELDS.map((f) => (
        <div className="field-row" key={f.label}>
          <span className="field-label">{f.label}</span>
          <span className="field-value">{f.value}</span>
        </div>
      ))}
    </div>
  );
}

/* A sub-section INSIDE the Policyholder Details page — always shown
   with its content, edit pencil is decorative (no onClick). */
function SubCard({ title }: { title: string }) {
  return (
    <div className="sub-card">
      <div className="sub-card-head">
        <span className="sub-card-title">{title}</span>
        <span className="sub-card-edit" aria-disabled="true" title="Not wired up in this prototype">
          ✎ Edit
        </span>
      </div>
      <div className="sub-card-body">
        <FieldGrid />
      </div>
    </div>
  );
}

/* A collapsed-looking row for the OTHER top-level sections
   (Health & Lifestyle, Nominee, Existing Insurance, Bank Details) —
   decorative only, matches the flat list under Policyholder Details
   in the reference screen. */
function FlatRow({ title }: { title: string }) {
  return (
    <div className="flat-row">
      <span className="flat-row-title">{title}</span>
      <span className="flat-row-actions">
        <span className="flat-row-edit" aria-disabled="true" title="Not wired up in this prototype">
          Edit
        </span>
        <svg width="10" height="6" viewBox="0 0 12 8" fill="none" aria-hidden="true">
          <path d="M1 1l5 5 5-5" stroke={GRAY} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

export interface PolicyholderExpandedPageProps {
  onBack: () => void;
}

export default function PolicyholderExpandedPage({ onBack }: PolicyholderExpandedPageProps) {
  return (
    <div className="pe-page">
      {/* Same 3-piece fixed layout as PreviewEsignPage: header (fixed),
          .pe-body (the only scrolling piece) — no footer on this page. */}
      <style>{`
        .pe-page { position: fixed; inset: 0; display: flex; flex-direction: column; background: #fff; font-family: inherit; }

        .pe-header {
          flex: none; display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-bottom: 1px solid ${BORDER};
        }
        .pe-header-left { display: flex; align-items: center; gap: 10px; }
        .pe-back { border: none; background: none; padding: 4px; font-size: 20px; color: ${NAVY}; cursor: pointer; }
        .pe-header-title { font-size: 16px; font-weight: 700; color: #111; }
        .pe-save-exit {
          border: 1px solid ${BORDER}; background: #fff; border-radius: 20px;
          padding: 8px 14px; font-size: 13px; font-weight: 700; color: ${NAVY}; cursor: pointer;
        }

        .pe-body { flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 16px; }

        .pe-section-head { display: flex; align-items: center; gap: 8px; margin: 0 0 14px; }
        .pe-section-title { font-size: 18px; font-weight: 700; color: ${NAVY}; }

        .sub-card { border: 1px solid ${BORDER}; border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
        .sub-card-head {
          display: flex; align-items: center; justify-content: space-between;
          background: ${HEAD_BG}; padding: 10px 14px;
        }
        .sub-card-title { font-size: 12px; font-weight: 700; color: ${NAVY}; letter-spacing: .02em; }
        .sub-card-edit { font-size: 12px; font-weight: 600; color: ${NAVY}; opacity: .6; cursor: default; }
        .sub-card-body { padding: 14px; }

        .field-grid { display: flex; flex-direction: column; gap: 12px; }
        .field-row { display: flex; flex-direction: column; gap: 2px; }
        .field-label { font-size: 11px; color: ${GRAY}; }
        .field-value { font-size: 14px; font-weight: 600; color: #111; }

        .pe-divider { height: 1px; background: ${BORDER}; margin: 20px 0; }

        .flat-row {
          display: flex; align-items: center; justify-content: space-between;
          border: 1px solid ${BORDER}; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px;
          background: ${HEAD_BG};
        }
        .flat-row-title { font-size: 14px; font-weight: 700; color: #111; }
        .flat-row-actions { display: flex; align-items: center; gap: 14px; }
        .flat-row-edit { font-size: 13px; font-weight: 600; color: ${NAVY}; opacity: .6; cursor: default; }
      `}</style>

      <header className="pe-header">
        <div className="pe-header-left">
          <button type="button" className="pe-back" onClick={onBack} aria-label="Back to Preview">‹</button>
          <span className="pe-header-title">Policyholder Details</span>
        </div>
        <button type="button" className="pe-save-exit" onClick={onBack}>
          Save &amp; Exit
        </button>
      </header>

      <div className="pe-body">
        <div className="pe-section-head">
          <span className="pe-section-title">Policyholder Details</span>
        </div>

        {/* 4 always-expanded sub-cards — this is the section Edit
            navigated here to fix. */}
        <SubCard title="PERSONAL DETAILS" />
        <SubCard title="COMMUNICATION DETAILS" />
        <SubCard title="ADDRESS DETAILS" />
        <SubCard title="OCCUPATION DETAILS" />

        <div className="pe-divider" />

        {/* Everything else, shown flat/collapsed — decorative only,
            since this prototype only needs to prove Edit → here →
            Save & Exit → back, not these sections' own content. */}
        <FlatRow title="Health & Lifestyle Details" />
        <FlatRow title="Nominee Details" />
        <FlatRow title="Existing Insurance" />
        <FlatRow title="Bank Details" />
      </div>
    </div>
  );
}

import { ReactNode, useState } from "react";

/* ================================================================
   Policyholder Expanded — the page "Edit" on the Preview & E-sign
   accordion navigates to. Rebuilt to match the real Figma desktop
   reference (node 1085:81735, "Basic Details (Proposer) - Rebuild"):
   a left "Proposal Form Progress" sidebar + 4-step stepper (Proposer's
   Details / Address / Occupation / Life Assured's Details) + the real
   Basic/Communication/KYC/Nationality/Additional Details cards for
   Step 1 ("Proposer's Details"), with actual inputs instead of the
   earlier flat label/value placeholder rows.

   Scope, per HX: this is still a prototype of ONE step (Proposer's
   Details). Chips, Yes/No toggles and the conditional fields they
   reveal (Married → spouse fields, PEP/criminal Yes → "Provide
   Details") are real and interactive, since that's the actual point
   of this screen. "Save & Exit" (header) and "‹ Back" (footer) both
   return to Preview & E-sign. "Next" is decorative — Steps 2-4
   (Address / Occupation / Life Assured's Details) aren't built.
   The 4 other sidebar stages that used to be flat rows here
   (Health/Nominee/Past Insurance/Bank Details) are now just sidebar
   entries, matching the real product's step-per-page structure —
   not inline sections on this page.

   Responsive: below 900px this is a single scrolling column (no
   sidebar) — the same content, stacked. At 900px+ the sidebar shows
   and field rows widen from 2 to 3 columns, matching the desktop
   reference. Same breakpoint convention as PreviewEsignPage.tsx.
================================================================ */

const NAVY = "#280071";
const PINK = "#d60d47";
const BORDER = "#e6e6e6";
const GRAY = "#6f6f6f";
const HEAD_BG = "#f4f2f8";

// ============================================================
// SIDEBAR — "Proposal Form Progress". Distinct from the top-level
// journey sidebar on Preview & E-sign: this is the Policyholder
// Details step's OWN sub-stage list (20% here vs. 70% on Preview,
// since this step comes much earlier). Icons are a plain emoji
// stand-in for the real per-stage Figma icons; locked stages get 🔒.
// ============================================================
type StageState = "active" | "default" | "locked";
const SIDEBAR_STAGES: { label: string; state: StageState; icon: string }[] = [
  { label: "Policyholder Details", state: "active", icon: "📋" },
  { label: "Health Details", state: "default", icon: "❤️" },
  { label: "Nominee Details", state: "default", icon: "👤" },
  { label: "Past Insurance", state: "default", icon: "🛡️" },
  { label: "Bank Details", state: "default", icon: "🏦" },
  { label: "Preview & E-Sign", state: "locked", icon: "🔒" },
  { label: "Document Upload", state: "locked", icon: "🔒" },
  { label: "Medical Test", state: "locked", icon: "🔒" },
  { label: "Video Verification", state: "locked", icon: "🔒" },
];

function Sidebar() {
  return (
    <>
      <div className="pe-sb-head">
        <span className="pe-sb-head-label">Your Proposal Journey</span>
        <span className="pe-sb-head-pct">
          <b>20%</b> Completed
        </span>
      </div>
      <div className="pe-sb-track">
        <div className="pe-sb-fill" />
      </div>
      <div className="pe-sb-stages">
        {SIDEBAR_STAGES.map((s) => (
          <div key={s.label} className="pe-sb-stage" data-state={s.state}>
            <span aria-hidden="true">{s.icon}</span>
            {s.label}
          </div>
        ))}
      </div>
    </>
  );
}

// ============================================================
// STEPPER — the 4 sub-steps of "Policyholder Details" itself. Only
// Step 1 ("Proposer's Details") is built; the rest are shown greyed
// out for context, matching the reference's own dashed-divider strip.
// ============================================================
const STEPS = ["Proposer's Details", "Address", "Occupation", "Life Assured's Details"];

function Stepper() {
  return (
    <div className="pe-stepper">
      {STEPS.map((step, i) => (
        <span key={step} className="pe-step-wrap">
          <span className="pe-step" data-active={i === 0 ? "true" : undefined}>
            {step}
          </span>
          {i < STEPS.length - 1 ? <span className="pe-step-rule" /> : null}
        </span>
      ))}
    </div>
  );
}

// ============================================================
// FormCard — a titled card (centered uppercase header bar + padded
// body), matching every section on the reference: Basic Details,
// Communication Details, KYC Details, Nationality Details, Additional
// Details.
// ============================================================
function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="fc-card">
      <div className="fc-header">{title}</div>
      <div className="fc-body">{children}</div>
    </div>
  );
}

// ============================================================
// Field building blocks — a small shared vocabulary reused across
// every card below, styled to match the float-label inputs already
// established in PreviewEsignPage.tsx (.esign-input etc.), just
// generalized and namespaced "ff-" so both files can coexist.
// ============================================================
function TextField({
  label,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="ff-wrap">
      <span className="ff-label">
        {label}
        {required ? <span className="ff-req">*</span> : null}
      </span>
      <input className="ff-input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function DateField({
  label,
  required,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="ff-wrap">
      <span className="ff-label">
        {label}
        {required ? <span className="ff-req">*</span> : null}
      </span>
      <input
        className="ff-input ff-input-date"
        placeholder="DD/MM/YYYY"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="ff-date-icon" aria-hidden="true">📅</span>
    </div>
  );
}

function DropdownField({
  label,
  required,
  value,
  options,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="ff-wrap">
      <span className="ff-label">
        {label}
        {required ? <span className="ff-req">*</span> : null}
      </span>
      <select className="ff-input ff-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="chip-group">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className="chip"
          data-selected={opt === value ? "true" : undefined}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* A "Label* [chips]" row — Gender, Marital Status. */
function ChipRow({
  label,
  required,
  options,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="chip-row">
      <span className="ff-label chip-row-label">
        {label}
        {required ? <span className="ff-req">*</span> : null}
      </span>
      <ChipGroup options={options} value={value} onChange={onChange} />
    </div>
  );
}

/* A Yes/No question with a conditional "Provide Details*" input that
   only appears when the answer is "Yes" — matches the reference's own
   PEP / criminal-proceedings / conviction-history questions exactly. */
function YesNoQuestion({
  question,
  value,
  onChange,
  detail,
  onDetailChange,
}: {
  question: string;
  value: string;
  onChange: (v: string) => void;
  detail: string;
  onDetailChange: (v: string) => void;
}) {
  return (
    <div className="q-field">
      <div className="q-row">
        <p className="q-text">{question}</p>
        <ChipGroup options={["Yes", "No"]} value={value} onChange={onChange} />
      </div>
      {value === "Yes" ? (
        <input
          className="ff-input"
          placeholder="Provide Details*"
          value={detail}
          onChange={(e) => onDetailChange(e.target.value)}
        />
      ) : null}
    </div>
  );
}

export interface PolicyholderExpandedPageProps {
  onBack: () => void;
}

export default function PolicyholderExpandedPage({ onBack }: PolicyholderExpandedPageProps) {
  // ---- Basic Details ----
  const [firstName, setFirstName] = useState("Kallara");
  const [middleName, setMiddleName] = useState("Saman");
  const [lastName, setLastName] = useState("Chithra");
  const [fatherName, setFatherName] = useState("Rajveer");
  const [motherName, setMotherName] = useState("Lata");
  const [gender, setGender] = useState("Third Gender");
  const [dob, setDob] = useState("26/11/1994");
  const [pob, setPob] = useState("Nagpur");
  const [maritalStatus, setMaritalStatus] = useState("Married");
  const [spouseFirst, setSpouseFirst] = useState("Namrata");
  const [spouseMiddle, setSpouseMiddle] = useState("Namrata");
  const [spouseLast, setSpouseLast] = useState("Namrata");

  // ---- Communication Details ----
  const [mobile, setMobile] = useState("9876543210");
  const [email, setEmail] = useState("sreyashdeshmukh@gmail.com");

  // ---- KYC Details ----
  const [kycOvd, setKycOvd] = useState("Voter's Identity Card");
  const [kycDocNo, setKycDocNo] = useState("");
  const [ckycNo, setCkycNo] = useState("");

  // ---- Nationality Details ----
  const [nationality, setNationality] = useState("Indian");

  // ---- Additional Details ----
  const [pep, setPep] = useState("Yes");
  const [pepDetail, setPepDetail] = useState("");
  const [criminal, setCriminal] = useState("Yes");
  const [criminalDetail, setCriminalDetail] = useState("");
  const [conviction, setConviction] = useState("Yes");
  const [convictionDetail, setConvictionDetail] = useState("");
  const [staffBenefit, setStaffBenefit] = useState("Yes");
  const [employerName, setEmployerName] = useState("");
  const [employerFor, setEmployerFor] = useState("Self");
  const [pfNumber, setPfNumber] = useState("123452201234");

  return (
    <div className="pe-page">
      {/* Same 3-piece fixed layout as PreviewEsignPage: header (fixed),
          a sidebar+body row (only .pe-body scrolls), fixed footer. */}
      <style>{`
        .pe-page { position: fixed; inset: 0; display: flex; flex-direction: column; background: #fff; font-family: inherit; }

        /* ---- header: product row, matches PreviewEsignPage's .pv-product-row ---- */
        .pe-header {
          flex: none; display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-bottom: 1px solid ${BORDER};
        }
        .pe-header-left { display: flex; align-items: center; gap: 10px; }
        .pe-back { border: none; background: none; padding: 4px; font-size: 20px; color: ${NAVY}; cursor: pointer; }
        .pe-header-title { font-size: 15px; font-weight: 800; line-height: 1.3; color: ${NAVY}; }
        .pe-header-uin { font-size: 11px; color: ${GRAY}; margin-top: 2px; }
        .pe-save-exit {
          flex: none; border: 1px solid ${NAVY}; background: #fff; border-radius: 20px;
          padding: 7px 14px; font-size: 12.5px; font-weight: 700; color: ${NAVY}; cursor: pointer;
        }

        /* ---- sidebar + body row ---- */
        .pe-dv-row { display: flex; flex-direction: column; flex: 1; min-height: 0; }
        .pe-sidebar { display: none; }

        .pe-body { flex: 1; min-height: 0; overflow-y: auto; scrollbar-gutter: stable; -webkit-overflow-scrolling: touch; padding: 16px; }

        /* ---- stepper ---- */
        .pe-stepper { display: flex; align-items: center; gap: 6px; overflow-x: auto; margin-bottom: 16px; }
        .pe-step-wrap { display: flex; align-items: center; gap: 6px; flex: none; }
        .pe-step { font-size: 12px; font-weight: 600; color: ${GRAY}; white-space: nowrap; }
        .pe-step[data-active="true"] { color: ${NAVY}; font-weight: 800; }
        .pe-step-rule { width: 24px; height: 1px; border-top: 1px dashed ${BORDER}; }

        .pe-title { font-size: 19px; font-weight: 800; color: ${NAVY}; line-height: 1.3; margin: 0 0 4px; }
        .pe-subtitle { font-size: 13px; color: ${GRAY}; margin: 0 0 18px; }

        /* ---- FormCard ---- */
        .fc-card { border: 1px solid ${BORDER}; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
        .fc-header {
          background: ${HEAD_BG}; text-align: center; padding: 9px 14px;
          font-size: 11px; font-weight: 800; letter-spacing: .04em; color: ${NAVY}; text-transform: uppercase;
        }
        .fc-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
        .fc-caption { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: ${GRAY}; margin-top: -6px; }

        /* ---- field grid: 2 cols mobile, 3 cols desktop (matches
           PreviewEsignPage.tsx's .field-grid convention) ---- */
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 12px; }
        .field-cell-full { grid-column: 1 / -1; }

        /* ---- inputs ---- */
        .ff-wrap { position: relative; min-width: 0; }
        .ff-label {
          display: block; font-size: 11px; color: ${GRAY}; margin-bottom: 4px;
        }
        .ff-req { color: ${PINK}; margin-left: 2px; }
        .ff-input {
          width: 100%; box-sizing: border-box; height: 44px; padding: 0 14px;
          border: 1px solid ${BORDER}; border-radius: 6px; font-size: 14px; color: #111;
          background: #fff; font-family: inherit;
        }
        .ff-input:focus { outline: none; border-color: ${NAVY}; }
        .ff-input-date { padding-right: 36px; }
        .ff-date-icon { position: absolute; right: 12px; bottom: 12px; font-size: 14px; pointer-events: none; }
        .ff-select { appearance: none; -webkit-appearance: none; background-image: none; cursor: pointer; }

        /* ---- chips ---- */
        .chip-row { display: flex; flex-direction: column; gap: 8px; }
        .chip-row-label { margin-bottom: 0; }
        .chip-group { display: flex; flex-wrap: wrap; gap: 8px; }
        .chip {
          border: 1px solid ${BORDER}; background: #fff; border-radius: 18px;
          padding: 8px 16px; font-size: 13px; font-weight: 600; color: #111; cursor: pointer;
        }
        .chip[data-selected="true"] { background: ${NAVY}; border-color: ${NAVY}; color: #fff; }

        /* ---- Yes/No question fields ---- */
        .q-field { display: flex; flex-direction: column; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid ${BORDER}; }
        .fc-body > .q-field:last-child { border-bottom: none; padding-bottom: 0; }
        .q-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .q-text { font-size: 13.5px; font-weight: 600; color: #111; line-height: 1.4; margin: 0; flex: 1; min-width: 200px; }

        /* ---- footer, matches PreviewEsignPage's .pv-footer ---- */
        .pe-footer { flex: none; background: #fff; }
        .pe-footer-action-row { padding: 6px 16px; display: flex; align-items: center; }
        .pe-questions-btn {
          display: inline-flex; align-items: center; gap: 6px;
          border: 1px solid ${NAVY}; background: #fff; border-radius: 20px;
          padding: 8px 16px; font-size: 13px; font-weight: 700; color: ${NAVY}; cursor: pointer;
        }
        .pe-footer-divider { height: 1px; background: ${BORDER}; }
        .pe-footer-nav-row { padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .pe-back-link { border: none; background: none; padding: 0; font-size: 13px; font-weight: 700; color: ${NAVY}; cursor: pointer; }
        .pe-next {
          border: none; border-radius: 24px; background: ${NAVY}; color: #fff; opacity: .55;
          font-size: 15px; font-weight: 700; padding: 13px 32px; cursor: not-allowed;
        }

        /* ================================================================
           DESKTOP OVERRIDES (>=900px) — matches Figma node 1085:81735.
           Swaps in the "Proposal Form Progress" sidebar and widens the
           field grid from 2 to 3 columns.
        ================================================================ */
        @media (min-width: 900px) {
          .pe-dv-row { flex-direction: row; }
          .pe-sidebar {
            display: block; flex: none; width: 303px;
            border-right: 1px solid ${BORDER}; overflow-y: auto; padding: 20px 16px;
          }
          .pe-sb-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
          .pe-sb-head-label { font-size: 12.5px; font-weight: 700; color: ${NAVY}; }
          .pe-sb-head-pct { font-size: 12px; color: ${GRAY}; }
          .pe-sb-head-pct b { color: ${NAVY}; }
          .pe-sb-track { height: 6px; border-radius: 4px; background: #eae6f1; margin-bottom: 20px; overflow: hidden; }
          .pe-sb-fill { height: 100%; width: 20%; background: linear-gradient(90deg, ${PINK}, ${NAVY}); }
          .pe-sb-stages { display: flex; flex-direction: column; gap: 10px; }
          .pe-sb-stage {
            display: flex; align-items: center; gap: 8px;
            padding: 11px 14px; border-radius: 24px; border: 1px solid ${BORDER};
            font-size: 13.5px; font-weight: 600; color: ${NAVY};
          }
          .pe-sb-stage[data-state="active"] { border-color: ${NAVY}; background: ${HEAD_BG}; }
          .pe-sb-stage[data-state="locked"] { background: #f0f0f0; color: #888; }

          .pe-body { padding: 24px 32px; }
          .field-grid { grid-template-columns: repeat(3, 1fr); }
          .pe-footer-action-row, .pe-footer-nav-row { padding-left: 32px; padding-right: 32px; }
        }
      `}</style>

      <header className="pe-header">
        <div className="pe-header-left">
          <button type="button" className="pe-back" onClick={onBack} aria-label="Back to Preview">‹</button>
          <div>
            <div className="pe-header-title">SBI Life - Smart Elite Plus</div>
            <div className="pe-header-uin">UIN: 111L150V01</div>
          </div>
        </div>
        <button type="button" className="pe-save-exit" onClick={onBack}>
          Save &amp; Exit
        </button>
      </header>

      <div className="pe-dv-row">
        <aside className="pe-sidebar">
          <Sidebar />
        </aside>

        <div className="pe-body">
          <Stepper />

          <p className="pe-title">Basic Details for Kallara Chithra (Proposer)</p>
          <p className="pe-subtitle">For the person buying this policy.</p>

          <FormCard title="Basic Details">
            <div className="field-grid">
              <TextField label="First Name" required value={firstName} onChange={setFirstName} />
              <TextField label="Middle Name" value={middleName} onChange={setMiddleName} />
              <TextField label="Last Name" required value={lastName} onChange={setLastName} />
            </div>
            <p className="fc-caption">As per Gov ID proof</p>

            <div className="field-grid">
              <TextField label="Father's Name" required value={fatherName} onChange={setFatherName} />
              <TextField label="Mother's Name" required value={motherName} onChange={setMotherName} />
            </div>

            <ChipRow label="Gender" required options={["Male", "Female", "Third Gender"]} value={gender} onChange={setGender} />

            <div className="field-grid">
              <DateField label="Date of Birth" required value={dob} onChange={setDob} />
              <TextField label="Place of Birth" required value={pob} onChange={setPob} />
            </div>

            <ChipRow
              label="Marital Status"
              required
              options={["Single", "Married", "Divorced", "Widow"]}
              value={maritalStatus}
              onChange={setMaritalStatus}
            />

            {/* Conditional: only when Married, matching the reference exactly. */}
            {maritalStatus === "Married" ? (
              <div className="field-grid">
                <TextField label="Spouse's First Name" required value={spouseFirst} onChange={setSpouseFirst} />
                <TextField label="Spouse's Middle Name" value={spouseMiddle} onChange={setSpouseMiddle} />
                <TextField label="Spouse's Last Name" required value={spouseLast} onChange={setSpouseLast} />
              </div>
            ) : null}
          </FormCard>

          <FormCard title="Communication Details">
            <div className="field-grid">
              <TextField label="Mobile" required value={mobile} onChange={setMobile} />
              <TextField label="Email ID" required value={email} onChange={setEmail} />
            </div>
            <p className="fc-caption">🛡️ As per linked to Aadhaar</p>
          </FormCard>

          <FormCard title="KYC Details">
            <div className="field-grid">
              <DropdownField
                label="KYC OVD (Official Valid Document)"
                required
                value={kycOvd}
                options={["Voter's Identity Card", "Aadhaar Card", "Passport", "Driving Licence"]}
                onChange={setKycOvd}
              />
              <TextField label="Document No." required value={kycDocNo} onChange={setKycDocNo} />
            </div>
            <p className="fc-caption">Make sure you upload the supporting documents</p>
            <div className="field-grid">
              <TextField label="C-KYC Number (optional)" value={ckycNo} onChange={setCkycNo} />
            </div>
          </FormCard>

          <FormCard title="Nationality Details">
            <div className="field-grid">
              <DropdownField label="Nationality" required value={nationality} options={["Indian", "Other"]} onChange={setNationality} />
            </div>
          </FormCard>

          <FormCard title="Additional Details">
            <YesNoQuestion
              question={'Are you a "Politically Exposed Person" (PEP) or a close relative of PEP?*'}
              value={pep}
              onChange={setPep}
              detail={pepDetail}
              onDetailChange={setPepDetail}
            />
            <YesNoQuestion
              question="Do you have any criminal proceedings initiated against you?*"
              value={criminal}
              onChange={setCriminal}
              detail={criminalDetail}
              onDetailChange={setCriminalDetail}
            />
            <YesNoQuestion
              question="Do you have any history of conviction under any criminal proceedings in India or abroad?*"
              value={conviction}
              onChange={setConviction}
              detail={convictionDetail}
              onDetailChange={setConvictionDetail}
            />
            <div className="q-field">
              <div className="q-row">
                <p className="q-text">Is Staff Benefit applicable to you?*</p>
                <ChipGroup options={["Yes", "No"]} value={staffBenefit} onChange={setStaffBenefit} />
              </div>
              {staffBenefit === "Yes" ? (
                <>
                  <div className="field-grid">
                    <TextField label="Name of the Employer" required value={employerName} onChange={setEmployerName} />
                    <div className="ff-wrap">
                      <ChipRow label="For" required options={["Self", "Spouse"]} value={employerFor} onChange={setEmployerFor} />
                    </div>
                  </div>
                  <div className="field-grid">
                    <TextField label="PF/Pension Index/Employee No." required value={pfNumber} onChange={setPfNumber} />
                  </div>
                </>
              ) : null}
            </div>
          </FormCard>
        </div>
      </div>

      <footer className="pe-footer">
        <div className="pe-footer-action-row">
          <button type="button" className="pe-questions-btn">📞 Got Questions?</button>
        </div>
        <div className="pe-footer-divider" />
        <div className="pe-footer-nav-row">
          <button type="button" className="pe-back-link" onClick={onBack}>
            ‹ Back
          </button>
          <button type="button" className="pe-next" aria-disabled="true" title="Not wired up in this prototype (Steps 2-4 aren't built)">
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import Accordion from "./Accordion";

/* ================================================================
   Preview & E-sign — mobile prototype, rebuilt to match the actual
   Figma screen (mobile-preview-esign-bank-details-expanded, node
   738:47464/48198 in the Purchase Journey 2.0 file) rather than a
   rough placeholder: product header, journey progress bar, per-person
   accordion groups (Proposer + Life Assured), field groups with
   section dividers, and the real E-Sign card layout incl. its error
   state (red-bordered inputs + inline messages), pulled straight from
   the design's own "Error when user clicks on submit without doing
   e-sign" reference frame.

   Content is still the SAME placeholder field set reused across every
   accordion section per person (per HX: the point is the interaction,
   not per-section content) — only the STRUCTURE (groups, dividers,
   2-column field pairs vs. full-width Yes/No rows) now matches design.

   Interactions (unchanged from the previous pass, see HX's annotations):
   1. Gratification/clarity banner at the top.
   2. "Edit" lives in the section heading and always routes to the
      Policyholder Details page.
   3. Free accordions: each person's Policyholder Details starts open,
      everything else starts collapsed; sections are fully independent
      — no auto-collapse, manual collapse always available.
   4. Nominee Details: Edit disabled (nominee == proposer) under BOTH
      groups, since nominee is locked to the Proposer under WOP too.
   5. CTA is "Submit" (+ "Back"), not "Go to e-sign". The design's own
      OTP consent card has no separate OTP-entry step — checking
      consent IS the e-sign action here, matching what the source file
      actually shows. Submitting with any incomplete E-sign block shows
      the exact error treatment from the design: red borders + "Please
      enter a value" / "Please enter the date" under the two inputs,
      and "⊘ Please complete the e-signature before proceeding." below
      the consent text — for every incomplete block, then scrolls to
      the first one.

   Left as-is per HX: the purple declaration line AND the "cannot be
   edited after e-sign" info alert both stay, unresolved.
================================================================ */

// ============================================================
// COLOR TOKENS — copied inline rather than imported so this file stays
// drop-in-able on its own. Change these 5 lines to re-theme the whole
// page (they're read by the <style> block near the bottom).
// ============================================================
const NAVY = "#280071";   // primary brand / headings / active states
const PINK = "#D60D47";   // secondary brand accent (used sparingly)
const BORDER = "#e6e6e6"; // hairline borders everywhere
const GRAY = "#6f6f6f";   // secondary/muted text (labels, captions)
const ERROR = "#d32f2f";  // validation error red

// ============================================================
// PLACEHOLDER FIELD DATA — the same field set is reused for every
// accordion section, for both people. Only structure (groups, which
// fields are full-width) matches the real design; the VALUES here are
// dummy content per HX's instruction that the point of this prototype
// is the interaction, not per-section content.
// To swap in real data later: replace this function's return value
// with real field values, keeping the FieldGroup[] shape.
// ============================================================
interface Field {
  label: string;
  value: string;
  full?: boolean; /* full-width row, e.g. a Yes/No question or an address */
}
interface FieldGroup {
  title: string;
  fields: Field[];
}

function placeholderGroups(personName: string, dob: string): FieldGroup[] {
  const [first, ...rest] = personName.split(" ");
  const last = rest.pop() ?? "";
  const middle = rest.join(" ");
  return [
    {
      title: "PERSONAL DETAILS",
      fields: [
        { label: "Salutation", value: "Mr." },
        { label: "First Name", value: first },
        { label: "Middle Name", value: middle || "—" },
        { label: "Last Name", value: last },
        { label: "Gender", value: "Male" },
        { label: "Date of Birth", value: dob },
        { label: 'Are you a "Politically Exposed Person" (PEP) or a close relative of PEP?', value: "No", full: true },
        { label: "Do you have any criminal proceedings initiated against you?", value: "No", full: true },
      ],
    },
    {
      title: "COMMUNICATION DETAILS",
      fields: [
        { label: "Mobile", value: "+91 98765 43210" },
        { label: "Email ID", value: "kallarac@gmail.com" },
      ],
    },
    {
      title: "ADDRESS DETAILS",
      fields: [
        {
          label: "Permanent Address",
          value: "B 101 / Koyna CHS, Gokul Complex, Shantivan, Opp. HDFC Bank, Near Sanjay Gandhi National Park, Mumbai - 400062",
          full: true,
        },
      ],
    },
  ];
}

// ============================================================
// FieldGroups — renders the 2-column field grid (with full-width rows
// for long labels/answers) inside an EXPANDED accordion. Purely
// presentational; takes whatever placeholderGroups() (or real data)
// hands it.
// ============================================================
function FieldGroups({ groups }: { groups: FieldGroup[] }) {
  return (
    <div className="field-groups">
      {groups.map((g) => (
        <div className="field-group" key={g.title}>
          <div className="field-group-title">
            <span>{g.title}</span>
            <span className="field-group-rule" />
          </div>
          <div className="field-grid">
            {g.fields.map((f) => (
              <div className={f.full ? "field-cell field-cell-full" : "field-cell"} key={f.label}>
                <span className="field-label">{f.label}</span>
                <span className="field-value">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SECTIONS — the 5 accordions rendered under EACH person. Add/remove/
// reorder entries here to change what accordions appear; PersonGroup
// below maps over this array once per person.
// ============================================================
type SectionKey = "policyholder" | "health" | "insurance" | "nominee" | "bank";

const SECTIONS: { key: SectionKey; title: string }[] = [
  { key: "policyholder", title: "Policyholder Details" },
  { key: "health", title: "Health & Lifestyle Details" },
  { key: "insurance", title: "Existing Insurance" },
  { key: "nominee", title: "Nominee Details" },
  { key: "bank", title: "Bank Details" },
];

/* Demo flag driving the "nominee = proposer, Edit disabled" state.
   In the real build this comes from the actual nominee data instead
   of being hardcoded true. */
const NOMINEE_EQUALS_PROPOSER = true;

/* Full journey strip, matching the real design's "Stages" bar (it's a
   horizontally scrolling strip of every stage, not just the neighbours
   of the active one — the active pill sits with earlier/later stages
   bleeding off both edges, which is what reads as "real"). Content per
   the project's proposal journey; only "Preview & E-sign" is active
   here. */
const JOURNEY_STEPS = [
  "CLP",
  "Quote",
  "Riders",
  "KYC",
  "Proposal Form",
  "Bank Details",
  "Preview & E-sign",
  "Document Upload",
  "Video Verification",
  "Medical Test",
] as const;
const ACTIVE_STEP = "Preview & E-sign"; // change this + the array order to move the "active" pill elsewhere

// ============================================================
// PEOPLE / E-SIGN DATA MODELS
// ============================================================
interface Person {
  name: string;
  role: string;
  dob: string;
  maskedMobile: string;
}
const PEOPLE: Person[] = [
  { name: "Kallara Chithra", role: "Proposer", dob: "26/11/1994", maskedMobile: "+91 *******889" },
  { name: "Ananthapadmanabhan Swaminathan", role: "Life Assured", dob: "14/03/1996", maskedMobile: "+91 *******889" },
];

interface SignEntry {
  place: string;
  date: string;
  consent: boolean;
  touched: boolean; /* becomes true once Submit has been attempted */
}
const emptySign = (): SignEntry => ({ place: "Mumbai", date: "", consent: false, touched: false });

// ============================================================
// EsignBlock — one person's "Place / Date / OTP consent" card.
// - Checking the consent checkbox IS the e-sign action; there's no
//   separate OTP-entry step (matches the real Figma design, which has
//   no such UI — an earlier version of this prototype invented one).
// - `entry.touched` only flips true once Submit has been clicked, so
//   errors don't show while the person is still filling the form in.
// - Validation is inline: red border + "Please enter a value/date"
//   under each bad input, plus a block-level "⊘ Please complete..."
//   line, pulled from the design's own error reference frame.
// ============================================================
function EsignBlock({
  person,
  entry,
  onChange,
  cardRef,
}: {
  person: Person;
  entry: SignEntry;
  onChange: (next: SignEntry) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const placeError = entry.touched && !entry.place.trim();
  const dateError = entry.touched && !entry.date.trim();
  const consentError = entry.touched && !entry.consent;
  const incomplete = placeError || dateError || consentError;

  return (
    <div className="esign-card" ref={cardRef}>
      <p className="esign-title">
        E-Sign for {person.name} ({person.role})
      </p>

      <div className="esign-form">
        <div className="input-wrap">
          <span className="float-label">
            Place of E-Signing<span className="req">*</span>
          </span>
          <input
            className="esign-input"
            data-error={placeError ? "true" : undefined}
            value={entry.place}
            onChange={(e) => onChange({ ...entry, place: e.target.value })}
          />
          {placeError ? <span className="esign-field-error">Please enter a value</span> : null}
        </div>

        <div className="input-wrap">
          <span className="float-label">
            Date<span className="req">*</span>
          </span>
          <input
            className="esign-input"
            data-error={dateError ? "true" : undefined}
            type="text"
            placeholder="DD/MM/YYYY"
            value={entry.date}
            onChange={(e) => onChange({ ...entry, date: e.target.value })}
          />
          {dateError ? <span className="esign-field-error">Please enter the date</span> : null}
        </div>

        <p className="esign-consent-label">OTP Verification Consent</p>
        <label className="esign-consent">
          <input
            type="checkbox"
            checked={entry.consent}
            onChange={(e) => onChange({ ...entry, consent: e.target.checked })}
          />
          <span>
            I hereby give my consent to SBI Life Insurance Company Ltd to use my Mobile Number{" "}
            {person.maskedMobile}, for sending One Time Password(OTP), for authentication purposes and I hereby
            agree and consent that the authentication through OTP verification will be considered as my signature
            on the Proposal Form and that there is no need for my physical signatures on these documents once OTP
            based authentication is done. SBI Life Insurance Company Ltd has informed me that the OTP would be
            used only for processing my SBI Life application form for SBI Life - Smart Shield Plus (UIN-111NXXXV01).
          </span>
        </label>
        {consentError ? (
          <p className="esign-block-error">⊘ Please complete the e-signature before proceeding.</p>
        ) : null}
      </div>

      {!incomplete && entry.touched ? <p className="esign-verified">✓ E-signed</p> : null}
    </div>
  );
}

// ============================================================
// PersonGroup — one person's heading + their 5 SECTIONS, each as an
// Accordion. Renders once for the Proposer and once for the Life
// Assured (see PEOPLE below); each person's accordions are fully
// independent — opening one never affects the other person's group.
// ============================================================
function PersonGroup({
  person,
  personIdx,
  open,
  onToggle,
  onEdit,
}: {
  person: Person;
  personIdx: number;
  open: Record<string, boolean>;
  onToggle: (sectionKey: SectionKey) => void;
  onEdit: () => void;
}) {
  const groups = placeholderGroups(person.name, person.dob);
  return (
    <div className="person-group">
      <p className="person-heading">
        Preview Details for {person.name} ({person.role})
      </p>
      <p className="person-subtext">
        {person.role === "Proposer" ? "For the person buying this policy." : "For the person whose life is insured under this policy."}
      </p>

      {SECTIONS.map((s) => (
        <Accordion
          key={s.key}
          title={s.title}
          open={!!open[`${personIdx}-${s.key}`]}
          onToggle={() => onToggle(s.key)}
          onEdit={onEdit}
          editDisabled={s.key === "nominee" ? NOMINEE_EQUALS_PROPOSER : undefined}
          editDisabledReason={
            s.key === "nominee"
              ? "Nominee is the same as the Proposer, so this is set from their basic details."
              : undefined
          }
        >
          <FieldGroups groups={groups} />
        </Accordion>
      ))}
    </div>
  );
}

export interface PreviewEsignPageProps {
  /** Fired from ANY section's "Edit" — every section routes to the same
      Policyholder Details page for this prototype. */
  onEditPolicyholder: () => void;
  onBack?: () => void;
}

export default function PreviewEsignPage({ onEditPolicyholder, onBack }: PreviewEsignPageProps) {
  // ---- accordion open/closed state -------------------------------
  // Keyed "<personIndex>-<sectionKey>" (e.g. "0-nominee") so each
  // person's accordions are fully independent of the other's, and any
  // number can be open at once — no auto-collapse. Policyholder
  // Details for person 0 (Proposer) starts open; everything else
  // starts collapsed.
  const [open, setOpen] = useState<Record<string, boolean>>({ "0-policyholder": true });
  const toggleFor = (personIdx: number) => (sectionKey: SectionKey) =>
    setOpen((o) => ({ ...o, [`${personIdx}-${sectionKey}`]: !o[`${personIdx}-${sectionKey}`] }));

  // ---- e-sign form state (place / date / consent per person) ----
  const [signState, setSignState] = useState<Record<number, SignEntry>>({
    0: emptySign(),
    1: emptySign(),
  });

  // Refs to each person's e-sign card, so Submit can scroll to the
  // first incomplete one.
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  /* Scroll the active step into the middle of the strip on mount, so it
     shows with earlier/later stages bleeding off both edges — matching
     the real design rather than a tidy, fully-visible 3-chip row. */
  const activeStepRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    activeStepRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  // Submit: mark every e-sign entry "touched" (so errors become
  // visible), then either scroll to the first incomplete one, or show
  // a mock success alert if everything's filled in.
  const onSubmit = () => {
    const withTouched = PEOPLE.map((_, i) => ({ ...signState[i], touched: true }));
    setSignState({ 0: withTouched[0], 1: withTouched[1] });

    const idx = withTouched.findIndex((e) => !e.place.trim() || !e.date.trim() || !e.consent);
    if (idx !== -1) {
      cardRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    // eslint-disable-next-line no-alert
    alert("Proposal submitted (mock).");
  };

  return (
    <div className="pv-page">
      <style>{`
        /* Page shell: fixed full-screen flex column of 3 pieces —
           .pv-topchrome (fixed), .pv-body (the only scrolling piece),
           .pv-footer (fixed). See the section comments in the JSX
           below for what's inside each. */
        .pv-page { position: fixed; inset: 0; display: flex; flex-direction: column; background: #fff; font-family: inherit; }

        /* ---- top chrome: product header + journey progress ---- */
        .pv-topchrome { flex: none; border-bottom: 1px solid ${BORDER}; }
        .pv-product-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 14px 16px 10px;
        }
        .pv-product-name { font-size: 15px; font-weight: 800; line-height: 1.3; color: ${NAVY}; }
        .pv-product-name .brand { color: ${PINK}; }
        .pv-product-uin { font-size: 11px; color: ${GRAY}; margin-top: 2px; }
        .pv-save-exit {
          flex: none; border: 1px solid ${NAVY}; background: #fff; border-radius: 20px;
          padding: 7px 14px; font-size: 12.5px; font-weight: 700; color: ${NAVY}; cursor: pointer;
        }
        .pv-progress-row {
          background: #f4f2f8; padding: 10px 16px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pv-progress-label { font-size: 12.5px; font-weight: 700; color: ${NAVY}; }
        .pv-progress-pct { font-size: 12.5px; font-weight: 700; color: ${NAVY}; }
        .pv-progress-track { height: 4px; border-radius: 2px; background: #e0dceb; margin: 0 16px 12px; overflow: hidden; }
        .pv-progress-fill { height: 100%; width: 70%; background: linear-gradient(90deg, ${PINK}, ${NAVY}); }
        .pv-steps { display: flex; gap: 8px; padding: 10px 16px; overflow-x: auto; }
        .pv-step {
          flex: none; display: flex; align-items: center; gap: 6px;
          border-radius: 20px; padding: 7px 12px; font-size: 12px; font-weight: 500; white-space: nowrap;
          background: #f4f2f8; color: ${GRAY};
        }
        .pv-step[data-active="true"] { border: 1px solid ${NAVY}; background: #fff; color: ${NAVY}; font-weight: 700; }

        .pv-back-link {
          border: none; background: none; padding: 0; font-size: 13px; font-weight: 700;
          color: ${NAVY}; cursor: pointer;
        }

        /* scrollbar-gutter reserves the scrollbar's width up front, so
           opening an accordion that pushes content past the viewport
           doesn't shove everything sideways the instant a scrollbar
           appears — this is the actual cause of the "page shifts"
           feeling on expand. */
        .pv-body { flex: 1; min-height: 0; overflow-y: auto; scrollbar-gutter: stable; -webkit-overflow-scrolling: touch; padding: 16px; }

        .pv-banner {
          display: flex; gap: 10px;
          background: #e6f6fb; border-left: 3px solid #1aa6c4; border-radius: 6px;
          padding: 12px 14px; font-size: 13px; color: #1a1a1a; line-height: 1.45; margin-bottom: 20px;
        }

        .person-group { margin-bottom: 24px; }
        .person-heading { font-size: 19px; font-weight: 800; color: ${NAVY}; line-height: 1.3; margin: 0 0 4px; }
        .person-subtext { font-size: 13px; color: ${GRAY}; margin: 0 0 14px; }

        .field-groups { display: flex; flex-direction: column; gap: 18px; }
        .field-group-title {
          display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
        }
        .field-group-title span:first-child { font-size: 11px; font-weight: 800; letter-spacing: .03em; color: ${NAVY}; text-transform: uppercase; white-space: nowrap; }
        .field-group-rule { flex: 1; height: 1px; background: ${BORDER}; }
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 12px; }
        .field-cell { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .field-cell-full { grid-column: 1 / -1; }
        .field-label { font-size: 11px; color: ${GRAY}; line-height: 1.3; }
        .field-value { font-size: 13.5px; font-weight: 500; color: #111; line-height: 1.35; }

        .pv-declaration { font-size: 12.5px; color: ${NAVY}; font-weight: 700; line-height: 1.5; margin: 4px 0 14px; }
        .pv-alert {
          background: #e6f6fb; border-left: 3px solid #1aa6c4; border-radius: 6px;
          padding: 12px 14px; font-size: 13px; color: #111; font-weight: 600; line-height: 1.45; margin-bottom: 20px;
        }

        /* ---- E-sign card, matching float-label inputs used elsewhere ---- */
        .esign-card { border: 1px solid ${BORDER}; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        .esign-title { font-size: 15px; font-weight: 700; color: ${NAVY}; margin: 0 0 14px; }
        .esign-form { display: flex; flex-direction: column; gap: 14px; }
        .input-wrap { position: relative; }
        .float-label {
          position: absolute; top: -8px; left: 10px; background: #fff; padding: 0 4px;
          font-size: 11px; color: ${GRAY};
        }
        .req { color: ${PINK}; margin-left: 2px; }
        .esign-input {
          width: 100%; box-sizing: border-box; height: 44px; padding: 0 14px;
          border: 1px solid ${BORDER}; border-radius: 6px; font-size: 14px; color: #111;
        }
        .esign-input:focus { outline: none; border-color: ${NAVY}; }
        .esign-input[data-error="true"] { border-color: ${ERROR}; }
        .esign-field-error { display: block; font-size: 11px; color: ${ERROR}; margin-top: 4px; }
        .esign-consent-label { font-size: 13px; font-weight: 700; color: #111; margin: 0; }
        .esign-consent {
          display: flex; gap: 10px; align-items: flex-start; cursor: pointer;
          font-size: 12px; color: rgba(0,0,0,.6); line-height: 1.4;
        }
        .esign-consent input { width: 16px; height: 16px; margin-top: 1px; accent-color: ${NAVY}; flex-shrink: 0; }
        .esign-block-error { font-size: 12px; font-weight: 700; color: ${ERROR}; margin: 2px 0 0; }
        .esign-verified { font-size: 13px; font-weight: 700; color: #2e7d32; margin: 10px 0 0; }

        .pv-questions-btn {
          display: inline-flex; align-items: center; gap: 6px;
          border: 1px solid ${NAVY}; background: #fff; border-radius: 20px;
          padding: 8px 16px; font-size: 13px; font-weight: 700; color: ${NAVY}; cursor: pointer;
        }

        /* Fixed footer: Action Row (Got Questions) + divider + Bottom Nav
           Row (Back/Submit) — matches the real "Mobile Footer" component. */
        .pv-footer { flex: none; background: #fff; }
        .pv-footer-action-row { padding: 6px 16px; display: flex; align-items: center; }
        .pv-footer-divider { height: 1px; background: ${BORDER}; }
        .pv-footer-nav-row {
          padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .pv-submit {
          border: none; border-radius: 24px; background: ${NAVY}; color: #fff;
          font-size: 15px; font-weight: 700; padding: 13px 32px; cursor: pointer;
        }
      `}</style>

      {/* ================= TOP CHROME (fixed) =================
          Product name/UIN + Save & Exit → journey progress bar →
          the scrollable stage strip. Everything here is static/fixed,
          only pv-body below scrolls. */}
      <div className="pv-topchrome">
        <div className="pv-product-row">
          <div>
            <div className="pv-product-name">
              <span className="brand">SBI Life</span> - Smart Elite Plus
            </div>
            <div className="pv-product-uin">UIN: 111L150V01</div>
          </div>
          <button type="button" className="pv-save-exit">Save &amp; Exit</button>
        </div>
        <div className="pv-progress-row">
          <span className="pv-progress-label">Your Proposal Journey</span>
          <span className="pv-progress-pct">70% Completed</span>
        </div>
        <div className="pv-progress-track"><div className="pv-progress-fill" /></div>

        {/* Horizontally-scrolling stage strip — ALL journey stages,
            not just neighbours of the active one, so it bleeds off
            both edges like the real design instead of looking like a
            tidy, fully-visible 3-chip row. Steps after the active one
            get a 🔒, the active one gets a ✎, earlier ones get nothing.
            activeStepRef + the useEffect above scroll it into view. */}
        <div className="pv-steps">
          {JOURNEY_STEPS.map((step, i) => {
            const active = step === ACTIVE_STEP;
            const activeIdx = JOURNEY_STEPS.indexOf(ACTIVE_STEP);
            const upcoming = i > activeIdx;
            return (
              <span
                key={step}
                ref={active ? activeStepRef : undefined}
                className="pv-step"
                data-active={active ? "true" : undefined}
              >
                {active ? "✎ " : upcoming ? "🔒 " : ""}
                {step}
              </span>
            );
          })}
        </div>
      </div>

      {/* ================= SCROLLABLE BODY =================
          Banner → both people's accordion groups → declaration text +
          "can't be edited" alert → both people's e-sign cards. */}
      <div className="pv-body">
        <div className="pv-banner">
          🎉
          <span>
            You&apos;re almost there! Review your proposal details carefully before e-signing. You can edit any
            information that needs to be corrected.
          </span>
        </div>

        {/* One PersonGroup per entry in PEOPLE — add a 3rd person here
            (e.g. a second Life Assured) and it renders automatically. */}
        {PEOPLE.map((p, i) => (
          <PersonGroup
            key={p.name}
            person={p}
            personIdx={i}
            open={open}
            onToggle={toggleFor(i)}
            onEdit={onEditPolicyholder}
          />
        ))}

        <p className="pv-declaration">
          Please go through all the information thoroughly. Verifying your mobile number via OTP would mean that
          all the above information is correct.
        </p>
        <div className="pv-alert">Once you e-sign, your proposal details will be finalised and cannot be edited.</div>

        {/* One e-sign card per person — same PEOPLE array as above. */}
        {PEOPLE.map((p, i) => (
          <EsignBlock
            key={p.name}
            person={p}
            entry={signState[i]}
            onChange={(next) => setSignState((s) => ({ ...s, [i]: next }))}
            cardRef={(el) => {
              cardRefs.current[i] = el;
            }}
          />
        ))}
      </div>

      {/* ================= FIXED FOOTER =================
          The real "Mobile Footer" component is TWO stacked rows in one
          fixed panel — an Action Row ("Got Questions Button") above a
          divider, then a Bottom Navigation Bar (Back + Submit) below it.
          Got Questions is NOT part of the scrolling body — it belongs
          here, or it ends up crowding the Back/Submit row. */}
      <footer className="pv-footer">
        <div className="pv-footer-action-row">
          <button type="button" className="pv-questions-btn">📞 Got Questions?</button>
        </div>
        <div className="pv-footer-divider" />
        <div className="pv-footer-nav-row">
          <button type="button" className="pv-back-link" onClick={onBack}>
            ‹ Back
          </button>
          <button type="button" className="pv-submit" onClick={onSubmit}>
            Submit
          </button>
        </div>
      </footer>
    </div>
  );
}

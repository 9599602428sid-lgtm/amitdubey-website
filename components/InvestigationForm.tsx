"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { submitInvestigation, type SubmitResult } from "@/app/actions/submit-investigation";
import { getCopy } from "@/content/en";
import {
  CATEGORIES,
  DECLARATIONS,
  INDIA_STATES,
  MAX_FILES,
  MAX_FILE_BYTES,
  MIN_ESTABLISH_CHARS,
  PREFERRED_CONTACT,
  RELATIONSHIPS,
  URGENCY_OPTIONS,
} from "@/lib/constants";
import { COUNTRIES, DIAL_CODES } from "@/lib/countries";

const copy = getCopy();
const DRAFT_KEY = "cd-investigation-draft";

type Draft = {
  step: number;
  startedAt: string;
  subjectLocation: string;
  clientCountry: string;
  category: string;
  subcategory: string;
  indiaState: string;
  indiaCity: string;
  urgency: string;
  moneyAtRisk: string;
  fullName: string;
  email: string;
  phoneCountry: string;
  phoneNumber: string;
  preferredContact: string;
  clientCity: string;
  clientType: string;
  organisationName: string;
  organisationRole: string;
  establish: string;
  relationship: string;
  relationshipOther: string;
  purpose: string;
  adverseDecision: string;
  reportedAuthorities: string;
  courtCase: string;
  valueAtRisk: string;
  d1: boolean;
  d2: boolean;
  d3: boolean;
  d4: boolean;
};

const emptyDraft = (): Draft => ({
  step: 1,
  startedAt: String(Date.now()),
  subjectLocation: "",
  clientCountry: "",
  category: "",
  subcategory: "",
  indiaState: "",
  indiaCity: "",
  urgency: "",
  moneyAtRisk: "",
  fullName: "",
  email: "",
  phoneCountry: "+91",
  phoneNumber: "",
  preferredContact: "",
  clientCity: "",
  clientType: "",
  organisationName: "",
  organisationRole: "",
  establish: "",
  relationship: "",
  relationshipOther: "",
  purpose: "",
  adverseDecision: "",
  reportedAuthorities: "",
  courtCase: "",
  valueAtRisk: "",
  d1: false,
  d2: false,
  d3: false,
  d4: false,
});

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inv-field" data-invalid={error ? "true" : "false"}>
      <label htmlFor={id}>{label}</label>
      {hint ? <span className="inv-hint" id={`${id}-hint`}>{hint}</span> : null}
      {children}
      {error ? (
        <p className="inv-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function InvestigationForm() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [hydrated, setHydrated] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Draft>;
        setDraft({ ...emptyDraft(), ...parsed, d1: false, d2: false, d3: false, d4: false });
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const { d1, d2, d3, d4, ...rest } = draft;
    void d1;
    void d2;
    void d3;
    void d4;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
  }, [draft, hydrated]);

  const set = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const subs = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.id === draft.category);
    return cat ? cat.subcategories : [];
  }, [draft.category]);

  const blocked = draft.subjectLocation === "OUTSIDE";

  function validateStep(step: number): Record<string, string> {
    const next: Record<string, string> = {};
    if (step === 1) {
      if (!draft.subjectLocation) next.subjectLocation = copy.form.required;
      if (draft.subjectLocation === "OUTSIDE") return next;
      if (!draft.clientCountry) next.clientCountry = copy.form.required;
      if (!draft.category) next.category = copy.form.required;
      if (!draft.subcategory) next.subcategory = copy.form.required;
      if (!draft.indiaState) next.indiaState = copy.form.required;
      if (!draft.urgency) next.urgency = copy.form.required;
      if (!draft.moneyAtRisk) next.moneyAtRisk = copy.form.required;
    }
    if (step === 2) {
      if (!draft.fullName) next.fullName = copy.form.required;
      if (!draft.email) next.email = copy.form.required;
      if (!draft.phoneNumber) next.phoneNumber = copy.form.required;
      if (!draft.preferredContact) next.preferredContact = copy.form.required;
      if (!draft.clientCity) next.clientCity = copy.form.required;
      if (!draft.clientType) next.clientType = copy.form.required;
      if (draft.clientType === "organisation") {
        if (!draft.organisationName) next.organisationName = copy.form.required;
        if (!draft.organisationRole) next.organisationRole = copy.form.required;
      }
    }
    if (step === 3) {
      if (draft.establish.trim().length < MIN_ESTABLISH_CHARS) {
        next.establish = `Please write at least ${MIN_ESTABLISH_CHARS} characters.`;
      }
      if (!draft.relationship) next.relationship = copy.form.required;
      if (draft.relationship === "Other" && !draft.relationshipOther) next.relationshipOther = copy.form.required;
      if (!draft.purpose) next.purpose = copy.form.required;
      if (!draft.adverseDecision) next.adverseDecision = copy.form.required;
      if (!draft.reportedAuthorities) next.reportedAuthorities = copy.form.required;
      if (!draft.courtCase) next.courtCase = copy.form.required;
    }
    if (step === 4) {
      for (const d of DECLARATIONS) {
        if (!draft[d.id]) next[d.id] = copy.form.required;
      }
    }
    return next;
  }

  function goNext() {
    const nextErrors = validateStep(draft.step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (blocked) return;
    setDraft((prev) => ({ ...prev, step: Math.min(4, prev.step + 1) }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = { ...validateStep(1), ...validateStep(2), ...validateStep(3), ...validateStep(4) };
    setErrors(nextErrors);
    if (blocked || Object.keys(nextErrors).length) {
      setDraft((prev) => ({ ...prev, step: blocked ? 1 : prev.step }));
      return;
    }
    setSubmitting(true);
    setResult(null);
    const data = new FormData();
    const entries: Record<string, string> = {
      subjectLocation: draft.subjectLocation,
      clientCountry: draft.clientCountry,
      category: draft.category,
      subcategory: draft.subcategory,
      indiaState: draft.indiaState,
      indiaCity: draft.indiaCity,
      urgency: draft.urgency,
      moneyAtRisk: draft.moneyAtRisk,
      fullName: draft.fullName,
      email: draft.email,
      phoneCountry: draft.phoneCountry,
      phoneNumber: draft.phoneNumber,
      preferredContact: draft.preferredContact,
      clientCity: draft.clientCity,
      clientType: draft.clientType,
      organisationName: draft.organisationName,
      organisationRole: draft.organisationRole,
      establish: draft.establish,
      relationship: draft.relationship,
      relationshipOther: draft.relationshipOther,
      purpose: draft.purpose,
      adverseDecision: draft.adverseDecision,
      reportedAuthorities: draft.reportedAuthorities,
      courtCase: draft.courtCase,
      valueAtRisk: draft.valueAtRisk,
      startedAt: draft.startedAt,
      website: "",
      d1: String(draft.d1),
      d2: String(draft.d2),
      d3: String(draft.d3),
      d4: String(draft.d4),
    };
    for (const [k, v] of Object.entries(entries)) data.set(k, v);
    for (const file of files) data.append("files", file);

    const response = await submitInvestigation(data);
    setSubmitting(false);
    setResult(response);
    if (response.ok) {
      localStorage.removeItem(DRAFT_KEY);
    }
  }

  if (result?.ok) {
    return (
      <div className="inv-success">
        <p className="inv-kicker">{copy.form.successTitle}</p>
        <p className="inv-case" aria-live="polite">
          {result.caseNumber}
        </p>
        <p>{copy.form.successLead}</p>
        <p>{copy.form.successNext}</p>
        <p className="inv-hint">{copy.workingHours}</p>
        <div className="inv-actions">
          <button
            type="button"
            className="inv-btn"
            onClick={() => {
              setResult(null);
              setDraft(emptyDraft());
              setFiles([]);
              setErrors({});
            }}
          >
            {copy.form.another}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="inv-form" onSubmit={onSubmit} noValidate>
      <ol className="inv-progress" aria-label="Form steps">
        {copy.form.steps.map((label, index) => (
          <li key={label} data-active={draft.step === index + 1}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {result && !result.ok ? (
        <div className="inv-errors" role="alert">
          <p>{result.code === "NOT_INDIA" ? copy.indiaGate : result.message || copy.form.errorGeneric}</p>
          {result.issues?.length ? (
            <ul>
              {result.issues.map((issue) => (
                <li key={issue.field}>{issue.message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <p className="inv-hp">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </p>

      {draft.step === 1 ? (
        <fieldset>
          <legend className="inv-legend">{copy.form.step1Title}</legend>
          <Field id="subjectLocation" label={copy.form.subjectLocation} error={errors.subjectLocation}>
            <select
              id="subjectLocation"
              name="subjectLocation"
              value={draft.subjectLocation}
              onChange={(e) => set("subjectLocation", e.target.value)}
              required
            >
              <option value="">{copy.form.select}</option>
              <option value="IN">{copy.form.subjectIndia}</option>
              <option value="OUTSIDE">{copy.form.subjectOther}</option>
            </select>
          </Field>

          {blocked ? (
            <div className="inv-stop" role="status">
              <p>{copy.indiaGate}</p>
            </div>
          ) : (
            <>
              <Field id="clientCountry" label={copy.form.clientCountry} hint={copy.form.clientCountryHint} error={errors.clientCountry}>
                <select
                  id="clientCountry"
                  value={draft.clientCountry}
                  onChange={(e) => set("clientCountry", e.target.value)}
                >
                  <option value="">{copy.form.select}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="category" label={copy.form.category} error={errors.category}>
                <select
                  id="category"
                  value={draft.category}
                  onChange={(e) => {
                    set("category", e.target.value);
                    set("subcategory", "");
                  }}
                >
                  <option value="">{copy.form.select}</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="subcategory" label={copy.form.subcategory} error={errors.subcategory}>
                <select
                  id="subcategory"
                  value={draft.subcategory}
                  onChange={(e) => set("subcategory", e.target.value)}
                  disabled={!subs.length}
                >
                  <option value="">{copy.form.select}</option>
                  {subs.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="indiaState" label={copy.form.indiaState} hint={copy.form.indiaWhere} error={errors.indiaState}>
                <select id="indiaState" value={draft.indiaState} onChange={(e) => set("indiaState", e.target.value)}>
                  <option value="">{copy.form.select}</option>
                  {INDIA_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="indiaCity" label={copy.form.indiaCity}>
                <input id="indiaCity" value={draft.indiaCity} onChange={(e) => set("indiaCity", e.target.value)} />
              </Field>
              <Field id="urgency" label={copy.form.urgency} error={errors.urgency}>
                <select id="urgency" value={draft.urgency} onChange={(e) => set("urgency", e.target.value)}>
                  <option value="">{copy.form.select}</option>
                  {URGENCY_OPTIONS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="moneyAtRisk" label={copy.form.moneyAtRisk} error={errors.moneyAtRisk}>
                <select id="moneyAtRisk" value={draft.moneyAtRisk} onChange={(e) => set("moneyAtRisk", e.target.value)}>
                  <option value="">{copy.form.select}</option>
                  <option value="yes">{copy.form.yes}</option>
                  <option value="no">{copy.form.no}</option>
                </select>
              </Field>
              {draft.moneyAtRisk === "yes" ? (
                <div className="inv-callout" role="status">
                  {copy.moneyAtRisk}
                </div>
              ) : null}
            </>
          )}
        </fieldset>
      ) : null}

      {draft.step === 2 ? (
        <fieldset>
          <legend className="inv-legend">{copy.form.step2Title}</legend>
          <Field id="fullName" label={copy.form.fullName} error={errors.fullName}>
            <input id="fullName" autoComplete="name" value={draft.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </Field>
          <Field id="email" label={copy.form.email} hint={copy.form.emailHint} error={errors.email}>
            <input id="email" type="email" autoComplete="email" value={draft.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <div className="inv-field" data-invalid={errors.phoneNumber ? "true" : "false"}>
            <label htmlFor="phoneNumber">{copy.form.phone}</label>
            <span className="inv-hint">{copy.form.phoneHint}</span>
            <div className="inv-phone">
              <select
                id="phoneCountry"
                aria-label="Country code"
                value={draft.phoneCountry}
                onChange={(e) => set("phoneCountry", e.target.value)}
              >
                {DIAL_CODES.map((d) => (
                  <option key={`${d.code}-${d.dial}`} value={d.dial}>
                    {d.dial} {d.name}
                  </option>
                ))}
              </select>
              <input
                id="phoneNumber"
                autoComplete="tel-national"
                inputMode="tel"
                value={draft.phoneNumber}
                onChange={(e) => set("phoneNumber", e.target.value)}
              />
            </div>
            {errors.phoneNumber ? <p className="inv-error">{errors.phoneNumber}</p> : null}
          </div>
          <Field id="preferredContact" label={copy.form.preferredContact} error={errors.preferredContact}>
            <select
              id="preferredContact"
              value={draft.preferredContact}
              onChange={(e) => set("preferredContact", e.target.value)}
            >
              <option value="">{copy.form.select}</option>
              {PREFERRED_CONTACT.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="clientCity" label={copy.form.clientCity} error={errors.clientCity}>
            <input id="clientCity" value={draft.clientCity} onChange={(e) => set("clientCity", e.target.value)} />
          </Field>
          <Field id="clientType" label={copy.form.clientType} error={errors.clientType}>
            <select id="clientType" value={draft.clientType} onChange={(e) => set("clientType", e.target.value)}>
              <option value="">{copy.form.select}</option>
              <option value="individual">{copy.form.individual}</option>
              <option value="organisation">{copy.form.organisation}</option>
            </select>
          </Field>
          {draft.clientType === "organisation" ? (
            <>
              <Field id="organisationName" label={copy.form.organisationName} error={errors.organisationName}>
                <input id="organisationName" value={draft.organisationName} onChange={(e) => set("organisationName", e.target.value)} />
              </Field>
              <Field id="organisationRole" label={copy.form.organisationRole} error={errors.organisationRole}>
                <input id="organisationRole" value={draft.organisationRole} onChange={(e) => set("organisationRole", e.target.value)} />
              </Field>
            </>
          ) : null}
        </fieldset>
      ) : null}

      {draft.step === 3 ? (
        <fieldset>
          <legend className="inv-legend">{copy.form.step3Title}</legend>
          <Field id="establish" label={copy.form.establish} hint={copy.form.establishHint} error={errors.establish}>
            <textarea
              id="establish"
              value={draft.establish}
              onChange={(e) => set("establish", e.target.value)}
              minLength={MIN_ESTABLISH_CHARS}
            />
          </Field>
          <Field id="relationship" label={copy.form.relationship} error={errors.relationship}>
            <select id="relationship" value={draft.relationship} onChange={(e) => set("relationship", e.target.value)}>
              <option value="">{copy.form.select}</option>
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          {draft.relationship === "Other" ? (
            <Field id="relationshipOther" label={copy.form.relationshipOther} error={errors.relationshipOther}>
              <input
                id="relationshipOther"
                value={draft.relationshipOther}
                onChange={(e) => set("relationshipOther", e.target.value)}
              />
            </Field>
          ) : null}
          <Field id="purpose" label={copy.form.purpose} error={errors.purpose}>
            <textarea id="purpose" value={draft.purpose} onChange={(e) => set("purpose", e.target.value)} />
          </Field>
          <Field id="adverseDecision" label={copy.form.adverseDecision} hint={copy.form.adverseHint} error={errors.adverseDecision}>
            <select id="adverseDecision" value={draft.adverseDecision} onChange={(e) => set("adverseDecision", e.target.value)}>
              <option value="">{copy.form.select}</option>
              <option value="yes">{copy.form.yes}</option>
              <option value="no">{copy.form.no}</option>
            </select>
          </Field>
          <Field id="reportedAuthorities" label={copy.form.reported} error={errors.reportedAuthorities}>
            <select
              id="reportedAuthorities"
              value={draft.reportedAuthorities}
              onChange={(e) => set("reportedAuthorities", e.target.value)}
            >
              <option value="">{copy.form.select}</option>
              <option value="yes">{copy.form.yes}</option>
              <option value="no">{copy.form.no}</option>
              <option value="not_yet">{copy.form.notYet}</option>
            </select>
          </Field>
          <Field id="courtCase" label={copy.form.courtCase} error={errors.courtCase}>
            <select id="courtCase" value={draft.courtCase} onChange={(e) => set("courtCase", e.target.value)}>
              <option value="">{copy.form.select}</option>
              <option value="yes">{copy.form.yes}</option>
              <option value="no">{copy.form.no}</option>
            </select>
          </Field>
          <Field id="valueAtRisk" label={copy.form.valueAtRisk}>
            <input id="valueAtRisk" value={draft.valueAtRisk} onChange={(e) => set("valueAtRisk", e.target.value)} />
          </Field>
          <div className="inv-field">
            <label htmlFor="files">{copy.form.uploads}</label>
            <span className="inv-hint">{copy.form.uploadsHint}</span>
            <input
              id="files"
              name="files"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.docx,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                const list = Array.from(e.target.files || []).slice(0, MAX_FILES);
                setFiles(list.filter((f) => f.size <= MAX_FILE_BYTES));
              }}
            />
            <p className="inv-hint">{copy.uploadNotice}</p>
            {files.length ? (
              <ul>
                {files.map((f) => (
                  <li key={f.name}>
                    {f.name} ({Math.ceil(f.size / 1024)} KB)
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </fieldset>
      ) : null}

      {draft.step === 4 ? (
        <fieldset>
          <legend className="inv-legend">{copy.form.declarationsLegend}</legend>
          {DECLARATIONS.map((d) => (
            <label className="inv-check" key={d.id} htmlFor={d.id}>
              <input
                id={d.id}
                type="checkbox"
                checked={draft[d.id]}
                onChange={(e) => set(d.id, e.target.checked)}
              />
              <span>
                {d.text}{" "}
                {d.id === "d4" ? (
                  <>
                    <Link href="/investigations/privacy">Privacy Notice</Link>
                    {" · "}
                    <Link href="/investigations/terms">Terms</Link>
                  </>
                ) : null}
              </span>
            </label>
          ))}
          {errors.d1 || errors.d2 || errors.d3 || errors.d4 ? (
            <p className="inv-error" role="alert">
              All four confirmations are required.
            </p>
          ) : null}
        </fieldset>
      ) : null}

      <div className="inv-actions">
        {draft.step > 1 ? (
          <button type="button" className="inv-btn-secondary" onClick={() => set("step", draft.step - 1)}>
            {copy.form.back}
          </button>
        ) : null}
        {draft.step < 4 ? (
          <button type="button" className="inv-btn" onClick={goNext} disabled={blocked && draft.step === 1}>
            {copy.form.next}
          </button>
        ) : (
          <button type="submit" className="inv-btn" disabled={submitting}>
            {submitting ? copy.form.submitting : copy.form.submit}
          </button>
        )}
      </div>
    </form>
  );
}

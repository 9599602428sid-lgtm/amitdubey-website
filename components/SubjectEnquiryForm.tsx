"use client";

import { useState } from "react";
import { submitSubjectEnquiry } from "@/app/actions/submit-subject-enquiry";
import { getCopy } from "@/content/en";

const copy = getCopy();

export function SubjectEnquiryForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  return (
    <form
      className="inv-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await submitSubjectEnquiry(new FormData(event.currentTarget));
        setOk(result.ok);
        setStatus(result.message);
        if (result.ok) event.currentTarget.reset();
      }}
    >
      <p className="inv-hp">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </p>
      <div className="inv-field">
        <label htmlFor="name">{copy.subjectForm.name}</label>
        <input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="inv-field">
        <label htmlFor="email">{copy.subjectForm.email}</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="inv-field">
        <label htmlFor="message">{copy.subjectForm.message}</label>
        <textarea id="message" name="message" required minLength={20} />
      </div>
      {status ? (
        <p className={ok ? "inv-callout" : "inv-error"} role="status">
          {status}
        </p>
      ) : null}
      <button className="inv-btn" type="submit">
        {copy.subjectForm.submit}
      </button>
    </form>
  );
}

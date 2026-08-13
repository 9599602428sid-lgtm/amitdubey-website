"use client";

import { useEffect, useRef } from "react";
import { getCopy } from "@/content/en";

const copy = getCopy();

export function FileInvestigationButton({ hideOnFormPage = false }: { hideOnFormPage?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dialogRef.current?.close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (hideOnFormPage) return null;

  const open = () => {
    dialogRef.current?.showModal();
  };

  return (
    <>
      <button type="button" className="inv-float" onClick={open}>
        {copy.float.label}
      </button>
      <dialog ref={dialogRef} className="inv-dialog" aria-label={copy.float.dialogTitle}>
        <button
          type="button"
          className="inv-btn-secondary inv-dialog-close"
          onClick={() => dialogRef.current?.close()}
        >
          {copy.float.close}
        </button>
        <iframe className="inv-dialog-frame" title={copy.float.dialogTitle} src="/file-an-investigation?embed=1" />
      </dialog>
    </>
  );
}

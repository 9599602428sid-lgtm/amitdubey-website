"use client";

import { useEffect, useRef } from "react";
import { getCopy } from "@/content/en";

const copy = getCopy();
const FORM_SRC = "/file-an-investigation?embed=1";

export function FileInvestigationButton({ hideOnFormPage = false }: { hideOnFormPage?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dialogRef.current?.close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onToggle = () => {
      document.body.style.overflow = dialog.open ? "hidden" : "";
    };
    dialog.addEventListener("close", onToggle);
    dialog.addEventListener("cancel", onToggle);
    return () => {
      dialog.removeEventListener("close", onToggle);
      dialog.removeEventListener("cancel", onToggle);
      document.body.style.overflow = "";
    };
  }, []);

  if (hideOnFormPage) return null;

  const open = () => {
    const frame = frameRef.current;
    if (frame && frame.getAttribute("src") !== FORM_SRC) {
      frame.setAttribute("src", FORM_SRC);
    }
    dialogRef.current?.showModal();
    document.body.style.overflow = "hidden";
  };

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button type="button" className="inv-float" onClick={open}>
        {copy.float.label}
      </button>
      <dialog
        ref={dialogRef}
        className="inv-dialog"
        aria-labelledby="inv-dialog-title"
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <div className="inv-dialog-bar">
          <p id="inv-dialog-title" className="inv-dialog-title">
            {copy.float.dialogTitle}
          </p>
          <button type="button" className="inv-btn-secondary inv-dialog-close" onClick={close}>
            {copy.float.close}
          </button>
        </div>
        <iframe
          ref={frameRef}
          className="inv-dialog-frame"
          title={copy.float.dialogTitle}
          src="about:blank"
          referrerPolicy="same-origin"
        />
      </dialog>
    </>
  );
}

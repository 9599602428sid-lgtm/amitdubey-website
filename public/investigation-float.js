(function () {
  if (document.getElementById("cd-file-investigation")) return;

  var css =
    "#cd-file-investigation{position:fixed;right:20px;bottom:20px;z-index:40;background:#0f1c2e;color:#f7f5f0;border:0;border-radius:6px;min-height:48px;padding:14px 18px;font:700 16px/1.2 system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(15,28,46,.25)}" +
    "#cd-file-investigation:hover{background:#16263d}" +
    "#cd-file-investigation:focus{outline:3px solid #1a4f4a;outline-offset:3px}" +
    "#cd-inv-dialog{box-sizing:border-box;border:0;padding:0;background:transparent;overflow:hidden;" +
      "position:fixed;top:50%;left:50%;right:auto;bottom:auto;margin:0;" +
      "transform:translate(-50%,-50%);" +
      "width:min(880px,calc(100vw - 2.5rem));height:min(800px,calc(100dvh - 2.5rem));" +
      "max-width:calc(100vw - 2.5rem);max-height:calc(100dvh - 2.5rem);" +
      "border-radius:12px;box-shadow:0 24px 64px rgba(15,28,46,.4)}" +
    "#cd-inv-dialog::backdrop{background:rgba(15,28,46,.58)}" +
    "#cd-inv-window{display:flex;flex-direction:column;width:100%;height:100%;background:#f7f5f0;overflow:hidden;border-radius:12px}" +
    "#cd-inv-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;padding:10px 12px;background:#0f1c2e;color:#f7f5f0}" +
    "#cd-inv-bar p{margin:0;font:700 15px/1.3 system-ui,sans-serif}" +
    "#cd-inv-dialog iframe{width:100%;flex:1;min-height:0;border:0;display:block;background:#f7f5f0}" +
    "#cd-inv-close{background:transparent;border:1px solid rgba(247,245,240,.35);color:#f7f5f0;min-height:44px;padding:8px 12px;font:600 14px system-ui,sans-serif;cursor:pointer;border-radius:6px}" +
    "@media (max-width:640px){" +
    "#cd-file-investigation{left:0;right:0;bottom:0;width:100%;border-radius:0;padding-bottom:calc(14px + env(safe-area-inset-bottom,0px))}" +
    "#cd-inv-dialog{width:calc(100vw - 1.5rem);height:calc(100dvh - 1.5rem - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));max-width:calc(100vw - 1.5rem);max-height:calc(100dvh - 1.5rem - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));border-radius:10px}" +
    "}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var button = document.createElement("button");
  button.id = "cd-file-investigation";
  button.type = "button";
  button.textContent = "File an Investigation";
  document.body.appendChild(button);

  var dialog = document.createElement("dialog");
  dialog.id = "cd-inv-dialog";
  dialog.setAttribute("aria-labelledby", "cd-inv-dialog-title");
  dialog.innerHTML =
    '<div id="cd-inv-window">' +
    '<div id="cd-inv-bar">' +
    '<p id="cd-inv-dialog-title">File an Investigation</p>' +
    '<button type="button" id="cd-inv-close">Close</button>' +
    "</div>" +
    '<iframe title="File an Investigation" referrerpolicy="same-origin" src="about:blank" data-src="/file-an-investigation?embed=1"></iframe>' +
    "</div>";
  document.body.appendChild(dialog);

  var frame = dialog.querySelector("iframe");

  function setOpen(open) {
    document.body.style.overflow = open ? "hidden" : "";
  }

  function ensureFrame() {
    var src = frame.getAttribute("data-src");
    if (src && frame.getAttribute("src") !== src) {
      frame.setAttribute("src", src);
    }
  }

  button.addEventListener("click", function () {
    if (typeof dialog.showModal === "function") {
      ensureFrame();
      dialog.showModal();
      setOpen(true);
    } else {
      window.location.href = "/file-an-investigation";
    }
  });
  document.getElementById("cd-inv-close").addEventListener("click", function () {
    dialog.close();
    setOpen(false);
  });
  dialog.addEventListener("close", function () {
    setOpen(false);
  });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  function pad() {
    document.body.style.paddingBottom =
      window.innerWidth <= 640 ? "calc(72px + env(safe-area-inset-bottom, 0px))" : "";
  }
  pad();
  window.addEventListener("resize", pad);
})();

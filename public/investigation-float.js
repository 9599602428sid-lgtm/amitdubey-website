(function () {
  if (document.getElementById("cd-file-investigation")) return;

  var css =
    "#cd-file-investigation{position:fixed;right:20px;bottom:20px;z-index:9998;background:#0f1c2e;color:#f7f5f0;border:0;border-radius:6px;min-height:48px;padding:14px 18px;font:700 16px/1.2 Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(15,28,46,.25)}" +
    "#cd-file-investigation:hover{background:#16263d}" +
    "#cd-file-investigation:focus{outline:3px solid #1a4f4a;outline-offset:3px}" +
    "#cd-inv-dialog{border:0;padding:0;width:min(920px,96vw);height:min(90vh,900px);background:#f7f5f0}" +
    "#cd-inv-dialog::backdrop{background:rgba(15,28,46,.55)}" +
    "#cd-inv-dialog iframe{width:100%;height:100%;border:0}" +
    "#cd-inv-close{position:absolute;top:8px;right:8px;z-index:2;background:#fff;border:1px solid #e4e0d8;min-height:44px;padding:8px 12px;font:600 14px Inter,system-ui,sans-serif;cursor:pointer}" +
    "@media (max-width:640px){#cd-file-investigation{left:0;right:0;bottom:0;width:100%;border-radius:0}}";

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
  dialog.setAttribute("aria-label", "File an Investigation");
  dialog.innerHTML =
    '<button type="button" id="cd-inv-close">Close form</button>' +
    '<iframe title="File an Investigation" src="/file-an-investigation?embed=1"></iframe>';
  document.body.appendChild(dialog);

  button.addEventListener("click", function () {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else window.location.href = "/file-an-investigation";
  });
  document.getElementById("cd-inv-close").addEventListener("click", function () {
    dialog.close();
  });
  function pad() {
    document.body.style.paddingBottom = window.innerWidth <= 640 ? "64px" : "";
  }
  pad();
  window.addEventListener("resize", pad);
})();

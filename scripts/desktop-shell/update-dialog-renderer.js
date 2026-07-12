const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const badgeEl = document.getElementById("badge");
const badgeTextEl = document.getElementById("badge-text");
const badgeDot = badgeEl?.querySelector(".badge-dot");
const versionText = document.getElementById("version-text");
const notesWrap = document.getElementById("notes-wrap");
const notesEl = document.getElementById("notes");
const btnSecondary = document.getElementById("btn-secondary");
const btnPrimary = document.getElementById("btn-primary");
const btnClose = document.getElementById("btn-close");
const footer = document.getElementById("footer");
const iconRing = document.getElementById("icon-ring");
const iconCheck = document.getElementById("icon-check");
const iconDownload = document.getElementById("icon-download");
const iconRestart = document.getElementById("icon-restart");

function hideAllIcons() {
  [iconCheck, iconDownload, iconRestart].forEach(el => { if (el) el.style.display = "none"; });
}

function setBadge(kind) {
  badgeEl?.classList.remove("badge-uptodate", "badge-available", "badge-ready");
  if (kind === "uptodate") badgeEl?.classList.add("badge-uptodate");
  else if (kind === "ready") badgeEl?.classList.add("badge-ready");
  else badgeEl?.classList.add("badge-available");
}

function setIcon(kind) {
  hideAllIcons();
  iconRing?.classList.remove("icon-ring-uptodate", "icon-ring-available", "icon-ring-ready");
  if (kind === "uptodate") {
    iconRing?.classList.add("icon-ring-uptodate");
    if (iconCheck) iconCheck.style.display = "block";
  } else if (kind === "ready") {
    iconRing?.classList.add("icon-ring-ready");
    if (iconRestart) iconRestart.style.display = "block";
  } else {
    iconRing?.classList.add("icon-ring-available");
    if (iconDownload) iconDownload.style.display = "block";
  }
}

function render(payload) {
  const kind = payload.kind || "available";
  setBadge(kind);
  setIcon(kind);

  if (kind === "ready") {
    badgeTextEl.textContent = "Ready to install";
    titleEl.textContent = `${payload.nextVersion ? "v" + payload.nextVersion : "Update"} downloaded`;
    subtitleEl.textContent = "Restart CHITHRA — CINEMA to finish installing.";
    notesWrap?.classList.add("hidden");
    btnPrimary.textContent = "Restart now";
    btnSecondary.textContent = "Later";
    btnSecondary.style.display = "";
    footer?.classList.remove("solo");
    versionText.textContent = payload.currentVersion ? "v" + payload.currentVersion : "—";
    return;
  }

  if (kind === "uptodate") {
    badgeTextEl.textContent = "Up to date";
    titleEl.textContent = "You're on the latest version";
    subtitleEl.textContent = "CHITHRA — CINEMA will check for updates on startup.";
    notesWrap?.classList.add("hidden");
    btnPrimary.textContent = "OK";
    btnSecondary.style.display = "none";
    footer?.classList.add("solo");
    versionText.textContent = payload.currentVersion ? "v" + payload.currentVersion : "—";
    return;
  }

  badgeTextEl.textContent = "Update available";
  titleEl.textContent = (payload.nextVersion ? "v" + payload.nextVersion : "New version") + " is available";
  subtitleEl.textContent = "Download the latest build for fixes and new features.";
  btnPrimary.textContent = "Download update";
  btnSecondary.textContent = "Not now";
  btnSecondary.style.display = "";
  footer?.classList.remove("solo");
  versionText.textContent = payload.currentVersion ? "v" + payload.currentVersion : "—";

  if (payload.notesHtml) {
    notesEl.innerHTML = payload.notesHtml;
    notesWrap?.classList.remove("hidden");
  } else {
    notesWrap?.classList.add("hidden");
  }
}

function respond(action) {
  if (window.updateDialog) {
    window.updateDialog.respond(action);
  }
}

btnSecondary?.addEventListener("click", () => respond("secondary"));
btnPrimary?.addEventListener("click", () => respond("primary"));
btnClose?.addEventListener("click", () => respond("secondary"));

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    respond("secondary");
  }
});

if (window.updateDialog) {
  window.updateDialog.onInit(render);
}

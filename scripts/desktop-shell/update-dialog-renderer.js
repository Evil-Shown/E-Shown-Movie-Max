const titleEl = document.getElementById("update-title");
const subtitleEl = document.getElementById("subtitle");
const badgeTextEl = document.getElementById("badge-text");
const versionsEl = document.getElementById("versions");
const notesSectionEl = document.getElementById("notes-section");
const notesEl = document.getElementById("notes");
const btnSecondary = document.getElementById("btn-secondary");
const btnPrimary = document.getElementById("btn-primary");
const btnClose = document.getElementById("btn-close");

function formatVersion(version) {
  return version ? `v${version}` : "Latest";
}

function renderVersions(currentVersion, nextVersion) {
  versionsEl.innerHTML = "";

  if (currentVersion) {
    const current = document.createElement("div");
    current.className = "version-pill";
    current.innerHTML = `Installed <strong>${formatVersion(currentVersion)}</strong>`;
    versionsEl.appendChild(current);
  }

  if (nextVersion) {
    const next = document.createElement("div");
    next.className = "version-pill next";
    next.innerHTML = `Available <strong>${formatVersion(nextVersion)}</strong>`;
    versionsEl.appendChild(next);
  }
}

function render(payload) {
  const kind = payload.kind || "available";

  if (kind === "ready") {
    badgeTextEl.textContent = "Ready to install";
    titleEl.textContent = `${formatVersion(payload.nextVersion)} is downloaded`;
    subtitleEl.textContent = "Restart CHITHRA — CINEMA to finish installing this update.";
    notesSectionEl.style.display = "none";
    btnPrimary.textContent = "Restart now";
    btnSecondary.textContent = "Later";
    renderVersions(payload.currentVersion, payload.nextVersion);
    return;
  }

  if (kind === "uptodate") {
    badgeTextEl.textContent = "Up to date";
    titleEl.textContent = "You're on the latest version";
    subtitleEl.textContent = "CHITHRA — CINEMA will automatically check for updates on startup.";
    notesSectionEl.style.display = "none";
    btnPrimary.textContent = "OK";
    btnSecondary.style.display = "none";
    renderVersions(payload.currentVersion, "");
    return;
  }

  badgeTextEl.textContent = "Update available";
  titleEl.textContent = `${formatVersion(payload.nextVersion)} is available`;
  subtitleEl.textContent = "Stay on the latest build for fixes, performance, and new features.";
  btnPrimary.textContent = "Download update";
  btnSecondary.textContent = "Not now";
  renderVersions(payload.currentVersion, payload.nextVersion);

  if (payload.notesHtml) {
    notesEl.innerHTML = payload.notesHtml;
    notesEl.classList.remove("empty");
  } else {
    notesEl.textContent = "This release includes improvements and bug fixes.";
    notesEl.classList.add("empty");
  }
}

function respond(action) {
  if (window.updateDialog) {
    window.updateDialog.respond(action);
  }
}

btnSecondary.addEventListener("click", () => respond("secondary"));
btnPrimary.addEventListener("click", () => respond("primary"));
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

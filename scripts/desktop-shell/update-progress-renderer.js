const spinnerProgress = document.getElementById('spinnerProgress');
const progressFill = document.getElementById('progressFill');
const percentText = document.getElementById('percentText');
const bytesText = document.getElementById('bytesText');
const versionText = document.getElementById('versionText');

const circumference = 2 * Math.PI * 40;
spinnerProgress.style.strokeDasharray = circumference;
spinnerProgress.style.strokeDashoffset = circumference;

function formatBytes(bytes) {
  if (bytes === 0 || isNaN(bytes)) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return mb.toFixed(1) + ' MB';
  return (mb / 1024).toFixed(2) + ' GB';
}

function setProgress(percent, transferred, total) {
  const p = Math.max(0, Math.min(100, percent || 0));
  const offset = circumference - (p / 100) * circumference;
  spinnerProgress.style.strokeDashoffset = offset;
  progressFill.style.width = p + '%';
  percentText.textContent = Math.round(p) + '%';
  bytesText.textContent = formatBytes(transferred) + ' / ' + formatBytes(total);
}

function setVersion(version) {
  versionText.textContent = version ? 'v' + version : 'Latest version';
}

if (window.updateProgress) {
  window.updateProgress.onInit((payload) => {
    if (payload.version) setVersion(payload.version);
    setProgress(payload.percent, payload.transferred, payload.total);
  });
}

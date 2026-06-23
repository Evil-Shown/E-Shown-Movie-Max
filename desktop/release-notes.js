function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extractReleaseNotesText(releaseNotes) {
  if (!releaseNotes) return "";

  if (typeof releaseNotes === "string") {
    return releaseNotes.trim();
  }

  if (Array.isArray(releaseNotes)) {
    return releaseNotes
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item.note === "string") return item.note;
        return "";
      })
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }

  return "";
}

function formatInlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" tabindex="-1">$1</a>');
}

function formatReleaseNotesHtml(releaseNotes) {
  const raw = extractReleaseNotesText(releaseNotes);
  if (!raw) return "";

  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let listItems = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const content = formatInlineMarkdown(escapeHtml(paragraph.join(" ")));
    blocks.push(`<p>${content}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      `<ul>${listItems
        .map((item) => `<li>${formatInlineMarkdown(escapeHtml(item))}</li>`)
        .join("")}</ul>`
    );
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      flushParagraph();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      flushParagraph();
      const level = headingMatch[1].length === 1 ? "h3" : "h4";
      const title = formatInlineMarkdown(escapeHtml(headingMatch[2]));
      blocks.push(`<${level} class="note-heading">${title}</${level}>`);
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      listItems.push(bulletMatch[1]);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushList();
  flushParagraph();

  return blocks.join("");
}

module.exports = { extractReleaseNotesText, formatReleaseNotesHtml };

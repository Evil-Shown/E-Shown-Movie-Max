/** Higher score = prefer as primary (stable CDNs over tokenized aggregators) */
export function urlStabilityScore(url: string): number {
  const u = url.toLowerCase();
  if (u.includes("jmp2.uk")) return 5;
  if (u.includes("authtoken=") || u.includes("terminate=false&sid=")) return 10;
  if (u.includes("cloudfront.net")) return 92;
  if (u.includes("akamaized.net") || u.includes("akamaihd.net")) return 90;
  if (u.includes("livestream.pbs")) return 88;
  if (u.includes("static.france24.com") || u.includes("bloomberg.com")) return 86;
  if (u.includes("getaj.net") || u.includes("thehlive.com")) return 84;
  if (u.includes("cgtn.com")) return 84;
  if (u.includes("foxnews.com") || u.includes("pbs.org")) return 82;
  if (u.includes("frequency.stream")) return 75;
  if (u.includes("samsung.wurl.tv") || u.includes("amagi.tv")) return 25;
  if (u.startsWith("http://") && /\d+\.\d+\.\d+\.\d+/.test(u)) return 35;
  return 55;
}

export function sortByStability(urls: string[]): string[] {
  return [...urls].sort((a, b) => urlStabilityScore(b) - urlStabilityScore(a));
}

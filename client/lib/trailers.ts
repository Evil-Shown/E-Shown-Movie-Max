/** YouTube trailer IDs keyed by movie slug — separate from lib/movies.ts */
export const trailerIds: Record<string, string> = {
  interstellar: "zSWdZVeZ_ap",
  inception: "YoHD9XEInc0",
  "the-dark-knight": "EXeTwWkMxOc",
  "dune-part-two": "_YUzQK7-r8",
  oppenheimer: "uYPbbksJxIg",
  parasite: "5xH0HfJHsaY",
  "spider-man-across": "cqGjhVWU0kk",
  "the-matrix": "vKQi2FB0PBg",
  "la-la-land": "0pdqf4P9M8s",
  "get-out": "sRfneKXzPz0",
  "mad-max-fury-road": "hEJnMQG9ev8",
  "everything-everywhere": "wxN1T1vxQ2g",
  "the-shawshank-redemption": "6hBqS0lLdkw",
  "blade-runner-2049": "gCcxclm9eFI",
  whiplash: "7d_jQycdQGo",
  "the-grand-budapest": "1Fg5iWmQjJU",
  hereditary: "V6wWKNiHaHM",
  arrival: "ZU0WlzKAQ78",
  joker: "zAGVQLHvwOY",
  "avatar-way-of-water": "d9MyTicket",
};

export function getTrailerId(movieId: string): string {
  return trailerIds[movieId] ?? "zSWdZVeZ_ap";
}

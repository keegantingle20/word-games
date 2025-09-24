export const WORDS = [
  "crane","slice","proud","ghost","flint","chart","stare","swift","plain","trend",
  "spice","light","brave","crown","grain","laugh","shade","prism","store","rigid",
];

export function wordOfTheDay(date = new Date()) {
  const epoch = new Date("2024-01-01T00:00:00Z").getTime();
  const day = Math.floor((date.getTime() - epoch) / (1000 * 60 * 60 * 24));
  return WORDS[day % WORDS.length];
}

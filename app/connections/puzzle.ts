export type Group = { title: string; color: string; words: string[] };

export const GROUPS: Group[] = [
  { title: "Celestial", color: "bg-blue-500", words: ["sun","moon","star","comet"] },
  { title: "Tree Parts", color: "bg-green-500", words: ["root","bark","trunk","branch"] },
  { title: "Kitchen Verbs", color: "bg-yellow-400", words: ["boil","chop","stir","bake"] },
  { title: "Synonyms of Quick", color: "bg-purple-500", words: ["rapid","swift","fast","hasty"] },
];

export const WORDS = GROUPS.flatMap((g) => g.words).sort(() => Math.random() - 0.5);

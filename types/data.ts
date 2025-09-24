export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type PersonalMeaning = {
  note?: string;
  memory?: string;
  tags?: string[];
};

export type WordEntry = {
  word: string; // must be 5 letters for Wordle
  categories?: string[]; // e.g., animals, verbs
  metadata?: {
    difficulty?: Difficulty;
    themes?: string[];
    personal?: PersonalMeaning;
  };
};

export type WordleList = {
  id: string; // e.g., "words.en"
  language?: string; // ISO code like en, es
  title?: string;
  description?: string;
  words: WordEntry[];
  metadata?: {
    difficulty?: Difficulty;
    themes?: string[];
    personal?: PersonalMeaning;
    createdAt?: string;
    updatedAt?: string;
  };
};

export type ConnectionsGroup = {
  title: string; // group title shown after solve
  color?: string; // tailwind color class or hex
  words: [string, string, string, string]; // exactly 4
  hint?: string; // short hint shown on request
  description?: string; // shown after solve to explain connection
  personal?: PersonalMeaning; // optional personal context
};

export type ConnectionsPuzzle = {
  id: string; // e.g., "puzzle.sample"
  title?: string;
  description?: string;
  groups: [ConnectionsGroup, ConnectionsGroup, ConnectionsGroup, ConnectionsGroup];
  metadata?: {
    difficulty?: Difficulty;
    themes?: string[];
    personal?: PersonalMeaning;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
  };
};

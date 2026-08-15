import { PSEUDO_ARGUMENTS } from "@/data/arguments";

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateCard() {
  const picked = shuffle(PSEUDO_ARGUMENTS).slice(0, 24);
  const card = [...picked];
  card.splice(12, 0, "GRÁTIS");
  return card;
}

export function initialMarks() {
  const marks = new Array(25).fill(false);
  marks[12] = true;
  return marks;
}

const LINES = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20]
];

export function checkBingo(marks) {
  if (!marks || marks.length !== 25) return false;
  return LINES.some((line) => line.every((i) => marks[i]));
}

export function getWinningLine(marks) {
  if (!marks || marks.length !== 25) return null;
  return LINES.find((line) => line.every((i) => marks[i])) || null;
}
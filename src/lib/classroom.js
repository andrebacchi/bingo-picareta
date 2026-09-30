// Modo sala de aula: tudo é derivado de códigos curtos, sem servidor.
// O código da partida define a ordem do sorteio; o código da cartela define a cartela.
// Assim, o computador do professor consegue reconstruir e conferir qualquer cartela.
import { PSEUDO_ARGUMENTS } from "@/data/arguments";
import { FREE_SPACE } from "@/lib/bingoUtils";

// Sem I, O, 0 e 1, para não confundir ao ditar em voz alta
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomCode(len = 4) {
  let s = "";
  const buf = new Uint32Array(len);
  (globalThis.crypto || window.crypto).getRandomValues(buf);
  for (let i = 0; i < len; i++) s += ALPHABET[buf[i] % ALPHABET.length];
  return s;
}

// Normaliza sem "consertar" letras: só maiúsculas e caracteres válidos
export function normCode(s) {
  return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function hash(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0) ^ (h1 >>> 0);
}

function rng(seedStr) {
  let a = hash(seedStr) >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(array, seedStr) {
  const r = rng(seedStr);
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Ordem completa do sorteio para uma partida */
export function drawOrder(gameCode) {
  return seededShuffle(PSEUDO_ARGUMENTS, "sorteio:" + normCode(gameCode));
}

/** Cartela 5 × 5 (centro livre) para uma partida e um código de cartela */
export function cardFor(gameCode, cardId) {
  const picked = seededShuffle(PSEUDO_ARGUMENTS, "cartela:" + normCode(gameCode) + ":" + normCode(cardId)).slice(0, 24);
  const card = [...picked];
  card.splice(12, 0, FREE_SPACE);
  return card;
}

/** Aceita "PX42-7KQM", "px42 7kqm" ou só "7KQM" (usa a partida atual) */
export function parseCardCode(input, currentGame) {
  const raw = String(input || "").toUpperCase().trim();
  const parts = raw.split(/[^A-Z0-9]+/).filter(Boolean);
  if (parts.length >= 2) return { game: parts[0], card: parts[1] };
  const one = parts[0] || "";
  if (one.length === 8) return { game: one.slice(0, 4), card: one.slice(4) };
  return { game: normCode(currentGame), card: one };
}

const LINES = [
  [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
];

/** Confere uma cartela contra os argumentos já sorteados */
export function checkCard(card, drawnList) {
  const drawn = new Set(drawnList);
  const marks = card.map((a) => a === FREE_SPACE || drawn.has(a));
  const lines = LINES.filter((l) => l.every((i) => marks[i]));
  const missingBest = Math.min(...LINES.map((l) => l.filter((i) => !marks[i]).length));
  const full = marks.every(Boolean);
  return { marks, lines, lineCount: lines.length, missingBest, full, missingFull: marks.filter((m) => !m).length };
}

export const ALLOWED = ALPHABET;

/**
 * Lightweight fuzzy matcher (subsequence match with contiguity, word-boundary
 * and prefix bonuses). Returns null when the query is not a subsequence.
 */
export interface FuzzyResult {
  score: number;
  indices: number[];
}

const isBoundary = (text: string, i: number) => i === 0 || /[\s\-_/.:()[\]]/.test(text[i - 1]);

export function fuzzyMatch(query: string, text: string): FuzzyResult | null {
  const q = query.trim().toLowerCase();
  if (!q) return { score: 0, indices: [] };
  const t = text.toLowerCase();

  // Fast path: direct substring gets a strong bonus.
  const direct = t.indexOf(q);
  if (direct !== -1) {
    const indices = Array.from({ length: q.length }, (_, k) => direct + k);
    return { score: 1000 - direct * 2 + (isBoundary(text, direct) ? 120 : 0) - t.length * 0.5, indices };
  }

  let score = 0;
  let ti = 0;
  let prev = -2;
  const indices: number[] = [];
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    if (ch === " ") continue;
    let found = -1;
    // Prefer a word-boundary occurrence ahead, otherwise the next occurrence.
    for (let k = ti; k < t.length; k++) {
      if (t[k] === ch && isBoundary(text, k)) {
        found = k;
        break;
      }
    }
    const next = t.indexOf(ch, ti);
    if (found === -1 || (next !== -1 && next === prev + 1)) found = next;
    if (found === -1) return null;

    score += 10;
    if (found === prev + 1) score += 15;
    if (isBoundary(text, found)) score += 20;
    score -= Math.min(found - ti, 10);
    indices.push(found);
    prev = found;
    ti = found + 1;
  }
  return { score: score - t.length * 0.5, indices };
}

/** Levenshtein distance — used for "did you mean" suggestions in the CLI. */
export function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prevDiag = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prevDiag + (a[i - 1] === b[j - 1] ? 0 : 1));
      prevDiag = tmp;
    }
  }
  return dp[b.length];
}

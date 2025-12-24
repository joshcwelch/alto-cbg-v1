export type RngState = number;

const LCG_A = 1664525;
const LCG_C = 1013904223;

export const nextRng = (state: RngState): { value: number; next: RngState } => {
  const next = (state * LCG_A + LCG_C) >>> 0;
  return { value: next / 0x100000000, next };
};

export const shuffleWithRng = <T,>(
  items: T[],
  state: RngState
): { shuffled: T[]; next: RngState } => {
  let nextState = state;
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const roll = nextRng(nextState);
    nextState = roll.next;
    const j = Math.floor(roll.value * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return { shuffled: result, next: nextState };
};

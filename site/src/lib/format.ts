// One decimal on scales that reach 10 or more, three below; `scale` is the column's (or metric's) largest value.
export const formatScore = (v: number, scale = v) => v.toFixed(Math.abs(scale) >= 10 ? 1 : 3);

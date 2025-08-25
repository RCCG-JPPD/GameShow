 export function halfPoints(points) {
  // integer points -> half may be .5
  return points / 2;
}

export function fmtScore(n) {
  // show one decimal only if .5 appears; else integer
  if (Math.abs(n - Math.round(n)) === 0.5) return n.toFixed(1);
  return Math.round(n).toString();
}

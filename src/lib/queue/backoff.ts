export function calculateBackoff(attempt: number) {
  const base = 2000;
  return base * Math.pow(2, attempt - 1);
}

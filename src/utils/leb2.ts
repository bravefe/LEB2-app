export function parseLeb2DueDate(dateStr: string | null | undefined): number {
  if (!dateStr || dateStr === "No Due Date") return Infinity;
  const cleaned = dateStr.replace(" at ", " ");
  const time = new Date(cleaned).getTime();
  return isNaN(time) ? Infinity : time;
}

export function isDueDateOverdue(dateStr: string | null | undefined): boolean {
  const time = parseLeb2DueDate(dateStr);
  if (time === Infinity) return false;
  return time < Date.now();
}

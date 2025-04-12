export function formatReadableDate(dateStr: string): string {
  if (!/^\d{14}$/.test(dateStr)) throw new Error('Invalid format');

  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  const hour = dateStr.slice(8, 10);
  const minute = dateStr.slice(10, 12);
  const second = dateStr.slice(12, 14);

  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);

  return date.toLocaleString(); // You can customize this
}

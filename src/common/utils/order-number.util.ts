/**
 * Generate unique order number with format: ORD-YYYYMMDD-XXXX
 * Ví dụ: ORD-20240115-0001
 */
export function generateOrderNumber(prefix = 'ORD'): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}-${dateStr}-${random}`;
}

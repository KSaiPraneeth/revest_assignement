import { describe, expect, it } from 'vitest';
import { clamp, formatCurrency, formatDateTime } from '@/lib/format';

describe('format utilities', () => {
  it('formats currency in SAR', () => {
    expect(formatCurrency(99.5)).toMatch(/99\.50/);
    expect(formatCurrency(99.5)).toContain('SAR');
  });

  it('clamps numeric values', () => {
    expect(clamp(15, 1, 10)).toBe(10);
    expect(clamp(-2, 0, 5)).toBe(0);
    expect(clamp(3, 0, 5)).toBe(3);
  });

  it('formats date/time strings', () => {
    const formatted = formatDateTime('2026-06-28T10:30:00.000Z');
    expect(formatted.length).toBeGreaterThan(0);
  });
});

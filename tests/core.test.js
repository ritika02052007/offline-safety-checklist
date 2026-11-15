// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { sanitizeText } from '../src/sanitize.js';
import { validateItem, validateReport } from '../src/validation.js';
import { trackEvent } from '../src/analytics.js';

describe('sanitizeText', () => {
  it('removes XSS payloads', () => {
    expect(sanitizeText('<script>alert(1)</script>')).not.toContain('<');
    expect(sanitizeText('<img src=x onerror=alert(1)>')).toBe('');
    expect(sanitizeText('"><svg onload=alert(1)>')).not.toMatch(/[<>]/);
  });
  it('trims whitespace', () => expect(sanitizeText('   hi   ')).toBe('hi'));
});

describe('validation', () => {
  it('rejects empty title', () => {
    expect(validateItem({ title: '', category: 'PPE', priority: 'High' }).title).toBeTruthy();
  });
  it('rejects duplicates', () => {
    const errors = validateItem({ title: 'a', category: 'PPE', priority: 'High' }, [{ title: 'A' }]);
    expect(errors.title).toBeTruthy();
  });
  it('rejects bad inspector and missing shift', () => {
    const errors = validateReport({ inspector: '1234', shift: '' }, 1);
    expect(errors.inspector).toBeTruthy();
    expect(errors.shift).toBeTruthy();
  });
});

describe('analytics', () => {
  it('logs the telemetry message', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    trackEvent('item added');
    expect(spy).toHaveBeenCalledWith('[Analytics] User interacted with Offline Safety Checklist - item added');
  });
});

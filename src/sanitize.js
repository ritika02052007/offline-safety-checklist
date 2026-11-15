/**
 * Strip markup and script-like patterns from user text before it enters state.
 * Output is rendered with textContent, so it is never parsed as HTML.
 */
export function sanitizeText(value, max = Infinity) {
  if (typeof value !== 'string') return '';
  const clean = value
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/<[^>]*>?/g, '')
    .replace(/[<>]/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/\bon\w+\s*=/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.slice(0, max);
}

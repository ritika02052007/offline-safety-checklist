export const CATEGORIES = ['PPE', 'Fire safety', 'Equipment', 'Housekeeping', 'Storage', 'Emergency'];
export const PRIORITIES = ['Low', 'Medium', 'High'];
export const SHIFTS = ['Morning', 'Afternoon', 'Night'];
export const LIMITS = { title: 80, notes: 200, inspector: 60 };

const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]*$/u;

export function validateItem(data, existing = []) {
  const errors = {};
  if (!data.title) errors.title = 'Enter an item title.';
  else if (data.title.length > LIMITS.title) errors.title = `Title must be ${LIMITS.title} characters or fewer.`;
  else if (existing.some((i) => i.title.toLowerCase() === data.title.toLowerCase())) errors.title = 'This item is already on the checklist.';
  if (!CATEGORIES.includes(data.category)) errors.category = 'Choose a category.';
  if (!PRIORITIES.includes(data.priority)) errors.priority = 'Choose a priority.';
  if (data.notes && data.notes.length > LIMITS.notes) errors.notes = `Notes must be ${LIMITS.notes} characters or fewer.`;
  return errors;
}

export function validateReport(data, itemCount) {
  const errors = {};
  if (!data.inspector) errors.inspector = 'Enter the inspector name.';
  else if (data.inspector.length < 2 || data.inspector.length > LIMITS.inspector || !NAME_PATTERN.test(data.inspector)) {
    errors.inspector = 'Use letters only, 2 to 60 characters.';
  }
  if (!SHIFTS.includes(data.shift)) errors.shift = 'Choose a shift.';
  if (itemCount < 1) errors.items = 'Add at least one checklist item before submitting.';
  return errors;
}

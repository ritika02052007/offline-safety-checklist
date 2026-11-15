const NOW = new Date().toISOString();
const seed = (n, title, category, priority) => ({ id: `seed-${n}`, title, category, priority, notes: '', completed: false, createdAt: NOW });

const SEED_ITEMS = [
  seed(1, 'PPE worn by all staff on the floor', 'PPE', 'High'),
  seed(2, 'Fire exits clear and unlocked', 'Fire safety', 'High'),
  seed(3, 'Forklift pre-shift inspection done', 'Equipment', 'High'),
  seed(4, 'Spills and slip hazards cleaned', 'Housekeeping', 'Medium'),
  seed(5, 'Pallets stacked safely and within height limit', 'Storage', 'Medium'),
  seed(6, 'Emergency equipment accessible', 'Emergency', 'High'),
];

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Mock API with slow-3G style delay and optional forced failure. */
export async function fetchChecklist({ delay = 1500, forceFail = false } = {}) {
  await wait(delay);
  if (forceFail) throw new Error('Network unavailable');
  return SEED_ITEMS.map((item) => ({ ...item }));
}

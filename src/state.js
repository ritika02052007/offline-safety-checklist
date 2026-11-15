import { sanitizeText } from './sanitize.js';
import { validateItem, validateReport } from './validation.js';
import { loadJSON, saveJSON } from './storage.js';
import { fetchChecklist, wait } from './api.js';
import { trackEvent } from './analytics.js';

const ITEMS_KEY = 'osc.items';
const REPORTS_KEY = 'osc.reports';

export const state = {
  items: [],
  reports: [],
  filters: { query: '', category: 'all', status: 'all' },
  loading: false,
  saving: false,
  loadingText: '',
  error: '',
  notice: '',
  online: navigator.onLine,
  forceFail: false,
  errors: { add: {}, report: {} },
};

const listeners = new Set();
export const subscribe = (fn) => { listeners.add(fn); };
const emit = () => listeners.forEach((fn) => fn(state));

const newId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);
const isItem = (i) => i && typeof i === 'object' && typeof i.id === 'string' && typeof i.title === 'string';
const readList = (key) => {
  const data = loadJSON(key, []);
  return Array.isArray(data) ? data : [];
};

function persist() {
  const ok = saveJSON(ITEMS_KEY, state.items);
  state.notice = ok ? '' : 'Storage is unavailable. Changes will be lost when you close this page.';
}

export async function loadChecklist() {
  if (state.loading) return;
  state.loading = true;
  state.loadingText = 'Loading checklist…';
  state.error = '';
  emit();
  const cached = readList(ITEMS_KEY).filter(isItem);
  state.reports = readList(REPORTS_KEY);
  try {
    const remote = await fetchChecklist({ forceFail: state.forceFail || !navigator.onLine });
    state.items = cached.length ? cached : remote;
    persist();
  } catch {
    state.items = cached;
    state.error = 'Could not reach the server. Showing saved data on this device.';
  } finally {
    state.loading = false;
    emit();
  }
}

export function addItem(raw) {
  const data = {
    title: sanitizeText(raw.title),
    category: raw.category,
    priority: raw.priority,
    notes: sanitizeText(raw.notes),
  };
  state.errors.add = validateItem(data, state.items);
  if (Object.keys(state.errors.add).length) { emit(); return false; }
  state.items = [...state.items, { id: newId(), ...data, completed: false, createdAt: new Date().toISOString() }];
  persist();
  trackEvent('item added');
  emit();
  return true;
}

export function toggleItem(id) {
  const item = state.items.find((i) => i.id === id);
  if (!item) return;
  state.items = state.items.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i));
  persist();
  trackEvent(item.completed ? 'item reopened' : 'item completed');
  emit();
}

export function removeItem(id) {
  if (!state.items.some((i) => i.id === id)) return;
  state.items = state.items.filter((i) => i.id !== id);
  persist();
  trackEvent('item deleted');
  emit();
}

export async function submitReport(raw) {
  if (state.saving) return false;
  const data = { inspector: sanitizeText(raw.inspector), shift: raw.shift };
  state.errors.report = validateReport(data, state.items.length);
  if (Object.keys(state.errors.report).length) { emit(); return false; }
  state.saving = true;
  state.loadingText = 'Saving report…';
  emit();
  await wait(800);
  const report = {
    id: newId(),
    inspector: data.inspector,
    shift: data.shift,
    submittedAt: new Date().toISOString(),
    items: state.items.map(({ id, title, category, priority, completed }) => ({ id, title, category, priority, completed })),
  };
  state.reports = [report, ...state.reports];
  const saved = saveJSON(REPORTS_KEY, state.reports);
  state.items = state.items.map((i) => ({ ...i, completed: false }));
  persist();
  if (!saved) state.notice = 'Storage is unavailable. This report could not be saved on this device.';
  state.saving = false;
  trackEvent('checklist submitted');
  emit();
  return true;
}

export function setFilter(key, value) {
  state.filters = { ...state.filters, [key]: value };
  emit();
}

export function setOnline(online) {
  state.online = online;
  emit();
}

export function setForceFail(value) {
  state.forceFail = value;
}

export function visibleItems() {
  const { query, category, status } = state.filters;
  const q = query.trim().toLowerCase();
  return state.items.filter((i) => (
    (!q || i.title.toLowerCase().includes(q) || (i.notes || '').toLowerCase().includes(q))
    && (category === 'all' || i.category === category)
    && (status === 'all' || (status === 'done') === i.completed)
  ));
}

import {
  subscribe, loadChecklist, addItem, toggleItem, removeItem,
  submitReport, setFilter, setOnline, setForceFail,
} from './state.js';
import { render } from './render.js';
import { CATEGORIES, PRIORITIES, SHIFTS } from './validation.js';
import { trackEvent } from './analytics.js';

const $ = (id) => document.getElementById(id);

function fillOptions(select, values, placeholder, placeholderValue = '') {
  select.replaceChildren(new Option(placeholder, placeholderValue), ...values.map((v) => new Option(v, v)));
}

function init() {
  fillOptions($('f-category'), CATEGORIES, 'All categories', 'all');
  fillOptions($('a-category'), CATEGORIES, 'Choose a category');
  fillOptions($('a-priority'), PRIORITIES, 'Choose a priority');
  fillOptions($('r-shift'), SHIFTS, 'Choose a shift');

  subscribe(render);

  $('filter-form').addEventListener('submit', (e) => e.preventDefault());
  $('f-query').addEventListener('input', (e) => setFilter('query', e.target.value));
  $('f-category').addEventListener('change', (e) => setFilter('category', e.target.value));
  $('f-status').addEventListener('change', (e) => setFilter('status', e.target.value));
  $('f-fail').addEventListener('change', (e) => setForceFail(e.target.checked));
  $('reload').addEventListener('click', () => loadChecklist());

  $('status').addEventListener('click', (e) => {
    if (e.target.id === 'retry') {
      trackEvent('retry clicked');
      loadChecklist();
    }
  });

  $('list').addEventListener('change', (e) => {
    if (e.target.dataset.action === 'toggle') toggleItem(e.target.dataset.id);
  });
  $('list').addEventListener('click', (e) => {
    if (e.target.dataset.action === 'delete') {
      removeItem(e.target.dataset.id);
      $('list-heading').focus();
    }
  });

  $('add-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const ok = addItem({
      title: form.title.value,
      category: form.category.value,
      priority: form.priority.value,
      notes: form.notes.value,
    });
    if (ok) {
      form.reset();
      $('a-title').focus();
    } else {
      form.querySelector('[aria-invalid="true"]')?.focus();
    }
  });

  $('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const ok = await submitReport({ inspector: form.inspector.value, shift: form.shift.value });
    if (ok) form.reset();
    else form.querySelector('[aria-invalid="true"]')?.focus();
  });

  window.addEventListener('online', () => setOnline(true));
  window.addEventListener('offline', () => setOnline(false));

  loadChecklist();
}

init();

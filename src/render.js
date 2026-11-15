import { visibleItems } from './state.js';

const $ = (id) => document.getElementById(id);

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value);
  });
  children.forEach((child) => child && node.append(child));
  return node;
}

function setFieldError(inputId, message) {
  const input = $(inputId);
  const error = $(`${inputId}-err`);
  input.classList.toggle('invalid', Boolean(message));
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
  error.textContent = message || '';
  error.hidden = !message;
}

function renderStatus(state) {
  const box = $('status');
  box.replaceChildren();
  if (state.loading || state.saving) {
    box.append(el('div', { class: 'loading', role: 'status' },
      el('span', { class: 'spinner', 'aria-hidden': 'true' }),
      el('span', { text: state.loadingText })));
  }
  if (state.error && !state.loading) {
    box.append(el('div', { class: 'failure', role: 'alert' },
      el('span', { text: state.error }),
      el('button', { type: 'button', id: 'retry', 'aria-label': 'Retry loading the checklist', text: 'Retry' })));
  }
  if (state.notice) box.append(el('div', { class: 'notice', role: 'alert', text: state.notice }));
}

function renderList(state) {
  const items = visibleItems();
  const list = $('list');
  list.replaceChildren(...items.map((item) => {
    const cbId = `cb-${item.id}`;
    const checkbox = el('input', { type: 'checkbox', id: cbId, 'data-action': 'toggle', 'data-id': item.id, 'data-focus': cbId });
    checkbox.checked = item.completed;
    const meta = `${item.category}, ${item.priority} priority`;
    const body = el('div', { class: 'body' },
      el('label', { for: cbId, class: 'title', text: item.title }),
      el('p', { class: 'meta', text: meta }),
      item.notes ? el('p', { class: 'meta', text: item.notes }) : null);
    const del = el('button', {
      type: 'button', class: 'secondary', 'data-action': 'delete', 'data-id': item.id,
      'data-focus': `del-${item.id}`, 'aria-label': `Delete item: ${item.title}`, text: 'Delete',
    });
    return el('li', { class: item.completed ? 'done' : '' }, checkbox, body, del);
  }));
  $('empty').hidden = items.length > 0 || state.loading;
}

function renderProgress(state) {
  const total = state.items.length;
  const done = state.items.filter((i) => i.completed).length;
  $('progress-text').textContent = `${done} of ${total} complete`;
  $('progress-bar').max = Math.max(total, 1);
  $('progress-bar').value = done;
}

function renderReports(state) {
  $('reports').replaceChildren(...state.reports.map((r) => {
    const done = r.items.filter((i) => i.completed).length;
    return el('li', {},
      el('strong', { text: `${r.inspector}, ${r.shift} shift` }),
      el('p', { class: 'meta', text: `${new Date(r.submittedAt).toLocaleString()}: ${done} of ${r.items.length} items complete` }));
  }));
  $('reports-empty').hidden = state.reports.length > 0;
}

export function render(state) {
  const focused = document.activeElement?.dataset?.focus;
  const banner = $('banner');
  banner.hidden = state.online;
  banner.textContent = state.online ? '' : 'You are offline. Changes are saved on this device.';

  renderStatus(state);
  renderProgress(state);
  renderList(state);
  renderReports(state);

  const { add, report } = state.errors;
  setFieldError('a-title', add.title);
  setFieldError('a-category', add.category);
  setFieldError('a-priority', add.priority);
  setFieldError('a-notes', add.notes);
  setFieldError('r-inspector', report.inspector);
  setFieldError('r-shift', report.shift);
  $('r-items-err').textContent = report.items || '';
  $('r-items-err').hidden = !report.items;

  const submit = $('submit-report');
  submit.disabled = state.saving;
  submit.setAttribute('aria-busy', String(state.saving));
  $('reload').disabled = state.loading;

  if (focused) document.querySelector(`[data-focus="${focused}"]`)?.focus();
}

const preparedCache = new Map();

let apiPromise = null;
let ready = false;
let enabled = readInitialState();

function readInitialState() {
  try {
    if (new URLSearchParams(window.location.search).get('measure') === 'off') return false;
    if (window.localStorage.getItem('measure') === 'off') return false;
  } catch {
    /* storage unavailable */
  }
  return true;
}

function isSupported() {
  if (!('Segmenter' in Intl)) return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext && canvas.getContext('2d'));
}

function loadPretext() {
  if (!apiPromise) {
    apiPromise = import('./vendor/pretext/layout.js').then((layout) => ({ layout }));
  }
  return apiPromise;
}

function readType(el) {
  const cs = getComputedStyle(el);
  const fontSize = parseFloat(cs.fontSize) || 16;
  const font = [cs.fontStyle, cs.fontVariant, cs.fontWeight, `${fontSize}px`, cs.fontFamily]
    .filter((part) => part && part !== 'normal')
    .join(' ');
  const lineHeight = cs.lineHeight === 'normal' ? fontSize * 1.2 : parseFloat(cs.lineHeight) || fontSize * 1.2;
  const letterSpacing = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) || 0;
  return { font, fontSize, lineHeight, letterSpacing };
}

function px(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function prepareSegments(text, type) {
  const { layout } = await loadPretext();
  const key = `${type.font}|${type.letterSpacing}|${text}`;
  if (!preparedCache.has(key)) {
    preparedCache.set(key, layout.prepareWithSegments(text, type.font, { letterSpacing: type.letterSpacing }));
  }
  return preparedCache.get(key);
}

async function calibrate() {
  const { layout } = await loadPretext();
  if (!document.body) return false;

  const probe = document.createElement('span');
  probe.style.cssText =
    'position:absolute;left:-99999px;top:0;visibility:hidden;white-space:pre;font-size:16px;';
  probe.textContent = 'Hamburgefonstiv 12345MMM';
  document.body.appendChild(probe);

  const type = readType(probe);
  const expected = px(probe.getBoundingClientRect().width);
  probe.remove();

  const prepared = await prepareSegments(probe.textContent, type);
  const measured = layout.measureNaturalWidth(prepared);
  const tolerance = Math.max(1, expected * 0.01);

  return Math.abs(measured - expected) <= tolerance;
}

export async function initMeasurement() {
  if (!enabled || !isSupported()) return false;

  try {
    const { layout } = await loadPretext();
    layout.setLocale(document.documentElement.lang || undefined);
    ready = await calibrate();
  } catch {
    ready = false;
  }

  enabled = ready;
  return ready;
}

export function isMeasurementEnabled() {
  return enabled && ready;
}

export function resetMeasurements() {
  document.querySelectorAll('[data-measured]').forEach((el) => {
    el.style.minWidth = '';
    el.style.maxWidth = '';
  });
  document.querySelectorAll('[data-balanced]').forEach((el) => {
    el.style.maxWidth = '';
    delete el.dataset.balanced;
    delete el.dataset.balanceKey;
  });
}

function raggedness(layout, prepared, maxWidth) {
  let widest = 0;
  const widths = [];
  layout.walkLineRanges(prepared, maxWidth, (line) => {
    widths.push(line.width);
    if (line.width > widest) widest = line.width;
  });
  if (!widths.length) return Infinity;
  const total = widths.reduce((sum, value) => sum + (widest - value) ** 2, 0);
  return total / widths.length;
}

export async function balanceElement(el) {
  if (!isMeasurementEnabled()) return;
  if (CSS.supports && CSS.supports('text-wrap', 'balance')) return;

  const text = el.textContent.trim();
  if (!text) return;

  /* Measured against the parent, so setting a max-width here never feeds
     back into the next run's idea of the available width. */
  const available = el.parentElement ? el.parentElement.clientWidth : 0;
  if (!available) return;

  const signature = `${available}|${text}`;
  if (el.dataset.balanceKey === signature) return;

  el.style.maxWidth = '';
  delete el.dataset.balanced;
  el.dataset.balanceKey = signature;

  const { layout } = await loadPretext();
  const type = readType(el);
  const prepared = await prepareSegments(text, type);
  const { lineCount } = layout.measureLineStats(prepared, available);
  if (lineCount < 2) return;

  const baseline = raggedness(layout, prepared, available);

  let bestWidth = available;
  let bestCost = baseline;
  const floor = Math.max(80, type.fontSize * 12);

  for (let width = floor; width <= available; width += 2) {
    if (layout.measureLineStats(prepared, width).lineCount !== lineCount) continue;
    const cost = raggedness(layout, prepared, width);
    if (cost < bestCost) {
      bestCost = cost;
      bestWidth = width;
    }
  }

  if (bestWidth < available && bestCost < baseline) {
    el.style.maxWidth = `${Math.ceil(bestWidth)}px`;
    el.dataset.balanced = 'true';
  }
}

export async function measureLines(text, el, maxWidth) {
  if (!isMeasurementEnabled() || !text) return 0;
  const { layout } = await loadPretext();
  const prepared = await prepareSegments(text, readType(el));
  return layout.measureLineStats(prepared, maxWidth).lineCount;
}

export async function naturalBoxWidth(el) {
  if (!isMeasurementEnabled()) return 0;
  const text = el.textContent.trim();
  if (!text) return 0;

  const { layout } = await loadPretext();
  const type = readType(el);
  const prepared = await prepareSegments(text, type);
  const cs = getComputedStyle(el);

  return (
    layout.measureNaturalWidth(prepared) +
    px(cs.paddingLeft) +
    px(cs.paddingRight) +
    px(cs.borderLeftWidth) +
    px(cs.borderRightWidth)
  );
}

export async function equalizeChips(list) {
  if (!isMeasurementEnabled()) return;

  const chips = Array.from(list.querySelectorAll('.skill-chip'));
  if (chips.length < 2) return;

  const widths = await Promise.all(chips.map((chip) => naturalBoxWidth(chip)));
  const widest = Math.ceil(Math.max(...widths));
  if (!Number.isFinite(widest) || widest <= 0) return;

  chips.forEach((chip) => {
    chip.style.minWidth = `${widest}px`;
    chip.dataset.measured = 'true';
  });
}

function pillLabel(pill) {
  const clone = pill.cloneNode(true);
  clone.querySelectorAll('.arrow').forEach((el) => el.remove());
  return clone.textContent.trim();
}

export async function sizePills(root) {
  if (!isMeasurementEnabled()) return;

  const pills = Array.from(root.querySelectorAll('[data-measure-pill]'));
  if (!pills.length) return;

  await Promise.all(
    pills.map(async (pill) => {
      const label = pillLabel(pill);
      if (!label) return;

      const { layout } = await loadPretext();
      const type = readType(pill);
      const prepared = await prepareSegments(label, type);
      const cs = getComputedStyle(pill);
      const arrow = pill.querySelector('.arrow');

      const total =
        layout.measureNaturalWidth(prepared) +
        px(cs.columnGap) +
        (arrow ? px(arrow.getBoundingClientRect().width) : 0) +
        px(cs.paddingLeft) +
        px(cs.paddingRight) +
        px(cs.borderLeftWidth) +
        px(cs.borderRightWidth);

      const width = Math.ceil(total) + 1;
      const parentWidth = pill.parentElement ? pill.parentElement.clientWidth : 0;
      if (parentWidth && width > parentWidth) return;

      pill.style.minWidth = `${width}px`;
      pill.dataset.measured = 'true';
    })
  );
}

export function releaseMeasurements() {
  preparedCache.clear();
}
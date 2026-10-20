/* ==========================================================================
   OCEAN — full-viewport ASCII sharks on the 404 view.
   The canvas lives in index.html and starts hidden; the engine is dynamically
   imported and mounted only for unknown routes, and the router tears it down
   (hiding the canvas again) whenever a known route takes over.
   ========================================================================== */
let engine = null;
let mountId = 0;

/* Mirrors the router's fallback: an unknown hash renders the 404 view. */
function isOceanRoute() {
  const hash = window.location.hash || '';
  if (!hash || hash === '#' || hash === '#home') return false;
  return !/^#(projects|project\/|contact|info)/.test(hash);
}

export async function mountOcean() {
  if (engine || !isOceanRoute()) return;
  const canvas = document.getElementById('oceanCanvas');
  if (!canvas) return;

  const id = ++mountId;
  try {
    const { OceanEngine } = await import('./vendor/ascii-sharks/index.js');
    /* Navigation (or a teardown) may have happened while the module loaded. */
    if (id !== mountId || !canvas.isConnected || !isOceanRoute()) return;
    canvas.style.display = '';
    engine = new OceanEngine(canvas);
  } catch {
    if (id === mountId) {
      canvas.style.display = 'none';
    }
  }
}

export function unmountOcean() {
  /* Stay in the water while the visitor roams unknown routes. */
  if (isOceanRoute()) return;
  mountId++;
  engine?.destroy();
  engine = null;
  const canvas = document.getElementById('oceanCanvas');
  if (canvas) canvas.style.display = 'none';
}

import { escapeHtml } from './util.js';

const KEEP_ABSOLUTE = /^(https?:|\/\/|mailto:|tel:|data:|#)/i;
const DANGEROUS = /^\s*(javascript|vbscript|file|blob):/i;

let markedPromise = null;
let purifyPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      script.remove();
      reject(new Error(`Failed to load ${src}`));
    };
    document.head.appendChild(script);
  });
}

function loadScriptWithFallback(sources) {
  return sources.reduce(
    (chain, src) => chain.catch(() => loadScript(src)),
    Promise.reject(new Error('No script sources configured'))
  );
}

export function loadMarked() {
  if (!markedPromise) {
    markedPromise = loadScriptWithFallback([
      'https://cdn.jsdelivr.net/npm/marked@4/marked.min.js',
      'https://unpkg.com/marked@4/marked.min.js',
    ])
      .then(() => {
        if (!window.marked) throw new Error('marked unavailable');
        return window.marked;
      })
      .catch((error) => {
        markedPromise = null;
        throw error;
      });
  }
  return markedPromise;
}

export function loadPurify() {
  if (!purifyPromise) {
    purifyPromise = loadScriptWithFallback([
      'https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js',
      'https://unpkg.com/dompurify@3/dist/purify.min.js',
    ])
      .then(() => {
        if (!window.DOMPurify) throw new Error('DOMPurify unavailable');
        return window.DOMPurify;
      })
      .catch((error) => {
        purifyPromise = null;
        throw error;
      });
  }
  return purifyPromise;
}

export function normalizeReadmeUrl(url) {
  const match = String(url).match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/);
  if (!match) return url;

  const [, owner, repo, rest] = match;
  const parts = rest.split('/');
  const usesRefs = parts[0] === 'refs' && (parts[1] === 'heads' || parts[1] === 'tags');
  const ref = usesRefs ? `${parts[0]}/${parts[1]}/${parts[2]}` : parts[0];
  const path = parts.slice(usesRefs ? 3 : 1).join('/');
  if (!ref || !path) return url;

  return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
}

export function deriveRepoInfo(readmeUrl) {
  const marker = 'raw.githubusercontent.com/';
  const index = readmeUrl.indexOf(marker);
  if (index === -1) return null;

  const parts = readmeUrl.slice(index + marker.length).split('/');
  const owner = parts[0];
  const repo = parts[1];
  if (!owner || !repo || parts.length < 3) return null;

  const usesRefs = parts[2] === 'refs' && (parts[3] === 'heads' || parts[3] === 'tags');
  const ref = usesRefs ? `${parts[2]}/${parts[3]}/${parts[4]}` : parts[2];
  if (!ref) return null;

  return {
    owner,
    repo,
    ref,
    shortRef: ref.replace(/^refs\/heads\//, '').replace(/^refs\/tags\//, ''),
    rawRoot: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/`,
    readmeDir: readmeUrl.slice(0, readmeUrl.lastIndexOf('/') + 1),
    webBase: `https://github.com/${owner}/${repo}/`,
  };
}

function resolveWith(url, info) {
  const rootRelative = url.startsWith('/');
  const base = rootRelative ? info.rawRoot : info.readmeDir;
  try {
    return new URL(rootRelative ? url.slice(1) : url, base);
  } catch {
    return null;
  }
}

function relativeToRoot(absolute, info) {
  const rootPath = `/${info.owner}/${info.repo}/${info.ref}/`;
  if (!absolute.pathname.startsWith(rootPath)) return null;
  return absolute.pathname.slice(rootPath.length);
}

function toRawUrl(url, info) {
  const absolute = resolveWith(url, info);
  return absolute ? absolute.href : url;
}

function toWebUrl(url, info) {
  const absolute = resolveWith(url, info);
  if (!absolute) return url;

  const tail = relativeToRoot(absolute, info);
  if (tail === null) return absolute.href;

  const kind = absolute.pathname.endsWith('/') ? 'tree' : 'blob';
  return `${info.webBase}${kind}/${info.shortRef}/${tail}${absolute.search}${absolute.hash}`;
}

function toFallbackUrl(url, info) {
  const absolute = resolveWith(url, info);
  if (!absolute) return null;

  const tail = relativeToRoot(absolute, info);
  if (!tail) return null;

  return `https://cdn.jsdelivr.net/gh/${info.owner}/${info.repo}@${info.shortRef}/${tail}`;
}

function rewriteSrcset(value, map) {
  if (/data:/i.test(value)) return value;

  return value
    .split(',')
    .map((entry) => {
      const segment = entry.trim();
      if (!segment) return '';

      const match = segment.match(/^(\S+)(\s+.*)?$/);
      const url = match[1];
      const descriptor = match[2] || '';

      return (KEEP_ABSOLUTE.test(url) ? url : map(url)) + descriptor;
    })
    .filter(Boolean)
    .join(', ');
}

function slugify(text, used) {
  const base =
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section';

  let slug = base;
  let counter = 2;
  while (used.has(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  used.add(slug);
  return slug;
}

function collectHeadings(doc) {
  const used = new Set();
  const headings = [];

  doc.querySelectorAll('h2, h3').forEach((heading) => {
    const text = heading.textContent.trim();
    if (!text) return;

    const slug = slugify(text, used);
    heading.id = slug;
    headings.push({ slug, text, level: heading.tagName === 'H2' ? 2 : 3 });
  });

  return headings;
}

function renderToc(headings) {
  if (headings.length < 2) return '';

  const items = headings
    .map(
      (heading) =>
        `<li class="readme-toc__item readme-toc__item--h${heading.level}"><a href="#${heading.slug}">${escapeHtml(heading.text)}</a></li>`
    )
    .join('');

  return `<nav class="readme-toc" aria-label="On this page"><p class="readme-toc__title">On this page</p><ul class="readme-toc__list">${items}</ul></nav>`;
}

export function processReadmeHtml(html, readmeUrl) {
  const info = deriveRepoInfo(readmeUrl);
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const lead = doc.body.firstElementChild;
  if (lead && lead.tagName === 'H1') lead.remove();

  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');

    if (src) {
      if (DANGEROUS.test(src)) {
        img.removeAttribute('src');
      } else if (info && !KEEP_ABSOLUTE.test(src)) {
        img.setAttribute('src', toRawUrl(src, info));
        const fallback = toFallbackUrl(src, info);
        if (fallback) img.setAttribute('data-fallback', fallback);
      }
    }

    const srcset = img.getAttribute('srcset');
    if (srcset && info) {
      img.setAttribute('srcset', rewriteSrcset(srcset, (url) => toRawUrl(url, info)));
    }

    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  });

  doc.querySelectorAll('source').forEach((source) => {
    const srcset = source.getAttribute('srcset');
    if (srcset && info) {
      source.setAttribute('srcset', rewriteSrcset(srcset, (url) => toRawUrl(url, info)));
    }
  });

  doc.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (!href) return;

    if (DANGEROUS.test(href)) {
      anchor.removeAttribute('href');
      return;
    }

    if (KEEP_ABSOLUTE.test(href)) {
      if (!href.startsWith('#')) {
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
      }
      return;
    }

    if (info) anchor.setAttribute('href', toWebUrl(href, info));
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  });

  doc.querySelectorAll('table').forEach((table) => {
    const wrap = doc.createElement('div');
    wrap.className = 'readme-content__tableWrap';
    table.replaceWith(wrap);
    wrap.appendChild(table);
  });

  const headings = collectHeadings(doc);

  return { content: doc.body.innerHTML, toc: renderToc(headings) };
}

export async function renderReadme(markdownText, readmeUrl) {
  const [marked, purifier] = await Promise.all([loadMarked(), loadPurify()]);
  const html = marked.parse(markdownText);
  const clean = purifier.sanitize(html);
  return processReadmeHtml(clean, readmeUrl);
}
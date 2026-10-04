import { normalizeReadmeUrl, renderReadme } from './markdown.js';

const cache = new Map();

async function load(url) {
  const requestUrl = normalizeReadmeUrl(url);
  const response = await fetch(requestUrl);

  if (!response.ok) {
    const error = new Error(`README request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const markdownText = await response.text();
  return renderReadme(markdownText, requestUrl);
}

export function getReadme(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      load(url).catch((error) => {
        cache.delete(url);
        throw error;
      })
    );
  }
  return cache.get(url);
}

export function clearReadmeCache() {
  cache.clear();
}
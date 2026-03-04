export function scrollToResults(elementId = 'results-anchor') {
  if (typeof window === 'undefined') {
    return;
  }

  const node = document.getElementById(elementId);
  if (!node) {
    return;
  }

  node.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

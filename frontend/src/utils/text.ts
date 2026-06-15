export function truncateText(text: string, max = 10) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '...' : text
}
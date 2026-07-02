export function truncateText(text: string, max = 10) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '...' : text
}

export function normalizeMultilineText(text: string | null | undefined) {
  return (text ?? '')
    .replace(/\r\n/g, '\n')      // 統一換行格式
    .replace(/\n{3,}/g, '\n\n')  // 最多保留一個空白行
    .trimEnd()                   // 移除結尾空白
}
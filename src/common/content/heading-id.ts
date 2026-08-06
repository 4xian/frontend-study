/** 将小节标题文本转为锚点 ID，空白转连字符并保留中文与字母数字。 */
export function headingId(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w一-鿿-]/g, '')
}

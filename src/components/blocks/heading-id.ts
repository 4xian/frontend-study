/* heading 文本 → 锚点 id 的统一转换（HeadingBlock 与 AppOutline 共用） */

/**
 * 将小节标题文本转为锚点 id：空白转连字符，保留中文与字母数字
 */
export function headingId(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w一-鿿-]/g, '')
}

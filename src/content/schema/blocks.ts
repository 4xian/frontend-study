export interface PitfallExample {
  lang: string
  content: string
}

export interface PitfallItem {
  title: string
  description: string
  consequence: string
  wrong: PitfallExample
  correct: PitfallExample
}

export type ContentBlock =
  | { type: 'heading'; content: string }
  | { type: 'text'; content: string }
  | { type: 'code'; lang: string; content: string }
  | { type: 'demo'; id: string; description?: string; playground?: boolean }
  | { type: 'tip'; style: 'info' | 'warning'; content: string }
  | { type: 'principle'; id: string; content: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'steps'; items: { title: string; content: string }[] }
  | { type: 'exercise'; title: string; instructions: string; answer?: string }
  | { type: 'checklist'; items: { label: string; checked?: boolean }[] }
  | { type: 'compare'; before: string; after: string; labels?: [string, string] }
  | { type: 'pitfalls'; items: PitfallItem[] }
  | { type: 'interactive'; id: string }

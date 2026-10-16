import type { Media } from '@/payload-types'

// NOTE: this file is imported by both server and client components. Keep it
// free of any server-only imports ('payload', 'server-only', fs, etc.).

// ---------- classnames ----------
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

// ---------- media URL ----------
export function mediaUrl(media: Media | number | string | null | undefined): string | undefined {
  if (!media) return undefined
  if (typeof media === 'string') return media
  if (typeof media === 'number') return undefined
  return media?.url ?? undefined
}

// ---------- rich text -> plain text (for meta descriptions / cards) ----------
type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
  [k: string]: unknown
}

export function richTextToPlain(value: unknown): string {
  if (!value) return ''
  try {
    // Payload stores Lexical richText as { root: {...} }.
    const container = value as { root?: LexicalNode }
    const root = container.root ?? (value as LexicalNode)
    const parts: string[] = []
    const walk = (node: LexicalNode | undefined) => {
      if (!node) return
      if (typeof node.text === 'string') parts.push(node.text)
      node.children?.forEach(walk)
    }
    walk(root)
    return parts.join(' ').replace(/\s+/g, ' ').trim()
  } catch {
    return ''
  }
}

// ---------- misc ----------
export const ANSWER_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function answerLetter(index: number): string {
  return ANSWER_LETTERS[index] ?? '?'
}

export function formatPoints(n: number): string {
  return n.toLocaleString('en-US')
}

export const PLAYER_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Cyan', hex: '#06b6d4' },
]

// Classic Kahoot-style answer colours, keyed by index.
export const ANSWER_COLORS = [
  { bg: '#ef4444', text: '#ffffff' }, // A — red
  { bg: '#3b82f6', text: '#ffffff' }, // B — blue
  { bg: '#facc15', text: '#1f2937' }, // C — yellow
  { bg: '#22c55e', text: '#ffffff' }, // D — green
  { bg: '#a855f7', text: '#ffffff' }, // E — purple
  { bg: '#f97316', text: '#ffffff' }, // F — orange
]

export function generateJoinCode(length = 6): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no confusable 0/O/1/I/L
  let out = ''
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

// Build a single-paragraph Payload Lexical richText value from plain text.
export function plainTextToLexical(text: string) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: null,
      children: [
        {
          type: 'paragraph',
          format: '' as const,
          indent: 0,
          version: 1,
          direction: null,
          textFormat: 0,
          textStyle: '',
          children: [
            {
              type: 'text',
              text,
              detail: 0,
              format: 0,
              mode: 'normal' as const,
              style: '',
              version: 1,
            },
          ],
        },
      ],
    },
  }
}

export function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  const out: Record<string, FormDataEntryValue> = {}
  formData.forEach((value, key) => {
    out[key] = value
  })
  return out
}

// Selectable player avatars (served from /public/game-assets).
export const AVATARS = [
  '/game-assets/player-icon-luffy.jpg',
  '/game-assets/player-icon-naruto.jpg',
  '/game-assets/player-icon-ichigo.jpg',
  '/game-assets/player-icon-yhwach.jpg',
]

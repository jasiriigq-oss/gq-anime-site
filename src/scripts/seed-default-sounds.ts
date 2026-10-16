/**
 * Seeds the three feedback sounds (correct / incorrect / timeout) as synthesized
 * WAV tones and points the `game-sounds` global at them, so feedback works out of
 * the box. Replace the uploads in the Payload admin at any time.
 *
 * Run:  bun src/scripts/seed-default-sounds.ts
 */
import { getPayload } from 'payload'
import config from '@/payload.config'

const SR = 44100

function wav(samples: Float32Array): Buffer {
  const n = samples.length
  const buf = Buffer.alloc(44 + n * 2)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + n * 2, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20) // PCM
  buf.writeUInt16LE(1, 22) // mono
  buf.writeUInt32LE(SR, 24)
  buf.writeUInt32LE(SR * 2, 28)
  buf.writeUInt16LE(2, 32)
  buf.writeUInt16LE(16, 34)
  buf.write('data', 36)
  buf.writeUInt32LE(n * 2, 40)
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2)
  }
  return buf
}

type Note = { freq: number; dur: number; amp?: number; type?: 'sine' | 'square' | 'tri' }

function melody(notes: Note[]): Float32Array {
  const total = Math.floor(SR * notes.reduce((a, n) => a + n.dur, 0))
  const out = new Float32Array(total)
  let o = 0
  for (const note of notes) {
    const n = Math.floor(SR * note.dur)
    const amp = note.amp ?? 0.5
    for (let i = 0; i < n && o + i < total; i++) {
      const t = i / SR
      const phase = 2 * Math.PI * note.freq * t
      let v = Math.sin(phase)
      if (note.type === 'square') v = v >= 0 ? 1 : -1
      if (note.type === 'tri') v = Math.asin(Math.sin(phase)) * (2 / Math.PI)
      // soft attack, smooth release
      const env = Math.min(1, t / 0.008) * Math.min(1, (note.dur - t) / 0.06)
      out[o + i] = v * env * amp
    }
    o += n
  }
  return out
}

const sounds = {
  // rising, cheerful "ding-ding-ding"
  correctSound: {
    name: 'gqe-correct.wav',
    alt: 'Correct answer sound',
    data: wav(melody([
      { freq: 880, dur: 0.09, amp: 0.45 },
      { freq: 1174.66, dur: 0.09, amp: 0.45 },
      { freq: 1567.98, dur: 0.18, amp: 0.5 },
    ])),
  },
  // low descending buzz
  incorrectSound: {
    name: 'gqe-incorrect.wav',
    alt: 'Incorrect answer sound',
    data: wav(melody([
      { freq: 220, dur: 0.16, amp: 0.4, type: 'square' },
      { freq: 155, dur: 0.26, amp: 0.4, type: 'square' },
    ])),
  },
  // soft two-note "time's up" chime
  timeoutSound: {
    name: 'gqe-timeout.wav',
    alt: 'Time-out sound',
    data: wav(melody([
      { freq: 587.33, dur: 0.16, amp: 0.4, type: 'tri' },
      { freq: 392, dur: 0.34, amp: 0.4, type: 'tri' },
    ])),
  },
} as const

const payload = await getPayload({ config: await config })

const ids: Record<string, number> = {}
for (const [field, s] of Object.entries(sounds)) {
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: s.name } }, limit: 1 })
  const doc =
    existing.docs[0] ??
    (await payload.create({
      collection: 'media',
      data: { alt: s.alt },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      file: { data: s.data, mimetype: 'audio/wav', name: s.name, size: s.data.length } as any,
    }))
  ids[field] = doc.id
  console.log(`${s.name} -> media id ${doc.id} (${s.data.length} bytes) url=${doc.url}`)
}

await payload.updateGlobal({
  slug: 'game-sounds',
  data: {
    enabled: true,
    volume: 0.7,
    correctSound: ids.correctSound,
    incorrectSound: ids.incorrectSound,
    timeoutSound: ids.timeoutSound,
  },
})
console.log('game-sounds global updated with', JSON.stringify(ids))
process.exit(0)

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiTrash2, FiSave, FiSend } from 'react-icons/fi'
import { saveQuizAction } from '@/app/quiz-actions'
import { quizCreatorSchema } from '@/lib/validation'

type Answer = { text: string; isCorrect: boolean }
type Question = {
  questionText: string
  questionType: 'text' | 'image' | 'video' | 'audio'
  timeLimitSeconds: number
  points: number
  answers: Answer[]
}

const QUESTION_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
]

const CATEGORIES = [
  { value: 'lore', label: 'Lore' },
  { value: 'personality', label: 'Personality' },
  { value: 'trivia', label: 'Trivia' },
  { value: 'quick-challenge', label: 'Quick Challenge' },
]

function newQuestion(): Question {
  return {
    questionText: '',
    questionType: 'text',
    timeLimitSeconds: 15,
    points: 10,
    answers: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
  }
}

export function CreatorForm({ user }: { user: { id: number; username: string } }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [series, setSeries] = useState('')
  const [category, setCategory] = useState('trivia')
  const [difficulty, setDifficulty] = useState(3)
  const [expectedTimeMinutes, setExpectedTimeMinutes] = useState(10)
  const [description, setDescription] = useState('')
  const [multiplayerEnabled, setMultiplayerEnabled] = useState(true)
  const [soloPlayEnabled, setSoloPlayEnabled] = useState(true)
  const [challengeMode, setChallengeMode] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([newQuestion()])
  const [error, setError] = useState('')
  const [pending, setPending] = useState<'draft' | 'publish' | null>(null)

  function setQuestion(i: number, patch: Partial<Question>) {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)))
  }
  function setAnswer(qi: number, ai: number, patch: Partial<Answer>) {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qi ? { ...q, answers: q.answers.map((a, j) => (j === ai ? { ...a, ...patch } : a)) } : q,
      ),
    )
  }
  function setCorrect(qi: number, ai: number) {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qi ? { ...q, answers: q.answers.map((a, j) => ({ ...a, isCorrect: j === ai })) } : q,
      ),
    )
  }
  function addAnswer(qi: number) {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qi && q.answers.length < 6 ? { ...q, answers: [...q.answers, { text: '', isCorrect: false }] } : q,
      ),
    )
  }
  function removeAnswer(qi: number, ai: number) {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qi && q.answers.length > 2 ? { ...q, answers: q.answers.filter((_, j) => j !== ai) } : q,
      ),
    )
  }
  function addQuestion() {
    setQuestions((prev) => [...prev, newQuestion()])
  }
  function removeQuestion(qi: number) {
    setQuestions((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== qi) : prev))
  }

  async function submit(publish: boolean) {
    setPending(publish ? 'publish' : 'draft')
    setError('')

    const payload = {
      name,
      series,
      category,
      difficulty,
      expectedTimeMinutes,
      description,
      multiplayerEnabled,
      soloPlayEnabled,
      challengeMode,
      questions: questions.map((q) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        timeLimitSeconds: q.timeLimitSeconds,
        points: q.points,
        answers: q.answers.map((a) => ({ text: a.text, isCorrect: a.isCorrect })),
      })),
    }

    const parsed = quizCreatorSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please fix the highlighted fields.')
      setPending(null)
      return
    }

    const fd = new FormData()
    fd.set('name', name)
    fd.set('series', series)
    fd.set('category', category)
    fd.set('difficulty', String(difficulty))
    fd.set('expectedTimeMinutes', String(expectedTimeMinutes))
    fd.set('description', description)
    if (multiplayerEnabled) fd.set('multiplayerEnabled', 'on')
    if (soloPlayEnabled) fd.set('soloPlayEnabled', 'on')
    if (challengeMode) fd.set('challengeMode', 'on')
    fd.set('questions', JSON.stringify(parsed.data.questions))
    fd.set('publish', String(publish))

    const res = await saveQuizAction(fd)
    setPending(null)
    if (!res.ok) {
      setError(res.error ?? Object.values(res.fieldErrors ?? {})[0] ?? 'Failed to save quiz.')
      return
    }
    if (publish && res.quizSlug) {
      router.push(`/quiz/${res.quizSlug}`)
    } else if (res.quizId) {
      router.push('/profile')
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* sidebar */}
      <aside className="space-y-3">
        <div className="card-dark p-4">
          <h2 className="font-black text-white">My Quizzes</h2>
          <ul className="mt-2 space-y-1 text-sm text-white/60">
            <li>My Drafts</li>
            <li>Published Quizzes</li>
            <li>My Category</li>
          </ul>
        </div>
        <div className="card-dark space-y-2 p-4">
          <button onClick={() => submit(false)} disabled={pending !== null} className="btn-dark w-full">
            <FiSave /> Save Draft
          </button>
          <button onClick={() => submit(true)} disabled={pending !== null} className="btn-brand w-full">
            <FiSend /> {pending === 'publish' ? 'Publishing…' : 'Publish Quiz'}
          </button>
          {error && <p className="field-error">{error}</p>}
        </div>
      </aside>

      {/* main */}
      <div className="space-y-6">
        <div className="card-dark p-6">
          <h2 className="mb-4 font-black text-white">Quiz Info</h2>
          <div className="space-y-4">
            <div>
              <label className="label-dark">Quiz Title</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input-dark" placeholder="Demon Slayer Breaths & Hashira Challenge" />
            </div>
            <div>
              <label className="label-dark">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-dark min-h-24" placeholder="Describe your quiz…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-dark">Anime Series</label>
                <input value={series} onChange={(e) => setSeries(e.target.value)} className="input-dark" placeholder="Jujutsu Kaisen" />
              </div>
              <div>
                <label className="label-dark">Quiz Type</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-dark">
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-dark">Difficulty</label>
                <div className="flex gap-1 text-2xl">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setDifficulty(n)} className={n <= difficulty ? 'text-gold' : 'text-white/20'}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-dark">Expected Time (minutes)</label>
                <input type="number" min={1} max={180} value={expectedTimeMinutes} onChange={(e) => setExpectedTimeMinutes(Number(e.target.value))} className="input-dark" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="label-dark">Settings</span>
              {[
                { label: 'Multi-Player Enabled', value: multiplayerEnabled, set: setMultiplayerEnabled },
                { label: 'Solo-Play Enabled', value: soloPlayEnabled, set: setSoloPlayEnabled },
                { label: 'Challenge Mode (wrong answer = eliminated)', value: challengeMode, set: setChallengeMode },
              ].map((s) => (
                <label key={s.label} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-sm text-white/80">{s.label}</span>
                  <input type="checkbox" checked={s.value} onChange={(e) => s.set(e.target.checked)} className="h-5 w-5 accent-[#e91e63]" />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* questions */}
        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={qi} className="card-dark p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-black text-white">Q{qi + 1}</h3>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-300">
                    <FiTrash2 />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <textarea value={q.questionText} onChange={(e) => setQuestion(qi, { questionText: e.target.value })} className="input-dark min-h-20" placeholder="Question text…" />

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="label-dark">Type</label>
                    <select value={q.questionType} onChange={(e) => setQuestion(qi, { questionType: e.target.value as Question['questionType'] })} className="input-dark">
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-dark">Timer (s)</label>
                    <input type="number" min={5} max={300} value={q.timeLimitSeconds} onChange={(e) => setQuestion(qi, { timeLimitSeconds: Number(e.target.value) })} className="input-dark" />
                  </div>
                  <div>
                    <label className="label-dark">Points</label>
                    <input type="number" min={0} value={q.points} onChange={(e) => setQuestion(qi, { points: Number(e.target.value) })} className="input-dark" />
                  </div>
                </div>

                <div>
                  <span className="label-dark">Answers (select the correct one)</span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.answers.map((a, ai) => (
                      <div key={ai} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={a.isCorrect}
                          onChange={() => setCorrect(qi, ai)}
                          className="accent-[#e91e63]"
                          aria-label="Correct answer"
                        />
                        <input
                          value={a.text}
                          onChange={(e) => setAnswer(qi, ai, { text: e.target.value })}
                          className="input-dark !py-2"
                          placeholder={`Answer ${['A', 'B', 'C', 'D', 'E', 'F'][ai]}`}
                        />
                        {q.answers.length > 2 && (
                          <button type="button" onClick={() => removeAnswer(qi, ai)} className="text-red-400">
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {q.answers.length < 6 && (
                    <button type="button" onClick={() => addAnswer(qi)} className="btn-dark mt-2 !py-1 text-xs">
                      <FiPlus /> Add answer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button onClick={addQuestion} className="btn-dark w-full">
            <FiPlus /> Add Question
          </button>
        </div>
      </div>
    </div>
  )
}

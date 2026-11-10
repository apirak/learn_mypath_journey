import { useState } from 'react'
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2, TriangleAlert } from 'lucide-react'
import { analyse } from '../data/analysis'
import { CODES } from '../data/demo'
import { programById } from '../data/programs'
import { ExamChips, ProgramText, SubjectChip, UniBadge } from './parts'
import TargetPicker, { MAX_TARGETS } from './TargetPicker'

// Step 1: pick + rank in one page (design screenshot). Drag to reorder, with
// up/down buttons as the keyboard/precise alternative.
export default function StepTargets({
  targets,
  setTargets,
  onCode,
}: {
  targets: string[]
  setTargets: (t: string[]) => void
  onCode?: (code: string) => void
}) {
  const [picking, setPicking] = useState(false)
  const [drag, setDrag] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)
  const move = (from: number, to: number) => {
    if (to < 0 || to >= targets.length || from === to) return
    const next = [...targets]
    const [x] = next.splice(from, 1)
    next.splice(to, 0, x)
    setTargets(next)
  }
  const a = analyse(targets)

  return (
    <div className="mx-auto w-full max-w-[950px]">
      <h1 className="text-center text-[28px] font-bold">คณะเป้าหมาย (เพิ่มได้สูงสุด {MAX_TARGETS} อันดับ)</h1>
      <p className="mt-1 text-center text-muted">ลากเพื่อเรียงตามที่อยากเข้า อันดับ 1 คือที่อยากเข้าที่สุด</p>

      <ol className="mt-8 flex flex-col gap-4">
        {targets.map((id, i) => {
          const p = programById(id)
          if (!p) return null
          return (
            <li
              key={id}
              draggable
              onDragStart={e => { setDrag(i); e.dataTransfer.effectAllowed = 'move' }}
              onDragOver={e => { e.preventDefault(); setOver(i) }}
              onDragLeave={() => setOver(o => (o === i ? null : o))}
              onDrop={e => { e.preventDefault(); if (drag !== null) move(drag, i); setDrag(null); setOver(null) }}
              onDragEnd={() => { setDrag(null); setOver(null) }}
              className={`group flex items-center gap-4 rounded-xl border bg-white px-5 py-4 transition ${
                drag === i ? 'opacity-40' : ''
              } ${over === i && drag !== i ? 'border-primary ring-2 ring-primary/20' : 'border-line'}`}
            >
              <GripVertical size={22} className="flex-none cursor-grab text-ink active:cursor-grabbing" aria-hidden="true" />
              <span className="grid h-8 w-11 flex-none place-items-center rounded-full bg-primary text-[15px] font-semibold text-white">{i + 1}</span>
              <UniBadge p={p} size={44} />
              <div className="min-w-0 flex-1">
                <ProgramText p={p} />
                <div className="mt-2"><ExamChips p={p} /></div>
              </div>
              <div className="flex flex-none flex-col opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                <button type="button" className="btn-ghost h-7 px-1.5" aria-label={`เลื่อนอันดับ ${i + 1} ขึ้น`} disabled={i === 0} onClick={() => move(i, i - 1)}><ChevronUp size={18} /></button>
                <button type="button" className="btn-ghost h-7 px-1.5" aria-label={`เลื่อนอันดับ ${i + 1} ลง`} disabled={i === targets.length - 1} onClick={() => move(i, i + 1)}><ChevronDown size={18} /></button>
              </div>
              <button type="button" className="btn-ghost px-2" aria-label={`ลบอันดับ ${i + 1}`} onClick={() => setTargets(targets.filter(t => t !== id))}>
                <Trash2 size={22} />
              </button>
            </li>
          )
        })}
      </ol>

      {!targets.length && (
        <div className="mt-8 rounded-xl border border-dashed border-line px-6 py-10 text-center text-muted">ยังไม่มีเป้าหมาย กด “เพิ่มคณะเป้าหมาย” เพื่อเริ่ม</div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <button type="button" className="btn-outline" disabled={targets.length >= MAX_TARGETS} onClick={() => setPicking(true)}>
          <Plus size={20} /> เพิ่มคณะเป้าหมาย
        </button>
        {onCode && <CodeEntry onCode={onCode} />}
      </div>

      {targets.length > 0 && (
        <section className="mt-8 rounded-xl bg-canvas px-5 py-4" aria-live="polite">
          <h2 className="text-sm font-semibold text-muted">วิชาที่ต้องสอบรวมทุกอันดับ</h2>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {a.subjects.map(s => (
              <span key={s.id} className="inline-flex items-center gap-1.5">
                <SubjectChip id={s.id} />
                <span className="text-xs text-muted">{s.ranks.length === targets.length ? 'ใช้ทุกอันดับ' : `ใช้ ${s.ranks.length} อันดับ`}</span>
              </span>
            ))}
            {!a.subjects.length && <span className="text-sm text-muted">เป้าหมายที่เลือกยังไม่ใช้คะแนนสอบ</span>}
          </div>
          {a.noExamTargets.length > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-warn">
              <TriangleAlert size={16} /> {a.noExamTargets.length} อันดับยังไม่มีข้อมูลวิชาสอบใน mytcas
            </p>
          )}
        </section>
      )}

      {picking && <TargetPicker targets={targets} onAdd={id => setTargets([...targets, id])} onClose={() => setPicking(false)} />}
    </div>
  )
}

function CodeEntry({ onCode }: { onCode: (code: string) => void }) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  if (!open)
    return (
      <button type="button" className="ml-auto text-[15px] font-medium text-primary hover:underline" onClick={() => setOpen(true)}>
        มีโค้ด MyPath?
      </button>
    )
  return (
    <form
      className="ml-auto flex items-start gap-2"
      onSubmit={e => {
        e.preventDefault()
        const c = code.trim().toUpperCase()
        if (!CODES[c]) return setError('ไม่พบโค้ดนี้ ลองตรวจตัวสะกดอีกครั้ง')
        onCode(c)
      }}
    >
      <div>
        <input
          autoFocus
          className={`input h-11 w-52 uppercase ${error ? 'border-danger' : ''}`}
          placeholder="ใส่โค้ด เช่น ENG70"
          value={code}
          onChange={e => { setCode(e.target.value); setError('') }}
          aria-invalid={!!error}
          aria-describedby="code-error"
        />
        <p id="code-error" className="mt-1 h-4 text-xs text-danger">{error}</p>
      </div>
      <button type="submit" className="btn-primary" disabled={!code.trim()}>ใช้โค้ด</button>
    </form>
  )
}

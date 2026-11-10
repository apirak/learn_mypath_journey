import type { CSSProperties } from 'react'
import { programSubjects, subjectColor, subjectName } from '../data/analysis'
import { programTitle, shortKey, uniName, type Program } from '../data/programs'

// Placeholder crest: we have no university logos, so a tinted initial.
const HUES = [205, 340, 25, 145, 265, 45, 185, 0]
export function UniBadge({ p, size = 40 }: { p: Program; size?: number }) {
  const name = uniName(p).replace(/^(มหาวิทยาลัย|สถาบันเทคโนโลยี|สถาบัน)/, '')
  const hue = HUES[Number(p.uni) % HUES.length]
  return (
    <span
      aria-hidden="true"
      className="grid flex-none place-items-center rounded-full font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.42, background: `hsl(${hue} 70% 94%)`, color: `hsl(${hue} 55% 38%)` }}
    >
      {name.slice(0, 1)}
    </span>
  )
}

export function SubjectChip({ id, label, muted }: { id: string; label?: string; muted?: boolean }) {
  const c = subjectColor(id)
  return (
    <span
      className="chip"
      style={{ background: muted ? '#f1f3f5' : `${c}1a`, color: muted ? '#868e96' : c, '--c': c } as CSSProperties}
    >
      {label ?? subjectName(id)}
    </span>
  )
}

// A target's exams as chips: first `max`, then "+N" (docs/journey.md step 1).
export function ExamChips({ p, max = 4 }: { p: Program; max?: number }) {
  const subs = programSubjects(p)
  const others = Object.entries(p.others)
  if (!subs.length) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {others.length ? (
          others.map(([k, w]) => <span key={k} className="chip bg-[#f1f3f5] text-muted">{shortKey(k)} {w}%</span>)
        ) : (
          <span className="chip bg-warn-soft text-warn">ยังไม่มีข้อมูลวิชาสอบ</span>
        )}
      </div>
    )
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {subs.slice(0, max).map(s => (
        <SubjectChip key={s.id} id={s.id} label={`${subjectName(s.id)} ${s.weight ? `${s.weight}%` : 'ขั้นต่ำ'}`} />
      ))}
      {subs.length > max && <span className="chip bg-[#f1f3f5] text-muted">+{subs.length - max}</span>}
    </div>
  )
}

export function ProgramText({ p }: { p: Program }) {
  const t = programTitle(p)
  return (
    <div className="min-w-0">
      <div className="truncate text-[17px] font-semibold">{t.title}</div>
      <div className="truncate text-[15px] text-muted">
        {t.subtitle}, {t.uni}
      </div>
    </div>
  )
}

// 0–10 h, 1 h steps, 0 = พัก — same range and wording as MyPath's StepSlider.
export function HourSlider({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span>
          <span className="text-[17px] font-semibold">{label}</span>
          <span className="ml-2 text-sm text-muted">{hint}</span>
        </span>
        <span className="text-2xl font-bold text-primary">{value === 0 ? 'พัก' : `${value} ชม.`}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        aria-label={label}
        onChange={e => onChange(Number(e.target.value))}
        className="mt-4 w-full accent-[var(--color-primary)]"
      />
      <div className="mt-1 flex justify-between px-[2px] text-xs text-muted" aria-hidden="true">
        {Array.from({ length: 11 }, (_, i) => <span key={i} className="w-4 text-center">{i}</span>)}
      </div>
    </label>
  )
}

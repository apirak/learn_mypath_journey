import { useEffect, useState } from 'react'
import { Check, Info, LoaderCircle, TriangleAlert } from 'lucide-react'
import { analyse, CATALOG_SUBJECTS, DRILL_COURSES, PHASES, phaseOf } from '../data/analysis'
import { examFor, thaiDate } from '../data/mypath'
import { programTitle } from '../data/programs'
import { SubjectChip } from './parts'

const LOADING = ['รวมวิชาสอบจากทุกอันดับ…', 'จัดลำดับความสำคัญของวิชา…', 'วางคอร์สที่ต้องเรียน…']

// Step 2: a short "analysing" beat, then the Required subjects.
export default function StepSubjects({ targets, analysed, setAnalysed }: { targets: string[]; analysed: boolean; setAnalysed: () => void }) {
  const [phase, setPhase] = useState(analysed ? LOADING.length : 0)
  useEffect(() => {
    if (analysed) return
    const t = setInterval(() => setPhase(p => p + 1), 700)
    return () => clearInterval(t)
  }, [analysed])
  useEffect(() => {
    if (phase >= LOADING.length && !analysed) setAnalysed()
  }, [phase, analysed, setAnalysed])

  if (phase < LOADING.length)
    return (
      <div className="mx-auto flex max-w-[420px] flex-col items-center py-16" aria-live="polite">
        <LoaderCircle size={48} className="animate-spin text-primary" />
        <h1 className="mt-6 text-2xl font-bold">กำลังวิเคราะห์เป้าหมาย</h1>
        <ul className="mt-6 flex w-full flex-col gap-3">
          {LOADING.map((t, i) => (
            <li key={t} className={`flex items-center gap-3 ${i > phase ? 'text-[#ced4da]' : i === phase ? 'text-ink' : 'text-muted'}`}>
              {i < phase ? <Check size={18} className="text-ok" /> : <span className="size-[18px]" />}
              {t}
            </li>
          ))}
        </ul>
      </div>
    )

  const a = analyse(targets)
  const n = targets.length
  const drill = a.subjects
    .filter(s => s.hasCourses)
    .flatMap(s => (CATALOG_SUBJECTS.find(x => x.id === s.id)?.courses ?? []).filter(c => DRILL_COURSES.has(c.id)).map(c => ({ s, c })))
  return (
    <div className="mx-auto w-full max-w-[950px]">
      <h1 className="text-center text-[28px] font-bold">วิชาที่ต้องสอบ</h1>
      <p className="mt-1 text-center text-muted">รวมจาก {n} อันดับ จัดเป็น 4 ช่วงเรียน ในแต่ละช่วงวิชาที่สำคัญกว่าเริ่มก่อน</p>

      <ol className="mt-8 flex flex-col gap-6">
        {PHASES.filter(ph => ph.id !== 'drill').map((ph, pi) => {
          const members = a.subjects.filter(s => phaseOf(s.id) === ph.id)
          if (!members.length) return null
          return (
            <li key={ph.id}>
              <PhaseHead n={pi + 1} label={ph.label} hint={ph.hint} />
              <ul className="mt-2.5 flex flex-col gap-2">
                {members.map(s => (
                  <li key={s.id} className="flex items-center gap-4 rounded-xl border border-line bg-white px-5 py-3">
                    <span className="size-3 flex-none rounded-full" style={{ background: s.hasCourses ? s.color : '#ced4da' }} />
                    <div className="w-40 flex-none font-semibold">{s.name}</div>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-[#f1f3f5]">
                        <div className="h-full rounded-full" style={{ width: `${Math.max(4, s.importance)}%`, background: s.hasCourses ? s.color : '#ced4da' }} />
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm tabular-nums text-muted">{s.importance}%</div>
                    <div className="w-40 flex-none text-sm text-muted">
                      {s.ranks.length === n ? 'ใช้ทุกอันดับ' : `ใช้อันดับ ${s.ranks.join(', ')}`}
                    </div>
                    <div className="w-48 flex-none text-right">
                      {s.hasCourses ? <SubjectChip id={s.id} label="มีคอร์ส" /> : <span className="chip bg-[#f1f3f5] text-muted">ยังไม่มีคอร์สใน prototype</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
        {drill.length > 0 && (
          <li>
            <PhaseHead n={4} label="ลุยโจทย์" hint="ย้ายคอร์สตะลุยโจทย์ของทุกวิชามาท้ายสุด นับถอยหลังให้จบพอดีวันสอบ" />
            <ul className="mt-2.5 grid grid-cols-2 gap-2">
              {drill.map(({ s, c }) => (
                <li key={c.id} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
                  <SubjectChip id={s.id} />
                  <span className="min-w-0 flex-1 truncate text-[15px]">{c.short}</span>
                  <span className="flex-none text-xs text-muted">จบก่อนสอบ {thaiDate(examFor(s.id))}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-muted">ถ้าเรียนช่วงอื่นจบก่อนเริ่มลุยโจทย์ เวลาที่เหลือคือช่วงทบทวน</p>
          </li>
        )}
      </ol>
      {!a.subjects.length && <p className="mt-8 text-center text-muted">เป้าหมายที่เลือกยังไม่ใช้คะแนนสอบ จึงยังไม่มีคอร์สให้วางแผน</p>}

      {(a.notes.length > 0 || a.noExamTargets.length > 0) && (
        <section className="mt-6 rounded-xl bg-canvas px-5 py-4 text-sm">
          <h2 className="flex items-center gap-1.5 font-semibold text-muted"><Info size={16} /> หมายเหตุ</h2>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-muted">
            {a.notes.map(t => <li key={t}>{t}</li>)}
            {a.noExamTargets.map(p => (
              <li key={p.id} className="text-warn">
                <TriangleAlert size={14} className="mr-1 inline" />
                {programTitle(p).title} {programTitle(p).uni}: ยังไม่มีข้อมูลวิชาสอบใน mytcas
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function PhaseHead({ n, label, hint }: { n: number; label: string; hint: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-semibold text-primary">ช่วงที่ {n}</span>
      <h2 className="text-lg font-semibold">{label}</h2>
      <span className="text-sm text-muted">{hint}</span>
    </div>
  )
}

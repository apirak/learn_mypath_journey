import { useState, type ReactNode } from 'react'
import type { StudentPlan } from '@learn/mypath'
import TopBar from '../components/TopBar'
import { analyse, buildPlan } from '../data/analysis'
import { breaksFor } from '../data/schools'
import StepPreview from './StepPreview'
import StepSubjects from './StepSubjects'
import StepTargets from './StepTargets'
import StepTime from './StepTime'

export type Draft = { targets: string[]; weekdayHours: number; weekendHours: number; school?: string }
export type Step = 1 | 2 | 3 | 4
const STEPS = ['เป้าหมาย', 'วิชาที่ต้องสอบ', 'เวลาเรียน', 'ดูแผน']

// The 4-step flow (docs/journey.md). Everything is a draft until onConfirm
// (ADR-0002); the tutor reuses it with its own banner and labels.
export default function CreateFlow({
  initial,
  startStep = 1,
  onCancel,
  onConfirm,
  onCode,
  banner,
  owned = [],
  progress = {},
}: {
  initial: Draft
  startStep?: Step
  onCancel?: () => void
  onConfirm: (d: Draft & { plan: StudentPlan }) => void
  onCode?: (code: string) => void
  banner?: ReactNode
  owned?: string[]
  progress?: Record<string, number>
}) {
  const [draft, setDraft] = useState(initial)
  const [step, setStep] = useState<Step>(startStep)
  const [analysedFor, setAnalysedFor] = useState<string | null>(startStep > 2 ? initial.targets.join() : null)
  const [plan, setPlan] = useState<StudentPlan | null>(null)
  const [redo, setRedo] = useState(false)

  const go = (s: Step) => {
    if (s === 4) setPlan(buildPlan(analyse(draft.targets).subjects, draft.weekdayHours, draft.weekendHours, breaksFor(draft.school, draft.weekendHours)))
    setRedo(false)
    setStep(s)
    window.scrollTo({ top: 0 })
  }
  const key = draft.targets.join()
  const analysing = step === 2 && analysedFor !== key

  return (
    <div className="flex min-h-full flex-col">
      <TopBar menu={!onCancel} right={onCancel && <button type="button" className="btn h-8 px-4 text-xs text-white/80 hover:bg-white/10 hover:text-white" onClick={onCancel}>ยกเลิก</button>} />
      {banner}
      <main className="flex-1 px-8 py-12">
        <div className="card mx-auto flex min-h-[720px] w-full max-w-[1248px] flex-col px-12 pb-8 pt-12">
          <ol className="grid grid-cols-4 gap-2" aria-label="ขั้นตอน">
            {STEPS.map((label, i) => (
              <li key={label} aria-current={step === i + 1 ? 'step' : undefined}>
                <div className={`h-1 rounded-full ${i < step ? 'bg-primary' : 'bg-[#e9ecef]'}`} />
                <div className={`mt-2 text-sm ${i + 1 === step ? 'font-semibold text-ink' : 'text-muted'}`}>{i + 1}. {label}</div>
              </li>
            ))}
          </ol>

          <div className="flex flex-1 py-10">
            {step === 1 && <StepTargets targets={draft.targets} setTargets={targets => setDraft({ ...draft, targets })} onCode={onCode} />}
            {step === 2 && <StepSubjects key={key} targets={draft.targets} analysed={!analysing} setAnalysed={() => setAnalysedFor(key)} />}
            {step === 3 && <StepTime weekdayHours={draft.weekdayHours} weekendHours={draft.weekendHours} school={draft.school} set={(weekdayHours, weekendHours) => setDraft({ ...draft, weekdayHours, weekendHours })} setSchool={school => setDraft({ ...draft, school })} />}
            {step === 4 && plan && <StepPreview plan={plan} setPlan={setPlan} owned={owned} progress={progress} />}
          </div>

          <div className="flex items-center justify-between">
            {step === 4 ? (
              <div className="relative">
                <button type="button" className="btn-secondary h-14 w-52" onClick={() => setRedo(r => !r)}>ยังไม่ชอบ ปรับใหม่</button>
                {redo && (
                  <div className="absolute bottom-16 left-0 z-20 w-64 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5">
                    <button type="button" className="w-full rounded-lg px-3 py-2.5 text-left hover:bg-black/5" onClick={() => go(3)}>
                      <div className="font-medium">ปรับเวลาเรียน</div><div className="text-xs text-muted">เปลี่ยนชั่วโมงวันเรียน / วันหยุด</div>
                    </button>
                    <button type="button" className="w-full rounded-lg px-3 py-2.5 text-left hover:bg-black/5" onClick={() => go(1)}>
                      <div className="font-medium">ปรับเป้าหมาย</div><div className="text-xs text-muted">เพิ่ม ลบ หรือเรียงอันดับใหม่</div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" className="btn-secondary h-14 w-52" disabled={step === 1 && !onCancel} onClick={() => (step === 1 ? onCancel?.() : go((step - 1) as Step))}>
                ย้อนกลับ
              </button>
            )}
            {step === 4 ? (
              <button type="button" className="btn-primary h-14 w-52" onClick={() => plan && onConfirm({ ...draft, plan })}>ตกลง ใช้แผนนี้</button>
            ) : (
              <button type="button" className="btn-primary h-14 w-52" disabled={(step === 1 && !draft.targets.length) || (step === 3 && !draft.school) || analysing} onClick={() => go((step + 1) as Step)}>
                ถัดไป
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

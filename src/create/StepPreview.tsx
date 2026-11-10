import type { StudentPlan } from '@learn/mypath'
import { CalendarCheck, Clock, Layers, TriangleAlert } from 'lucide-react'
import MyPathView from '../components/MyPathView'
import { DRILL_COURSES, subjectName } from '../data/analysis'
import { DAY, layout, summarise, thaiDate } from '../data/mypath'

// Step 4: summary + the draft in MyPath's All view. Edits made here stay in
// the draft until the student goes back to an earlier step.
export default function StepPreview({
  plan,
  setPlan,
  owned,
  progress,
}: {
  plan: StudentPlan
  setPlan: (p: StudentPlan) => void
  owned: string[]
  progress: Record<string, number>
}) {
  const s = summarise(plan)
  // Review period (GLOSSARY.md): free weeks between a subject's last regular course and its first drill course.
  const spans = layout(plan)
  const review = plan.calendar.subjects.flatMap(id => {
    const mine = spans.filter(x => x.subject === id)
    const lastRegular = Math.max(...mine.filter(x => !DRILL_COURSES.has(x.course)).map(x => x.end))
    const firstDrill = Math.min(...mine.filter(x => DRILL_COURSES.has(x.course)).map(x => x.start))
    const weeks = Math.floor((firstDrill - lastRegular - DAY) / (7 * DAY))
    return Number.isFinite(weeks) && weeks > 0 ? [`${subjectName(id)} ${weeks} สัปดาห์`] : []
  })
  const late = s.lateSubjects.length > 0
  const stat = (icon: React.ReactNode, label: string, value: string, sub?: string, warn?: boolean) => (
    <div className={`flex items-start gap-3 rounded-xl px-5 py-4 ${warn ? 'bg-warn-soft' : 'bg-canvas'}`}>
      <span className={warn ? 'text-warn' : 'text-primary'}>{icon}</span>
      <div>
        <div className="text-sm text-muted">{label}</div>
        <div className={`text-xl font-bold ${warn ? 'text-warn' : ''}`}>{value}</div>
        {sub && <div className="text-xs text-muted">{sub}</div>}
      </div>
    </div>
  )
  return (
    <div className="w-full">
      <h1 className="text-center text-[28px] font-bold">แผนเรียนของคุณ</h1>
      <p className="mt-1 text-center text-muted">ลองดูก่อน ถ้าชอบกด “ตกลง ใช้แผนนี้” ถ้ายังไม่ชอบ ย้อนกลับไปปรับได้</p>
      <div className="mt-8 grid grid-cols-4 gap-3">
        {stat(<Layers size={22} />, 'วิชาที่มีคอร์ส', `${plan.calendar.subjects.length} วิชา`, `${s.courses} คอร์ส`)}
        {stat(<Clock size={22} />, 'ชั่วโมงเรียนรวม', `${s.hours.toLocaleString()} ชม.`)}
        {stat(
          <CalendarCheck size={22} />,
          'เรียนจบ',
          s.end ? thaiDate(s.end) : '–',
          late ? `หลังสอบจริง (${thaiDate(s.lastExam)}): ${s.lateSubjects.map(subjectName).join(', ')}` : `ก่อนสอบจริง ${thaiDate(s.lastExam)}`,
          late,
        )}
        {stat(
          <TriangleAlert size={22} />,
          'สัปดาห์ที่เกินเวลาเรียน',
          `${s.overWeeks} สัปดาห์`,
          s.overWeeks ? 'จากกราฟภาระเรียนใน MyPath' : 'อยู่ในเวลาที่ตั้งไว้',
          s.overWeeks > 0,
        )}
      </div>
      {review.length > 0 && (
        <p className="mt-3 text-sm text-muted">
          <b className="font-semibold text-ink">ช่วงทบทวนก่อนลุยโจทย์</b> · {review.join(' · ')}
        </p>
      )}
      <MyPathView plan={plan} owned={owned} progress={progress} onPlanChange={setPlan} defaultView="all" className="mt-6 h-[640px] overflow-hidden rounded-xl border border-line" />
    </div>
  )
}

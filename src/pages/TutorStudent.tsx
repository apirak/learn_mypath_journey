import { ArrowLeft, Pencil, Plus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import MyPathView from '../components/MyPathView'
import TopBar from '../components/TopBar'
import { weeklyBudget } from '../data/analysis'
import { displayName, TUTOR } from '../data/demo'
import { TODAY, thaiDate } from '../data/mypath'
import { programById } from '../data/programs'
import { ExamChips, ProgramText, UniBadge } from '../create/parts'
import { useStore } from '../store'
import { STATUS, statusOf } from './TutorList'

// ADR-0003: the tutor edits the student's MyPath directly; the student sees
// a Tutor change notice.
export default function TutorStudent() {
  const { id = '' } = useParams()
  const store = useStore()
  const nav = useNavigate()
  const s = store.students[id]
  if (!s) return <p className="p-10">ไม่พบน้องคนนี้</p>
  const mp = s.mypath
  const st = STATUS[statusOf(s)]

  return (
    <div className="flex min-h-full flex-col">
      <TopBar nav={<Link to="/tutor" className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white">รายชื่อน้อง</Link>} />
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-8 py-8">
        <Link to="/tutor" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> รายชื่อน้อง</Link>
        <div className="mt-3 flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-full bg-primary-soft text-xl font-bold text-primary">{(s.nickname ?? '?').slice(0, 1)}</div>
          <div>
            <h1 className="text-[26px] font-bold">{displayName(s)}</h1>
            <p className="text-sm text-muted">
              {s.grade ?? 'ยังไม่ระบุชั้น'} · login ด้วย {s.login === 'google' ? 'Google' : 'LearnID'}
              {mp && <> · แก้ล่าสุด {thaiDate(mp.updatedAt)} โดย{mp.updatedBy}</>}
            </p>
          </div>
          <span className={`chip ml-2 ${st.cls}`}>{st.label}</span>
        </div>

        {!mp ? (
          <div className="card mt-8 flex flex-col items-center px-8 py-16 text-center">
            <h2 className="text-xl font-semibold">น้องยังไม่ได้สร้าง MyPath</h2>
            <p className="mt-1 text-muted">พี่สร้างให้ได้ น้องจะเห็นแผนนี้ตอนเข้าใช้ครั้งถัดไป</p>
            <button type="button" className="btn-primary mt-6" onClick={() => nav(`/tutor/${id}/edit`)}><Plus size={18} /> สร้าง MyPath ให้น้อง</button>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-[1fr_320px] gap-4">
              <section className="card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">เป้าหมาย {mp.targets.length} อันดับ</h2>
                  <button type="button" className="btn-outline h-9 px-3 text-sm" onClick={() => nav(`/tutor/${id}/edit?step=1`)}><Pencil size={15} /> แก้เป้าหมาย</button>
                </div>
                <ol className="mt-3 flex flex-col gap-2">
                  {mp.targets.map((t, i) => {
                    const p = programById(t)
                    return p && (
                      <li key={t} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2">
                        <span className="grid size-7 flex-none place-items-center rounded-full bg-primary text-xs font-semibold text-white">{i + 1}</span>
                        <UniBadge p={p} size={32} />
                        <div className="min-w-0 flex-1"><ProgramText p={p} /></div>
                        <div className="max-w-[300px] flex-none"><ExamChips p={p} max={2} /></div>
                      </li>
                    )
                  })}
                </ol>
              </section>
              <section className="card flex flex-col p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">เวลาเรียน</h2>
                  <button type="button" className="btn-outline h-9 px-3 text-sm" onClick={() => nav(`/tutor/${id}/edit?step=3`)}><Pencil size={15} /> แก้เวลาเรียน</button>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-canvas p-3"><dt className="text-xs text-muted">วันเรียน</dt><dd className="text-xl font-bold">{mp.weekdayHours} ชม.</dd></div>
                  <div className="rounded-lg bg-canvas p-3"><dt className="text-xs text-muted">วันหยุด</dt><dd className="text-xl font-bold">{mp.weekendHours} ชม.</dd></div>
                </dl>
                <p className="mt-3 text-sm text-muted">รวม {weeklyBudget(mp.weekdayHours, mp.weekendHours)} ชม./สัปดาห์</p>
              </section>
            </div>
            <h2 className="mt-8 font-semibold">MyPath ของน้อง <span className="font-normal text-muted">· แก้ในนี้ได้เลย มีผลทันทีและน้องจะเห็นการแจ้งเตือน</span></h2>
            <MyPathView
              className="mt-3 h-[720px] overflow-hidden rounded-xl border border-line"
              plan={mp.plan}
              owned={s.owned}
              progress={s.progress}
              onPlanChange={plan =>
                store.saveMyPath(id, {
                  ...mp,
                  plan,
                  weekdayHours: plan.calendar.weekdayHours,
                  weekendHours: plan.calendar.weekendHours,
                  updatedAt: TODAY,
                  updatedBy: TUTOR.name,
                  tutorChange: {
                    by: TUTOR.name,
                    at: TODAY,
                    summary: [...new Set([...(mp.tutorChange && !mp.tutorChange.seen ? mp.tutorChange.summary : []), 'ปรับรายละเอียดในตารางเรียน'])],
                  },
                })
              }
            />
          </>
        )}
      </main>
    </div>
  )
}

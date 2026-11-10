import { useMemo, useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { CATALOG_SUBJECTS, subjectName } from '../data/analysis'
import { displayName, GRADES, type Student } from '../data/demo'
import { summarise, thaiDate } from '../data/mypath'
import { programById, programTitle } from '../data/programs'
import { SubjectChip } from '../create/parts'
import { useStore } from '../store'

export type Status = 'none' | 'ok' | 'over'
export const STATUS: Record<Status, { label: string; cls: string }> = {
  none: { label: 'ยังไม่สร้าง', cls: 'bg-[#f1f3f5] text-muted' },
  ok: { label: 'ปกติ', cls: 'bg-[#ebfbee] text-ok' },
  over: { label: 'เกินเวลาเรียน', cls: 'bg-warn-soft text-warn' },
}
export const statusOf = (s: Student): Status => (!s.mypath ? 'none' : summarise(s.mypath.plan).overWeeks > 0 ? 'over' : 'ok')

// Every student, filterable by name, grade, enabled subject and status.
export default function TutorList() {
  const store = useStore()
  const [q, setQ] = useState('')
  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [status, setStatus] = useState('')

  const rows = useMemo(
    () => Object.values(store.students).map(s => ({ s, status: statusOf(s), subjects: s.mypath?.plan.calendar.subjects ?? [] })),
    [store.students],
  )
  const shown = rows.filter(
    r =>
      (!q.trim() || displayName(r.s).includes(q.trim())) &&
      (!grade || r.s.grade === grade) &&
      (!subject || r.subjects.includes(subject)) &&
      (!status || r.status === status),
  )
  const select = 'input h-10 w-auto min-w-40 text-sm'

  return (
    <div className="flex min-h-full flex-col">
      <TopBar nav={<span className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white">รายชื่อน้อง</span>} />
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-8 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-bold">รายชื่อน้อง</h1>
            <p className="text-muted">ทั้งหมด {rows.length} คน · มี MyPath แล้ว {rows.filter(r => r.status !== 'none').length} คน</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input h-10 pl-9 text-sm" placeholder="ค้นหาชื่อ" value={q} onChange={e => setQ(e.target.value)} aria-label="ค้นหาชื่อ" />
          </div>
          <select className={select} value={grade} onChange={e => setGrade(e.target.value)} aria-label="ชั้นเรียน">
            <option value="">ทุกชั้น</option>
            {GRADES.map(g => <option key={g}>{g}</option>)}
          </select>
          <select className={select} value={subject} onChange={e => setSubject(e.target.value)} aria-label="วิชาที่เรียน">
            <option value="">ทุกวิชา</option>
            {CATALOG_SUBJECTS.filter(s => s.courses.length).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className={select} value={status} onChange={e => setStatus(e.target.value)} aria-label="สถานะ">
            <option value="">ทุกสถานะ</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {(q || grade || subject || status) && (
            <button type="button" className="btn-ghost text-sm" onClick={() => { setQ(''); setGrade(''); setSubject(''); setStatus('') }}>ล้างตัวกรอง</button>
          )}
          <span className="ml-auto text-sm text-muted">แสดง {shown.length} คน</span>
        </div>

        <div className="card mt-4 overflow-hidden">
          <table className="w-full text-left text-[15px]">
            <thead className="border-b border-line bg-canvas text-sm text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">ชื่อ</th>
                <th className="px-3 py-3 font-medium">ชั้น</th>
                <th className="px-3 py-3 font-medium">เป้าหมายอันดับ 1</th>
                <th className="px-3 py-3 font-medium">วิชาที่เรียน</th>
                <th className="px-3 py-3 font-medium">สถานะ</th>
                <th className="px-3 py-3 font-medium">แก้ล่าสุด</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map(({ s, status, subjects }) => {
                const first = s.mypath && programById(s.mypath.targets[0])
                return (
                  <tr key={s.id} className="border-b border-line/70 last:border-0 hover:bg-black/[0.02]">
                    <td className="px-5 py-3.5">
                      <Link to={`/tutor/${s.id}`} className="font-semibold hover:text-primary">{displayName(s)}</Link>
                      <div className="text-xs text-muted">{s.login === 'google' ? 'Google' : 'LearnID'}</div>
                    </td>
                    <td className="px-3 py-3.5">{s.grade ?? '–'}</td>
                    <td className="max-w-[280px] px-3 py-3.5">
                      {first ? (
                        <>
                          <div className="truncate">{programTitle(first).title}</div>
                          <div className="truncate text-xs text-muted">{programTitle(first).uni}</div>
                        </>
                      ) : <span className="text-muted">–</span>}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex max-w-[300px] flex-wrap gap-1">
                        {subjects.map(id => <SubjectChip key={id} id={id} label={subjectName(id)} />)}
                        {!subjects.length && <span className="text-muted">–</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3.5"><span className={`chip ${STATUS[status].cls}`}>{STATUS[status].label}</span></td>
                    <td className="px-3 py-3.5 text-sm text-muted">{s.mypath ? <>{thaiDate(s.mypath.updatedAt)}<div className="text-xs">โดย{s.mypath.updatedBy}</div></> : '–'}</td>
                    <td className="pr-4"><Link to={`/tutor/${s.id}`} aria-label={`ดู ${displayName(s)}`} className="btn-ghost px-2"><ChevronRight size={18} /></Link></td>
                  </tr>
                )
              })}
              {!shown.length && <tr><td colSpan={7} className="p-10 text-center text-muted">ไม่พบน้องที่ตรงกับตัวกรอง</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

import { CalendarRange } from 'lucide-react'
import { weeklyBudget } from '../data/analysis'
import { thaiDate } from '../data/mypath'
import { CALENDARS, schoolById, SCHOOLS, upcomingBreaks } from '../data/schools'
import { HourSlider } from './parts'

// Step 3: school (→ School breaks) + Study time per day (GLOSSARY.md).
// Special days stay in MyPath's own calendar settings afterwards.
export default function StepTime({
  weekdayHours,
  weekendHours,
  school,
  set,
  setSchool,
}: {
  weekdayHours: number
  weekendHours: number
  school?: string
  set: (wd: number, we: number) => void
  setSchool: (id: string) => void
}) {
  const total = weeklyBudget(weekdayHours, weekendHours)
  const s = schoolById(school)
  const breaks = upcomingBreaks(school)
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <h1 className="text-center text-[28px] font-bold">มีเวลาเรียนพิเศษวันละกี่ชั่วโมง</h1>
      <p className="mt-1 text-center text-muted">ไม่ต้องเป๊ะ ปรับทีหลังในหน้า MyPath ได้ รวมถึงช่วงปิดเทอมและวันพิเศษ</p>

      <div className="mt-10 rounded-xl border border-line bg-white p-8">
        <label className="block">
          <span className="text-[17px] font-semibold">เรียนอยู่โรงเรียน</span>
          <span className="ml-2 text-sm text-muted">ใช้คำนวณช่วงปิดเทอม</span>
          <select className="input mt-3" value={school ?? ''} onChange={e => setSchool(e.target.value)} aria-label="โรงเรียน">
            <option value="" disabled>เลือกโรงเรียน</option>
            {SCHOOLS.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </label>
        {s && (
          <div className="mt-4 rounded-lg bg-canvas px-4 py-3 text-sm">
            <div className="flex items-center gap-1.5 font-medium"><CalendarRange size={16} className="text-primary" /> ช่วงปิดเทอมที่จะใส่ให้ · {CALENDARS[s.calendar].label}</div>
            <ul className="mt-1.5 flex flex-col gap-0.5 text-muted">
              {breaks.map(b => <li key={b.start}>{b.label}: {thaiDate(b.start)} – {thaiDate(b.end)}</li>)}
              {!breaks.length && <li>ไม่มีช่วงปิดเทอมก่อนวันสอบ</li>}
            </ul>
            <p className="mt-1.5 text-xs text-muted">ช่วงปิดเทอมใช้ชั่วโมงเท่าวันหยุด · วันที่เป็นการประมาณ แก้ได้ในปฏิทินการเรียนของ MyPath</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-10 rounded-xl border border-line bg-white p-8">
        <HourSlider label="วันเรียน" hint="จันทร์–ศุกร์" value={weekdayHours} onChange={v => set(v, weekendHours)} />
        <HourSlider label="วันหยุด" hint="เสาร์–อาทิตย์ วันหยุด และช่วงปิดเทอม" value={weekendHours} onChange={v => set(weekdayHours, v)} />
      </div>
      <div className="mt-6 flex items-center justify-between rounded-xl bg-primary-soft px-6 py-4">
        <div>
          <div className="font-semibold">รวมต่อสัปดาห์ (ช่วงเปิดเทอม)</div>
          <div className="text-sm text-muted">{weekdayHours} × 5 วัน + {weekendHours} × 2 วัน · ช่วงปิดเทอม {weekendHours * 7} ชม./สัปดาห์</div>
        </div>
        <div className="text-3xl font-bold text-primary">{total} ชม.</div>
      </div>
      {total === 0 && <p className="mt-3 text-center text-sm text-warn">ยังไม่มีเวลาเรียนเลย แผนจะใช้ขั้นต่ำ 1 ชม./สัปดาห์ต่อวิชา และอาจจบไม่ทันสอบ</p>}
    </div>
  )
}

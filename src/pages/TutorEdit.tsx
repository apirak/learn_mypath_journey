import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { UserRoundPen } from 'lucide-react'
import CreateFlow, { type Step } from '../create/CreateFlow'
import { displayName, EXAMPLE_TARGETS, TUTOR } from '../data/demo'
import { TODAY } from '../data/mypath'
import { useStore } from '../store'

// Same steps as the student's flow; ?step=1 (targets) or 3 (study time).
export default function TutorEdit() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const store = useStore()
  const nav = useNavigate()
  const s = store.students[id]
  const mp = s?.mypath
  const back = () => nav(`/tutor/${id}`)
  if (!s) return null
  return (
    <CreateFlow
      initial={mp ? { targets: mp.targets, weekdayHours: mp.weekdayHours, weekendHours: mp.weekendHours, school: mp.school ?? s.school } : { targets: EXAMPLE_TARGETS, weekdayHours: 2, weekendHours: 4, school: s.school }}
      startStep={(Number(params.get('step')) || 1) as Step}
      onCancel={back}
      owned={s.owned}
      progress={s.progress}
      banner={
        <div className="border-b border-[#ffd8a8] bg-warn-soft">
          <div className="mx-auto flex max-w-[1240px] items-center gap-2 px-8 py-2.5 text-[15px]">
            <UserRoundPen size={18} className="text-warn" />
            {mp ? 'กำลังปรับแผนของ' : 'กำลังสร้าง MyPath แทน'} <b>{displayName(s)}</b> · บันทึกแล้วน้องจะเห็นการแจ้งเตือน
          </div>
        </div>
      }
      onConfirm={d => {
        const summary = !mp
          ? ['สร้าง MyPath ให้']
          : [
              d.targets.join() !== mp.targets.join() && 'ปรับเป้าหมาย / อันดับ',
              (d.weekdayHours !== mp.weekdayHours || d.weekendHours !== mp.weekendHours) &&
                `ปรับเวลาเรียนเป็น วันเรียน ${d.weekdayHours} ชม. วันหยุด ${d.weekendHours} ชม.`,
              d.school !== mp.school && 'เปลี่ยนโรงเรียน (ช่วงปิดเทอมใหม่)',
              'จัดตารางเรียนใหม่',
            ].filter((x): x is string => !!x)
        store.updateStudent(id, { school: d.school })
        store.saveMyPath(id, {
          ...d,
          createdAt: mp?.createdAt ?? TODAY,
          updatedAt: TODAY,
          updatedBy: TUTOR.name,
          tutorChange: { by: TUTOR.name, at: TODAY, summary },
        })
        back()
      }}
    />
  )
}

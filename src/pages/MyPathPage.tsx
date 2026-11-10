import { useState } from 'react'
import { Plus, UserRoundPen, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MyPathView from '../components/MyPathView'
import TopBar from '../components/TopBar'
import { CODES } from '../data/demo'
import { TODAY, thaiDate } from '../data/mypath'
import { programById, programTitle } from '../data/programs'
import { useStore } from '../store'

export default function MyPathPage() {
  const store = useStore()
  const nav = useNavigate()
  const me = store.me!
  const mp = me.mypath!
  const [asking, setAsking] = useState(false)
  const first = programById(mp.targets[0])
  const change = mp.tutorChange && !mp.tutorChange.seen ? mp.tutorChange : null

  return (
    <div className="flex h-full flex-col">
      <TopBar
        right={
          <button type="button" className="btn h-8 bg-white/10 px-4 text-xs text-white hover:bg-white/20" onClick={() => setAsking(true)}>
            <Plus size={18} /> สร้าง MyPath ใหม่
          </button>
        }
      />
      {change && (
        <div className="flex-none border-b border-[#a5d8ff] bg-[#e7f5ff]">
          <div className="mx-auto flex max-w-[1240px] items-start gap-3 px-8 py-3 text-[15px]">
            <UserRoundPen size={20} className="mt-0.5 flex-none text-primary" />
            <div className="flex-1">
              <b>{change.by}</b> ปรับแผนของคุณเมื่อ {thaiDate(change.at)}
              <span className="text-muted"> · {change.summary.join(' · ')}</span>
            </div>
            <button type="button" className="btn-ghost h-7 px-1.5" aria-label="ปิดการแจ้งเตือน"
              onClick={() => store.saveMyPath(me.id, { ...mp, tutorChange: { ...change, seen: true } })}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      <div className="flex-none border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-8 py-2.5 text-sm">
          <span className="text-muted">เป้าหมายอันดับ 1</span>
          {first && <span className="font-semibold">{programTitle(first).title}, {programTitle(first).uni}</span>}
          {mp.targets.length > 1 && <span className="text-muted">และอีก {mp.targets.length - 1} อันดับ</span>}
          {mp.code && <span className="chip bg-primary-soft text-primary">จากโค้ด {mp.code} · {CODES[mp.code]?.label}</span>}
          <span className="ml-auto text-muted">แก้ล่าสุด {thaiDate(mp.updatedAt)} โดย{mp.updatedBy}</span>
        </div>
      </div>
      <MyPathView
        className="flex-1"
        plan={mp.plan}
        owned={me.owned}
        progress={me.progress}
        onPlanChange={plan =>
          store.saveMyPath(me.id, {
            ...mp,
            plan,
            weekdayHours: plan.calendar.weekdayHours,
            weekendHours: plan.calendar.weekendHours,
            updatedAt: TODAY,
            updatedBy: 'น้อง',
          })
        }
      />
      {asking && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6" onClick={() => setAsking(false)}>
          <div className="card w-full max-w-[460px] p-7" role="alertdialog" aria-label="สร้าง MyPath ใหม่" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold">สร้าง MyPath ใหม่?</h2>
            <p className="mt-2 text-muted">
              เราจะเติมเป้าหมายและเวลาเรียนเดิมไว้ให้ แผนเดิมยังอยู่จนกว่าจะกด “ตกลง ใช้แผนนี้” ในขั้นสุดท้าย คอร์สที่ซื้อแล้วและความคืบหน้าไม่หาย
            </p>
            <div className="mt-7 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setAsking(false)}>ไม่ใช่ตอนนี้</button>
              <button type="button" className="btn-primary" onClick={() => nav('/create')}>เริ่มสร้างใหม่</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

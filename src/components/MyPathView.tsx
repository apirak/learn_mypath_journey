import { MyPath, type StudentPlan } from '@learn/mypath'
import { mypathData, TODAY } from '../data/mypath'
import { toast } from './toast'

// <MyPath> with the demo's fixtures. Buy / start are mock toasts.
export default function MyPathView({
  plan,
  owned = [],
  progress = {},
  onPlanChange,
  defaultView,
  className = '',
}: {
  plan: StudentPlan
  owned?: string[]
  progress?: Record<string, number>
  onPlanChange: (p: StudentPlan) => void
  defaultView?: 'month' | 'all'
  className?: string
}) {
  return (
    <div className={`mypath-box ${className}`}>
      <MyPath
        data={mypathData(plan, owned, progress)}
        today={TODAY}
        defaultView={defaultView}
        onPlanChange={onPlanChange}
        onBuyCourse={id => toast(`ไปหน้าซื้อ ${id} ที่ OnDemand (mock)`)}
        onStartCourse={id => toast(`เปิดบทเรียน ${id} (mock)`)}
      />
    </div>
  )
}

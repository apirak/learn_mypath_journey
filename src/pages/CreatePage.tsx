import { useNavigate } from 'react-router-dom'
import CreateFlow from '../create/CreateFlow'
import { CODES, EXAMPLE_TARGETS, makeMyPath } from '../data/demo'
import { TODAY } from '../data/mypath'
import { useStore } from '../store'

// Student's create / re-create (ADR-0002): prefilled from the current
// MyPath, which is replaced only on confirm or a valid code.
export default function CreatePage() {
  const store = useStore()
  const nav = useNavigate()
  const me = store.me!
  const mp = me.mypath
  return (
    <CreateFlow
      initial={mp ? { targets: mp.targets, weekdayHours: mp.weekdayHours, weekendHours: mp.weekendHours, school: mp.school ?? me.school } : { targets: EXAMPLE_TARGETS, weekdayHours: 2, weekendHours: 4, school: me.school }}
      onCancel={mp ? () => nav('/mypath') : undefined}
      owned={me.owned}
      progress={me.progress}
      onConfirm={d => {
        store.updateStudent(me.id, { school: d.school, mypath: { ...d, createdAt: TODAY, updatedAt: TODAY, updatedBy: 'น้อง' } })
        nav('/mypath')
      }}
      onCode={code => {
        if (mp && !confirm(`ใช้ MyPath จากโค้ด ${code} (${CODES[code].label}) แทนแผนเดิม?`)) return
        const c = CODES[code]
        store.saveMyPath(me.id, makeMyPath(c.targets, c.weekdayHours, c.weekendHours, 'น้อง', { code }, me.school))
        nav('/mypath')
      }}
    />
  )
}

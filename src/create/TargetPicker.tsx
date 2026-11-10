import { useMemo, useState } from 'react'
import { Check, ChevronRight, Plus, Search, X } from 'lucide-react'
import { programs, searchPrograms, uniName, type Program } from '../data/programs'
import { ExamChips, ProgramText, UniBadge } from './parts'

export const MAX_TARGETS = 7

// Search first; with no query, browse มหาวิทยาลัย → คณะ → หลักสูตร.
// Stays open so several targets can be added in one go.
export default function TargetPicker({
  targets,
  onAdd,
  onClose,
}: {
  targets: string[]
  onAdd: (id: string) => void
  onClose: () => void
}) {
  const D = programs()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<string>()
  const [uni, setUni] = useState<string>()
  const [faculty, setFaculty] = useState<string>()
  const full = targets.length >= MAX_TARGETS

  const results = useMemo(() => (query.trim() ? searchPrograms({ query, group, uni }) : []), [query, group, uni])

  const inGroup = useMemo(() => D.programs.filter(p => !group || p.group === group), [D, group])
  const unis = useMemo(() => {
    const n = new Map<string, number>()
    for (const p of inGroup) n.set(p.uni, (n.get(p.uni) ?? 0) + 1)
    return [...n].map(([id, count]) => ({ id, count, name: D.universities[id] ?? id })).sort((a, b) => a.name.localeCompare(b.name, 'th'))
  }, [D, inGroup])
  const faculties = useMemo(() => {
    if (!uni) return []
    const n = new Map<string, number>()
    for (const p of inGroup) if (p.uni === uni) n.set(p.faculty, (n.get(p.faculty) ?? 0) + 1)
    return [...n].sort((a, b) => a[0].localeCompare(b[0], 'th'))
  }, [inGroup, uni])
  const browsed = useMemo(
    () => (uni && faculty ? inGroup.filter(p => p.uni === uni && p.faculty === faculty) : []),
    [inGroup, uni, faculty],
  )

  const row = (p: Program) => {
    const added = targets.includes(p.id)
    return (
      <li key={p.id} className="flex items-center gap-4 border-b border-line/70 px-5 py-3.5 last:border-0">
        <UniBadge p={p} />
        <div className="min-w-0 flex-1">
          <ProgramText p={p} />
          <div className="mt-1.5"><ExamChips p={p} /></div>
        </div>
        <button
          type="button"
          disabled={added || full}
          onClick={() => onAdd(p.id)}
          className={added ? 'btn h-9 px-3 text-sm text-ok' : 'btn-outline h-9 px-3 text-sm'}
        >
          {added ? <><Check size={16} /> เพิ่มแล้ว</> : <><Plus size={16} /> เพิ่ม</>}
        </button>
      </li>
    )
  }

  const col = 'min-h-0 overflow-auto border-r border-line last:border-0'
  const item = (on: boolean) =>
    `flex w-full items-center gap-2 px-4 py-2.5 text-left text-[15px] ${on ? 'bg-primary-soft font-semibold text-primary' : 'hover:bg-black/[0.03]'}`

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-8" onClick={onClose}>
      <div role="dialog" aria-label="เพิ่มคณะเป้าหมาย" className="card flex h-[min(760px,88vh)] w-full max-w-[1040px] flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex-none border-b border-line p-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">เพิ่มคณะเป้าหมาย</h2>
            <span className="text-sm text-muted">เลือกแล้ว {targets.length}/{MAX_TARGETS}</span>
            <button type="button" className="btn-ghost ml-auto px-2" aria-label="ปิด" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="relative mt-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              autoFocus
              aria-label="ค้นหาหลักสูตร"
              className="input pl-10"
              placeholder="ค้นหามหาวิทยาลัย คณะ หรือสาขา เช่น “วิศวะ คอม จุฬา”"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1">
              <button type="button" className={`chip h-7 border ${!group ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-white'}`} onClick={() => setGroup(undefined)}>ทุกกลุ่มสาขา</button>
              {Object.entries(D.groups).map(([id, name]) => (
                <button key={id} type="button" title={name}
                  className={`chip h-7 border ${group === id ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-white'}`}
                  onClick={() => { setGroup(group === id ? undefined : id); setFaculty(undefined) }}>
                  {name.split(' ')[0]}
                </button>
              ))}
            </div>
            {query.trim() && (
              <select className="input h-8 w-56 text-sm" value={uni ?? ''} onChange={e => setUni(e.target.value || undefined)} aria-label="กรองมหาวิทยาลัย">
                <option value="">ทุกมหาวิทยาลัย</option>
                {unis.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            )}
          </div>
          {full && <p className="mt-2 text-sm text-warn">ครบ {MAX_TARGETS} อันดับแล้ว ลบอันดับเดิมก่อนถ้าอยากเพิ่ม</p>}
        </div>

        {query.trim() ? (
          <ul className="min-h-0 flex-1 overflow-auto">
            {results.map(row)}
            {!results.length && <li className="p-10 text-center text-muted">ไม่พบ “{query}” ลองพิมพ์ชื่อสั้นลง หรือเลือกจากรายการแทน</li>}
            {results.length >= 60 && <li className="p-4 text-center text-sm text-muted">แสดง 60 รายการแรก พิมพ์เพิ่มเพื่อให้แคบลง</li>}
          </ul>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-[260px_280px_1fr]">
            <div className={col}>
              <div className="sticky top-0 bg-white px-4 py-2 text-xs font-semibold text-muted">มหาวิทยาลัย ({unis.length})</div>
              {unis.map(u => (
                <button key={u.id} type="button" className={item(uni === u.id)} onClick={() => { setUni(u.id); setFaculty(undefined) }}>
                  <span className="flex-1 truncate">{u.name}</span><ChevronRight size={14} className="text-muted" />
                </button>
              ))}
            </div>
            <div className={col}>
              <div className="sticky top-0 bg-white px-4 py-2 text-xs font-semibold text-muted">คณะ</div>
              {!uni && <p className="px-4 py-6 text-sm text-muted">เลือกมหาวิทยาลัยก่อน</p>}
              {faculties.map(([f, n]) => (
                <button key={f} type="button" className={item(faculty === f)} onClick={() => setFaculty(f)}>
                  <span className="flex-1 truncate">{f}</span><span className="text-xs text-muted">{n}</span>
                </button>
              ))}
            </div>
            <div className="min-h-0 overflow-auto">
              <div className="sticky top-0 z-10 bg-white px-5 py-2 text-xs font-semibold text-muted">
                หลักสูตร{uni && faculty ? ` · ${faculty}, ${uniName(browsed[0] ?? { uni } as Program)}` : ''}
              </div>
              {!faculty && <p className="px-5 py-6 text-sm text-muted">เลือกคณะเพื่อดูหลักสูตร</p>}
              <ul>{browsed.map(row)}</ul>
            </div>
          </div>
        )}

        <div className="flex flex-none justify-end border-t border-line p-4">
          <button type="button" className="btn-primary" onClick={onClose}>เสร็จ</button>
        </div>
      </div>
    </div>
  )
}

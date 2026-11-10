import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { GRADES, type Grade } from '../data/demo'
import { useStore } from '../store'

// Google sign-in carries no grade, which the tutor filters on (docs/journey.md).
export default function Welcome() {
  const store = useStore()
  const nav = useNavigate()
  const [nickname, setNickname] = useState('')
  const [grade, setGrade] = useState<Grade | null>(null)
  const ok = nickname.trim() && grade
  return (
    <div className="flex min-h-full flex-col">
      <TopBar />
      <main className="grid flex-1 place-items-center px-6 py-16">
        <form
          className="card w-full max-w-[520px] px-10 py-10"
          onSubmit={e => {
            e.preventDefault()
            if (!ok || !store.session) return
            store.updateStudent(store.session.id, { nickname: nickname.trim(), grade: grade! })
            nav('/create')
          }}
        >
          <h1 className="text-2xl font-bold">ยินดีต้อนรับสู่ MyPath</h1>
          <p className="mt-1 text-muted">บอกเราอีกนิดก่อนเริ่มวางแผน</p>
          <label className="mt-8 block">
            <span className="mb-1.5 block text-sm font-medium">ชื่อเล่น</span>
            <input className="input" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="เช่น ข้าวหอม" autoFocus />
          </label>
          <fieldset className="mt-6">
            <legend className="mb-1.5 text-sm font-medium">ตอนนี้เรียนชั้น</legend>
            <div className="grid grid-cols-4 gap-2">
              {GRADES.map(g => (
                <button key={g} type="button" aria-pressed={grade === g} onClick={() => setGrade(g)}
                  className={`h-11 rounded-lg border text-[15px] font-medium ${grade === g ? 'border-primary bg-primary-soft text-primary' : 'border-line hover:border-[#adb5bd]'}`}>
                  {g}
                </button>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="btn-primary mt-10 w-full" disabled={!ok}>เริ่มวางแผน</button>
        </form>
      </main>
    </div>
  )
}

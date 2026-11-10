import { useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/TopBar'
import { DEMO_ACCOUNTS, TUTOR } from '../data/demo'
import { useStore } from '../store'

// Two sign-in buttons (docs/journey.md). Neither is wired: both open a
// chooser of Demo accounts instead of LearnID / Google.
export default function Login() {
  const store = useStore()
  const nav = useNavigate()
  const [via, setVia] = useState<'learnid' | 'google' | null>(null)

  const choose = (id: string) => {
    if (!via) return
    const tutor = id === TUTOR.id
    store.signIn({ role: tutor ? 'tutor' : 'student', id, via })
    const s = store.students[id]
    nav(tutor ? '/tutor' : !s?.nickname ? '/welcome' : s.mypath ? '/mypath' : '/create')
  }

  return (
    <div className="flex min-h-full flex-col">
      <header data-hdr className="flex h-12 items-center bg-bar px-8">
        <div className="mx-auto w-full max-w-[1240px]"><Logo to="/login" /></div>
      </header>
      <main className="grid flex-1 place-items-center px-6 py-16">
        <div className="card w-full max-w-[440px] px-10 py-12 text-center">
          <h1 className="text-[28px] font-bold">วางแผนสอบเข้ามหาวิทยาลัย</h1>
          <p className="mt-2 text-muted">เลือกคณะที่อยากเข้า แล้ว MyPath จะจัดตารางเรียนให้</p>
          <div className="mt-10 flex flex-col gap-3">
            <button type="button" className="btn-primary h-12 w-full" onClick={() => setVia('learnid')}>
              เข้าสู่ระบบด้วย LearnID
            </button>
            <button type="button" className="btn h-12 w-full border border-line bg-white hover:bg-black/[0.03]" onClick={() => setVia('google')}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
                <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
              </svg>
              เข้าสู่ระบบด้วย Google
            </button>
          </div>
        </div>
      </main>

      {via && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6" onClick={() => setVia(null)}>
          <div className="card w-full max-w-[480px] p-6" role="dialog" aria-label="เลือกบัญชีตัวอย่าง" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">เลือกบัญชีตัวอย่าง</h2>
                <p className="text-sm text-muted">Prototype ยังไม่ได้เชื่อม {via === 'google' ? 'Google' : 'LearnID'} จริง</p>
              </div>
              <button type="button" className="btn-ghost -mr-2 -mt-1 px-2" aria-label="ปิด" onClick={() => setVia(null)}><X size={18} /></button>
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {DEMO_ACCOUNTS.filter(a => (via === 'google' ? a.id !== 'new-learnid' : a.id !== 'new-google')).map(a => (
                <li key={a.id}>
                  <button type="button" onClick={() => choose(a.id)} className="flex w-full items-center gap-3 rounded-xl border border-line px-4 py-3 text-left hover:border-primary hover:bg-primary-soft">
                    <div className="flex-1">
                      <div className="font-semibold">{a.label}</div>
                      <div className="text-sm text-muted">{a.hint}</div>
                    </div>
                    <ChevronRight size={18} className="text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

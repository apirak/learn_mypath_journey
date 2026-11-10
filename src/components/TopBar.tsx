import { useState, type ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { TUTOR, useStore } from '../store'

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} data-hdr-logo className="flex items-center gap-2 text-white">
      <img src="/images/mypath_logo_header.png" alt="" aria-hidden="true" className="h-6 w-auto" />
      <span className="text-[24px] font-semibold tracking-tight">MyPath</span>
    </Link>
  )
}

// Dark bar from the design. `right` holds page actions; the avatar menu is
// shown whenever someone is signed in and `menu` is not false.
export default function TopBar({ right, menu = true, nav }: { right?: ReactNode; menu?: boolean; nav?: ReactNode }) {
  const store = useStore()
  const go = useNavigate()
  const [open, setOpen] = useState(false)
  const who = store.isTutor
    ? { name: TUTOR.name, sub: 'พี่' }
    : { name: store.me?.nickname ? `น้อง${store.me.nickname}` : 'น้องใหม่', sub: store.me?.grade ?? '' }
  return (
    <header data-hdr className="flex h-12 flex-none items-center bg-bar">
      <div className="mx-auto flex w-full max-w-[1240px] items-center gap-8 px-8">
        <Logo />
        <nav className="flex items-center gap-1">{nav}</nav>
        <div data-hdr-actions className="ml-auto flex items-center gap-3">
          {right}
          {menu && store.session && (
            <div className="relative">
              <button
                type="button"
                aria-label="เมนูบัญชี"
                data-hdr-avatar
                onClick={() => setOpen(o => !o)}
                className="grid size-8 place-items-center rounded-full bg-white/15 text-xs font-semibold text-white hover:bg-white/25"
              >
                {who.name.replace(/^(น้อง|พี่)/, '').slice(0, 1) || '?'}
              </button>
              {open && (
                <div className="absolute right-0 top-10 z-50 w-56 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5">
                  <div className="px-3 py-2">
                    <div className="font-semibold">{who.name}</div>
                    <div className="text-sm text-muted">{who.sub}{store.session.via === 'google' ? ' · Google' : ' · LearnID'}</div>
                  </div>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5"
                    onClick={() => {
                      store.signOut()
                      go('/login')
                    }}
                  >
                    <LogOut size={16} /> ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

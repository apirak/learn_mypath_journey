import { useEffect, useState } from 'react'

let push: (msg: string) => void = () => {}
export const toast = (msg: string) => push(msg)

export function Toaster() {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([])
  useEffect(() => {
    push = msg => {
      const id = Date.now() + Math.random()
      setItems(xs => [...xs, { id, msg }])
      setTimeout(() => setItems(xs => xs.filter(x => x.id !== id)), 2800)
    }
  }, [])
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2" role="status">
      {items.map(t => (
        <div key={t.id} className="rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">{t.msg}</div>
      ))}
    </div>
  )
}

import { RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'

// Prototype-only control, kept visually apart from the product UI.
export default function DemoBar() {
  const store = useStore()
  const nav = useNavigate()
  return (
    <button
      type="button"
      className="fixed bottom-4 left-4 z-[90] inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#adb5bd] bg-white/90 px-3 py-1.5 text-xs text-muted shadow-sm hover:text-ink"
      onClick={() => {
        if (!confirm('รีเซ็ตเดโม? ข้อมูลทุกบัญชีจะกลับเป็นค่าเริ่มต้น')) return
        store.reset()
        nav('/login')
      }}
    >
      <RotateCcw size={14} /> รีเซ็ตเดโม
    </button>
  )
}

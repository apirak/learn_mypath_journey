import { useEffect, useState } from 'react'

// Dev-only panel for tuning header sizes live. Only values that differ from the
// current design are injected as overrides, so the header is untouched until
// you move a slider. Copy the result and bake it into TopBar.tsx.

type Key = 'barH' | 'logoH' | 'logoText' | 'logoGap' | 'btnH' | 'btnText' | 'btnPx' | 'avatar'

const FIELDS: { key: Key; label: string; min: number; max: number; def: number; tw: string }[] = [
  { key: 'barH', label: 'ความสูง Header', min: 32, max: 120, def: 48, tw: 'header h-12' },
  { key: 'logoH', label: 'ความสูงรูป Logo', min: 12, max: 72, def: 24, tw: 'logo img h-6' },
  { key: 'logoText', label: 'ขนาดตัวอักษร "MyPath"', min: 12, max: 40, def: 24, tw: 'logo text-[24px]' },
  { key: 'logoGap', label: 'ระยะห่าง Logo ↔ ตัวอักษร', min: 0, max: 32, def: 8, tw: 'logo gap-2' },
  { key: 'btnH', label: 'ความสูงปุ่ม', min: 24, max: 64, def: 32, tw: 'button h-8' },
  { key: 'btnText', label: 'ขนาดตัวอักษรปุ่ม', min: 10, max: 22, def: 12, tw: 'button text-xs' },
  { key: 'btnPx', label: 'Padding ซ้าย-ขวาปุ่ม', min: 4, max: 40, def: 16, tw: 'button px-4' },
  { key: 'avatar', label: 'ขนาดวงกลม Avatar', min: 20, max: 64, def: 32, tw: 'avatar size-8' },
]

type Vals = Record<Key, number>
const DEFAULTS = Object.fromEntries(FIELDS.map(f => [f.key, f.def])) as Vals
const STORE_KEY = 'header-tuner'

function load(): Vals {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {}
  return DEFAULTS
}

function css(v: Vals) {
  const d = (k: Key) => v[k] !== DEFAULTS[k]
  const r: string[] = []
  if (d('barH')) r.push(`header[data-hdr]{height:${v.barH}px!important}`)
  if (d('logoH')) r.push(`[data-hdr-logo] img{height:${v.logoH}px!important}`)
  if (d('logoText')) r.push(`[data-hdr-logo] span{font-size:${v.logoText}px!important}`)
  if (d('logoGap')) r.push(`[data-hdr-logo]{gap:${v.logoGap}px!important}`)
  const btn = '[data-hdr-actions]>button,[data-hdr-actions]>a'
  if (d('btnH')) r.push(`${btn}{height:${v.btnH}px!important}`)
  if (d('btnText')) r.push(`${btn}{font-size:${v.btnText}px!important}`)
  if (d('btnPx')) r.push(`${btn}{padding-left:${v.btnPx}px!important;padding-right:${v.btnPx}px!important}`)
  if (d('avatar')) r.push(`[data-hdr-avatar]{width:${v.avatar}px!important;height:${v.avatar}px!important}`)
  return r.join('\n')
}

function summary(v: Vals) {
  return [
    'Header sizes:',
    ...FIELDS.map(f => `- ${f.label}: ${v[f.key]}px${v[f.key] === f.def ? ' (เดิม)' : ` (เดิม ${f.def}px · ${f.tw})`}`),
  ].join('\n')
}

export default function HeaderTuner() {
  const [open, setOpen] = useState(false)
  const [v, setV] = useState<Vals>(load)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(v)) } catch {}
    let el = document.getElementById('header-tuner-style')
    if (!el) {
      el = document.createElement('style')
      el.id = 'header-tuner-style'
      document.head.appendChild(el)
    }
    el.textContent = css(v)
  }, [v])

  const set = (k: Key, n: number) => setV(p => ({ ...p, [k]: n }))
  const changed = FIELDS.filter(f => v[f.key] !== f.def).length

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[95] rounded-full border border-dashed border-[#adb5bd] bg-white/90 px-3 py-1.5 text-xs text-muted shadow-sm hover:text-ink"
      >
        ปรับ Header{changed ? ` (${changed})` : ''}
      </button>
    )

  return (
    <div className="fixed bottom-4 right-4 z-[95] w-[320px] rounded-xl bg-white p-4 text-sm shadow-2xl ring-1 ring-black/10">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-semibold">ปรับขนาด Header</div>
        <button type="button" className="text-muted hover:text-ink" onClick={() => setOpen(false)} aria-label="ปิด">✕</button>
      </div>
      <div className="flex flex-col gap-3">
        {FIELDS.map(f => (
          <label key={f.key} className="block">
            <div className="flex items-center justify-between text-xs">
              <span className={v[f.key] !== f.def ? 'font-semibold text-primary' : 'text-muted'}>{f.label}</span>
              <span className="flex items-center gap-1">
                <input
                  type="number"
                  min={f.min}
                  max={f.max}
                  value={v[f.key]}
                  onChange={e => set(f.key, Number(e.target.value) || 0)}
                  className="w-14 rounded border border-line px-1 text-right tabular-nums"
                />
                px
              </span>
            </div>
            <input
              type="range"
              min={f.min}
              max={f.max}
              value={v[f.key]}
              onChange={e => set(f.key, Number(e.target.value))}
              className="w-full accent-[#0a6cf5]"
            />
          </label>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-lg bg-primary px-3 py-2 font-medium text-white hover:bg-primary-dark"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(summary(v))
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            } catch {
              prompt('คัดลอกค่านี้', summary(v))
            }
          }}
        >
          {copied ? 'คัดลอกแล้ว ✓' : 'คัดลอกค่า'}
        </button>
        <button type="button" className="rounded-lg border border-line px-3 py-2 hover:bg-black/5" onClick={() => setV(DEFAULTS)}>
          รีเซ็ต
        </button>
      </div>
    </div>
  )
}

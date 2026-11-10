// Programs from learn_tcas browse.json (copied by `pnpm sync`, ADR-0001).
// A Target is one program id (GLOSSARY.md).

export type Program = {
  id: string
  name: string
  type: string
  uni: string
  group: string
  field: string
  faculty: string
  exams: Record<string, number> // exam key → max % across rounds, 0 = minimum score only
  either: string[][]
  others: Record<string, number> // gpax / portfolio / interview → %
  ly?: boolean
}

export type ProgramsData = {
  groups: Record<string, string>
  fields: Record<string, string>
  universities: Record<string, string>
  subjects: Record<string, string>
  short: Record<string, string>
  programs: Program[]
}

let DATA: ProgramsData
let BY_ID = new Map<string, Program>()

export async function loadPrograms() {
  const res = await fetch(`${import.meta.env.BASE_URL}data/programs.json`)
  DATA = await res.json()
  BY_ID = new Map(DATA.programs.map(p => [p.id, p]))
}

export const programs = () => DATA
export const programById = (id: string) => BY_ID.get(id)
export const uniName = (p: Program) => DATA.universities[p.uni] ?? p.uni
export const fieldName = (p: Program) => DATA.fields[p.field] ?? ''
export const shortKey = (k: string) => DATA.short[k] ?? DATA.subjects[k] ?? k

// "สาขาวิชาวิศวกรรมคอมพิวเตอร์ (วศ.บ.)" style subtitle like the design.
export function programTitle(p: Program) {
  return {
    title: p.faculty,
    subtitle: `${p.name.replace(/^หลักสูตร/, '')}${p.type && p.type !== 'ภาษาไทย ปกติ' ? ` · ${p.type}` : ''}`,
    uni: uniName(p),
  }
}

// --- search ---------------------------------------------------------------

// Nicknames students actually type → words that appear in the data.
const SYNONYMS: Record<string, string[]> = {
  วิศวะ: ['วิศวกรรม'],
  วิดวะ: ['วิศวกรรม'],
  คอม: ['คอมพิวเตอร์'],
  หมอ: ['แพทย'],
  แพทย์: ['แพทย'],
  ทันตะ: ['ทันตแพทย'],
  เภสัช: ['เภสัช'],
  นิเทศ: ['นิเทศ'],
  ถาปัด: ['สถาปัตย'],
  สถาปัตย์: ['สถาปัตย'],
  บัญชี: ['บัญชี'],
  เศรษฐะ: ['เศรษฐศาสตร์'],
  จุฬา: ['จุฬาลงกรณ์มหาวิทยาลัย'],
  จุฬาฯ: ['จุฬาลงกรณ์มหาวิทยาลัย'],
  มธ: ['ธรรมศาสตร์'],
  มก: ['เกษตรศาสตร์'],
  มช: ['เชียงใหม่'],
  มข: ['ขอนแก่น'],
  มอ: ['สงขลานครินทร์'],
  มศว: ['ศรีนครินทรวิโรฒ'],
  ลาดกระบัง: ['ลาดกระบัง'],
  สจล: ['ลาดกระบัง'],
  บางมด: ['ธนบุรี'],
  มจธ: ['ธนบุรี'],
  มหิดล: ['มหิดล'],
}

const haystacks = new Map<string, string>()
const hay = (p: Program) => {
  let h = haystacks.get(p.id)
  if (!h) {
    h = [uniName(p), p.faculty, fieldName(p), DATA.groups[p.group], p.name, p.type].join(' ').toLowerCase()
    haystacks.set(p.id, h)
  }
  return h
}

export type ProgramFilter = { query: string; group?: string; uni?: string }

export function searchPrograms({ query, group, uni }: ProgramFilter, limit = 60) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const out: Program[] = []
  for (const p of DATA.programs) {
    if (group && p.group !== group) continue
    if (uni && p.uni !== uni) continue
    const h = hay(p)
    // A nickname matches only its expansions: raw "มช" would hit อัสสัมชัญ.
    if (!tokens.every(t => (SYNONYMS[t] ? SYNONYMS[t].some(s => h.includes(s.toLowerCase())) : h.includes(t)))) continue
    out.push(p)
    if (out.length >= limit) break
  }
  return out
}

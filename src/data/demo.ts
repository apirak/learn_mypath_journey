// Demo accounts, mock students and MyPath codes. Every name here is made up
// (PDPA [DP-001]) — never put real student data in this prototype.
import type { StudentPlan } from '@learn/mypath'
import { analyse, buildPlan } from './analysis'
import { SAMPLE_OWNED, SAMPLE_PLAN, SAMPLE_PROGRESS, TODAY } from './mypath'
import { breaksFor, SCHOOLS } from './schools'

export type Grade = 'ม.4' | 'ม.5' | 'ม.6' | 'ซิ่ว'
export const GRADES: Grade[] = ['ม.4', 'ม.5', 'ม.6', 'ซิ่ว']

export type TutorChange = { by: string; at: string; summary: string[]; seen?: boolean }

export type MyPathRecord = {
  targets: string[] // program ids, index 0 = rank 1
  weekdayHours: number
  weekendHours: number
  school?: string // schools.ts id; drives School breaks
  plan: StudentPlan
  createdAt: string
  code?: string
  updatedAt: string
  updatedBy: string // 'น้อง' or a tutor name
  tutorChange?: TutorChange
}

export type Student = {
  id: string
  nickname?: string // missing = Google sign-in that has not filled /welcome
  grade?: Grade
  school?: string // from the LearnID profile; Google asks in step 3
  login: 'learnid' | 'google'
  mypath?: MyPathRecord
  owned: string[]
  progress: Record<string, number>
}

export const TUTOR = { id: 'tutor', name: 'พี่ต้น' }

// Step 1 opens with these three, as in the design.
export const EXAMPLE_TARGETS = ['10280104300501A', '10010121300501A', '10010138113101A']

const SETS = {
  eng: ['10010121300501A', '10160101300501A', '10020105300501A'],
  sci: ['10020137130101A', '10060105210001A', '10030115130101A'],
  soc: ['10010129611101A', '10050204611101A', '10010128901101A'],
  arch: ['10010125400201A', '10010121300001A'],
  mix: ['10010138113101A', '10060105210001A'],
}

export const CODES: Record<string, { label: string; targets: string[]; weekdayHours: number; weekendHours: number }> = {
  ENG70: { label: 'สายวิศวะ', targets: SETS.eng, weekdayHours: 2, weekendHours: 5 },
  SCI70: { label: 'สายวิทย์สุขภาพ', targets: SETS.sci, weekdayHours: 2, weekendHours: 4 },
  TGAT70: { label: 'เน้น TGAT/TPAT', targets: SETS.soc, weekdayHours: 1, weekendHours: 3 },
}

export function makeMyPath(
  targets: string[],
  weekdayHours: number,
  weekendHours: number,
  by = 'น้อง',
  extra: Partial<MyPathRecord> = {},
  school?: string,
): MyPathRecord {
  const plan = buildPlan(analyse(targets).subjects, weekdayHours, weekendHours, breaksFor(school, weekendHours))
  return { targets, weekdayHours, weekendHours, school, plan, createdAt: TODAY, updatedAt: TODAY, updatedBy: by, ...extra }
}

export const DEMO_ACCOUNTS = [
  { id: 'new-learnid', label: 'น้องใหม่ (LearnID)', hint: 'ยังไม่มี MyPath · มีชื่อและชั้นจากโปรไฟล์ LearnID' },
  { id: 'new-google', label: 'น้องใหม่ (Google)', hint: 'ยังไม่มี MyPath · ต้องกรอกชื่อเล่นและชั้นก่อน' },
  { id: 'has-mypath', label: 'น้องที่มี MyPath แล้ว', hint: 'เข้าหน้า MyPath ทันที' },
  { id: TUTOR.id, label: `${TUTOR.name} (พี่)`, hint: 'เห็นรายชื่อน้องทุกคน' },
] as const

const NAMES = [
  'ข้าวหอม', 'ปั้นแป้ง', 'ไอซ์', 'ต้นกล้า', 'ใบเตย', 'ภูผา', 'มินนี่', 'ออม', 'ฟ้าใส', 'กันต์',
  'พิม', 'เจได', 'น้ำหวาน', 'ปลื้ม', 'ซันนี่', 'โบ๊ท', 'แพรวา', 'ตะวัน', 'เพลง', 'ไผ่', 'ขนุน', 'ดาว',
]

export function seedStudents(): Record<string, Student> {
  const list: Student[] = [
    { id: 'new-learnid', nickname: 'มิว', grade: 'ม.5', school: 'satriwit', login: 'learnid', owned: [], progress: {} },
    { id: 'new-google', login: 'google', owned: [], progress: {} },
    {
      id: 'has-mypath',
      nickname: 'ภูมิ',
      grade: 'ม.6',
      school: 'triam',
      login: 'learnid',
      owned: SAMPLE_OWNED,
      progress: SAMPLE_PROGRESS,
      mypath: {
        targets: SETS.eng,
        weekdayHours: SAMPLE_PLAN.calendar.weekdayHours,
        weekendHours: SAMPLE_PLAN.calendar.weekendHours,
        school: 'triam',
        plan: SAMPLE_PLAN,
        createdAt: '2026-10-01',
        updatedAt: '2026-11-02',
        updatedBy: 'น้อง',
      },
    },
  ]
  const sets = Object.values(SETS)
  NAMES.forEach((name, i) => {
    const hasPath = i % 5 !== 3
    const wd = [1, 2, 2, 3, 1][i % 5]
    const we = [3, 4, 6, 5, 2][i % 5]
    const set = sets[i % sets.length]
    const school = SCHOOLS[i % SCHOOLS.length].id
    list.push({
      id: `s${String(i + 1).padStart(2, '0')}`,
      nickname: name,
      grade: GRADES[i % 7 === 6 ? 3 : i % 3],
      school,
      login: i % 3 === 0 ? 'google' : 'learnid',
      owned: i % 4 === 0 ? ['MATH.1', 'PHY.0'] : [],
      progress: {},
      mypath: hasPath
        ? makeMyPath(i % 2 ? [...set].reverse() : set, wd, we, i % 6 === 0 ? TUTOR.name : 'น้อง', {
            createdAt: `2026-${10 + (i % 2)}-${String(1 + (i % 9)).padStart(2, '0')}`,
            updatedAt: `2026-11-${String(1 + (i % 9)).padStart(2, '0')}`,
          }, school)
        : undefined,
    })
  })
  return Object.fromEntries(list.map(s => [s.id, s]))
}

export const displayName = (s: Student) => (s.nickname ? `น้อง${s.nickname}` : 'น้องใหม่')

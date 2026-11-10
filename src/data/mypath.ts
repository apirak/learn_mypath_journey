// learn_mypath host fixtures (copied by `pnpm sync`) + a small re-creation of
// MyPath's course layout so the preview and the tutor list can summarise a
// plan. The SDK exports only <MyPath>, so the rules are mirrored from
// learn_mypath packages/mypath/src/plan/buildPlan.ts (simplified: ignores
// breaks and special days).
import type { ExamEvent, MyPathData, StudentPlan, StudyCalendar, SubjectGroup } from '@learn/mypath'
import catalogJson from './mypath/catalog.json'
import courseDetails from './mypath/courseDetails.json'
import events from './mypath/events.json'
import owned from './mypath/owned.json'
import packs from './mypath/packs.json'
import plan from './mypath/plan.json'
import prices from './mypath/prices.json'
import progress from './mypath/progress.json'

export const TODAY = '2026-11-10'
// Fixture covers are root paths ("/cover/x.png"); prefix the deploy base.
export const catalog: SubjectGroup[] = catalogJson.map(g => ({
  ...g,
  subjects: g.subjects.map(s => ({
    ...s,
    courses: s.courses.map(c => ('cover' in c && c.cover ? { ...c, cover: import.meta.env.BASE_URL + c.cover.slice(1) } : c)),
  })),
}))
export const EVENTS = events as ExamEvent[]
export const SAMPLE_PLAN: StudentPlan = plan
export const SAMPLE_OWNED: string[] = owned
export const SAMPLE_PROGRESS: Record<string, number> = progress

export function mypathData(p: StudentPlan, own: string[] = [], prog: Record<string, number> = {}): MyPathData {
  return { catalog, plan: p, events: EVENTS, owned: own, progress: prog, prices, packs, courseDetails }
}

// --- summary --------------------------------------------------------------

export const DAY = 86400000
export const toMs = (d: string) => Date.parse(`${d}T00:00:00Z`)
export const toISO = (ms: number) => new Date(ms).toISOString().slice(0, 10)

// Real exam days (fixtures): TGAT/TPAT first, A-Level last.
const REAL = EVENTS.filter(e => e.kind === 'exam').sort((a, b) => a.date.localeCompare(b.date))
export const EXAM_TGAT_TPAT = REAL.find(e => /TGAT|TPAT/.test(e.label))?.date ?? REAL[0].date
export const EXAM_A_LEVEL = REAL.find(e => /A-Level/.test(e.label))?.date ?? REAL[REAL.length - 1].date
export const examFor = (subjectId: string) => (/^(tgat|tpat)/.test(subjectId) ? EXAM_TGAT_TPAT : EXAM_A_LEVEL)

// Calendar budget of one day: special day > school break > weekday/weekend.
export function dayBudget(cal: StudyCalendar, ms: number) {
  const iso = toISO(ms)
  const special = cal.specialDays.find(d => d.date === iso)
  if (special) return special.hours
  const br = cal.breaks.find(b => b.start <= iso && iso <= b.end)
  if (br) return br.hours
  const dow = new Date(ms).getUTCDay()
  return dow === 0 || dow === 6 ? cal.weekendHours : cal.weekdayHours
}
export const weekBudget = (cal: StudyCalendar, weekStart: number) =>
  Array.from({ length: 7 }, (_, i) => dayBudget(cal, weekStart + i * DAY)).reduce((a, b) => a + b, 0)

export type Span = { course: string; subject: string; start: number; end: number; weekly: number; hours: number }

// Same rules as the SDK's buildPlan: courses in a subject run back to back,
// a startDate is only the earliest start.
export function layout(p: StudentPlan, today = TODAY): Span[] {
  const settings = new Map(p.courses.map(c => [c.courseId, c]))
  const spans: Span[] = []
  for (const g of catalog)
    for (const s of g.subjects) {
      if (!p.calendar.subjects.includes(s.id)) continue
      let nextStart = -Infinity
      let prevWeekly = 5
      s.courses.forEach((c, i) => {
        const st = settings.get(c.id)
        const follow = i > 0 && !!st?.followPrevious
        const startDate = !follow && st?.startDate ? toMs(st.startDate) : undefined
        const start = Math.max(nextStart, startDate ?? (i === 0 ? toMs(today) : nextStart))
        const weekly = i > 0 && st?.followPreviousWeeklyHours ? prevWeekly : Math.min(10, Math.max(1, st?.weeklyHours ?? 5))
        const end = start + (Math.ceil(c.hours / weekly) * 7 - 1) * DAY
        spans.push({ course: c.id, subject: s.id, start, end, weekly, hours: c.hours })
        nextStart = end + DAY
        prevWeekly = weekly
      })
    }
  return spans
}

export type PlanSummary = {
  courses: number
  hours: number
  end: string | null
  lastExam: string
  lateSubjects: string[] // subjects still studying on their exam day
  overWeeks: number // 7-day blocks where course hours > calendar budget
  weeks: number
}

export function summarise(p: StudentPlan, today = TODAY): PlanSummary {
  const spans = layout(p, today)
  const lastExam = EXAM_A_LEVEL
  if (!spans.length) return { courses: 0, hours: 0, end: null, lastExam, lateSubjects: [], overWeeks: 0, weeks: 0 }
  const end = Math.max(...spans.map(s => s.end))
  const lateSubjects = [...new Set(spans.filter(s => s.end >= toMs(examFor(s.subject))).map(s => s.subject))]
  // Daily load like the SDK: a course's hours spread evenly over its days.
  const load = (ms: number) =>
    spans.reduce((a, s) => (ms < s.start || ms > s.end ? a : a + s.hours / ((s.end - s.start) / DAY + 1)), 0)
  let overWeeks = 0
  let weeks = 0
  for (let w = toMs(today); w <= end; w += 7 * DAY) {
    weeks++
    let used = 0
    for (let d = 0; d < 7; d++) used += load(w + d * DAY)
    if (used > weekBudget(p.calendar, w) + 0.05) overWeeks++
  }
  return { courses: spans.length, hours: spans.reduce((a, s) => a + s.hours, 0), end: toISO(end), lastExam, lateSubjects, overWeeks, weeks }
}

const TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
export function thaiDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${TH_MONTH[m - 1]} ${(y + 543) % 100}`
}

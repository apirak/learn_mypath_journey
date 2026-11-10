// "ระบบวิเคราะห์" of the prototype (GLOSSARY.md): Required subjects from the
// ranked targets, then the Time split into a <MyPath> Student plan.
// No real scheduling algorithm — MyPath lays out the dates itself.
import type { CatalogSubject, StudentPlan, StudyCalendar } from '@learn/mypath'
import { catalog, DAY, examFor, toISO, toMs, TODAY, weekBudget } from './mypath'
import { programById, shortKey, type Program } from './programs'

export const CATALOG_SUBJECTS: CatalogSubject[] = catalog.flatMap(g => g.subjects)
const SUBJECT = new Map(CATALOG_SUBJECTS.map(s => [s.id, s]))

// browse.json exam key → catalog subject id. TGAT1/2/3 count as one TGAT;
// TPAT21–23 roll up to TPAT2. Anything else (English tests, NETSAT, GSAT…)
// is a condition, not a subject we teach.
export function subjectOf(key: string): string | null {
  if (/^tgat\d?$/.test(key)) return 'tgat'
  if (/^tpat2\d$/.test(key)) return 'tpat2'
  return SUBJECT.has(key) ? key : null
}

export const subjectName = (id: string) => SUBJECT.get(id)?.name ?? shortKey(id)
export const subjectColor = (id: string) => SUBJECT.get(id)?.color ?? '#8a94a6'
export const hasCourses = (id: string) => (SUBJECT.get(id)?.courses.length ?? 0) > 0

// One target's subjects with weight (max over its parts, e.g. TGAT1/2/3).
export function programSubjects(p: Program) {
  const out = new Map<string, number>()
  for (const [k, w] of Object.entries(p.exams)) {
    const s = subjectOf(k)
    if (s) out.set(s, Math.max(out.get(s) ?? 0, w))
  }
  return [...out].map(([id, weight]) => ({ id, weight })).sort((a, b) => b.weight - a.weight)
}

export type RequiredSubject = {
  id: string
  name: string
  color: string
  ranks: number[] // 1-based ranks that use it
  importance: number // 0–100, share of the rank-weighted score
  hasCourses: boolean
}

export type Analysis = {
  subjects: RequiredSubject[]
  notes: string[] // gpax / portfolio / either / other conditions
  noExamTargets: Program[] // exams: {} and no other criteria known
}

// Rank 1 counts most: factor 1, 1/2, 1/3 … Weight 0 (minimum score only)
// still matters a little.
export function analyse(targetIds: string[]): Analysis {
  const score = new Map<string, number>()
  const ranks = new Map<string, number[]>()
  const notes = new Set<string>()
  const noExamTargets: Program[] = []
  targetIds.forEach((id, i) => {
    const p = programById(id)
    if (!p) return
    const factor = 1 / (i + 1)
    const subs = programSubjects(p)
    for (const { id: s, weight } of subs) {
      score.set(s, (score.get(s) ?? 0) + factor * (weight || 5))
      ranks.set(s, [...(ranks.get(s) ?? []), i + 1])
    }
    const other = Object.keys(p.exams).filter(k => !subjectOf(k))
    if (other.length) notes.add(`อันดับ ${i + 1} ใช้ผลสอบอื่นด้วย: ${other.map(shortKey).join(', ')}`)
    for (const g of p.either) notes.add(`อันดับ ${i + 1} ต้องมีผลวิชาใดวิชาหนึ่ง: ${g.map(shortKey).join(' / ')}`)
    const others = Object.entries(p.others)
    if (others.length) notes.add(`อันดับ ${i + 1} ใช้ ${others.map(([k, w]) => `${shortKey(k)} ${w}%`).join(' · ')}`)
    if (!subs.length && !others.length && !other.length) noExamTargets.push(p)
  })
  const total = [...score.values()].reduce((a, b) => a + b, 0) || 1
  const subjects = [...score]
    .map(([id, s]) => ({
      id,
      name: subjectName(id),
      color: subjectColor(id),
      ranks: ranks.get(id)!,
      importance: Math.round((s / total) * 100),
      hasCourses: hasCourses(id),
    }))
    .sort((a, b) => b.importance - a.importance)
  return { subjects, notes: [...notes], noExamTargets }
}

export const weeklyBudget = (weekdayHours: number, weekendHours: number) => weekdayHours * 5 + weekendHours * 2

// --- Study phases (GLOSSARY.md ช่วงเรียน) ---------------------------------

export type Phase = 'understand' | 'practice' | 'memorize' | 'drill'
export const PHASES: { id: Phase; label: string; hint: string }[] = [
  { id: 'understand', label: 'ความเข้าใจ', hint: 'วิชาที่ต้องเข้าใจก่อนถึงจะไปต่อได้' },
  { id: 'practice', label: 'ฝึกฝน', hint: 'วิชาที่เก่งขึ้นจากการฝึกสม่ำเสมอ' },
  { id: 'memorize', label: 'ท่องจำ', hint: 'เรียนใกล้วันสอบเพื่อให้จำได้' },
  { id: 'drill', label: 'ลุยโจทย์', hint: 'คอร์สตะลุยโจทย์ของทุกวิชา จบพอดีวันสอบ' },
]
const PHASE_OF: Record<string, Phase> = {
  a_lv_61: 'understand', a_lv_62: 'understand', a_lv_64: 'understand',
  tgat: 'practice', a_lv_82: 'practice',
  a_lv_65: 'memorize', a_lv_66: 'memorize', a_lv_70: 'memorize', a_lv_81: 'memorize', a_lv_63: 'memorize',
}
// TPAT1–5 practise like TPAT3; other languages are memorised.
export const phaseOf = (subjectId: string): Exclude<Phase, 'drill'> =>
  (PHASE_OF[subjectId] as Exclude<Phase, 'drill'>) ?? (subjectId.startsWith('tpat') ? 'practice' : 'memorize')
export const DRILL_COURSES = new Set(['MATH.UP', 'MATH.EX', 'PHY.EX', 'CHEM.EX', 'TPAT3.2'])

export type SubjectSchedule = {
  id: string
  phase: Exclude<Phase, 'drill'>
  weeklyHours: number
  start: string | null // first non-drill course; null = only drill courses
  end: string | null
  drillStart: string | null
  drillWeeklyHours: number
  exam: string
  reviewWeeks: number // gap before drill (or before the exam when no drill)
}

const clamp = (n: number) => Math.min(10, Math.max(1, n))
const weeksOf = (hours: number[], rate: number) => hours.reduce((a, h) => a + Math.ceil(h / rate), 0)

// Phase scheduling (GLOSSARY.md การแบ่งเวลาเรียน):
// 1. Drill courses count back from each subject's real exam and end the day before it.
// 2. The other courses run understand → practice → memorize. A phase may start
//    once the previous one is half done, but only in weeks with free budget;
//    subjects in a phase start in importance order, sharing hours by course volume.
export function schedule(subjects: RequiredSubject[], cal: StudyCalendar, today = TODAY) {
  const taught = subjects.filter(s => s.hasCourses)
  const B = weeklyBudget(cal.weekdayHours, cal.weekendHours)
  const t0 = toMs(today)
  const HORIZON = 260
  const weekStart = (w: number) => t0 + w * 7 * DAY
  const cap = Array.from({ length: HORIZON }, (_, w) => weekBudget(cal, weekStart(w)))
  const used = new Array<number>(HORIZON).fill(0)
  const courses = (id: string) => SUBJECT.get(id)!.courses
  const out = new Map<string, SubjectSchedule>()

  // 1. drill, backwards from the exam
  const drillSubjects = taught.filter(s => courses(s.id).some(c => DRILL_COURSES.has(c.id)))
  const drillHours = (id: string) => courses(id).filter(c => DRILL_COURSES.has(c.id)).reduce((a, c) => a + c.hours, 0)
  const totalDrill = drillSubjects.reduce((a, s) => a + drillHours(s.id), 0) || 1
  const drillStarts = new Map<string, number>() // courseId → start ms
  for (const s of taught) {
    const exam = examFor(s.id)
    const drill = courses(s.id).filter(c => DRILL_COURSES.has(c.id))
    const rate = drill.length ? clamp(Math.floor((B * drillHours(s.id)) / totalDrill)) : 0
    let endNext = toMs(exam) // next course starts here; last one ends the day before the exam
    for (const c of [...drill].reverse()) {
      const start = Math.max(t0, endNext - Math.ceil(c.hours / rate) * 7 * DAY)
      drillStarts.set(c.id, start)
      const end = start + (Math.ceil(c.hours / rate) * 7 - 1) * DAY
      for (let w = 0; w < HORIZON; w++) {
        const a = Math.max(start, weekStart(w)), b = Math.min(end, weekStart(w) + 6 * DAY)
        if (b >= a) used[w] += (rate * ((b - a) / DAY + 1)) / 7
      }
      endNext = start
    }
    out.set(s.id, {
      id: s.id, phase: phaseOf(s.id), weeklyHours: 0, start: null, end: null,
      drillStart: drill.length ? toISO(drillStarts.get(drill[0].id)!) : null,
      drillWeeklyHours: rate, exam, reviewWeeks: 0,
    })
  }

  // 2. understand → practice → memorize
  const ORDER: Phase[] = ['understand', 'practice', 'memorize']
  const nd = (id: string) => courses(id).filter(c => !DRILL_COURSES.has(c.id)).map(c => c.hours)
  const ndTotal = (id: string) => nd(id).reduce((a, b) => a + b, 0)
  const queue = taught
    .filter(s => nd(s.id).length)
    .sort((a, b) => ORDER.indexOf(phaseOf(a.id)) - ORDER.indexOf(phaseOf(b.id)) || b.importance - a.importance)
  const phaseHours = (p: Phase) => queue.filter(s => phaseOf(s.id) === p).reduce((a, s) => a + ndTotal(s.id), 0)
  const placed = new Map<string, { w: number; rate: number }>()
  const phasesUsed = ORDER.filter(p => phaseHours(p) > 0)
  const unlocked = (p: Phase, w: number) => {
    const k = phasesUsed.indexOf(p)
    if (k <= 0) return true
    const prev = phasesUsed[k - 1]
    const members = queue.filter(s => phaseOf(s.id) === prev)
    if (!members.every(s => placed.has(s.id))) return false
    const done = members.reduce((a, s) => {
      const pl = placed.get(s.id)!
      return a + Math.min(ndTotal(s.id), Math.max(0, w - pl.w) * pl.rate)
    }, 0)
    return done >= phaseHours(prev) / 2
  }
  let qi = 0
  for (let w = 0; w < HORIZON && qi < queue.length; w++) {
    while (qi < queue.length) {
      const s = queue[qi]
      if (!unlocked(phaseOf(s.id), w)) break
      const ideal = clamp(Math.floor((B * ndTotal(s.id)) / phaseHours(phaseOf(s.id))))
      let fit = 0
      // Squeezing in at a sliver of time is not "free time": need half the fair share.
      for (let r = ideal; r >= Math.ceil(ideal / 2) && !fit; r--) {
        const span = weeksOf(nd(s.id), r)
        let ok = w + span <= HORIZON
        for (let k = w; ok && k < w + span; k++) ok = used[k] + r <= cap[k] + 1e-6
        if (ok) fit = r
      }
      if (!fit) break // the next subject waits for free time (strict importance order)
      for (let k = w; k < w + weeksOf(nd(s.id), fit); k++) used[k] += fit
      placed.set(s.id, { w, rate: fit })
      qi++
    }
  }
  // No room before the horizon: start right after, at 1 h/week (will show as late).
  for (; qi < queue.length; qi++) placed.set(queue[qi].id, { w: 0, rate: 1 })

  for (const s of queue) {
    const pl = placed.get(s.id)!
    const o = out.get(s.id)!
    const end = weekStart(pl.w) + (weeksOf(nd(s.id), pl.rate) * 7 - 1) * DAY
    const until = o.drillStart ? toMs(o.drillStart) : toMs(o.exam)
    Object.assign(o, {
      weeklyHours: pl.rate,
      start: toISO(weekStart(pl.w)),
      end: toISO(end),
      reviewWeeks: Math.max(0, Math.floor((until - end - DAY) / (7 * DAY))),
    })
  }
  return { subjects: taught.map(s => out.get(s.id)!), drillStarts }
}

export function buildPlan(
  subjects: RequiredSubject[],
  weekdayHours: number,
  weekendHours: number,
  breaks: StudyCalendar['breaks'] = [],
): StudentPlan {
  const calendar: StudyCalendar = {
    weekdayHours, weekendHours, specialDays: [], breaks,
    subjects: subjects.filter(s => s.hasCourses).map(s => s.id),
  }
  const { subjects: sched, drillStarts } = schedule(subjects, calendar)
  const courses: StudentPlan['courses'] = []
  for (const s of sched) {
    let first = true
    for (const c of SUBJECT.get(s.id)!.courses) {
      if (DRILL_COURSES.has(c.id)) courses.push({ courseId: c.id, startDate: toISO(drillStarts.get(c.id)!), weeklyHours: s.drillWeeklyHours })
      else if (first) {
        courses.push({ courseId: c.id, startDate: s.start!, weeklyHours: s.weeklyHours })
        first = false
      } else courses.push({ courseId: c.id, followPrevious: true, followPreviousWeeklyHours: true })
    }
  }
  return { calendar, courses }
}

// Schools and their term calendars → School breaks (learn_mypath GLOSSARY).
// Dates are ESTIMATES for the demo, not official calendars — verify with
// each school before any real use.
import type { StudyCalendar } from '@learn/mypath'
import { TODAY } from './mypath'

type Range = { start: string; end: string; label: string }

export const CALENDARS: Record<string, { label: string; breaks: Range[] }> = {
  obec: {
    label: 'ปฏิทิน สพฐ. (ประมาณการ)',
    breaks: [
      { start: '2026-10-10', end: '2026-10-31', label: 'ปิดภาคเรียนที่ 1 ปี 2569' },
      { start: '2027-04-01', end: '2027-05-15', label: 'ปิดภาคฤดูร้อน 2570' },
      { start: '2027-10-09', end: '2027-10-31', label: 'ปิดภาคเรียนที่ 1 ปี 2570' },
    ],
  },
  demonstration: {
    label: 'ปฏิทินโรงเรียนสาธิต (ประมาณการ)',
    breaks: [
      { start: '2026-10-03', end: '2026-11-08', label: 'ปิดภาคเรียนที่ 1 ปี 2569' },
      { start: '2027-03-13', end: '2027-05-16', label: 'ปิดภาคฤดูร้อน 2570' },
      { start: '2027-10-02', end: '2027-11-07', label: 'ปิดภาคเรียนที่ 1 ปี 2570' },
    ],
  },
  international: {
    label: 'ปฏิทินโรงเรียนนานาชาติ (ประมาณการ)',
    breaks: [
      { start: '2026-12-19', end: '2027-01-04', label: 'Winter break' },
      { start: '2027-04-03', end: '2027-04-18', label: 'Spring break' },
      { start: '2027-06-19', end: '2027-08-15', label: 'Summer break' },
      { start: '2027-12-18', end: '2028-01-03', label: 'Winter break' },
    ],
  },
}

export const SCHOOLS: { id: string; name: string; calendar: keyof typeof CALENDARS }[] = [
  { id: 'triam', name: 'โรงเรียนเตรียมอุดมศึกษา', calendar: 'obec' },
  { id: 'suankularb', name: 'โรงเรียนสวนกุหลาบวิทยาลัย', calendar: 'obec' },
  { id: 'bodindecha', name: 'โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี)', calendar: 'obec' },
  { id: 'satriwit', name: 'โรงเรียนสตรีวิทยา', calendar: 'obec' },
  { id: 'kalasin-pittayasan', name: 'โรงเรียนกาฬสินธุ์พิทยาสรรพ์', calendar: 'obec' },
  { id: 'yupparaj', name: 'โรงเรียนยุพราชวิทยาลัย', calendar: 'obec' },
  { id: 'satit-chula', name: 'โรงเรียนสาธิตจุฬาลงกรณ์มหาวิทยาลัย', calendar: 'demonstration' },
  { id: 'satit-pathumwan', name: 'โรงเรียนสาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ ปทุมวัน', calendar: 'demonstration' },
  { id: 'intl-demo', name: 'โรงเรียนนานาชาติ (ตัวอย่าง)', calendar: 'international' },
  { id: 'other', name: 'โรงเรียนอื่น (ใช้ปฏิทิน สพฐ.)', calendar: 'obec' },
]

export const schoolById = (id?: string) => SCHOOLS.find(s => s.id === id)

// Upcoming breaks only (ending on or after Today). Break hours = holiday hours.
export function breaksFor(schoolId: string | undefined, weekendHours: number): StudyCalendar['breaks'] {
  const s = schoolById(schoolId)
  if (!s) return []
  return CALENDARS[s.calendar].breaks
    .filter(b => b.end >= TODAY)
    .map((b, i) => ({ id: i + 1, start: b.start < TODAY ? TODAY : b.start, end: b.end, hours: weekendHours }))
}

export const upcomingBreaks = (schoolId?: string) => {
  const s = schoolById(schoolId)
  return s ? CALENDARS[s.calendar].breaks.filter(b => b.end >= TODAY) : []
}

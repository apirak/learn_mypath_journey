import { useState } from 'react'
import type { MyPathProps, MyPathView } from './types'
import { MyPathProvider } from './MyPathProvider'
import AllView from './ui/all/AllView'
import CourseDetail from './ui/course/CourseDetail'
import { OpenCourseContext } from './ui/course/openCourse'
import MonthView from './ui/month/MonthView'
import { isISODate, monthStartOf, thaiToday } from './plan/dates'

// The host must give a box with a fixed height: .mypath-root fills it, the
// header stays put and only .mp-scroll scrolls.
// Month/All, the selected month and the open course are internal state (no
// router). The month lives here so it survives switching to All and back.
export default function MyPath({
  data,
  today,
  onPlanChange,
  onBuyCourse,
  onStartCourse,
  onViewChange,
  defaultView,
}: MyPathProps) {
  const [mode, setMode] = useState<MyPathView['mode']>(
    defaultView === 'all' ? 'all' : 'month',
  )
  const [month, setMonth] = useState<string>() // undefined = Today's month
  const [course, setCourse] = useState<string>()
  const [slide, setSlide] = useState(false)
  // Switching mode closes the course detail (docs/mypath-sdk-plan.md, View
  // state and deep link).
  // shortcut: uncontrolled only — no `view` prop or invalid-view correction
  // yet (docs/mypath-sdk-plan.md, View state and deep link).
  const shownMonth =
    month ?? monthStartOf(isISODate(today) ? today : thaiToday())
  const emit = (next: MyPathView['mode'], m: string) =>
    onViewChange?.({ mode: next, month: m.slice(0, 7) })
  const onModeChange = (next: MyPathView['mode']) => {
    setMode(next)
    setSlide(true)
    setCourse(undefined)
    emit(next, shownMonth)
  }
  const onSelect = (m: string) => {
    setMonth(m)
    emit(mode, m)
  }
  return (
    <MyPathProvider
      data={data}
      today={today}
      onPlanChange={onPlanChange}
      onStartCourse={onStartCourse}
    >
      <OpenCourseContext.Provider value={setCourse}>
        <div className="mypath-root">
          {mode === 'month' ? (
            <MonthView
              selected={month}
              onSelect={onSelect}
              onModeChange={onModeChange}
              slide={slide}
            />
          ) : (
            <AllView onModeChange={onModeChange} slide={slide} />
          )}
          {/* key: opening another course replays the open animation */}
          {course && (
            <CourseDetail
              key={course}
              courseId={course}
              onClose={() => setCourse(undefined)}
              onBuyCourse={onBuyCourse}
            />
          )}
        </div>
      </OpenCourseContext.Provider>
    </MyPathProvider>
  )
}

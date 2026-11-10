import type { CSSProperties } from 'react'
import { usePlan } from '../../MyPathProvider'
import { fmtDate } from '../../plan/dates'
import { useOwned } from '../components/useOwned'
import AxisRow from './AxisRow'
import { eventLanes, position, type Timeline } from './layout'

const LANE_HEIGHT = 44

// Exam/mock flags above the month header. Lives in the same scroller as the
// grid so it scrolls with it without JS sync.
export default function EventRow({
  t,
  dayWidth,
}: {
  t: Timeline
  dayWidth: number
}) {
  const { events } = usePlan().plan,
    owned = useOwned()
  const { shown, lanes } = eventLanes(events, t, dayWidth, owned.event)
  const height = Math.max(76, lanes * LANE_HEIGHT + 24)
  return (
    <>
      <b
        className="mp-tp-label mp-tp-events-label mp-tp-load-label"
        style={{ minHeight: height }}
      ></b>
      <AxisRow
        t={t}
        dayWidth={dayWidth}
        className="mp-tp-events mp-tp-events-top"
        style={{ minHeight: height }}
      >
        {shown.map(({ event, group, text, lane }) => (
          <span
            key={event.id}
            className={
              'mp-tp-event ' +
              event.kind +
              (owned.event(event) ? '' : ' no') +
              (group.length > 1 ? ' merged' : '')
            }
            title={
              group.length > 1
                ? group.map(item => item.label).join(', ')
                : undefined
            }
            style={
              {
                left: `${position(event.date, t)}%`,
                bottom: lane * LANE_HEIGHT + 20,
              } as CSSProperties
            }
          >
            <span>{text}</span>
            <small>{fmtDate(event.date)}</small>
          </span>
        ))}
        {/* Poles sit behind every flag so a tall pole never hides one. */}
        {shown.map(({ event, lane }) => (
          <i
            key={`${event.id}-pole`}
            className={'mp-tp-event-pole ' + event.kind}
            style={{
              left: `${position(event.date, t)}%`,
              height: lane * LANE_HEIGHT + 14,
            }}
          />
        ))}
        {shown.map(({ event }) => (
          <i
            key={`${event.id}-marker`}
            className={
              'mp-tp-event-marker ' +
              event.kind +
              (owned.event(event) ? '' : ' no')
            }
            style={{ left: `${position(event.date, t)}%` }}
          />
        ))}
      </AxisRow>
    </>
  )
}

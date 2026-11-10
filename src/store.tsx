// Whole-demo state in localStorage (ADR-0001). One provider, plain setters.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { seedStudents, TUTOR, type MyPathRecord, type Student } from './data/demo'

type Session = { role: 'student' | 'tutor'; id: string; via: 'learnid' | 'google' } | null
type State = { session: Session; students: Record<string, Student> }

const KEY = 'mypath-journey-v2'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* private mode or corrupt — start fresh */
  }
  return { session: null, students: seedStudents() }
}

type Store = State & {
  signIn: (s: Session) => void
  signOut: () => void
  updateStudent: (id: string, patch: Partial<Student>) => void
  saveMyPath: (id: string, mp: MyPathRecord) => void
  reset: () => void
  me: Student | undefined
  isTutor: boolean
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const store = useMemo<Store>(() => {
    const updateStudent = (id: string, patch: Partial<Student>) =>
      setState(s => ({ ...s, students: { ...s.students, [id]: { ...s.students[id], ...patch } } }))
    return {
      ...state,
      signIn: session => setState(s => ({ ...s, session })),
      signOut: () => setState(s => ({ ...s, session: null })),
      updateStudent,
      saveMyPath: (id, mp) => updateStudent(id, { mypath: mp }),
      reset: () => setState({ session: null, students: seedStudents() }),
      me: state.session?.role === 'student' ? state.students[state.session.id] : undefined,
      isTutor: state.session?.role === 'tutor',
    }
  }, [state])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside StoreProvider')
  return s
}

export { TUTOR }

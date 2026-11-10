import { Navigate, Route, Routes } from 'react-router-dom'
import { useStore } from './store'
import Login from './pages/Login'
import Welcome from './pages/Welcome'
import MyPathPage from './pages/MyPathPage'
import CreatePage from './pages/CreatePage'
import TutorList from './pages/TutorList'
import TutorStudent from './pages/TutorStudent'
import TutorEdit from './pages/TutorEdit'
import DemoBar from './components/DemoBar'
import { Toaster } from './components/toast'

// Where a signed-in account lands (docs/journey.md, Login).
export function homeFor(store: ReturnType<typeof useStore>) {
  if (!store.session) return '/login'
  if (store.isTutor) return '/tutor'
  const me = store.me
  if (!me?.nickname) return '/welcome'
  return me.mypath ? '/mypath' : '/create'
}

function Guard({ role, children }: { role: 'student' | 'tutor'; children: React.ReactNode }) {
  const store = useStore()
  if (!store.session) return <Navigate to="/login" replace />
  if (store.session.role !== role) return <Navigate to={homeFor(store)} replace />
  return <>{children}</>
}

export default function App() {
  const store = useStore()
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={homeFor(store)} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Guard role="student"><Welcome /></Guard>} />
        <Route path="/create" element={<Guard role="student"><CreatePage /></Guard>} />
        <Route path="/mypath" element={<Guard role="student"><MyPathPage /></Guard>} />
        <Route path="/tutor" element={<Guard role="tutor"><TutorList /></Guard>} />
        <Route path="/tutor/:id" element={<Guard role="tutor"><TutorStudent /></Guard>} />
        <Route path="/tutor/:id/edit" element={<Guard role="tutor"><TutorEdit /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DemoBar />
      <Toaster />
    </>
  )
}

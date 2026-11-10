import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { loadPrograms } from './data/programs'
import { StoreProvider } from './store'
import './index.css'

// Programs (~1.7 MB) load before anything renders: seeds and every page read them.
loadPrograms().then(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <StoreProvider>
          <App />
        </StoreProvider>
      </BrowserRouter>
    </StrictMode>,
  ),
)

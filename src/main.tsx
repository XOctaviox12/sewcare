import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components'
import { seedDemoIfFirstRun } from './services'
import './styles/theme.css'
import './styles/global.css'
import App from './App.tsx'

// Carga la demo solo en el primer inicio (antes de pintar la app).
seedDemoIfFirstRun()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
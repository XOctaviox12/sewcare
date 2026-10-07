import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { seedDemoIfFirstRun } from './services'
import './styles/theme.css'
import './styles/global.css'
import App from './App.tsx'

// Carga la demo solo en el primer inicio (antes de pintar la app).
try {
  seedDemoIfFirstRun()
} catch (error) {
  console.error('No se pudo preparar el almacenamiento inicial:', error)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
)
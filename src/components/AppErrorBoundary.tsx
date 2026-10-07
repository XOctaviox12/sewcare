import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { StorageError } from '../services/storage'
import { Button } from './Button'
import { ErrorState } from './ErrorState'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  error: Error | null
}

/** Atrapa errores inesperados al pintar y evita la pantalla en blanco. */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Error en SewCare:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    const isStorage = error instanceof StorageError

    return (
      <main style={{ maxWidth: 640, margin: '0 auto', padding: 'var(--space-6)' }}>
        <ErrorState
          title={isStorage ? 'Problema con el almacenamiento' : 'Algo salió mal'}
          description={
            isStorage
              ? error.message
              : 'Ocurrió un error inesperado. Recarga la página; los datos que ya estaban guardados no se pierden.'
          }
          action={
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <Button onClick={() => window.location.reload()}>Recargar la página</Button>
              <Button variant="secondary" onClick={() => window.location.assign('/')}>
                Ir al inicio
              </Button>
            </div>
          }
        />
      </main>
    )
  }
}
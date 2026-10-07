import { Route, Routes } from 'react-router-dom'
import type { Breadcrumb } from './components/PageHeader'
import { PATHS, ROUTES } from './constants/routes'
import { AppLayout } from './layouts/AppLayout'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ComponentsDemoPage } from './pages/ComponentsDemoPage'

const HOME: Breadcrumb = { label: 'Inicio', to: ROUTES.home() }
const MACHINES: Breadcrumb = { label: 'Máquinas', to: ROUTES.machines() }
const PLANS: Breadcrumb = { label: 'Mantenimiento', to: ROUTES.plans() }
const HISTORY: Breadcrumb = { label: 'Historial', to: ROUTES.history() }
const REPAIRS: Breadcrumb = { label: 'Reparaciones', to: ROUTES.repairs() }

function page(title: string, section: number, crumbs: Breadcrumb[]) {
  return (
    <PlaceholderPage
      title={title}
      section={section}
      breadcrumbs={[HOME, ...crumbs]}
    />
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={PATHS.home} element={<PlaceholderPage title="Inicio" section={3} />} />

        {/* Máquinas */}
        <Route path={PATHS.machines} element={page('Máquinas', 2, [{ label: 'Máquinas' }])} />
        <Route path={PATHS.machineNew} element={page('Registrar máquina', 2, [MACHINES, { label: 'Nueva' }])} />
        <Route path={PATHS.machineDetail} element={page('Detalle de máquina', 2, [MACHINES, { label: 'Detalle' }])} />
        <Route path={PATHS.machineEdit} element={page('Editar máquina', 2, [MACHINES, { label: 'Editar' }])} />

        {/* Mantenimiento */}
        <Route path={PATHS.plans} element={page('Mantenimiento', 2, [{ label: 'Mantenimiento' }])} />
        <Route path={PATHS.planNew} element={page('Programar mantenimiento', 2, [PLANS, { label: 'Nuevo' }])} />
        <Route path={PATHS.planDetail} element={page('Detalle de mantenimiento', 2, [PLANS, { label: 'Detalle' }])} />
        <Route path={PATHS.planEdit} element={page('Editar mantenimiento', 2, [PLANS, { label: 'Editar' }])} />

        {/* Historial */}
        <Route path={PATHS.history} element={page('Historial', 2, [{ label: 'Historial' }])} />
        <Route path={PATHS.historyDetail} element={page('Detalle de historial', 2, [HISTORY, { label: 'Detalle' }])} />

        {/* Reparaciones */}
        <Route path={PATHS.repairs} element={page('Reparaciones', 3, [{ label: 'Reparaciones' }])} />
        <Route path={PATHS.repairNew} element={page('Reportar reparación', 3, [REPAIRS, { label: 'Nueva' }])} />
        <Route path={PATHS.repairDetail} element={page('Detalle de reparación', 3, [REPAIRS, { label: 'Detalle' }])} />
        <Route path={PATHS.repairEdit} element={page('Editar reparación', 3, [REPAIRS, { label: 'Editar' }])} />

        {/* Otras */}
        <Route path={PATHS.reports} element={page('Reportes', 4, [{ label: 'Reportes' }])} />
        <Route path={PATHS.alerts} element={page('Alertas', 3, [{ label: 'Alertas' }])} />
        <Route path={PATHS.settings} element={page('Configuración', 4, [{ label: 'Configuración' }])} />

        <Route path="/prueba" element={<ComponentsDemoPage />} />
        <Route path={PATHS.notFound} element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
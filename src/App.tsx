import { Route, Routes } from 'react-router-dom'
import type { Breadcrumb } from './components/PageHeader'
import { PATHS, ROUTES } from './constants/routes'
import { AppLayout } from './layouts/AppLayout'
import { ComponentsDemoPage } from './pages/ComponentsDemoPage'
import { HistoryDetailPage } from './pages/HistoryDetailPage'
import { HistoryPage } from './pages/HistoryPage'
import { MachineDetailPage } from './pages/MachineDetailPage'
import { MachineFormPage } from './pages/MachineFormPage'
import { MachinesPage } from './pages/MachinesPage'
import { MaintenanceDetailPage } from './pages/MaintenanceDetailPage'
import { MaintenanceFormPage } from './pages/MaintenanceFormPage'
import { MaintenancePage } from './pages/MaintenancePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

const HOME: Breadcrumb = { label: 'Inicio', to: ROUTES.home() }
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
        <Route path={PATHS.machines} element={<MachinesPage />} />
        <Route path={PATHS.machineNew} element={<MachineFormPage />} />
        <Route path={PATHS.machineDetail} element={<MachineDetailPage />} />
        <Route path={PATHS.machineEdit} element={<MachineFormPage />} />

        {/* Mantenimiento */}
        <Route path={PATHS.plans} element={<MaintenancePage />} />
        <Route path={PATHS.planNew} element={<MaintenanceFormPage />} />
        <Route path={PATHS.planDetail} element={<MaintenanceDetailPage />} />
        <Route path={PATHS.planEdit} element={<MaintenanceFormPage />} />

        {/* Historial */}
        <Route path={PATHS.history} element={<HistoryPage />} />
        <Route path={PATHS.historyDetail} element={<HistoryDetailPage />} />

        {/* Reparaciones (Sección 3) */}
        <Route path={PATHS.repairs} element={page('Reparaciones', 3, [{ label: 'Reparaciones' }])} />
        <Route path={PATHS.repairNew} element={page('Reportar reparación', 3, [REPAIRS, { label: 'Nueva' }])} />
        <Route path={PATHS.repairDetail} element={page('Detalle de reparación', 3, [REPAIRS, { label: 'Detalle' }])} />
        <Route path={PATHS.repairEdit} element={page('Editar reparación', 3, [REPAIRS, { label: 'Editar' }])} />

        {/* Otras */}
        <Route path={PATHS.reports} element={page('Reportes', 4, [{ label: 'Reportes' }])} />
        <Route path={PATHS.alerts} element={page('Alertas', 3, [{ label: 'Alertas' }])} />
        <Route path={PATHS.settings} element={page('Configuración', 4, [{ label: 'Configuración' }])} />

        {/* Temporal: se borra al terminar el proyecto */}
        <Route path="/prueba" element={<ComponentsDemoPage />} />

        <Route path={PATHS.notFound} element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
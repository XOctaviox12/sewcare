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
import { RepairDetailPage } from './pages/RepairDetailPage'
import { RepairFormPage } from './pages/RepairFormPage'
import { RepairsPage } from './pages/RepairsPage'

const HOME: Breadcrumb = { label: 'Inicio', to: ROUTES.home() }

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

        {/* Reparaciones */}
        <Route path={PATHS.repairs} element={<RepairsPage />} />
        <Route path={PATHS.repairNew} element={<RepairFormPage />} />
        <Route path={PATHS.repairDetail} element={<RepairDetailPage />} />
        <Route path={PATHS.repairEdit} element={<RepairFormPage />} />

        {/* Otras (Secciones 3 y 4) */}
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
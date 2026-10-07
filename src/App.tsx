import { Route, Routes } from 'react-router-dom'
import { PATHS } from './constants/routes'
import { AppLayout } from './layouts/AppLayout'
import { HistoryDetailPage } from './pages/HistoryDetailPage'
import { HistoryPage } from './pages/HistoryPage'
import { MachineDetailPage } from './pages/MachineDetailPage'
import { MachineFormPage } from './pages/MachineFormPage'
import { MachinesPage } from './pages/MachinesPage'
import { MaintenanceDetailPage } from './pages/MaintenanceDetailPage'
import { MaintenanceFormPage } from './pages/MaintenanceFormPage'
import { MaintenancePage } from './pages/MaintenancePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RepairDetailPage } from './pages/RepairDetailPage'
import { RepairFormPage } from './pages/RepairFormPage'
import { RepairsPage } from './pages/RepairsPage'
import { DashboardPage } from './pages/DashboardPage'
import { AlertsPage } from './pages/AlertsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'


export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={PATHS.home} element={<DashboardPage />} />

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
        <Route path={PATHS.reports} element={<ReportsPage />} />
        <Route path={PATHS.alerts} element={<AlertsPage />} />
        <Route path={PATHS.settings} element={<SettingsPage />} />

        <Route path={PATHS.notFound} element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
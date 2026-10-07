import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  Cog,
  Hammer,
  Plus,
  TriangleAlert,
  Wallet,
  Wrench,
} from 'lucide-react'
import { Button, PageHeader, StatCard } from '../components'
import { ROUTES } from '../constants/routes'
import { useAlerts } from '../hooks/useAlerts'
import {
  historyService,
  machineService,
  planService,
  repairService,
  sparePartService,
} from '../services'
import {
  buildDashboardStats,
  daysLabel,
  formatCurrency,
  formatDate,
  getUpcomingPlans,
} from '../utils'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const navigate = useNavigate()
  const { alerts } = useAlerts()

  const machines = machineService.list()
  const plans = planService.list()
  const stats = buildDashboardStats({
    machines,
    plans,
    history: historyService.list(),
    repairs: repairService.list(),
    spareParts: sparePartService.list(),
  })

  const machineById = new Map(machines.map((machine) => [machine.id, machine]))
  const upcoming = getUpcomingPlans(plans, 5)
  const criticalAlerts = alerts.filter((alert) => alert.critical)

  const cards = [
    { label: 'Total de máquinas', value: stats.totalMachines, icon: <Cog size={22} /> },
    { label: 'Máquinas operativas', value: stats.operativeMachines, icon: <CircleCheck size={22} /> },
    { label: 'Máquinas en mantenimiento', value: stats.maintenanceMachines, icon: <Wrench size={22} /> },
    { label: 'Máquinas fuera de servicio', value: stats.outOfServiceMachines, icon: <CircleX size={22} /> },
    { label: 'Mantenimientos programados', value: stats.scheduledPlans, icon: <CalendarDays size={22} /> },
    { label: 'Mantenimientos próximos', value: stats.upcomingPlans, icon: <CalendarClock size={22} /> },
    { label: 'Mantenimientos vencidos', value: stats.overduePlans, icon: <TriangleAlert size={22} /> },
    { label: 'Mantenimientos completados', value: stats.completedMaintenances, icon: <ClipboardCheck size={22} /> },
    { label: 'Reparaciones registradas', value: stats.repairsCount, icon: <Hammer size={22} /> },
    { label: 'Costo acumulado de reparaciones', value: formatCurrency(stats.repairsCost), icon: <Wallet size={22} /> },
  ]

  return (
    <>
      <PageHeader title="Inicio" />

      <div className={styles.stack}>
        <section aria-labelledby="home-quick-title" className={styles.section}>
          <h2 id="home-quick-title" className={styles.sectionTitle}>
            Accesos rápidos
          </h2>
          <div className={styles.actions}>
            <Button icon={<Plus size={18} />} onClick={() => navigate(ROUTES.machineNew())}>
              Registrar máquina
            </Button>
            <Button
              variant="secondary"
              icon={<CalendarPlus size={18} />}
              onClick={() => navigate(ROUTES.planNew())}
            >
              Programar mantenimiento
            </Button>
            <Button
              variant="secondary"
              icon={<TriangleAlert size={18} />}
              onClick={() => navigate(ROUTES.repairNew())}
            >
              Reportar falla
            </Button>
          </div>
        </section>

        <section aria-label="Indicadores" className={styles.stats}>
          {cards.map((card) => (
            <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
          ))}
        </section>

        <div className={styles.columns}>
          <section aria-labelledby="home-upcoming-title" className={styles.section}>
            <h2 id="home-upcoming-title" className={styles.sectionTitle}>
              <CalendarClock aria-hidden="true" size={20} />
              Próximos mantenimientos
            </h2>
            {upcoming.length === 0 ? (
              <p className={styles.empty}>No hay mantenimientos próximos programados.</p>
            ) : (
              <ul className={styles.list}>
                {upcoming.map(({ plan, days }) => {
                  const machine = machineById.get(plan.machineId)
                  return (
                    <li key={plan.id} className={styles.item}>
                      <p className={styles.itemTitle}>
                        <Link to={ROUTES.planDetail(plan.id)}>{plan.activity}</Link>
                      </p>
                      <p className={styles.itemMeta}>
                        {machine ? `${machine.code} · ${machine.name}` : 'Máquina eliminada'}
                      </p>
                      <p className={styles.itemMeta}>
                        {formatDate(plan.nextDate)} · {daysLabel(days)}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
            <Button
              variant="secondary"
              className={styles.more}
              onClick={() => navigate(ROUTES.plans())}
            >
              Ver todos los mantenimientos
            </Button>
          </section>

          <section aria-labelledby="home-critical-title" className={styles.section}>
            <h2 id="home-critical-title" className={styles.sectionTitle}>
              <TriangleAlert aria-hidden="true" size={20} />
              Alertas críticas
            </h2>
            {criticalAlerts.length === 0 ? (
              <p className={styles.empty}>No hay alertas críticas.</p>
            ) : (
              <ul className={styles.list}>
                {criticalAlerts.map((alert) => (
                  <li key={alert.id} className={`${styles.item} ${styles.critical}`}>
                    <p className={styles.itemTitle}>
                      <Link to={alert.link}>{alert.title}</Link>
                    </p>
                    <p className={styles.itemMeta}>{alert.message}</p>
                  </li>
                ))}
              </ul>
            )}
            <Button
              variant="secondary"
              className={styles.more}
              onClick={() => navigate(ROUTES.alerts())}
            >
              Ver todas las alertas
            </Button>
          </section>
        </div>
      </div>
    </>
  )
}
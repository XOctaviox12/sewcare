import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  ChartColumn,
  Cog,
  Hammer,
  History,
  House,
  Menu,
  Settings,
  Wrench,
  X,
} from 'lucide-react'
import { ROUTES } from '../constants/routes'
import styles from './AppLayout.module.css'
import { useAlerts } from '../hooks/useAlerts'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.home(), label: 'Inicio', icon: House },
  { to: ROUTES.machines(), label: 'Máquinas', icon: Cog },
  { to: ROUTES.plans(), label: 'Mantenimiento', icon: Wrench },
  { to: ROUTES.history(), label: 'Historial', icon: History },
  { to: ROUTES.repairs(), label: 'Reparaciones', icon: Hammer },
  { to: ROUTES.reports(), label: 'Reportes', icon: ChartColumn },
  { to: ROUTES.settings(), label: 'Configuración', icon: Settings },
]

/** Se conecta a las alertas reales en la Sección 3. */
const alertCount: number = 0

function getSectionTitle(pathname: string): string {
  if (pathname === ROUTES.alerts()) return 'Alertas'
  const item = NAV_ITEMS.find((nav) =>
    nav.to === '/'
      ? pathname === '/'
      : pathname === nav.to || pathname.startsWith(`${nav.to}/`),
  )
  return item ? item.label : 'SewCare'
}

export function AppLayout() {
    const { alerts, criticalCount } = useAlerts()
const alertCount = alerts.length
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()

  const closeMenu = () => setMenuOpen(false)

  // Escape cierra el menú del celular y devuelve el foco al botón.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <header className={styles.header}>
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="menu-principal"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? (
            <X aria-hidden="true" size={22} />
          ) : (
            <Menu aria-hidden="true" size={22} />
          )}
        </button>

        <Link to={ROUTES.home()} className={styles.brand} onClick={closeMenu}>
          <span className={styles.logo} aria-hidden="true">
            S
          </span>
          <span className={styles.brandName}>SewCare</span>
        </Link>

        <p className={styles.sectionTitle}>{getSectionTitle(pathname)}</p>

        <Link
  to={ROUTES.alerts()}
  className={styles.bell}
  aria-label={
    alertCount === 0
      ? 'Alertas: sin alertas pendientes'
      : `Alertas pendientes: ${alertCount}, ${criticalCount} críticas`
  }
  onClick={closeMenu}
>
  <Bell aria-hidden="true" size={22} />
  {alertCount > 0 && (
    <span className={styles.badge} aria-hidden="true">
      {alertCount > 99 ? '99+' : alertCount}
    </span>
  )}
</Link>
      </header>

      <div className={styles.body}>
        {menuOpen && (
          <div
            className={styles.backdrop}
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}

        <nav
          id="menu-principal"
          aria-label="Navegación principal"
          className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}
        >
          <ul className={styles.list}>
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  title={label}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.linkActive}` : styles.link
                  }
                >
                  <Icon aria-hidden="true" size={20} />
                  <span className={styles.linkLabel}>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main id="contenido" tabIndex={-1} className={styles.main}>
          <div className={styles.content}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
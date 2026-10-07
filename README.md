# SewCare - Tu registro digital

MVP web para llevar el mantenimiento preventivo y correctivo de máquinas de coser industriales: registro de máquinas, planes de mantenimiento con fechas de vencimiento, historial, reparaciones con refacciones y costos, alertas, reportes con gráficas y exportación a CSV.

No usa servidor ni inicio de sesión: todos los datos se guardan en el navegador (localStorage).

## Requisitos

- Node.js 20.19 o superior (o 22.12+)
- npm

## Instalación y ejecución

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # compilación de producción
npm run lint     # revisión de código
```

La app abre directo en el panel de Inicio. En el primer arranque carga datos de demostración (se pueden restaurar o borrar desde Configuración).

## Tecnologías

React + Vite + TypeScript estricto, React Router, CSS Modules con variables CSS, localStorage, Recharts, Lucide React y date-fns.

## Estructura

```
src/
  components/   Piezas reutilizables sin lógica de negocio
  pages/        Pantallas (arman componentes y llaman servicios)
  layouts/      AppLayout (barra lateral, encabezado, campana)
  services/     Único lugar que toca localStorage
  hooks/        useToast, useAlerts
  types/        Tipos TypeScript
  utils/        Funciones puras (fechas, costos, estados, reportes, CSV, respaldo)
  data/         Datos de demostración
  constants/    Listas fijas, rutas y claves de almacenamiento
  styles/       theme.css (variables), themeTokens.ts (espejo para gráficas), global.css
```

## Decisiones técnicas

- **Sin backend:** todo vive en localStorage; las pantallas nunca lo llaman directo, solo los servicios.
- **Estados calculados:** el estado de un plan (Pendiente, Próximo, Vencido, Completado), las alertas, los costos y los indicadores se calculan siempre; no se guardan.
- **Próxima fecha:** al completar un mantenimiento se calcula desde la fecha de realización.
- **Eliminar en cascada:** borrar una máquina borra sus planes, historial, reparaciones y refacciones (con aviso); borrar un plan borra su historial; borrar una reparación borra sus refacciones.
- **Respaldo:** JSON con versión; al importar se valida todo (formato, tipos, ids únicos y referencias) antes de cambiar un solo dato.
- **Estilos:** CSS Modules con un solo archivo de tema (colores rosa y morado provisionales).

## Funciones terminadas

- Máquinas: alta, edición, detalle, búsqueda sin acentos, filtros, orden y eliminación en cascada.
- Mantenimiento: planes con frecuencias, estado calculado, marcar como completado y reprogramación.
- Historial: filtros por fechas, máquina, área, responsable y estado; detalle de solo lectura.
- Reparaciones: refacciones dinámicas, costos en vivo, "Reportar falla" y propuesta de cambio de estado de la máquina.
- Alertas: vencidos, próximos, máquinas fuera de servicio y reparaciones de alto costo, con campana y contador.
- Panel de Inicio con 10 indicadores, próximos mantenimientos y alertas críticas.
- Reportes con filtros, 10 indicadores y 4 gráficas.
- Exportación a CSV (máquinas, mantenimientos, historial y reparaciones) con los datos filtrados.
- Configuración: costo alto, restaurar demostración, eliminar todo, respaldo e importación JSON.
- Accesibilidad básica y diseño adaptable a computadora, tableta y celular.

## Mejoras futuras

Inicio de sesión y roles, backend y nube, PWA o app nativa, avisos por correo o push, fotos y QR por máquina, importar desde Excel, exportar a PDF o Excel, cancelar mantenimientos con motivo, inventario de refacciones, varias plantas, indicadores avanzados (MTBF, MTTR), checklists, bitácora de cambios, reportes de falla por operadores y calendario mensual.
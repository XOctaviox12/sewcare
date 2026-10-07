import { addDays, subDays } from 'date-fns'
import type {
  Machine,
  MaintenanceHistory,
  MaintenancePlan,
  Repair,
  SparePart,
} from '../types'
import { today, toISODate } from '../utils'

export interface DemoData {
  machines: Machine[]
  plans: MaintenancePlan[]
  history: MaintenanceHistory[]
  repairs: Repair[]
  spareParts: SparePart[]
}

/** Fecha ISO "AAAA-MM-DD" a N días de hoy (negativo = pasado). */
function day(offset: number): string {
  const base = today()
  return toISODate(offset >= 0 ? addDays(base, offset) : subDays(base, -offset))
}

export function buildDemoData(): DemoData {
  const now = new Date().toISOString()
  const base = { createdAt: now, updatedAt: now }

  // ---------------------------------------------------------------
  // 8 MÁQUINAS: 5 operativas, 2 en mantenimiento, 1 fuera de servicio
  // ---------------------------------------------------------------
  const machines: Machine[] = [
    {
      ...base, id: 'demo-m1', code: 'REC-001', name: 'Recta Juki 01',
      brand: 'Juki', model: 'DDL-8700', serialNumber: 'JK8700-0145',
      type: 'Recta', area: 'Costura', productionLine: 'Línea 1',
      acquisitionDate: '2022-03-14', status: 'Operativa', usageHours: 3200,
      responsible: 'Laura Mendoza', notes: '',
    },
    {
      ...base, id: 'demo-m2', code: 'OVE-001', name: 'Overlock Pegasus 01',
      brand: 'Pegasus', model: 'M700', serialNumber: 'PG700-2231',
      type: 'Overlock', area: 'Costura', productionLine: 'Línea 1',
      acquisitionDate: '2021-08-02', status: 'Operativa', usageHours: 4100,
      responsible: 'Laura Mendoza', notes: 'Usar solo hilo de poliéster.',
    },
    {
      ...base, id: 'demo-m3', code: 'COL-001', name: 'Collaretera Brother 01',
      brand: 'Brother', model: 'S-7200C', serialNumber: 'BR7200-0988',
      type: 'Collaretera', area: 'Acabado', productionLine: 'Línea 2',
      acquisitionDate: '2023-01-20', status: 'Operativa', usageHours: 1850,
      responsible: 'Carlos Ruiz', notes: '',
    },
    {
      ...base, id: 'demo-m4', code: 'PRE-001', name: 'Presilladora Juki 01',
      brand: 'Juki', model: 'LK-1900B', serialNumber: 'JK1900-0377',
      type: 'Presilladora', area: 'Acabado', productionLine: 'Línea 2',
      acquisitionDate: '2020-11-09', status: 'En mantenimiento', usageHours: 5600,
      responsible: 'Carlos Ruiz', notes: 'En revisión por falla de motor.',
    },
    {
      ...base, id: 'demo-m5', code: 'OJA-001', name: 'Ojaladora Brother 01',
      brand: 'Brother', model: 'RH-9820', serialNumber: 'BR9820-0512',
      type: 'Ojaladora', area: 'Ensamble', productionLine: 'Línea 3',
      acquisitionDate: '2022-06-30', status: 'Operativa', usageHours: 2700,
      responsible: 'Ana Torres', notes: '',
    },
    {
      ...base, id: 'demo-m6', code: 'BOT-001', name: 'Botonadora Juki 01',
      brand: 'Juki', model: 'MB-1377', serialNumber: 'JK1377-0201',
      type: 'Botonadora', area: 'Ensamble', productionLine: 'Línea 3',
      acquisitionDate: '2019-05-17', status: 'Fuera de servicio', usageHours: 7400,
      responsible: 'Ana Torres', notes: 'Pendiente de cambio de engrane.',
    },
    {
      ...base, id: 'demo-m7', code: 'CER-001', name: 'Cerradora Pegasus 01',
      brand: 'Pegasus', model: 'EX-5214', serialNumber: 'PG5214-0764',
      type: 'Cerradora', area: 'Costura', productionLine: 'Línea 1',
      acquisitionDate: '2023-09-05', status: 'En mantenimiento', usageHours: 1200,
      responsible: 'Laura Mendoza', notes: '',
    },
    {
      ...base, id: 'demo-m8', code: 'COR-001', name: 'Cortadora Eastman 01',
      brand: 'Eastman', model: 'Blue Streak II', serialNumber: 'ES-BS2-0033',
      type: 'Cortadora', area: 'Corte', productionLine: 'Línea 1',
      acquisitionDate: '2021-02-11', status: 'Operativa', usageHours: 3900,
      responsible: 'Miguel Ortega', notes: 'Afilar cuchilla cada mes.',
    },
  ]

  // ---------------------------------------------------------------
  // 10 PLANES: 2 vencidos, 3 próximos, 3 pendientes, 2 completados
  // (el estado se calcula con las fechas; nunca se guarda)
  // ---------------------------------------------------------------
  const plans: MaintenancePlan[] = [
    // Vencidos (nextDate en el pasado)
    {
      ...base, id: 'demo-p1', machineId: 'demo-m1', activity: 'Lubricación',
      description: 'Lubricar mecanismos principales.', startDate: day(-60),
      frequency: 'Semanal', nextDate: day(-3), lastCompletedAt: day(-10),
      responsible: 'Laura Mendoza', priority: 'Alta', estimatedMinutes: 20, notes: '',
    },
    {
      ...base, id: 'demo-p2', machineId: 'demo-m2', activity: 'Cambio de aceite',
      description: 'Cambio completo de aceite.', startDate: day(-120),
      frequency: 'Trimestral', nextDate: day(-8), lastCompletedAt: day(-98),
      responsible: 'Laura Mendoza', priority: 'Alta', estimatedMinutes: 45, notes: '',
    },
    // Próximos (hoy o dentro de 7 días)
    {
      ...base, id: 'demo-p3', machineId: 'demo-m3', activity: 'Revisión de aguja',
      description: 'Revisar y cambiar aguja si hace falta.', startDate: day(-30),
      frequency: 'Diaria', nextDate: day(0), lastCompletedAt: day(-1),
      responsible: 'Carlos Ruiz', priority: 'Media', estimatedMinutes: 10, notes: '',
    },
    {
      ...base, id: 'demo-p4', machineId: 'demo-m5', activity: 'Revisión de tensión de hilo',
      description: 'Ajustar tensión superior e inferior.', startDate: day(-45),
      frequency: 'Semanal', nextDate: day(3), lastCompletedAt: day(-4),
      responsible: 'Ana Torres', priority: 'Media', estimatedMinutes: 15, notes: '',
    },
    {
      ...base, id: 'demo-p5', machineId: 'demo-m8', activity: 'Limpieza general',
      description: 'Limpiar mesa de corte y cuchilla.', startDate: day(-20),
      frequency: 'Semanal', nextDate: day(6), lastCompletedAt: day(-1),
      responsible: 'Miguel Ortega', priority: 'Baja', estimatedMinutes: 30, notes: '',
    },
    // Pendientes (más de 7 días y nunca completados)
    {
      ...base, id: 'demo-p6', machineId: 'demo-m1', activity: 'Calibración',
      description: 'Calibración general de la máquina.', startDate: day(5),
      frequency: 'Semestral', nextDate: day(25), lastCompletedAt: '',
      responsible: 'Laura Mendoza', priority: 'Media', estimatedMinutes: 60, notes: '',
    },
    {
      ...base, id: 'demo-p7', machineId: 'demo-m5', activity: 'Inspección eléctrica',
      description: 'Revisar cableado y conexiones.', startDate: day(10),
      frequency: 'Semestral', nextDate: day(40), lastCompletedAt: '',
      responsible: 'Ana Torres', priority: 'Alta', estimatedMinutes: 40, notes: '',
    },
    {
      ...base, id: 'demo-p8', machineId: 'demo-m7', activity: 'Revisión de banda',
      description: 'Revisar desgaste y tensión de banda.', startDate: day(8),
      frequency: 'Mensual', nextDate: day(12), lastCompletedAt: '',
      responsible: 'Laura Mendoza', priority: 'Baja', estimatedMinutes: 25, notes: '',
    },
    // Completados (ciclo cumplido, próxima fecha lejana)
    {
      ...base, id: 'demo-p9', machineId: 'demo-m2', activity: 'Limpieza de dientes de arrastre',
      description: 'Retirar pelusa y residuos.', startDate: day(-40),
      frequency: 'Mensual', nextDate: day(28), lastCompletedAt: day(-2),
      responsible: 'Laura Mendoza', priority: 'Media', estimatedMinutes: 20, notes: '',
    },
    {
      ...base, id: 'demo-p10', machineId: 'demo-m8', activity: 'Revisión de motor',
      description: 'Inspección de motor y carbones.', startDate: day(-90),
      frequency: 'Trimestral', nextDate: day(85), lastCompletedAt: day(-5),
      responsible: 'Miguel Ortega', priority: 'Alta', estimatedMinutes: 50, notes: '',
    },
  ]

  // ---------------------------------------------------------------
  // 5 REGISTROS DE HISTORIAL: 3 a tiempo y 2 con retraso
  // ---------------------------------------------------------------
  const history: MaintenanceHistory[] = [
    {
      ...base, id: 'demo-h1', planId: 'demo-p1', machineId: 'demo-m1',
      activity: 'Lubricación', scheduledDate: day(-10), completedDate: day(-10),
      responsible: 'Laura Mendoza', punctuality: 'A tiempo',
      tasksDone: ['Lubricar mecanismos', 'Limpiar exceso de aceite'], notes: '',
    },
    {
      ...base, id: 'demo-h2', planId: 'demo-p2', machineId: 'demo-m2',
      activity: 'Cambio de aceite', scheduledDate: day(-98), completedDate: day(-95),
      responsible: 'Laura Mendoza', punctuality: 'Con retraso',
      tasksDone: ['Drenar aceite', 'Rellenar depósito'],
      notes: 'Se retrasó por falta de aceite en almacén.',
    },
    {
      ...base, id: 'demo-h3', planId: 'demo-p9', machineId: 'demo-m2',
      activity: 'Limpieza de dientes de arrastre', scheduledDate: day(-2),
      completedDate: day(-2), responsible: 'Laura Mendoza', punctuality: 'A tiempo',
      tasksDone: ['Retirar pelusa', 'Revisar dientes'], notes: '',
    },
    {
      ...base, id: 'demo-h4', planId: 'demo-p10', machineId: 'demo-m8',
      activity: 'Revisión de motor', scheduledDate: day(-7), completedDate: day(-5),
      responsible: 'Miguel Ortega', punctuality: 'Con retraso',
      tasksDone: ['Revisar carbones', 'Medir consumo'], notes: 'Carbones en buen estado.',
    },
    {
      ...base, id: 'demo-h5', planId: 'demo-p5', machineId: 'demo-m8',
      activity: 'Limpieza general', scheduledDate: day(-1), completedDate: day(-1),
      responsible: 'Miguel Ortega', punctuality: 'A tiempo',
      tasksDone: ['Limpiar mesa de corte', 'Limpiar cuchilla'], notes: '',
    },
  ]

  // ---------------------------------------------------------------
  // 4 REPARACIONES: 1 Reportada, 1 En proceso, 2 Finalizadas
  // (una con total mayor a $5,000)
  // ---------------------------------------------------------------
  const repairs: Repair[] = [
    {
      ...base, id: 'demo-r1', machineId: 'demo-m7', reportDate: day(-1),
      repairDate: '', failure: 'Se rompe el hilo constantemente.',
      diagnosis: '', workDone: '', technician: '', downtimeHours: 0,
      laborCost: 0, status: 'Reportada', notes: '',
    },
    {
      ...base, id: 'demo-r2', machineId: 'demo-m4', reportDate: day(-4),
      repairDate: '', failure: 'El motor se sobrecalienta y se detiene.',
      diagnosis: 'Banda de motor desgastada y rodamiento con juego.',
      workDone: '', technician: 'Pedro Salinas', downtimeHours: 12,
      laborCost: 800, status: 'En proceso', notes: 'Esperando refacciones.',
    },
    {
      ...base, id: 'demo-r3', machineId: 'demo-m6', reportDate: day(-20),
      repairDate: day(-15), failure: 'No cierra el ciclo de botonado.',
      diagnosis: 'Engrane principal dañado y resorte de tensión fatigado.',
      workDone: 'Reemplazo de engrane, resorte y pedal.',
      technician: 'Pedro Salinas', downtimeHours: 40, laborCost: 3500,
      status: 'Finalizada', notes: 'Costo alto por engrane importado.',
    },
    {
      ...base, id: 'demo-r4', machineId: 'demo-m1', reportDate: day(-35),
      repairDate: day(-34), failure: 'Aguja se rompe al coser.',
      diagnosis: 'Prensatelas desalineado y garfio con desgaste.',
      workDone: 'Cambio de garfio, prensatelas y aguja.',
      technician: 'Pedro Salinas', downtimeHours: 3, laborCost: 400,
      status: 'Finalizada', notes: '',
    },
  ]

  // ---------------------------------------------------------------
  // 8 REFACCIONES repartidas entre las reparaciones
  // r2 = 1,420 + 800 = 2,220 | r3 = 6,490 + 3,500 = 9,990 (alto)
  // r4 = 700 + 400 = 1,100
  // ---------------------------------------------------------------
  const spareParts: SparePart[] = [
    {
      ...base, id: 'demo-s1', repairId: 'demo-r2', name: 'Banda de motor',
      code: 'BM-220', quantity: 1, unitCost: 420, supplier: 'Refaccionaria Textil',
    },
    {
      ...base, id: 'demo-s2', repairId: 'demo-r2', name: 'Rodamiento',
      code: 'RD-6204', quantity: 2, unitCost: 500, supplier: 'Refaccionaria Textil',
    },
    {
      ...base, id: 'demo-s3', repairId: 'demo-r3', name: 'Engrane principal',
      code: 'EG-1377', quantity: 1, unitCost: 5200, supplier: 'Juki México',
    },
    {
      ...base, id: 'demo-s4', repairId: 'demo-r3', name: 'Resorte de tensión',
      code: 'RT-014', quantity: 3, unitCost: 130, supplier: 'Juki México',
    },
    {
      ...base, id: 'demo-s5', repairId: 'demo-r3', name: 'Pedal',
      code: 'PD-100', quantity: 1, unitCost: 900, supplier: 'Refaccionaria Textil',
    },
    {
      ...base, id: 'demo-s6', repairId: 'demo-r4', name: 'Garfio',
      code: 'GF-8700', quantity: 1, unitCost: 450, supplier: 'Juki México',
    },
    {
      ...base, id: 'demo-s7', repairId: 'demo-r4', name: 'Prensatelas',
      code: 'PT-8700', quantity: 1, unitCost: 220, supplier: 'Juki México',
    },
    {
      ...base, id: 'demo-s8', repairId: 'demo-r4', name: 'Aguja',
      code: 'AG-DB1', quantity: 3, unitCost: 10, supplier: 'Refaccionaria Textil',
    },
  ]

  return { machines, plans, history, repairs, spareParts }
}
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { theme } from '../../styles/themeTokens'
import type { ChartPoint } from '../../utils'

interface BarChartBasicProps {
  data: ChartPoint[]
  /** Nombre de la serie (leyenda y tooltip), ej. "Planes". */
  valueLabel: string
  /** Un solo color para todas las barras. */
  color?: string
  /** Color por categoría (tiene prioridad sobre color). */
  colors?: Record<string, string>
  /** Formato de los valores (tooltip y etiquetas). */
  formatValue?: (value: number) => string
  /** Formato del eje vertical (por defecto, el mismo formatValue). */
  formatAxis?: (value: number) => string
}

export function BarChartBasic({
  data,
  valueLabel,
  color = theme.chart.secondary,
  colors,
  formatValue = String,
  formatAxis,
}: BarChartBasicProps) {
  const axisFormat = formatAxis ?? formatValue

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 24, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
        <XAxis
          dataKey="name"
          interval={0}
          tick={{ fontSize: 12, fill: theme.colors.textMuted }}
        />
        <YAxis
          allowDecimals={false}
          width={76}
          tick={{ fontSize: 12, fill: theme.colors.textMuted }}
          tickFormatter={(value) => axisFormat(Number(value))}
        />
        <Tooltip formatter={(value) => formatValue(Number(value ?? 0))} />
        <Legend />
        <Bar dataKey="value" name={valueLabel} fill={color} radius={[4, 4, 0, 0]}>
          {colors &&
            data.map((point) => (
              <Cell key={point.name} fill={colors[point.name] ?? color} />
            ))}
          <LabelList
            dataKey="value"
            position="top"
            fontSize={12}
            fill={theme.colors.text}
            formatter={(label) => formatValue(Number(label))}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
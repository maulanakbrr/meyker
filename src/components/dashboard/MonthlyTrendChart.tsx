import { TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '../../lib/utils'
import type { MonthlyTrendItem } from '../../lib/dashboardUtils'

interface MonthlyTrendChartProps {
  data: MonthlyTrendItem[]
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col min-h-[350px]">
      <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-emerald-400" /> 6-Month Spending Trend
      </h2>
      <div className="w-full h-[280px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              formatter={(val: number) => [formatCurrency(val)]}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '10px' }} />
            <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

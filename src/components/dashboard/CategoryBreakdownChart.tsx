import { Layers } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '../../lib/utils'
import type { CategoryBreakdownItem } from '../../lib/dashboardUtils'

interface CategoryBreakdownChartProps {
  data: CategoryBreakdownItem[]
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col min-h-[350px]">
      <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-400" /> Category Spending Breakdown
      </h2>
      <div className="w-full h-[280px] flex items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number) => [formatCurrency(val), 'Amount']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs">
            No expense records logged for this month.
          </div>
        )}
      </div>
    </div>
  )
}

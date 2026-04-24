'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend,
} from 'recharts'

interface WeeklyData { day: string; value: number | null }

export function WeeklyEfficiencyChart({ data }: { data: WeeklyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v: number | null) => (v !== null ? `${v}%` : '—')}
          contentStyle={{ fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 8 }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => {
            const color = d.value === null ? '#E5E7EB' : d.value >= 85 ? '#22C55E' : d.value >= 70 ? '#EAB308' : '#EF4444'
            return <Cell key={i} fill={color} />
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

interface IsiData { name: string; value: number; color: string }

export function IsiDistributionChart({ data }: { data: IsiData[] }) {
  const total = data.reduce((a, b) => a + b.value, 0)
  if (total === 0) {
    return <p className="text-xs text-gray-400 text-center py-10">ISI 평가 데이터가 없습니다.</p>
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={2}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Tooltip formatter={(v: number) => `${v}명`} contentStyle={{ fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

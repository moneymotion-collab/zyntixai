"use client"

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { month: "Jan", revenue: 2400 },
  { month: "Feb", revenue: 1398 },
  { month: "Mar", revenue: 9800 },
  { month: "Apr", revenue: 3908 },
  { month: "May", revenue: 4800 },
  { month: "Jun", revenue: 3800 },
]

export default function RevenueChart() {
  return (
    <div className="h-[320px] w-full">

      <ResponsiveContainer width="100%" height="100%">

        <LineChart data={data}>

          <XAxis
            dataKey="month"
            stroke="#71717a"
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#a3e635"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  )
}
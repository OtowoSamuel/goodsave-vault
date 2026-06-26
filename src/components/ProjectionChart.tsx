import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatWholeAmount } from '../hooks/useVaultSession'

interface ProjectionChartProps {
  apyPercent: number
}

function generateProjection(initialDeposit: number, monthlyDeposit: number, apyPercent: number, months = 12) {
  const data = []
  let balance = initialDeposit
  let balanceLower = initialDeposit
  let balanceUpper = initialDeposit
  let principal = initialDeposit
  const baseApy = apyPercent / 100
  const monthlyRate = baseApy / 12
  const lowerRate = Math.max(0, baseApy - 0.02) / 12
  const upperRate = (baseApy + 0.02) / 12

  for (let m = 0; m <= months; m++) {
    const yield_ = balance - principal
    // For the confidence band we use an array [lower, upper] for Recharts Area
    data.push({
      month: m === 0 ? 'Now' : `M${m}`,
      balance: parseFloat(balance.toFixed(2)),
      confidence: [parseFloat(balanceLower.toFixed(2)), parseFloat(balanceUpper.toFixed(2))],
      principal: parseFloat(principal.toFixed(2)),
      yield: parseFloat(yield_.toFixed(2)),
    })
    if (m < months) {
      balance = balance * (1 + monthlyRate) + monthlyDeposit
      balanceLower = balanceLower * (1 + lowerRate) + monthlyDeposit
      balanceUpper = balanceUpper * (1 + upperRate) + monthlyDeposit
      principal = principal + monthlyDeposit
    }
  }
  return data
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
        <p className="text-slate-400 text-xs mb-3 font-medium">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p: any) => {
            if (p.name === 'Confidence Band') return null; // Skip confidence array from tooltip
            return (
              <div key={p.name} className="flex justify-between gap-6 text-sm">
                <span className="text-slate-400">{p.name}</span>
                <span className="font-mono font-semibold" style={{ color: p.color }}>
                  {Number(p.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} G$
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return null
}

export function ProjectionChart({ apyPercent }: ProjectionChartProps) {
  const [initialDeposit, setInitialDeposit] = useState(1000)
  const [monthlyDeposit, setMonthlyDeposit] = useState(200)

  const data = useMemo(
    () => generateProjection(initialDeposit, monthlyDeposit, apyPercent),
    [initialDeposit, monthlyDeposit, apyPercent]
  )

  const finalBalance = data[data.length - 1]?.balance || 0
  const finalBalanceLower = data[data.length - 1]?.confidence[0] || 0
  const finalBalanceUpper = data[data.length - 1]?.confidence[1] || 0
  const totalPrincipal = data[data.length - 1]?.principal || 0
  const totalYield = finalBalance - totalPrincipal

  return (
    <div className="surface-card rounded-[1.75rem] p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/4 w-1/2 h-32 bg-emerald-500/5 blur-[60px] pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-display tracking-tight text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-[color:var(--color-accent-growth)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              12-Month Yield Projection
            </h3>
            <p className="text-slate-400 text-sm mt-1 font-body">Adjust the sliders to model your savings growth at {apyPercent}% APY</p>
          </div>

          {/* Summary stats */}
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-[0.08em] font-semibold">Final Balance Range</p>
              <p className="text-2xl font-extrabold font-mono-tabular tabular-nums text-white">
                <span className="text-lg text-slate-400">Est. </span>
                {formatWholeAmount(finalBalanceLower)}
                <span className="text-slate-500 font-normal mx-1">–</span>
                {formatWholeAmount(finalBalanceUpper)}
                <span className="text-base text-slate-500 ml-1">G$</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-[0.08em] font-semibold">Target Yield ({apyPercent}%)</p>
              <p className="text-2xl font-extrabold font-mono-tabular tabular-nums text-[color:var(--color-accent-growth)]">+{formatWholeAmount(totalYield)} <span className="text-base text-[color:var(--color-accent-growth)]/70">G$</span></p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-4 items-center text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 rounded-full bg-emerald-500" />
            <span>Projected balance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 rounded-full bg-[color:var(--color-accent-time)] border border-dashed border-[color:var(--color-accent-time)]/55 bg-transparent" />
            <span>Principal only, no yield</span>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-400 font-medium font-body">Initial Deposit</label>
              <span className="text-sm font-mono-tabular tabular-nums text-white font-semibold">{formatWholeAmount(initialDeposit)} G$</span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={initialDeposit}
              onChange={e => setInitialDeposit(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[color:var(--color-accent-growth)] bg-white/10"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>100</span><span>10,000</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-400 font-medium font-body">Monthly Top-up</label>
              <span className="text-sm font-mono-tabular tabular-nums text-white font-semibold">{formatWholeAmount(monthlyDeposit)} G$</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={monthlyDeposit}
              onChange={e => setMonthlyDeposit(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[color:var(--color-accent-growth)] bg-white/10"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>0</span><span>2,000</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="principalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="confidence" name="Confidence Band" stroke="none" fill="#10b981" fillOpacity={0.1} />
              <Area type="monotone" dataKey="principal" name="Principal only, no yield" stroke="#818cf8" strokeWidth={1.5} fill="url(#principalGrad)" strokeDasharray="4 2" />
              <Area type="monotone" dataKey="balance" name={`Projected Balance (${apyPercent}%)`} stroke="#10b981" strokeWidth={2.5} fill="url(#balanceGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4 font-body">Projection assumes {apyPercent}% APY compounded monthly. Actual returns may vary.</p>
      </div>
    </div>
  )
}

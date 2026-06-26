import { ConnectButton } from '@rainbow-me/rainbowkit'
import { VaultDashboard } from './components/VaultDashboard'
import { DepositForm } from './components/DepositForm'
import { BadgeCard } from './components/BadgeCard'
import { ProjectionChart } from './components/ProjectionChart'
import { useRef, useState } from 'react'
import { APY_BADGE_COPY, APY_TOOLTIP_COPY, DISPLAY_APY_PERCENT } from './hooks/useVaultSession'
import { ApyTooltip } from './components/ApyTooltip'
import GoodSaveLogo from './components/GoodSaveLogo'

function HeroSignal() {
  const spark = [18, 26, 21, 33, 29, 40, 37, 48, 44, 56]
  return (
    <div className="surface-elevated rounded-[1.75rem] p-5 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 brand-shell pointer-events-none" />
      <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">Yield snapshot</p>
          <h3 className="mt-2 text-2xl text-white font-display tracking-tight">See the current rate and lock window</h3>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-[1.1fr_0.9fr] gap-4 items-end">
        <div className="surface-card rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold mb-2">Current APY</p>
          <div className="flex items-end gap-2">
            <span className="font-display text-5xl text-white tracking-tight">{DISPLAY_APY_PERCENT}%</span>
            <span className="pb-1 text-sm text-slate-400 font-body">variable supply yield</span>
          </div>
          <p className="mt-2 text-sm text-slate-400 font-body leading-relaxed">Lock your G$ for the selected term and preview the return before you commit.</p>
        </div>

        <div className="surface-card rounded-2xl p-4">
          <svg viewBox="0 0 220 120" className="w-full h-28 overflow-visible">
            <defs>
              <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.98" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke="url(#heroLine)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={spark.map((v, i) => `${i * 24},${110 - v}`).join(' ')}
            />
            <circle cx="216" cy={110 - spark[spark.length - 1]} r="6" fill="#10b981" stroke="rgba(255,255,255,0.6)" strokeWidth="2" className="animate-pulse" />
          </svg>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-mono-tabular">
            <span>7d trend</span>
            <span className="text-slate-400">Projected balance</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-3 gap-3">
        <div className="surface-card rounded-xl p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">Starting balance</p>
          <p className="mt-2 text-lg text-white font-mono-tabular">Stable</p>
        </div>
        <div className="surface-card rounded-xl p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">Lock window</p>
          <p className="mt-2 text-lg text-white font-mono-tabular">30d</p>
        </div>
        <div className="surface-card rounded-xl p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">On-chain</p>
          <p className="mt-2 text-lg text-white font-mono-tabular">Transparent</p>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rewards' | 'projections'>('dashboard')
  const [amount, setAmount] = useState('')
  const [durationDays, setDurationDays] = useState(30)
  const [showApyTooltip, setShowApyTooltip] = useState(false)
  const apyInfoRef = useRef<HTMLSpanElement | null>(null)
  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--color-background)]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Sticky Glass Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/50 border-b border-white/5 flex justify-between items-center px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-black/20 border border-white/10 p-1 shadow-[0_0_28px_rgba(34,197,94,0.18)]">
            <GoodSaveLogo iconOnly className="h-8" />
          </div>
          <h1 className="text-2xl font-display tracking-tight text-white">
            GoodSave
          </h1>
        </div>
        <div className="flex items-center justify-end min-h-10">
          <ConnectButton chainStatus="none" />
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto pt-20 pb-24 px-6 flex flex-col gap-12 md:pt-24">
        
        {/* Hero Section */}
        <section className="grid lg:grid-cols-[1.08fr_0.92fr] gap-10 items-center md:pt-2">
          <div className="text-left max-w-2xl">
            <div className="group relative mb-6 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-white text-sm font-semibold tracking-wide inline-flex items-center gap-2 overflow-visible surface-card">
              <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {APY_BADGE_COPY}
              <span
                ref={apyInfoRef}
                className="relative inline-flex items-center justify-center"
                onMouseEnter={() => setShowApyTooltip(true)}
                onMouseLeave={() => setShowApyTooltip(false)}
                onFocus={() => setShowApyTooltip(true)}
                onBlur={() => setShowApyTooltip(false)}
                tabIndex={0}
                aria-label="APY disclosure"
              >
                <svg className="w-4 h-4 text-white/70 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <ApyTooltip anchorRef={apyInfoRef} open={showApyTooltip} content={APY_TOOLTIP_COPY} />
            </div>
            <h2 className="font-display text-5xl md:text-7xl tracking-tight text-white mb-6 leading-[0.95] max-w-xl">
              Optimize yield on your <span className="text-[color:var(--color-accent-growth)]">GoodDollars</span>
            </h2>
            <p className="font-body text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-xl">
              Lock your G$ for custom durations and earn a predictable return, backed by Aave V3. Zero gas fees, instant deposits.
            </p>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
              <span className="px-3 py-2 rounded-full bg-white/5 border border-white/10">Variable APY</span>
              <span className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300">30-day lock</span>
              <span className="px-3 py-2 rounded-full bg-white/5 border border-white/10">No gas fees</span>
            </div>
          </div>

          <div className="lg:justify-self-end w-full max-w-xl">
            <HeroSignal />
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/5 p-1.5 rounded-2xl flex gap-2 border border-white/10 backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${activeTab === 'dashboard' ? 'bg-white/10 border border-white/10 text-white shadow-none' : 'text-slate-400 hover:text-white transition'}`}
            >
              Vault Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('rewards')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${activeTab === 'rewards' ? 'bg-white/10 border border-white/10 text-white shadow-none' : 'text-slate-400 hover:text-white transition'}`}
            >
              Saver Rewards
            </button>
            <button 
              onClick={() => setActiveTab('projections')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${activeTab === 'projections' ? 'bg-white/10 border border-white/10 text-white shadow-none' : 'text-slate-400 hover:text-white transition'}`}
            >
              Yield Projections
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-5 w-full h-full">
              <DepositForm
                amount={amount}
                durationDays={durationDays}
                onAmountChange={setAmount}
                onDurationDaysChange={setDurationDays}
                apyPercent={DISPLAY_APY_PERCENT}
              />
            </div>
            <div className="lg:col-span-7 w-full h-full">
              <VaultDashboard />
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Saver Tiers</h3>
              <p className="text-slate-400">Level up your badges and unlock APY bonuses by successfully completing lock terms.</p>
            </div>
            <BadgeCard />
          </div>
        )}

        {activeTab === 'projections' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProjectionChart apyPercent={DISPLAY_APY_PERCENT} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App

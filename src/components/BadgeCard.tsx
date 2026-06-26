import { useEffect, useState } from 'react'
import { DISPLAY_APY_PERCENT } from '../hooks/useVaultSession'

const BADGES = [
  {
    level: 0,
    name: 'Seedling',
    icon: '🌱',
    color: 'from-green-600/20 to-emerald-800/20',
    border: 'border-emerald-700/40',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-900/40',
    description: 'First deposit made',
    apy: null as string | null,
    apyLabel: 'Welcome to GoodSave!',
    minTerms: 0,
  },
  {
    level: 1,
    name: 'Grower',
    icon: '🌿',
    color: 'from-teal-600/20 to-emerald-700/20',
    border: 'border-teal-600/40',
    text: 'text-teal-300',
    glow: 'shadow-teal-900/40',
    description: 'Completed 1 full term',
    apy: '+0.5%' as string | null,
    apyLabel: 'APY Bonus Unlocked',
    minTerms: 1,
  },
  {
    level: 2,
    name: 'Cultivator',
    icon: '🌳',
    color: 'from-cyan-600/20 to-teal-700/20',
    border: 'border-cyan-600/40',
    text: 'text-cyan-300',
    glow: 'shadow-cyan-900/40',
    description: 'Completed 3 full terms',
    apy: '+1%' as string | null,
    apyLabel: 'APY Bonus Unlocked',
    minTerms: 3,
  },
  {
    level: 3,
    name: 'Diamond Hands',
    icon: '💎',
    color: 'from-violet-600/20 to-indigo-700/20',
    border: 'border-violet-500/40',
    text: 'text-violet-300',
    glow: 'shadow-violet-900/40',
    description: 'Completed 5+ full terms',
    apy: '+2%' as string | null,
    apyLabel: 'Max Tier — Elite Saver',
    minTerms: 5,
  },
]

function ConfettiPiece({ index }: { index: number }) {
  const colors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6']
  return (
    <div
      className="absolute w-2 h-2 rounded-full"
      style={{
        left: `${(index * 37) % 100}%`,
        top: `${(index * 53) % 100}%`,
        background: colors[index % 5],
        animation: 'confettiBurst 1s ease-out forwards',
        animationDelay: `${(index % 5) * 0.1}s`,
      }}
    />
  )
}

const PREVIEW_STAGES = [
  { label: 'Seedling', terms: 0 },
  { label: 'Grower', terms: 1 },
  { label: 'Cultivator', terms: 3 },
  { label: 'Diamond Hands', terms: 5 },
]

export function BadgeCard() {
  const [completedTerms, setCompletedTerms] = useState<number>(() =>
    parseInt(localStorage.getItem('goodsave_terms') || '0', 10)
  )
  const [showConfetti, setShowConfetti] = useState(false)
  const [previewTerms, setPreviewTerms] = useState<number | null>(null)

  const displayedTerms = previewTerms ?? completedTerms

  useEffect(() => {
    ;(window as any).__goodsave_onTermComplete = () => {
      const next = completedTerms + 1
      setCompletedTerms(next)
      localStorage.setItem('goodsave_terms', String(next))
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1800)
    }
  }, [completedTerms])

  const currentBadge = [...BADGES].reverse().find(b => displayedTerms >= b.minTerms) || BADGES[0]
  const nextBadge = BADGES.find(b => b.minTerms > displayedTerms)
  const isPreviewing = previewTerms !== null

  return (
    <div className={`relative surface-card rounded-[1.75rem] p-6 overflow-hidden`}>
      {/* Confetti */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-20">
          {Array.from({ length: 30 }).map((_, i) => <ConfettiPiece key={i} index={i} />)}
        </div>
      )}

      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentBadge.color} pointer-events-none`} />

      <div className="relative z-10 flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-[0.16em] font-semibold mb-0.5 font-body">Saver Tier Preview</p>
          <p className="text-sm text-slate-300 font-body">Click a stage to preview how the card looks before or after unlocking it.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {PREVIEW_STAGES.map(stage => {
            const active = displayedTerms === stage.terms
            return (
              <button
                key={stage.label}
                type="button"
                onClick={() => setPreviewTerms(stage.terms)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer font-body ${active ? 'bg-[color:var(--color-accent-growth)]/18 border-[color:var(--color-accent-growth)]/35 text-white shadow-[0_0_0_1px_rgba(52,211,153,0.15)]' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/20'}`}
              >
                {stage.label}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setPreviewTerms(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer font-body ${isPreviewing ? 'bg-slate-900/70 border-white/10 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}
          >
            Live
          </button>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
        {/* Left: Current badge */}
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl bg-white/5 border ${currentBadge.border} flex items-center justify-center text-3xl shadow-lg`}>
            {currentBadge.icon}
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-[0.16em] font-semibold mb-0.5 font-body">Saver Tier</p>
            <h3 className={`text-2xl font-display tracking-tight ${currentBadge.text}`}>{currentBadge.name}</h3>
            <p className="text-sm text-slate-400 mt-0.5 font-body">{currentBadge.description}</p>
          </div>
        </div>

        {/* Center: Tier progress */}
        <div className="flex-1 min-w-[200px] max-w-sm">
          <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono-tabular">
            <span>{displayedTerms} terms completed{isPreviewing ? ' (preview)' : ''}</span>
            {nextBadge && <span>Next: {nextBadge.name} at {nextBadge.minTerms}</span>}
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
              style={{ width: nextBadge ? `${Math.min(100, (displayedTerms / nextBadge.minTerms) * 100)}%` : '100%' }}
            />
          </div>
          <div className="flex justify-between">
            {BADGES.map(b => (
              <div key={b.level} className="flex flex-col items-center gap-1.5 group/tier relative cursor-help">
                <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${displayedTerms >= b.minTerms ? 'bg-emerald-400' : 'bg-white/10'}`} />
                <div className="flex flex-col items-center text-center">
                  <span className="text-[10px] text-slate-400 font-medium font-body">{b.name.split(' ')[0]}</span>
                  <span className={`text-[9px] font-mono-tabular ${displayedTerms >= b.minTerms ? 'text-[color:var(--color-accent-growth)]' : 'text-slate-600'}`}>{b.apy || 'Base'}</span>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-slate-950/95 border border-white/10 rounded-xl text-xs text-slate-200 opacity-0 group-hover/tier:opacity-100 transition-all duration-200 pointer-events-none shadow-2xl z-50 backdrop-blur-md">
                  <p className="font-semibold text-white mb-0.5 font-display tracking-tight">{b.name}</p>
                  <p>{b.apy ? `Unlocks ${b.apy} APY bonus` : `Standard ~${DISPLAY_APY_PERCENT}% APY`}</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: APY bonus */}
        <div className="text-right">
          {currentBadge.apy ? (
            <>
              <p className={`text-3xl font-extrabold font-mono-tabular ${currentBadge.text}`}>{currentBadge.apy}</p>
              <p className="text-xs text-slate-400 mt-1 font-body">{currentBadge.apyLabel}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500 font-body">Complete your first term</p>
              <p className="text-xs text-slate-600 mt-1 font-body">to unlock APY bonuses</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

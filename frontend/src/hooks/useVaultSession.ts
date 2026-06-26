export const DISPLAY_APY_PERCENT = Number(import.meta.env.VITE_DISPLAY_APY_PERCENT || '12')
export const DISPLAY_APY = DISPLAY_APY_PERCENT / 100
export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60
export const DEFAULT_LOCK_DAYS = 30
export const DEV = import.meta.env.DEV
export const APY_TOOLTIP_COPY = 'Yield is derived from Aave V3 lending markets and is subject to market conditions. Rates can fluctuate and are not guaranteed.'
export const APY_BADGE_COPY = `~${DISPLAY_APY_PERCENT}% APY — variable, not guaranteed`

export function formatAmount(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: maximumFractionDigits,
    maximumFractionDigits,
  }).format(value)
}

export function formatWholeAmount(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatUnlockDate(timestampSeconds: number) {
  return new Date(timestampSeconds * 1000).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function calculateExpectedYield(principal: number, elapsedSeconds: number, apy = DISPLAY_APY) {
  return principal * apy * (elapsedSeconds / SECONDS_PER_YEAR)
}

export function warnIfYieldDeviation(expected: number, actual: number) {
  if (!DEV || expected <= 0) return
  const diff = Math.abs(actual - expected) / expected
  if (diff > 0.05) {
    console.warn('[GoodSave] Yield accrual deviates from expected calculation by more than 5%', {
      expected,
      actual,
      deviation: diff,
    })
  }
}

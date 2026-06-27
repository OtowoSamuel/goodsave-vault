import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { formatUnits } from 'viem'
import { VAULT_ADDRESS, vaultAbi } from '../config/contracts'
import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { ConfirmModal } from './ConfirmModal'
import {
  DISPLAY_APY,
  DISPLAY_APY_PERCENT,
  SECONDS_PER_YEAR,
  formatAmount,
  formatUnlockDate,
  warnIfYieldDeviation,
} from '../hooks/useVaultSession'

export function VaultDashboard() {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { openConnectModal } = useConnectModal()
  const { showToast } = useToast()
  const [timeLeft, setTimeLeft] = useState('')
  const [showEarlyWithdrawModal, setShowEarlyWithdrawModal] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  const { data: userInfo, refetch: refetchInfo } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultAbi,
    functionName: 'userInfos',
    args: address ? [address] : undefined,
  }) as { data: readonly [bigint, bigint, bigint] | undefined, refetch: any }

  const { data: tokenDecimals } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultAbi,
    functionName: 'decimals',
  })

  const { data: lockDuration } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultAbi,
    functionName: 'lockDuration',
  })

  const { data: globalDepositCap } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultAbi,
    functionName: 'globalDepositCap',
  })

  const { data: totalAssets } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultAbi,
    functionName: 'totalAssets',
  })

  const { data: currentAssets } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultAbi,
    functionName: 'convertToAssets',
    args: userInfo && userInfo[2] ? [userInfo[2]] : undefined,
  })

  const [lockedUntil, principalAssets, shares] = userInfo || [0n, 0n, 0n]
  const decimals = Number(tokenDecimals ?? 18)
  const principal = Number(formatUnits(principalAssets, decimals))
  const onChainYield = currentAssets ? Math.max(0, Number(formatUnits((currentAssets as bigint) - principalAssets, decimals))) : 0
  const lockDurationSeconds = Number(lockDuration ?? 30 * 24 * 60 * 60)
  const lockStartTime = Number(lockedUntil) > 0 ? Number(lockedUntil) - lockDurationSeconds : 0
  const elapsedSeconds = Number(lockedUntil) > 0
    ? Math.max(0, Math.min(Math.floor(currentTime / 1000) - lockStartTime, lockDurationSeconds))
    : 0
  const expectedYield = principal > 0 ? principal * DISPLAY_APY * (elapsedSeconds / SECONDS_PER_YEAR) : 0
  const isLocked = lockedUntil > BigInt(Math.floor(Date.now() / 1000))

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!lockedUntil) {
      setTimeLeft('')
      return
    }
    const interval = setInterval(() => {
      const diff = Number(lockedUntil) - Math.floor(Date.now() / 1000)
      if (diff <= 0) {
        setTimeLeft('Unlocked')
      } else {
        const d = Math.floor(diff / 86400)
        const h = Math.floor((diff % 86400) / 3600)
        setTimeLeft(`${d}d ${h}h`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [lockedUntil])

  useEffect(() => {
    warnIfYieldDeviation(expectedYield, onChainYield)
  }, [expectedYield, onChainYield])

  const progress = lockDurationSeconds > 0 ? Math.min(100, (elapsedSeconds / lockDurationSeconds) * 100) : 0
  const unlockDateLabel = lockedUntil ? formatUnlockDate(Number(lockedUntil)) : ''
  const totalAssetsValue = Number(formatUnits(((totalAssets ?? 0n) as bigint), decimals))
  const globalCapValue = Number(formatUnits(((globalDepositCap ?? 0n) as bigint), decimals))

  const handleWithdraw = async (isEarly: boolean) => {
    try {
      if (isEarly) {
        await writeContractAsync({
          address: VAULT_ADDRESS as `0x${string}`,
          abi: vaultAbi,
          functionName: 'earlyWithdraw',
        })
        showToast('Early withdrawal complete. Principal returned to your wallet.')
      } else {
        await writeContractAsync({
          address: VAULT_ADDRESS as `0x${string}`,
          abi: vaultAbi,
          functionName: 'redeem',
          args: [shares, address, address],
        })
        ;(window as any).__goodsave_onTermComplete?.()
        showToast('Withdrawal successful! Principal + yield sent to your wallet.')
      }
      refetchInfo()
    } catch (e) {
      console.error(e)
      showToast('Withdrawal failed. Please check console for details.', 'error')
    }
  }

  if (!address || principalAssets === 0n) {
    return (
      <div className="surface-card rounded-[1.75rem] p-5 sm:p-8 relative overflow-hidden min-h-[360px] sm:min-h-[400px] h-full flex items-center justify-center group">
        <div className="absolute inset-0 p-8 blur-md opacity-25 pointer-events-none flex flex-col justify-between grayscale">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 w-32 bg-slate-700 rounded-md"></div>
              <div className="h-6 w-24 bg-slate-700 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-800 rounded-2xl h-24"></div>
              <div className="p-6 bg-slate-800 rounded-2xl h-24"></div>
            </div>
          </div>
          <div className="w-full h-12 bg-slate-700 rounded-xl mt-4"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-6">
          <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-[1rem] flex items-center justify-center mb-6 shadow-2xl">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h3 className="text-xl font-display tracking-tight text-white mb-2">Start Earning Yield</h3>
          <p className="text-sm text-slate-400 mb-6 font-body">
            {!address
              ? 'Follow 3 simple steps to grow your savings.'
              : 'You have no active deposits yet. Make a deposit on the left to begin.'}
          </p>

          {!address && (
            <div className="flex flex-col gap-3 w-full mb-6 text-left bg-[color:var(--color-surface-2)] p-4 rounded-[1rem] border border-white/5 surface-elevated">
              <div className="flex items-center gap-3 text-sm text-slate-300 font-body">
                <span className="w-5 h-5 rounded-full bg-[color:var(--color-accent-growth)]/20 text-[color:var(--color-accent-growth)] flex items-center justify-center font-bold text-xs font-mono-tabular">1</span>
                Connect your wallet
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 font-body">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs font-mono-tabular text-slate-300">2</span>
                Deposit & Lock G$
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 font-body">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs font-mono-tabular">3</span>
                Earn {DISPLAY_APY_PERCENT}% APY instantly
              </div>
            </div>
          )}

          {!address && (
            <button
              onClick={openConnectModal}
              className="w-full min-h-[48px] px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-slate-950 font-bold transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
            >
              Connect Wallet
            </button>
          )}

          <a href="#" className="mt-6 text-xs text-[color:var(--color-accent-growth)] hover:text-[color:var(--color-accent-growth-hover)] underline underline-offset-4 decoration-[color:var(--color-accent-growth)]/30 font-body">
            How does this work? Read the docs
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="surface-card rounded-[1.75rem] p-5 sm:p-8 relative overflow-hidden group h-full flex flex-col">
        <div className="absolute -inset-1 bg-gradient-to-l from-[color:var(--color-accent-growth)]/10 to-white/5 rounded-[1.35rem] blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>

        <div className="relative flex flex-col flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display tracking-tight text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-[color:var(--color-accent-growth)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Your Position
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 font-mono-tabular tabular-nums ${
              isLocked
                ? 'bg-white/5 border border-white/10 text-slate-300'
                : 'bg-[color:var(--color-accent-growth)]/10 text-[color:var(--color-accent-growth)] border border-[color:var(--color-accent-growth)]/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-emerald-500' : 'bg-[color:var(--color-accent-growth)]'}`}></span>
              {isLocked ? `Locked · ${timeLeft}` : 'Matured'}
            </span>
          </div>

          {isLocked && (
            <div className="mb-5">
              <div className="flex justify-between text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2 font-mono-tabular tabular-nums">
                <span>{Math.round(progress)}% elapsed</span>
                <span className="text-slate-400">Unlocks {unlockDateLabel}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-0">
            <div className="surface-elevated rounded-[1.35rem] p-4 hover:border-white/20 transition-colors">
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">Principal</div>
              <div className="text-xl sm:text-2xl font-mono-tabular tabular-nums font-bold text-white">{formatAmount(principal)} <span className="text-sm sm:text-base text-slate-400">G$</span></div>
            </div>
            <div className="surface-card rounded-[1.35rem] p-4 relative overflow-hidden border-white/10">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[color:var(--color-accent-growth)]/10 rounded-full blur-xl"></div>
              <div className="relative">
                <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">Yield Accrued</div>
                <div className="text-xl sm:text-2xl font-mono-tabular tabular-nums font-bold text-[color:var(--color-accent-growth)]">+{expectedYield.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })} <span className="text-sm sm:text-base text-[color:var(--color-accent-growth)]/70">G$</span></div>
                <p className="mt-1 text-[11px] text-slate-400 font-body">Rate is variable and may change daily.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-4 flex justify-between gap-4 flex-wrap">
            <span className="text-xs font-mono-tabular tabular-nums text-slate-400">Strategy: <span className="text-slate-300">Aave V3 Smart Vault</span></span>
            <span className="text-xs font-mono-tabular tabular-nums text-slate-400">
              TVL: <span className="text-slate-300">{formatAmount(totalAssetsValue, 0)} / {formatAmount(globalCapValue, 0)} G$ cap</span>
            </span>
          </div>

          <div className="mt-auto pt-5">
            {isLocked ? (
              <button
                onClick={() => setShowEarlyWithdrawModal(true)}
                className="w-full min-h-[48px] py-3.5 bg-transparent hover:bg-[color:var(--color-accent-destructive)]/8 text-rose-400/80 hover:text-rose-400 font-medium rounded-[1rem] transition-colors duration-300 border border-white/5 hover:border-white/10 cursor-pointer text-sm font-body"
              >
                Early Withdraw (Forfeit Yield)
              </button>
            ) : (
              <button
                onClick={() => handleWithdraw(false)}
                className="w-full py-4 bg-[color:var(--color-accent-growth)] hover:bg-[color:var(--color-accent-growth-hover)] text-slate-950 font-bold rounded-[1rem] shadow-[0_14px_36px_rgba(16,185,129,0.24)] hover:shadow-[0_18px_44px_rgba(16,185,129,0.34)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer font-body"
              >
                Withdraw Principal + Yield
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showEarlyWithdrawModal}
        title="Confirm Early Withdrawal"
        message="Are you sure? Early withdrawal forfeits ALL accrued yield. Your principal will be returned but all yield earned so far will be lost."
        confirmLabel="Yes, Withdraw"
        cancelLabel="Keep Saving"
        isDestructive={true}
        onCancel={() => setShowEarlyWithdrawModal(false)}
        onConfirm={() => {
          setShowEarlyWithdrawModal(false)
          handleWithdraw(true)
        }}
      />
    </>
  )
}

import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { parseUnits, formatUnits, encodeAbiParameters, parseAbiParameters, maxUint256 } from 'viem'
import { VAULT_ADDRESS, GDOLLAR_ADDRESS, gDollarAbi } from '../config/contracts'
import { useToast } from '../context/ToastContext'
import { ConfirmModal } from './ConfirmModal'
import { DISPLAY_APY_PERCENT, formatAmount } from '../hooks/useVaultSession'
import { addTokenToWallet } from '../utils/addToken'

interface DepositFormProps {
  amount: string
  durationDays: number
  apyPercent?: number
  onAmountChange: (value: string) => void
  onDurationDaysChange: (value: number) => void
}

export function DepositForm({
  amount,
  durationDays,
  apyPercent = DISPLAY_APY_PERCENT,
  onAmountChange,
  onDurationDaysChange,
}: DepositFormProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const { address, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { openConnectModal } = useConnectModal()
  const { showToast } = useToast()

  const { data: tokenDecimals } = useReadContract({
    address: GDOLLAR_ADDRESS as `0x${string}`,
    abi: gDollarAbi,
    functionName: 'decimals',
  })

  // Read G$ balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: GDOLLAR_ADDRESS as `0x${string}`,
    abi: gDollarAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Read G$ allowance granted to vault
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: GDOLLAR_ADDRESS as `0x${string}`,
    abi: gDollarAbi,
    functionName: 'allowance',
    args: address ? [address, VAULT_ADDRESS as `0x${string}`] : undefined,
  })

  const decimals = Number(tokenDecimals ?? 18)
  const parsedAmount = amount ? parseUnits(amount, decimals) : 0n
  const needsApproval = isConnected && !!amount && (allowance as bigint ?? 0n) < parsedAmount

  // Estimated return calculation
  const estimatedReturn = (() => {
    const a = parseFloat(amount || '0')
    if (!a || a <= 0) return null
    const apy = apyPercent / 100
    const years = durationDays / 365
    const gain = a * (Math.pow(1 + apy, years) - 1)
    return { g: gain, usd: gain * 0.0003 }
  })()

  const handleApprove = async () => {
    if (!address) return
    setIsApproving(true)
    try {
      await writeContractAsync({
        address: GDOLLAR_ADDRESS as `0x${string}`,
        abi: gDollarAbi,
        functionName: 'approve',
        args: [VAULT_ADDRESS as `0x${string}`, maxUint256],
      })
      showToast('G$ approved! You can now deposit.')
      refetchAllowance()
    } catch (e) {
      console.error(e)
      showToast('Approval failed. Please try again.', 'error')
    } finally {
      setIsApproving(false)
    }
  }

  const handleAddToken = async () => {
    const added = await addTokenToWallet({
      address: GDOLLAR_ADDRESS,
      symbol: 'G$',
      decimals,
      image: 'https://raw.githubusercontent.com/GoodDollar/GoodProtocol/master/assets/logo.png',
    })
    if (added) showToast('G$ added to your wallet!')
    else showToast('Could not add token — please add it manually.', 'error')
  }

  const handleDeposit = async () => {
    if (!amount || !address) return;
    try {
      const parsed = parseUnits(amount, decimals)
      const durationSeconds = durationDays * 86400
      const encodedData = encodeAbiParameters(parseAbiParameters('uint256'), [BigInt(durationSeconds)])
      // Use transferAndCall for 1-click deposit (ERC-677)
      await writeContractAsync({
        address: GDOLLAR_ADDRESS as `0x${string}`,
        abi: gDollarAbi,
        functionName: 'transferAndCall',
        args: [VAULT_ADDRESS, parsed, encodedData],
      })
      showToast('Deposit successful! Your G$ is now locked and earning yield.')
      onAmountChange('')
      refetchBalance()
    } catch (e: unknown) {
      console.error(e)
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('SF_TOKEN_MOVE_INSUFFICIENT_BALANCE') || msg.includes('insufficient')) {
        showToast('You don\'t have enough G$. Claim or swap for G$ first.', 'error')
      } else if (msg.includes('User rejected') || msg.includes('user rejected')) {
        showToast('Transaction cancelled.', 'error')
      } else {
        showToast('Deposit failed. Please check console for details.', 'error')
      }
    }
  }

  const handleMax = () => {
    if (balance) {
      onAmountChange(formatUnits(balance as bigint, decimals))
    }
  }

  const maxButtonHighlighted = Number(balance ?? 0n) > 0 && !amount
  const lockRatio = (durationDays - 1) / 364
  const sliderFill = `${Math.round(lockRatio * 100)}%`
  const lockThumbScale = 1 + lockRatio * 0.22

  return (
    <div className="surface-card rounded-[1.75rem] p-6 relative group overflow-hidden h-full flex flex-col">
      {/* Decorative gradient blur */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[color:var(--color-accent-growth)] to-white/5 rounded-[1.5rem] blur opacity-0 group-hover:opacity-12 transition duration-500 pointer-events-none"></div>
      
      <div className="relative flex-1 flex flex-col">
        <h2 className="text-xl md:text-2xl font-display mb-6 text-white flex items-center gap-2 tracking-tight">
          <span className="text-[color:var(--color-accent-growth)] font-normal">+</span> Deposit G$
        </h2>
        
        <div className="mb-4 flex justify-between items-center text-sm">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Available Balance</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-mono-tabular bg-white/[0.05] px-3 py-1 rounded-full border border-white/5">
              {balance ? formatAmount(Number(formatUnits(balance as bigint, decimals))) : '0.00'} G$
            </span>
            <button
              onClick={handleAddToken}
              title="Add G$ to your wallet"
              className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 px-2 py-1 rounded-full transition-colors cursor-pointer"
            >
              + Add G$
            </button>
          </div>
        </div>

        {isConnected && (!balance || (balance as bigint) === 0n) && (
          <div className="mb-4 flex items-start gap-3 rounded-[1rem] border border-amber-500/20 bg-amber-500/8 p-3 text-sm">
            <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <div>
              <p className="text-amber-300 font-semibold font-body">No G$ in your wallet</p>
              <p className="text-amber-200/70 text-xs mt-0.5 font-body">You need GoodDollar (G$) tokens to deposit. Claim your daily UBI or swap for G$.</p>
              <div className="flex gap-2 mt-2">
                <a href="https://wallet.gooddollar.org" target="_blank" rel="noreferrer" className="text-xs font-semibold text-amber-300 hover:text-amber-200 underline">Claim G$ (UBI)</a>
                <span className="text-amber-500/40">·</span>
                <a href="https://app.uniswap.org/#/swap?outputCurrency=0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A&chain=celo" target="_blank" rel="noreferrer" className="text-xs font-semibold text-amber-300 hover:text-amber-200 underline">Swap for G$</a>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6 flex-1">
          {/* Inner Well */}
          <div className="surface-elevated rounded-[1.35rem] p-4 focus-within:border-white/25 transition-colors flex justify-between items-center">
            <div className="flex flex-col flex-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                className="w-full bg-transparent text-3xl font-semibold text-white placeholder-slate-600 focus:outline-none focus:ring-0 font-mono-tabular tabular-nums"
                placeholder="0.00"
              />
              {estimatedReturn && (
                <div className="mt-2 text-xs flex items-center gap-1">
                  <span className="text-slate-500">Estimated return at maturity:</span>
                  <span className="text-[color:var(--color-accent-growth)] font-mono-tabular tabular-nums font-semibold">+{estimatedReturn.g.toFixed(4)} G$</span>
                  <span className="text-slate-600">(≈ ${estimatedReturn.usd.toFixed(2)} USD)</span>
                </div>
              )}
              <span className="text-sm text-slate-500 mt-1">
                ≈ ${(Number(amount || 0) * 0.0003).toFixed(2)} USD
              </span>
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <button 
                onClick={handleMax}
                className={`text-xs font-bold transition-colors px-2 py-1 rounded cursor-pointer ${maxButtonHighlighted ? 'text-white bg-[color:var(--color-accent-growth)]/18 border border-[color:var(--color-accent-growth)]/35 shadow-[0_0_0_1px_rgba(16,185,129,0.18)]' : 'text-[color:var(--color-accent-growth)] hover:text-[color:var(--color-accent-growth-hover)] bg-[color:var(--color-accent-growth)]/10 border border-transparent'}`}
              >
                MAX
              </button>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <div className="w-5 h-5 rounded-full bg-[color:var(--color-accent-growth)] flex items-center justify-center text-[10px] font-bold text-white">
                  $
                </div>
                <span className="text-white font-semibold text-sm font-body">G$</span>
              </div>
            </div>
          </div>

          <div className="surface-card rounded-[1.35rem] p-4">
            <div className="flex justify-between mb-3 text-sm">
              <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Lock Duration</span>
              <span className="text-white font-semibold font-mono-tabular">{durationDays} Days</span>
            </div>
            <input
              type="range"
              min="1"
              max="365"
              step="1"
              value={durationDays}
              onChange={e => onDurationDaysChange(Number(e.target.value))}
              className="w-full appearance-none cursor-pointer goodsave-range"
              style={{ ['--fill' as any]: sliderFill, ['--thumb-scale' as any]: lockThumbScale }}
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono-tabular">
              <span>1 Day</span>
              <span>1 Year</span>
            </div>
          </div>

          <div className="surface-hot text-slate-200 p-4 rounded-[1.35rem] text-sm mt-auto">
            <div className="flex items-start gap-3 mb-2">
              <svg className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="text-white font-medium font-body leading-relaxed"><strong className="font-mono-tabular uppercase tracking-[0.08em] text-[11px] text-slate-300">{durationDays} Day Term:</strong> Your deposit will be locked for {durationDays} days. Yield is variable (~{apyPercent}% APY) and not guaranteed — actual return may differ.</p>
            </div>
            <p className="ml-8 text-sm text-slate-400 font-medium leading-relaxed font-body">
              Early withdrawal forfeits all accrued yield. Your principal is returned in full.
            </p>
          </div>

          <button
            onClick={!isConnected ? openConnectModal : needsApproval ? handleApprove : () => setShowDepositModal(true)}
            disabled={isConnected && !amount || isApproving}
            className="w-full py-4 mt-2 bg-[color:var(--color-accent-growth)] hover:bg-[color:var(--color-accent-growth-hover)] text-white font-bold rounded-[1rem] shadow-[0_14px_36px_rgba(16,185,129,0.22)] hover:shadow-[0_18px_44px_rgba(16,185,129,0.32)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer transform hover:-translate-y-0.5 disabled:hover:translate-y-0 flex items-center justify-center gap-2 font-body"
          >
            {!isConnected && 'Connect Wallet'}
            {isConnected && isApproving && (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Approving...
              </>
            )}
            {isConnected && !isApproving && needsApproval && (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Approve G$
              </>
            )}
            {isConnected && !isApproving && !needsApproval && amount && 'Deposit & Lock'}
            {isConnected && !isApproving && !needsApproval && !amount && 'Enter Amount'}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDepositModal}
        title="Confirm Deposit & Lock"
        message={`You are about to lock ${amount} G$ for a term of ${durationDays} days. Yield is variable (~${apyPercent}% APY) and not guaranteed — actual return may differ. If you choose to withdraw early, you will receive your principal back but forfeit all earned yield.`}
        confirmLabel={`Yes, Lock ${amount} G$`}
        cancelLabel="Cancel"
        onCancel={() => setShowDepositModal(false)}
        onConfirm={() => {
          setShowDepositModal(false)
          handleDeposit()
        }}
      />
    </div>
  )
}

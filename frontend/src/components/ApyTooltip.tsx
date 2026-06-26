import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { createPortal } from 'react-dom'

type Placement = 'top' | 'bottom'

interface ApyTooltipProps {
  anchorRef: RefObject<HTMLElement | null>
  open: boolean
  content: string
}

const VIEWPORT_PADDING = 12
const TOOLTIP_WIDTH = 280
const TOOLTIP_GAP = 10

export function ApyTooltip({ anchorRef, open, content }: ApyTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [placement, setPlacement] = useState<Placement>('top')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return

    setReady(false)

    const updatePosition = () => {
      const anchorRect = anchorRef.current?.getBoundingClientRect()
      const tooltipRect = tooltipRef.current?.getBoundingClientRect()
      if (!anchorRect || !tooltipRect) return

      const availableTop = anchorRect.top - VIEWPORT_PADDING - TOOLTIP_GAP
      const availableBottom = window.innerHeight - anchorRect.bottom - VIEWPORT_PADDING - TOOLTIP_GAP
      const nextPlacement: Placement = availableTop >= tooltipRect.height || availableTop >= availableBottom ? 'top' : 'bottom'

      const left = Math.min(
        Math.max(anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2, VIEWPORT_PADDING),
        window.innerWidth - tooltipRect.width - VIEWPORT_PADDING,
      )

      const top = nextPlacement === 'top'
        ? Math.max(anchorRect.top - tooltipRect.height - TOOLTIP_GAP, VIEWPORT_PADDING)
        : Math.min(anchorRect.bottom + TOOLTIP_GAP, window.innerHeight - tooltipRect.height - VIEWPORT_PADDING)

      setPlacement(nextPlacement)
      setPosition({ top, left })
      setReady(true)
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, anchorRef])

  if (!mounted || !open) return null

  return createPortal(
    <div
      ref={tooltipRef}
      className="fixed z-[80] pointer-events-none transition-opacity duration-150"
      style={{ top: `${position.top}px`, left: `${position.left}px`, width: `${TOOLTIP_WIDTH}px`, opacity: ready ? 1 : 0 }}
      role="tooltip"
    >
      <div className="relative rounded-xl border border-white/10 bg-slate-950/95 px-3 py-2.5 text-left text-xs leading-relaxed text-slate-200 shadow-2xl backdrop-blur-md">
        <div className="font-medium">
          {content}
        </div>
        <div
          className={`absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border border-white/10 bg-slate-950/95 ${placement === 'top' ? '-bottom-1.5 border-t-0 border-l-0' : '-top-1.5 border-b-0 border-r-0'}`}
        />
      </div>
    </div>,
    document.body,
  )
}
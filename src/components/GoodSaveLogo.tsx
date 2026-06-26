import type { FC } from 'react'

interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export const GoodSaveLogo: FC<LogoProps> = ({ className = 'h-7', iconOnly = false }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <path
          d="M4 24.5L12 15.5L18 21.5L28 8.5"
          stroke="#10B981"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 8H9C6.23858 8 4 10.2386 4 13V19C4 21.7614 6.23858 24 9 24H21C23.7614 24 26 21.7614 26 19V14.5H17.5"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {!iconOnly && (
        <span className="text-xl font-bold tracking-tight text-white font-sans">
          Good<span className="text-emerald-500 font-medium">save</span>
        </span>
      )}
    </div>
  )
}

export default GoodSaveLogo
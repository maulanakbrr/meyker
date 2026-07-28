import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: ReactNode
  rightElement?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-gray-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-gray-900/60 border ${
              error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-700/60 focus:border-indigo-500 focus:ring-indigo-500/20'
            } rounded-xl ${leftIcon ? 'pl-10' : 'pl-4'} ${
              rightElement ? 'pr-11' : 'pr-4'
            } py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 text-gray-400 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

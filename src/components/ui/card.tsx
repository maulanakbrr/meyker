import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 border border-white/10 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`flex flex-col space-y-1.5 text-center mb-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={`text-2xl font-bold tracking-tight text-white ${className}`} {...props}>
      {children}
    </h2>
  )
}

export function CardDescription({ children, className = '', ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-gray-400 mt-1 ${className}`} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`mt-6 text-center text-xs text-gray-400 ${className}`} {...props}>
      {children}
    </div>
  )
}

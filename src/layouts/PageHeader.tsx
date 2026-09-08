import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/utils'

interface PageHeaderProps {
  eyebrow?: string
  title?: string
  description?: string
  actions?: ReactNode
  className?: string
  children?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions, className, children }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        )}
        <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {(actions || children) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {children}
          {actions}
        </div>
      )}
    </motion.div>
  )
}
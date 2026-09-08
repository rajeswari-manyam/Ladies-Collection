import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { SearchX, TriangleAlert, RefreshCw, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-3 py-20 text-center"
    >
      <div className="relative size-12">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  )
}

interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'We could not locate the data you were looking for.',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
        <PackageOpen className="size-6 text-primary/70" />
      </div>
      <h3 className="font-serif text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}

export function EmptySearch({ title = 'No results found', description = 'Try a different search term.' }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
        <SearchX className="size-6 text-primary/70" />
      </div>
      <h3 className="font-serif text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'The mock service responded with an error. Please try again.',
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 py-16 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <TriangleAlert className="size-6 text-destructive" />
      </div>
      <h3 className="font-serif text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="soft" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      )}
    </motion.div>
  )
}
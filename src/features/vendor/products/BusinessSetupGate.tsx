import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Store, TriangleAlert } from 'lucide-react'
import { useVendorSetupStatus } from '@/features/vendor/hooks'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Blocks seller actions that need a verified business until Business setup is
 * filled in. Sign-up creates a placeholder seller profile so the portal's API
 * calls resolve, which means new vendors land here with an empty profile.
 */
export function BusinessSetupGate({ children }: { children: ReactNode }) {
  const { isLoading, isComplete, missing, unreachable } = useVendorSetupStatus()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Nothing to enforce if we cannot read the profile — do not trap the vendor.
  if (isComplete || unreachable) {
    return <>{children}</>
  }

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Store className="size-4" />
          Finish your business setup first
        </CardTitle>
        <CardDescription>
          Add your product once the marketplace has your business details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-white/70 p-3.5 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              {missing.length} detail{missing.length === 1 ? '' : 's'} still needed
            </p>
            <p className="text-xs text-muted-foreground">{missing.join(' · ')}</p>
          </div>
        </div>

        <Button size="sm" asChild>
          <Link to="/vendor/business-setup">
            Complete business setup
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
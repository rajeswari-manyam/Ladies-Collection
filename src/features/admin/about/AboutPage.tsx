import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { PageHeader } from '@/layouts/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const stack = [
  'React 18',
  'TypeScript',
  'Vite',
  'Tailwind CSS',
  'shadcn/ui',
  'Radix UI',
  'React Router v6',
  'Zustand',
  'TanStack Query',
  'TanStack Table',
  'Recharts',
  'React Hook Form',
  'Zod',
  'Framer Motion (motion)',
  'Lucide React',
  'Sonner',
]

const mockModules = [
  'Customers',
  'Vendors',
  'Categories & subcategories',
  'Products & product variants',
  'Orders',
  'Payments',
  'Shipments',
  'Settlements',
  'Notifications',
]

export function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="About this demo"
        description="A complete, responsive multi-vendor e-commerce admin portal shipped with realistic dummy data only."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Tech stack
            </CardTitle>
            <CardDescription>Powered by the following libraries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stack.map((item) => (
                <Badge key={item} variant="secondary" className="px-3 py-1">
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mock data coverage</CardTitle>
            <CardDescription>Every screen renders realistic placeholder data</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {mockModules.map((m) => (
                <li key={m} className="flex items-center gap-2 text-sm">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {m}
                </li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-blush-200 bg-blush-50 p-3 text-xs leading-relaxed text-muted-foreground"
            >
              This application does not connect to any backend API, does not process real payments and contains no real
              customer or vendor information. All names, addresses, IDs and figures are invented for demonstration.
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
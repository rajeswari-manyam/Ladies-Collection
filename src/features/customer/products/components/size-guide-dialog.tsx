import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const ROWS = [
  { size: 'XS', bust: 80, waist: 62, hip: 88 },
  { size: 'S', bust: 86, waist: 68, hip: 94 },
  { size: 'M', bust: 92, waist: 74, hip: 100 },
  { size: 'L', bust: 98, waist: 80, hip: 106 },
  { size: 'XL', bust: 104, waist: 86, hip: 112 },
  { size: 'XXL', bust: 112, waist: 94, hip: 120 },
]

export function SizeGuideDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Size guide</DialogTitle>
          <DialogDescription>
            Body measurements in cm. If you are between sizes, we recommend the larger size for ethnic fits.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">Bust</th>
                <th className="px-3 py-2">Waist</th>
                <th className="px-3 py-2">Hip</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.size} className="border-t border-border">
                  <td className="px-3 py-2 font-semibold text-foreground">{row.size}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.bust} cm</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.waist} cm</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.hip} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Free Size pieces fit most body types broadly. For custom tailoring, message the craft house after placing your
          order with your measurements.
        </p>
      </DialogContent>
    </Dialog>
  )
}
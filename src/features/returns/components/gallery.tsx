import { useState } from 'react'
import { Expand, ImageOff } from 'lucide-react'
import type { ReturnImage } from '@/features/returns/types'
import { GradientArtwork } from '@/components/common/artwork'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * Photos the customer uploaded with the return request.
 *
 * Rendered as themed artwork rather than remote images so the gallery, and the
 * preview that opens from it, work offline and in any environment.
 */
export function ReturnImageGallery({ images, className }: { images: ReturnImage[]; className?: string }) {
  const [preview, setPreview] = useState<ReturnImage | null>(null)

  if (images.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
        <ImageOff className="size-4 shrink-0" />
        No images were uploaded with this return request.
      </div>
    )
  }

  return (
    <>
      <div className={className}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setPreview(image)}
                className="group relative block w-full overflow-hidden rounded-xl border border-border"
                aria-label={`Preview ${image.label}`}
              >
                <GradientArtwork seed={image.label} label={image.label} hue={image.hue} className="h-28 w-full" />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-foreground/70 to-transparent px-3 pb-2 pt-6 text-[11px] font-medium text-white">
                  <span className="truncate">{image.label}</span>
                  <Expand className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Dialog open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{preview?.label}</DialogTitle>
            <DialogDescription>Uploaded by the customer with this return request.</DialogDescription>
          </DialogHeader>
          {preview && (
            <GradientArtwork seed={preview.label} label={preview.label} hue={preview.hue} className="h-72 w-full rounded-xl" />
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setPreview(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

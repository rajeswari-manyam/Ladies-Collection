import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, Search, SearchX } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUiStore } from '@/store/uiStore'
import { navSections } from '@/layouts/admin-navigation'
import { cn } from '@/utils'

export function CommandPalette() {
  const open = useUiStore((s) => s.commandOpen)
  const setOpen = useUiStore((s) => s.setCommandOpen)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      const t = window.setTimeout(() => inputRef.current?.focus(), 0)
      return () => window.clearTimeout(t)
    }
  }, [open])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return navSections
      .flatMap((section) => section.items.map((item) => ({ ...item, section: section.title })))
      .filter((item) => item.title.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query])

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[12vh] max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick navigation</DialogTitle>
          <DialogDescription>Search for a page and press Enter to jump to it.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2.5 border-b border-border/70 px-4 py-3.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages…"
            className="border-0 shadow-none focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && matches[0]) go(matches[0].to)
            }}
          />
          <kbd className="hidden shrink-0 items-center gap-1 rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            <CornerDownLeft className="size-3" />
            Enter
          </kbd>
        </div>
        <div className="max-h-[45vh]">
          <ScrollArea className="h-full">
            <div className="p-2">
              {query.trim().length === 0 ? (
                <div className="grid gap-0.5">
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Jump to
                  </p>
                  {navSections.flatMap((section) =>
                    section.items.slice(0, 2).map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.to}
                          type="button"
                          onClick={() => go(item.to)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-blush-100/60 hover:text-foreground"
                        >
                          <Icon className="size-4 shrink-0 text-primary/70" />
                          {item.title}
                          <span className="ml-auto text-[11px] text-muted-foreground/70">{section.title}</span>
                        </button>
                      )
                    }),
                  )}
                </div>
              ) : matches.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <SearchX className="size-6 text-muted-foreground" />
                  <p className="text-sm font-medium">No pages match “{query}”</p>
                  <p className="text-xs text-muted-foreground">Try a different keyword.</p>
                </div>
              ) : (
                <div className="grid gap-0.5">
                  {matches.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.to}
                        type="button"
                        onClick={() => go(item.to)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-blush-100/60 hover:text-foreground"
                      >
                        <Icon className={cn('size-4 shrink-0 text-primary/70')} />
                        <span className="font-medium">{item.title}</span>
                        <span className="ml-auto text-[11px] text-muted-foreground/70">{item.section}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span>
            <kbd className="rounded border border-border/70 bg-muted/60 px-1">Esc</kbd> to close
          </span>
          <span>Ladies Collection · quick nav</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
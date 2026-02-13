import { ArrowClockwise, Trash } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PDFPage } from '@/lib/types'

interface SidebarProps {
  pages: PDFPage[]
  currentPageIndex: number
  onPageSelect: (index: number) => void
  onDeletePage: (index: number) => void
  onReorderPages: (fromIndex: number, toIndex: number) => void
  onRotatePage: (index: number, degrees: number) => void
  documentName: string
}

export function Sidebar({
  pages,
  currentPageIndex,
  onPageSelect,
  onDeletePage,
  onRotatePage,
  documentName
}: SidebarProps) {
  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-sm truncate" title={documentName}>
          {documentName}
        </h2>
        <p className="text-xs text-sidebar-foreground/60 mt-1">
          {pages.length} {pages.length === 1 ? 'page' : 'pages'}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {pages.length === 0 ? (
            <div className="text-center py-8 text-sidebar-foreground/60 text-sm">
              No pages loaded
            </div>
          ) : (
            pages.map((page, index) => (
              <div
                key={page.id}
                className={cn(
                  "group relative rounded-lg border-2 transition-all cursor-pointer overflow-hidden",
                  currentPageIndex === index
                    ? "border-accent shadow-lg shadow-accent/20"
                    : "border-sidebar-accent hover:border-accent/50"
                )}
                onClick={() => onPageSelect(index)}
              >
                <div className="aspect-[8.5/11] bg-sidebar-accent/50 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-sidebar-foreground/20">
                      {index + 1}
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-sidebar/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRotatePage(index, 90)
                      }}
                    >
                      <ArrowClockwise size={14} weight="bold" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 px-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeletePage(index)
                      }}
                      disabled={pages.length === 1}
                    >
                      <Trash size={14} weight="bold" />
                    </Button>
                  </div>
                </div>

                <div className="absolute top-2 left-2 bg-sidebar/90 backdrop-blur-sm text-sidebar-foreground text-xs font-mono px-2 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}

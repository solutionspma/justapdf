import { ArrowClockwise, Trash } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PDFPage } from '@/lib/types'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

interface SidebarProps {
  pages: PDFPage[]
  currentPageIndex: number
  onPageSelect: (index: number) => void
  onDeletePage: (index: number) => void
  onReorderPages: (fromIndex: number, toIndex: number) => void
  onRotatePage: (index: number, degrees: number) => void
  documentName: string
  originalFile?: File | string | null
}

export function Sidebar({
  pages,
  currentPageIndex,
  onPageSelect,
  onDeletePage,
  onRotatePage,
  documentName,
  originalFile = null
}: SidebarProps) {
  const [fileUrl, setFileUrl] = useState<string>('')

  useEffect(() => {
    if (!originalFile) {
      setFileUrl('')
      return
    }
    if (typeof originalFile === 'string') {
      setFileUrl(originalFile)
      return
    }
    const url = URL.createObjectURL(originalFile)
    setFileUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [originalFile])

  return (
    <aside className="w-64 min-h-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-sm truncate" title={documentName}>
          {documentName}
        </h2>
        <p className="text-xs text-sidebar-foreground/60 mt-1">
          {pages.length} {pages.length === 1 ? 'page' : 'pages'}
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                <div className="aspect-[8.5/11] bg-sidebar-accent/50 flex items-center justify-center overflow-hidden">
                  {fileUrl ? (
                    <Document file={fileUrl} loading={null} error={null}>
                      <Page
                        pageNumber={index + 1}
                        width={220}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={null}
                      />
                    </Document>
                  ) : (
                    <span className="text-4xl font-bold text-sidebar-foreground/20">{index + 1}</span>
                  )}
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
      </div>
    </aside>
  )
}

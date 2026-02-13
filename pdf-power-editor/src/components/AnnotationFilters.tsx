import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Funnel, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { PDFElement } from '@/lib/types'

interface AnnotationFiltersProps {
  elements: PDFElement[]
  activeFilters: AnnotationFilter
  onFiltersChange: (filters: AnnotationFilter) => void
}

export interface AnnotationFilter {
  types: {
    text: boolean
    image: boolean
    signature: boolean
    form: boolean
    highlight: boolean
    note: boolean
  }
  authors: string[]
  showAllAuthors: boolean
}

export const DEFAULT_FILTERS: AnnotationFilter = {
  types: {
    text: true,
    image: true,
    signature: true,
    form: true,
    highlight: true,
    note: true
  },
  authors: [],
  showAllAuthors: true
}

export function AnnotationFilters({ elements, activeFilters, onFiltersChange }: AnnotationFiltersProps) {
  const [open, setOpen] = useState(false)

  const uniqueAuthors = Array.from(
    new Set(
      elements
        .filter(el => el.type === 'note' && el.data.author)
        .map(el => el.data.author)
    )
  )

  const handleTypeToggle = (type: keyof AnnotationFilter['types']) => {
    onFiltersChange({
      ...activeFilters,
      types: {
        ...activeFilters.types,
        [type]: !activeFilters.types[type]
      }
    })
  }

  const handleAuthorToggle = (author: string) => {
    const isCurrentlyShown = activeFilters.showAllAuthors || activeFilters.authors.includes(author)
    
    if (activeFilters.showAllAuthors) {
      onFiltersChange({
        ...activeFilters,
        showAllAuthors: false,
        authors: uniqueAuthors.filter(a => a !== author)
      })
    } else {
      if (isCurrentlyShown) {
        const newAuthors = activeFilters.authors.filter(a => a !== author)
        onFiltersChange({
          ...activeFilters,
          authors: newAuthors,
          showAllAuthors: newAuthors.length === uniqueAuthors.length
        })
      } else {
        const newAuthors = [...activeFilters.authors, author]
        onFiltersChange({
          ...activeFilters,
          authors: newAuthors,
          showAllAuthors: newAuthors.length === uniqueAuthors.length
        })
      }
    }
  }

  const handleShowAllAuthors = () => {
    onFiltersChange({
      ...activeFilters,
      showAllAuthors: true,
      authors: []
    })
  }

  const handleReset = () => {
    onFiltersChange(DEFAULT_FILTERS)
  }

  const isFiltered = !activeFilters.showAllAuthors || 
    Object.values(activeFilters.types).some(v => !v)

  const typeLabels: Record<keyof AnnotationFilter['types'], string> = {
    text: 'Text',
    image: 'Images',
    signature: 'Signatures',
    form: 'Forms',
    highlight: 'Highlights',
    note: 'Notes'
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Funnel size={18} weight={isFiltered ? 'fill' : 'regular'} />
          <span>Filters</span>
          {isFiltered && (
            <span className="w-2 h-2 rounded-full bg-accent"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Annotation Filters</h4>
            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 px-2 text-xs">
                Reset
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Type
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(activeFilters.types).map(([type, enabled]) => (
                <div key={type} className="flex items-center space-x-2">
                  <Switch
                    id={`type-${type}`}
                    checked={enabled}
                    onCheckedChange={() => handleTypeToggle(type as keyof AnnotationFilter['types'])}
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="text-sm cursor-pointer"
                  >
                    {typeLabels[type as keyof AnnotationFilter['types']]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {uniqueAuthors.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Authors
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="all-authors"
                    checked={activeFilters.showAllAuthors}
                    onCheckedChange={handleShowAllAuthors}
                  />
                  <Label
                    htmlFor="all-authors"
                    className="text-sm cursor-pointer font-medium"
                  >
                    Show All
                  </Label>
                </div>
                {!activeFilters.showAllAuthors && (
                  <div className="pl-6 space-y-2">
                    {uniqueAuthors.map((author) => (
                      <div key={author} className="flex items-center space-x-2">
                        <Switch
                          id={`author-${author}`}
                          checked={activeFilters.authors.includes(author)}
                          onCheckedChange={() => handleAuthorToggle(author)}
                        />
                        <Label
                          htmlFor={`author-${author}`}
                          className="text-sm cursor-pointer"
                        >
                          {author}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-border text-xs text-muted-foreground">
            Showing {elements.filter(el => {
              const typeMatch = activeFilters.types[el.type as keyof AnnotationFilter['types']]
              const authorMatch = activeFilters.showAllAuthors || 
                el.type !== 'note' || 
                !el.data.author ||
                activeFilters.authors.includes(el.data.author)
              return typeMatch && authorMatch
            }).length} of {elements.length} annotations
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function filterElements(elements: PDFElement[], filters: AnnotationFilter): PDFElement[] {
  return elements.filter(el => {
    const typeMatch = filters.types[el.type as keyof AnnotationFilter['types']]
    const authorMatch = filters.showAllAuthors || 
      el.type !== 'note' || 
      !el.data.author ||
      filters.authors.includes(el.data.author)
    return typeMatch && authorMatch
  })
}

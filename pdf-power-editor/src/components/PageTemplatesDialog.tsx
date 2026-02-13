import { useState } from 'react'
import { FilePlus, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PAGE_TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/pageTemplates'
import type { PageTemplate, PDFPage } from '@/lib/types'

interface PageTemplatesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: PageTemplate) => void
}

export function PageTemplatesDialog({
  open,
  onOpenChange,
  onSelectTemplate
}: PageTemplatesDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('business')

  const filteredTemplates = PAGE_TEMPLATES.filter(
    template => template.category === selectedCategory
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus className="w-5 h-5" />
            Page Templates
          </DialogTitle>
          <DialogDescription>
            Choose a pre-designed template to quickly create new pages
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {TEMPLATE_CATEGORIES.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="gap-1">
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {TEMPLATE_CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-4">
              <ScrollArea className="h-[50vh]">
                <div className="grid grid-cols-2 gap-4 p-1">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        onSelectTemplate(template)
                        onOpenChange(false)
                      }}
                      className="group relative rounded-lg border-2 border-border hover:border-primary transition-all overflow-hidden bg-card"
                    >
                      <div className="aspect-[8.5/11] bg-muted relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                        <div className="relative text-center p-4">
                          <div className="text-6xl opacity-20 mb-2">
                            {category.icon}
                          </div>
                          <div className="font-bold text-lg mb-1">
                            {template.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {template.description}
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border-t border-border bg-card/50">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{template.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {template.elements.length} elements
                          </Badge>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="default" size="sm">
                          Use Template
                        </Button>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

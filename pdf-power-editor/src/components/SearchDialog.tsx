import { useState, useEffect } from 'react'
import { MagnifyingGlass, X, ArrowUp, ArrowDown, ArrowsClockwise, Asterisk, BookOpen, FloppyDisk, Trash, Plus, Lightning } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { RegexInput } from '@/components/RegexInput'
import type { PDFDocument, TextElement, PDFElement } from '@/lib/types'
import { REGEX_PATTERNS, PATTERN_CATEGORIES, type RegexPattern } from '@/lib/regexPatterns'
import { toast } from 'sonner'

interface SearchResult {
  docId: string
  pageIndex: number
  elementId: string
  elementIndex: number
  text: string
  highlightStart: number
  highlightEnd: number
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documents: PDFDocument[]
  currentDocId: string | null
  currentPageIndex: number
  onNavigateToResult: (docId: string, pageIndex: number, elementId: string) => void
  onReplaceText: (docId: string, pageIndex: number, elementId: string, newText: string) => void
}

export function SearchDialog({
  open,
  onOpenChange,
  documents,
  currentDocId,
  currentPageIndex,
  onNavigateToResult,
  onReplaceText
}: SearchDialogProps) {
  const [customPatterns, setCustomPatterns] = useKV<RegexPattern[]>('regex-custom-patterns', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [regexError, setRegexError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [currentResultIndex, setCurrentResultIndex] = useState(0)
  const [showReplace, setShowReplace] = useState(false)
  const [patternLibraryOpen, setPatternLibraryOpen] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [newPatternName, setNewPatternName] = useState('')
  const [newPatternDescription, setNewPatternDescription] = useState('')
  const [newPatternExamples, setNewPatternExamples] = useState('')

  useEffect(() => {
    if (searchTerm) {
      performSearch()
    } else {
      setResults([])
      setCurrentResultIndex(0)
      setRegexError(null)
    }
  }, [searchTerm, caseSensitive, wholeWord, useRegex, documents])

  const performSearch = () => {
    const searchResults: SearchResult[] = []
    setRegexError(null)
    
    documents.forEach((doc) => {
      doc.pages.forEach((page, pageIndex) => {
        page.elements.forEach((element, elementIndex) => {
          if (element.type === 'text') {
            const textElement = element as TextElement
            const content = textElement.data.content
            
            let searchPattern: RegExp
            try {
              if (useRegex) {
                const flags = caseSensitive ? 'g' : 'gi'
                searchPattern = new RegExp(searchTerm, flags)
              } else if (wholeWord) {
                const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                searchPattern = new RegExp(`\\b${escapedTerm}\\b`, caseSensitive ? 'g' : 'gi')
              } else {
                const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                searchPattern = new RegExp(escapedTerm, caseSensitive ? 'g' : 'gi')
              }
              
              let match
              while ((match = searchPattern.exec(content)) !== null) {
                searchResults.push({
                  docId: doc.id,
                  pageIndex,
                  elementId: element.id,
                  elementIndex,
                  text: content,
                  highlightStart: match.index,
                  highlightEnd: match.index + match[0].length
                })
              }
            } catch (error) {
              if (useRegex && error instanceof SyntaxError) {
                setRegexError(error.message)
              }
              console.error('Search pattern error:', error)
            }
          }
        })
      })
    })
    
    setResults(searchResults)
    setCurrentResultIndex(0)
    
    if (searchResults.length > 0) {
      const first = searchResults[0]
      onNavigateToResult(first.docId, first.pageIndex, first.elementId)
    }
  }

  const navigateToResult = (index: number) => {
    if (results.length === 0) return
    
    const wrappedIndex = ((index % results.length) + results.length) % results.length
    setCurrentResultIndex(wrappedIndex)
    
    const result = results[wrappedIndex]
    onNavigateToResult(result.docId, result.pageIndex, result.elementId)
  }

  const handleNext = () => {
    navigateToResult(currentResultIndex + 1)
  }

  const handlePrevious = () => {
    navigateToResult(currentResultIndex - 1)
  }

  const handleReplace = () => {
    if (results.length === 0 || !searchTerm) return
    
    const result = results[currentResultIndex]
    const doc = documents.find(d => d.id === result.docId)
    if (!doc) return
    
    const page = doc.pages[result.pageIndex]
    const element = page.elements.find(el => el.id === result.elementId) as TextElement
    if (!element) return
    
    try {
      let newText: string
      
      if (useRegex) {
        const regex = new RegExp(searchTerm, caseSensitive ? 'g' : 'gi')
        let matchCount = 0
        newText = element.data.content.replace(regex, (match, offset) => {
          if (offset === result.highlightStart && matchCount === 0) {
            matchCount++
            return replaceTerm
          }
          matchCount++
          return match
        })
      } else {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        newText = element.data.content.replace(
          new RegExp(escapedTerm, caseSensitive ? 'g' : 'gi'),
          (match, offset) => {
            if (offset === result.highlightStart) {
              return replaceTerm
            }
            return match
          }
        )
      }
      
      onReplaceText(result.docId, result.pageIndex, result.elementId, newText)
      toast.success('Text replaced')
      
      setTimeout(() => performSearch(), 100)
    } catch (error) {
      toast.error('Replace failed: Invalid pattern')
    }
  }

  const handleReplaceAll = () => {
    if (results.length === 0 || !searchTerm) return
    
    let replaceCount = 0
    const processedElements = new Set<string>()
    
    try {
      results.forEach((result) => {
        const elementKey = `${result.docId}-${result.pageIndex}-${result.elementId}`
        if (processedElements.has(elementKey)) return
        
        const doc = documents.find(d => d.id === result.docId)
        if (!doc) return
        
        const page = doc.pages[result.pageIndex]
        const element = page.elements.find(el => el.id === result.elementId) as TextElement
        if (!element) return
        
        let newText: string
        
        if (useRegex) {
          const regex = new RegExp(searchTerm, caseSensitive ? 'g' : 'gi')
          newText = element.data.content.replace(regex, replaceTerm)
        } else {
          const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          newText = element.data.content.replace(
            new RegExp(escapedTerm, caseSensitive ? 'g' : 'gi'),
            replaceTerm
          )
        }
        
        if (newText !== element.data.content) {
          onReplaceText(result.docId, result.pageIndex, result.elementId, newText)
          processedElements.add(elementKey)
          replaceCount++
        }
      })
      
      toast.success(`Replaced ${replaceCount} occurrence${replaceCount !== 1 ? 's' : ''}`)
      
      setTimeout(() => performSearch(), 100)
    } catch (error) {
      toast.error('Replace all failed: Invalid pattern')
    }
  }

  const handleSelectPattern = (pattern: RegexPattern) => {
    setSearchTerm(pattern.pattern)
    setUseRegex(true)
    setWholeWord(false)
    setPatternLibraryOpen(false)
    toast.success(`Applied pattern: ${pattern.name}`)
  }

  const handleSavePattern = () => {
    if (!searchTerm || !useRegex) {
      toast.error('Please enter a valid regex pattern first')
      return
    }
    
    if (!newPatternName.trim()) {
      toast.error('Pattern name is required')
      return
    }

    try {
      new RegExp(searchTerm)
    } catch (error) {
      toast.error('Invalid regex pattern - cannot save')
      return
    }

    const examples = newPatternExamples
      .split('\n')
      .map(ex => ex.trim())
      .filter(ex => ex.length > 0)

    if (examples.length === 0) {
      toast.error('Please provide at least one example')
      return
    }

    const newPattern: RegexPattern = {
      id: `custom-${Date.now()}`,
      name: newPatternName.trim(),
      pattern: searchTerm,
      description: newPatternDescription.trim() || 'Custom pattern',
      category: 'custom',
      examples: examples,
      isCustom: true
    }

    setCustomPatterns((current) => [...(current || []), newPattern])
    
    setNewPatternName('')
    setNewPatternDescription('')
    setNewPatternExamples('')
    setShowSaveDialog(false)
    
    toast.success('Pattern saved successfully!')
  }

  const handleDeletePattern = (patternId: string) => {
    setCustomPatterns((current) => (current || []).filter(p => p.id !== patternId))
    toast.success('Pattern deleted')
  }

  const handleReplaceAllSuggestions = () => {
    if (!searchTerm || !useRegex || !replaceTerm) {
      toast.error('Please enter both a regex search pattern and replacement text')
      return
    }

    if (results.length === 0) {
      toast.error('No matches found to replace')
      return
    }

    try {
      new RegExp(searchTerm)
    } catch (error) {
      toast.error('Invalid regex pattern')
      return
    }

    const processedElements = new Set<string>()
    let totalReplacements = 0

    results.forEach((result) => {
      const elementKey = `${result.docId}-${result.pageIndex}-${result.elementId}`
      if (processedElements.has(elementKey)) return

      const doc = documents.find(d => d.id === result.docId)
      if (!doc) return

      const page = doc.pages[result.pageIndex]
      const element = page.elements.find(el => el.id === result.elementId) as TextElement
      if (!element) return

      const regex = new RegExp(searchTerm, caseSensitive ? 'g' : 'gi')
      const matches = element.data.content.match(regex)
      const matchCount = matches ? matches.length : 0

      if (matchCount > 0) {
        const newText = element.data.content.replace(regex, replaceTerm)
        
        if (newText !== element.data.content) {
          onReplaceText(result.docId, result.pageIndex, result.elementId, newText)
          processedElements.add(elementKey)
          totalReplacements += matchCount
        }
      }
    })

    if (totalReplacements > 0) {
      toast.success(`✨ Applied ${totalReplacements} replacement${totalReplacements !== 1 ? 's' : ''} across ${processedElements.size} element${processedElements.size !== 1 ? 's' : ''}`)
      setTimeout(() => performSearch(), 100)
    } else {
      toast.info('No changes were made')
    }
  }

  const allPatterns = [...(customPatterns || []), ...REGEX_PATTERNS]

  const renderHighlightedText = (result: SearchResult) => {
    const { text, highlightStart, highlightEnd } = result
    const before = text.substring(0, highlightStart)
    const match = text.substring(highlightStart, highlightEnd)
    const after = text.substring(highlightEnd)
    
    const contextBefore = before.length > 30 ? '...' + before.slice(-30) : before
    const contextAfter = after.length > 30 ? after.slice(0, 30) + '...' : after
    
    return (
      <span className="text-sm">
        <span className="text-muted-foreground">{contextBefore}</span>
        <span className="bg-accent text-accent-foreground font-semibold px-1 rounded">{match}</span>
        <span className="text-muted-foreground">{contextAfter}</span>
      </span>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MagnifyingGlass size={24} weight="bold" />
            Find and Replace
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search-input" className="text-xs flex items-center justify-between">
                  <span>Search for</span>
                  <div className="flex items-center gap-2">
                    {useRegex && (
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Regex mode • Syntax highlighted
                      </span>
                    )}
                    {useRegex && searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-2 text-[10px]"
                        onClick={() => setShowSaveDialog(true)}
                        title="Save this pattern"
                      >
                        <FloppyDisk size={12} weight="bold" className="mr-1" />
                        Save
                      </Button>
                    )}
                    <Popover open={patternLibraryOpen} onOpenChange={setPatternLibraryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 text-[10px]"
                          title="Pattern Library"
                        >
                          <BookOpen size={12} weight="bold" className="mr-1" />
                          Patterns
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[500px] p-0" align="end">
                        <div className="p-3 border-b">
                          <h4 className="font-semibold text-sm mb-1">Regex Pattern Library</h4>
                          <p className="text-xs text-muted-foreground">
                            Quick access to preset and custom regex patterns
                          </p>
                        </div>
                        <Tabs defaultValue="custom" className="w-full">
                          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                            {PATTERN_CATEGORIES.map((category) => (
                              <TabsTrigger
                                key={category.id}
                                value={category.id}
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
                              >
                                <span className="mr-1">{category.icon}</span>
                                {category.label}
                                {category.id === 'custom' && customPatterns && customPatterns.length > 0 && (
                                  <Badge variant="secondary" className="ml-1 text-[9px] h-4 px-1">
                                    {customPatterns.length}
                                  </Badge>
                                )}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          
                          {PATTERN_CATEGORIES.map((category) => (
                            <TabsContent key={category.id} value={category.id} className="m-0">
                              <ScrollArea className="h-[300px]">
                                <div className="p-2 space-y-1">
                                  {category.id === 'custom' && (!customPatterns || customPatterns.length === 0) && (
                                    <div className="p-8 text-center">
                                      <p className="text-sm text-muted-foreground mb-3">
                                        No custom patterns saved yet
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Enter a regex pattern in the search field and click "Save" to create a custom pattern
                                      </p>
                                    </div>
                                  )}
                                  {allPatterns.filter(p => p.category === category.id).map((pattern) => (
                                    <div
                                      key={pattern.id}
                                      className="w-full text-left p-3 rounded-md border bg-card hover:bg-accent transition-colors group relative"
                                    >
                                      <button
                                        onClick={() => handleSelectPattern(pattern)}
                                        className="w-full text-left"
                                      >
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                          <span className="font-semibold text-sm">{pattern.name}</span>
                                          <Badge variant="outline" className="text-[10px] font-mono">
                                            .*
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">
                                          {pattern.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {pattern.examples.slice(0, 2).map((example, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-[10px] font-mono">
                                              {example}
                                            </Badge>
                                          ))}
                                        </div>
                                      </button>
                                      {pattern.isCustom && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeletePattern(pattern.id)
                                          }}
                                          title="Delete pattern"
                                        >
                                          <Trash size={14} weight="bold" className="text-destructive" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </PopoverContent>
                    </Popover>
                  </div>
                </Label>
                {useRegex ? (
                  <RegexInput
                    id="search-input"
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Enter regex pattern... e.g. \d{3}-\d{4}"
                    className={`mt-1 ${regexError ? 'border-destructive' : ''}`}
                    autoFocus
                  />
                ) : (
                  <Input
                    id="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter text to find..."
                    className="mt-1"
                    autoFocus
                  />
                )}
                {regexError && (
                  <p className="text-xs text-destructive mt-1">
                    Invalid regex: {regexError}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col justify-end gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={results.length === 0}
                  title="Previous result"
                >
                  <ArrowUp size={16} weight="bold" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={results.length === 0}
                  title="Next result"
                >
                  <ArrowDown size={16} weight="bold" />
                </Button>
              </div>
            </div>

            {showReplace && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="replace-input" className="text-xs flex items-center justify-between">
                    <span>Replace with</span>
                    {useRegex && (
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Use $1, $2 for capture groups
                      </span>
                    )}
                  </Label>
                  <Input
                    id="replace-input"
                    value={replaceTerm}
                    onChange={(e) => setReplaceTerm(e.target.value)}
                    placeholder={useRegex ? "e.g. $1-$2 or replacement text" : "Enter replacement text..."}
                    className="mt-1 font-mono"
                  />
                </div>
                
                <div className="flex flex-col justify-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReplace}
                    disabled={results.length === 0}
                    className="whitespace-nowrap"
                  >
                    Replace
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReplaceAll}
                    disabled={results.length === 0}
                    className="whitespace-nowrap"
                  >
                    <ArrowsClockwise size={14} weight="bold" className="mr-1" />
                    All
                  </Button>
                </div>
              </div>
            )}

            {showReplace && useRegex && results.length > 0 && (
              <div className="flex items-center justify-center pt-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleReplaceAllSuggestions}
                  disabled={results.length === 0 || !replaceTerm}
                  className="gap-2"
                >
                  <Lightning size={16} weight="fill" />
                  Replace All {results.length} Suggestion{results.length !== 1 ? 's' : ''}
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="case-sensitive"
                    checked={caseSensitive}
                    onCheckedChange={(checked) => setCaseSensitive(checked as boolean)}
                  />
                  <Label htmlFor="case-sensitive" className="text-sm cursor-pointer">
                    Match case
                  </Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="whole-word"
                    checked={wholeWord}
                    onCheckedChange={(checked) => setWholeWord(checked as boolean)}
                    disabled={useRegex}
                  />
                  <Label htmlFor="whole-word" className={`text-sm cursor-pointer ${useRegex ? 'opacity-50' : ''}`}>
                    Whole word
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="use-regex"
                    checked={useRegex}
                    onCheckedChange={(checked) => {
                      setUseRegex(checked as boolean)
                      if (checked) {
                        setWholeWord(false)
                      }
                    }}
                  />
                  <Label htmlFor="use-regex" className="text-sm cursor-pointer flex items-center gap-1">
                    <Asterisk size={14} weight="bold" />
                    Regex
                  </Label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {results.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {currentResultIndex + 1} of {results.length}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplace(!showReplace)}
                  className="text-xs"
                >
                  {showReplace ? 'Hide' : 'Show'} Replace
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">
                Results {results.length > 0 && `(${results.length})`}
              </Label>
            </div>
            
            <ScrollArea className="flex-1 border rounded-md">
              {results.length === 0 && searchTerm && (
                <div className="p-8 text-center text-muted-foreground">
                  No matches found
                </div>
              )}
              
              {results.length === 0 && !searchTerm && (
                <div className="p-8 text-center text-muted-foreground">
                  Enter search terms to find text across all pages
                </div>
              )}
              
              <div className="p-2 space-y-1">
                {results.map((result, index) => {
                  const doc = documents.find(d => d.id === result.docId)
                  const isActive = index === currentResultIndex
                  
                  return (
                    <button
                      key={`${result.docId}-${result.pageIndex}-${result.elementId}-${index}`}
                      onClick={() => navigateToResult(index)}
                      className={`w-full text-left p-3 rounded-md border transition-all ${
                        isActive
                          ? 'bg-accent border-accent-foreground/20 shadow-sm'
                          : 'bg-card hover:bg-accent/50 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          Page {result.pageIndex + 1}
                        </span>
                        {isActive && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="break-words">
                        {renderHighlightedText(result)}
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FloppyDisk size={24} weight="bold" />
              Save Custom Pattern
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="pattern-name" className="text-sm">Pattern Name*</Label>
              <Input
                id="pattern-name"
                value={newPatternName}
                onChange={(e) => setNewPatternName(e.target.value)}
                placeholder="e.g. Custom Invoice Number"
                className="mt-1"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="pattern-description" className="text-sm">Description</Label>
              <Input
                id="pattern-description"
                value={newPatternDescription}
                onChange={(e) => setNewPatternDescription(e.target.value)}
                placeholder="Brief description of what this pattern matches"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="pattern-preview" className="text-sm">Pattern</Label>
              <div className="mt-1 p-3 bg-muted rounded-md">
                <code className="text-sm font-mono break-all">{searchTerm}</code>
              </div>
            </div>

            <div>
              <Label htmlFor="pattern-examples" className="text-sm">
                Example Matches* <span className="text-xs text-muted-foreground font-normal">(one per line)</span>
              </Label>
              <Textarea
                id="pattern-examples"
                value={newPatternExamples}
                onChange={(e) => setNewPatternExamples(e.target.value)}
                placeholder="example@email.com&#10;user@domain.org&#10;test@site.net"
                className="mt-1 font-mono text-sm"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter examples of text that should match your pattern
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePattern}
                disabled={!newPatternName.trim() || !newPatternExamples.trim()}
              >
                <FloppyDisk size={16} weight="bold" className="mr-2" />
                Save Pattern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

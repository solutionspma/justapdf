import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PaperPlaneRight } from '@phosphor-icons/react'
import type { PDFElement, NoteReply } from '@/lib/types'
import { snapPointToGrid, snapRectToGrid, type GridSettings } from '@/lib/snapToGrid'
import { ContextMenu } from '@/components/ContextMenu'

interface DraggableElementProps {
  element: PDFElement
  isSelected: boolean
  zoom: number
  gridSettings: GridSettings
  onSelect: () => void
  onUpdate: (updates: Partial<PDFElement>) => void
  onDelete: () => void
  onDuplicate?: () => void
  onBringToFront?: () => void
  onSendToBack?: () => void
}

export function DraggableElement({
  element,
  isSelected,
  zoom,
  gridSettings,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isEditingText, setIsEditingText] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [replyText, setReplyText] = useState('')
  const [flippedH, setFlippedH] = useState(false)
  const [flippedV, setFlippedV] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 })
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0 })
  const textInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditingText && textInputRef.current) {
      textInputRef.current.focus()
      textInputRef.current.select()
    }
  }, [isEditingText])

  useEffect(() => {
    if (!isDragging && !isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isEditingText) {
        const deltaX = (e.clientX - dragStartPos.current.x) / zoom
        const deltaY = (e.clientY - dragStartPos.current.y) / zoom
        
        let newX = dragStartPos.current.elementX + deltaX
        let newY = dragStartPos.current.elementY + deltaY
        
        const snapped = snapPointToGrid(newX, newY, gridSettings.size, gridSettings.enabled)
        
        onUpdate({
          x: snapped.x,
          y: snapped.y
        })
      } else if (isResizing && resizeHandle) {
        const deltaX = (e.clientX - resizeStartPos.current.x) / zoom
        const deltaY = (e.clientY - resizeStartPos.current.y) / zoom

        const updates: Partial<PDFElement> = {}

        if (resizeHandle.includes('e')) {
          updates.width = Math.max(20, resizeStartPos.current.width + deltaX)
        }
        if (resizeHandle.includes('w')) {
          const newWidth = Math.max(20, resizeStartPos.current.width - deltaX)
          updates.width = newWidth
          updates.x = resizeStartPos.current.elementX + (resizeStartPos.current.width - newWidth)
        }
        if (resizeHandle.includes('s')) {
          updates.height = Math.max(20, resizeStartPos.current.height + deltaY)
        }
        if (resizeHandle.includes('n')) {
          const newHeight = Math.max(20, resizeStartPos.current.height - deltaY)
          updates.height = newHeight
          updates.y = resizeStartPos.current.elementY + (resizeStartPos.current.height - newHeight)
        }

        const snapped = snapRectToGrid(
          updates.x !== undefined ? updates.x : element.x,
          updates.y !== undefined ? updates.y : element.y,
          updates.width !== undefined ? updates.width : element.width,
          updates.height !== undefined ? updates.height : element.height,
          gridSettings.size,
          gridSettings.enabled
        )

        onUpdate({
          x: snapped.x,
          y: snapped.y,
          width: snapped.width,
          height: snapped.height
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeHandle(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, resizeHandle, isEditingText, onUpdate, zoom])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditingText) return
    e.stopPropagation()
    e.preventDefault()
    onSelect()
    
    setIsDragging(true)
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: element.x,
      elementY: element.y
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (element.type === 'text' || element.type === 'note') {
      setIsEditingText(true)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      data: { ...element.data, content: e.target.value }
    })
  }

  const handleTextBlur = () => {
    setIsEditingText(false)
  }

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setIsEditingText(false)
      e.preventDefault()
    }
    e.stopPropagation()
  }

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation()
    onSelect()
    
    setIsResizing(true)
    setResizeHandle(handle)
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
      elementX: element.x,
      elementY: element.y
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      onDelete()
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleDuplicateFromMenu = () => {
    if (onDuplicate) onDuplicate()
  }

  const handleBringToFrontFromMenu = () => {
    if (onBringToFront) onBringToFront()
  }

  const handleSendToBackFromMenu = () => {
    if (onSendToBack) onSendToBack()
  }

  const handleFlipHorizontal = () => {
    setFlippedH(!flippedH)
  }

  const handleFlipVertical = () => {
    setFlippedV(!flippedV)
  }

  const handleAddReply = () => {
    if (!replyText.trim() || element.type !== 'note') return
    
    const newReply: NoteReply = {
      id: `reply-${Date.now()}`,
      author: 'You',
      content: replyText.trim(),
      createdAt: new Date().toISOString()
    }

    const currentReplies = element.data.replies || []
    onUpdate({
      data: {
        ...element.data,
        replies: [...currentReplies, newReply]
      }
    })
    setReplyText('')
  }

  return (
    <>
      <div
        className={cn(
          "absolute group transition-all",
          isSelected ? "ring-2 ring-accent" : "hover:ring-1 hover:ring-accent/50",
          (isDragging || isResizing) && "cursor-move"
        )}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          transform: `rotate(${element.rotation}deg) scaleX(${flippedH ? -1 : 1}) scaleY(${flippedV ? -1 : 1})`,
          zIndex: element.zIndex,
          cursor: isDragging ? 'move' : isEditingText ? 'text' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
        tabIndex={0}
      >
      {element.type === 'text' && (
        <>
          {isEditingText ? (
            <textarea
              ref={textInputRef}
              className="w-full h-full px-2 py-1 border-0 outline-none resize-none bg-white/90 shadow-lg"
              style={{
                fontSize: element.data.fontSize,
                fontFamily: element.data.fontFamily,
                color: element.data.color,
                fontWeight: element.data.bold ? 'bold' : 'normal',
                fontStyle: element.data.italic ? 'italic' : 'normal',
                lineHeight: element.data.lineHeight ? `${element.data.lineHeight}px` : '1.4',
                textAlign: element.data.align || 'left',
                overflow: 'auto',
                minHeight: '100%'
              }}
              value={element.data.content}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              onKeyDown={handleTextKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="w-full h-full select-none relative overflow-visible"
              style={{
                fontSize: element.data.fontSize,
                fontFamily: element.data.fontFamily,
                color: element.data.color,
                fontWeight: element.data.bold ? 'bold' : 'normal',
                fontStyle: element.data.italic ? 'italic' : 'normal',
                lineHeight: element.data.lineHeight ? `${element.data.lineHeight}px` : (element.data.isMerged ? '1.4' : '1'),
                padding: element.data.isExtracted && !element.data.isMerged ? '0' : '0.5rem',
                letterSpacing: element.data.letterSpacing ? `${element.data.letterSpacing}px` : 'normal',
                wordSpacing: element.data.wordSpacing ? `${element.data.wordSpacing}px` : 'normal',
                textAlign: element.data.align || 'left',
                whiteSpace: element.data.isMerged ? 'pre-wrap' : (element.data.align === 'justify' ? 'normal' : 'nowrap')
              }}
            >
              {element.data.content}
              {isSelected && !isEditingText && (
                <span className="absolute -top-6 left-0 text-xs text-muted-foreground bg-accent/10 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {element.data.isMerged ? '✓ Merged block - Double-click to edit' : 'Double-click to edit'}
                </span>
              )}
              {element.data.isMerged && !isSelected && (
                <span className="absolute -top-5 -left-1 text-[10px] text-accent font-mono bg-accent/10 px-1 rounded opacity-50 pointer-events-none">
                  M
                </span>
              )}
            </div>
          )}
        </>
      )}
      
      {element.type === 'image' && (
        <img
          src={element.data.src}
          alt="Added image"
          className="w-full h-full object-contain pointer-events-none"
          style={{ opacity: element.data.opacity }}
        />
      )}
      
      {element.type === 'signature' && (
        <img
          src={element.data.src}
          alt="Signature"
          className="w-full h-full object-contain pointer-events-none"
        />
      )}
      
      {element.type === 'form' && (
        <input
          type="text"
          className="w-full h-full px-2 border-0 outline-none bg-blue-50/50"
          placeholder={element.data.placeholder}
          value={element.data.value as string}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            onUpdate({
              data: { ...element.data, value: e.target.value }
            })
          }}
        />
      )}

      {element.type === 'highlight' && (
        <div
          className="w-full h-full rounded pointer-events-none"
          style={{
            backgroundColor: element.data.color,
            opacity: element.data.opacity
          }}
        />
      )}

      {element.type === 'note' && (
        <div
          className="w-full h-full flex flex-col rounded-lg shadow-lg overflow-hidden"
          style={{
            backgroundColor: element.data.color
          }}
        >
          <div className="flex items-center justify-between px-3 py-2 bg-black/10">
            <span className="text-xs font-medium text-white/90">
              {element.data.author || 'Note'}
            </span>
            <span className="text-xs text-white/70">
              {new Date(element.data.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            {isEditingText ? (
              <textarea
                ref={textInputRef}
                className="flex-1 px-3 py-2 border-0 outline-none resize-none bg-white/90"
                style={{
                  fontSize: 14,
                  lineHeight: '1.5'
                }}
                value={element.data.content}
                onChange={handleTextChange}
                onBlur={handleTextBlur}
                onKeyDown={handleTextKeyDown}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <div
                  className="px-3 py-2 text-sm bg-white/90 overflow-auto"
                  style={{
                    wordWrap: 'break-word',
                    lineHeight: '1.5'
                  }}
                >
                  {element.data.content}
                  {isSelected && !isEditingText && (
                    <span className="absolute -top-6 left-0 text-xs text-muted-foreground bg-accent/10 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Double-click to edit
                    </span>
                  )}
                </div>
                {element.data.replies && element.data.replies.length > 0 && (
                  <div className="border-t border-black/10 bg-white/80 max-h-24 overflow-y-auto">
                    {element.data.replies.map((reply) => (
                      <div key={reply.id} className="px-3 py-2 text-xs border-b border-black/5 last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{reply.author}</span>
                          <span className="text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-foreground/80">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                {isSelected && (
                  <div className="border-t border-black/10 bg-white/90 p-2 flex gap-1"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Input
                      placeholder="Add reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleAddReply()
                        }
                        e.stopPropagation()
                      }}
                      className="h-7 text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddReply}
                      disabled={!replyText.trim()}
                      className="h-7 px-2"
                    >
                      <PaperPlaneRight size={14} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {isSelected && !isEditingText && (
        <>
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-accent border border-white rounded-full cursor-nw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent border border-white rounded-full cursor-n-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-accent border border-white rounded-full cursor-ne-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-accent border border-white rounded-full cursor-e-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent border border-white rounded-full cursor-se-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent border border-white rounded-full cursor-s-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-accent border border-white rounded-full cursor-sw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-accent border border-white rounded-full cursor-w-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
          />
        </>
      )}
    </div>

    {contextMenu && (
      <ContextMenu
        element={element}
        position={contextMenu}
        onClose={() => setContextMenu(null)}
        onDuplicate={handleDuplicateFromMenu}
        onDelete={onDelete}
        onBringToFront={handleBringToFrontFromMenu}
        onSendToBack={handleSendToBackFromMenu}
        onFlipHorizontal={handleFlipHorizontal}
        onFlipVertical={handleFlipVertical}
      />
    )}
  </>
  )
}

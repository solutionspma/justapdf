import { useEffect, useRef } from 'react'
import { Copy, Trash, ArrowsOutSimple, ArrowsInSimple, FlipHorizontal, FlipVertical } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import type { PDFElement } from '@/lib/types'

interface ContextMenuProps {
  element: PDFElement
  position: { x: number; y: number }
  onClose: () => void
  onDuplicate: () => void
  onDelete: () => void
  onBringToFront: () => void
  onSendToBack: () => void
  onFlipHorizontal: () => void
  onFlipVertical: () => void
}

export function ContextMenu({
  element,
  position,
  onClose,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack,
  onFlipHorizontal,
  onFlipVertical
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const menuItems = [
    { label: 'Duplicate', icon: Copy, action: onDuplicate },
    { label: 'Bring to Front', icon: ArrowsOutSimple, action: onBringToFront },
    { label: 'Send to Back', icon: ArrowsInSimple, action: onSendToBack },
  ]

  if (element.type === 'image' || element.type === 'signature') {
    menuItems.push(
      { label: 'Flip Horizontal', icon: FlipHorizontal, action: onFlipHorizontal },
      { label: 'Flip Vertical', icon: FlipVertical, action: onFlipVertical }
    )
  }

  menuItems.push({ label: 'Delete', icon: Trash, action: onDelete })

  return (
    <div
      ref={menuRef}
      className="fixed bg-popover border border-border rounded-lg shadow-lg py-1 z-[9999] min-w-[180px]"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      {menuItems.map((item, index) => {
        const Icon = item.icon
        return (
          <button
            key={index}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => {
              item.action()
              onClose()
            }}
          >
            <Icon size={16} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

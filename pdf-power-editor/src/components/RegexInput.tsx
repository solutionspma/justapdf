import { useRef, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface RegexInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  id?: string
}

interface HighlightSegment {
  text: string
  type: 'normal' | 'quantifier' | 'group' | 'character-class' | 'anchor' | 'escape' | 'alternation' | 'special'
}

function parseRegexForHighlighting(pattern: string): HighlightSegment[] {
  const segments: HighlightSegment[] = []
  let i = 0
  
  while (i < pattern.length) {
    const char = pattern[i]
    
    if (char === '\\' && i + 1 < pattern.length) {
      const nextChar = pattern[i + 1]
      if (/[dDwWsSnrtfv0\\]/.test(nextChar)) {
        segments.push({ text: char + nextChar, type: 'escape' })
        i += 2
      } else if (nextChar === 'b' || nextChar === 'B') {
        segments.push({ text: char + nextChar, type: 'anchor' })
        i += 2
      } else {
        segments.push({ text: char + nextChar, type: 'escape' })
        i += 2
      }
    }
    else if (char === '^' || char === '$') {
      segments.push({ text: char, type: 'anchor' })
      i++
    }
    else if (char === '*' || char === '+' || char === '?') {
      segments.push({ text: char, type: 'quantifier' })
      i++
    }
    else if (char === '{') {
      let j = i + 1
      while (j < pattern.length && pattern[j] !== '}') j++
      if (j < pattern.length) {
        segments.push({ text: pattern.substring(i, j + 1), type: 'quantifier' })
        i = j + 1
      } else {
        segments.push({ text: char, type: 'normal' })
        i++
      }
    }
    else if (char === '(' || char === ')') {
      segments.push({ text: char, type: 'group' })
      i++
    }
    else if (char === '[') {
      let j = i + 1
      let escaped = false
      while (j < pattern.length) {
        if (pattern[j] === '\\' && !escaped) {
          escaped = true
          j++
          continue
        }
        if (pattern[j] === ']' && !escaped) {
          break
        }
        escaped = false
        j++
      }
      if (j < pattern.length) {
        segments.push({ text: pattern.substring(i, j + 1), type: 'character-class' })
        i = j + 1
      } else {
        segments.push({ text: char, type: 'normal' })
        i++
      }
    }
    else if (char === '|') {
      segments.push({ text: char, type: 'alternation' })
      i++
    }
    else if (char === '.') {
      segments.push({ text: char, type: 'special' })
      i++
    }
    else {
      let j = i
      while (
        j < pattern.length && 
        !/[\\^$*+?{}()[\]|.]/.test(pattern[j])
      ) {
        j++
      }
      segments.push({ text: pattern.substring(i, j), type: 'normal' })
      i = j
    }
  }
  
  return segments
}

export function RegexInput({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
  id
}: RegexInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  
  const segments = parseRegexForHighlighting(value)
  
  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    
    const handleScroll = () => {
      setScrollLeft(input.scrollLeft)
    }
    
    input.addEventListener('scroll', handleScroll)
    return () => input.removeEventListener('scroll', handleScroll)
  }, [])
  
  const getColorClass = (type: HighlightSegment['type']) => {
    switch (type) {
      case 'quantifier':
        return 'text-[oklch(0.70_0.15_70)]'
      case 'group':
        return 'text-[oklch(0.60_0.22_330)]'
      case 'character-class':
        return 'text-[oklch(0.65_0.15_150)]'
      case 'anchor':
        return 'text-[oklch(0.55_0.18_290)]'
      case 'escape':
        return 'text-[oklch(0.65_0.18_200)]'
      case 'alternation':
        return 'text-[oklch(0.70_0.15_70)]'
      case 'special':
        return 'text-[oklch(0.65_0.18_200)]'
      default:
        return 'text-foreground'
    }
  }
  
  return (
    <div className="relative">
      <div 
        ref={highlightRef}
        className="absolute inset-0 pointer-events-none overflow-hidden whitespace-pre"
        style={{
          transform: `translateX(-${scrollLeft}px)`,
        }}
      >
        <div className={cn(
          "h-full flex items-center px-3 font-mono text-sm",
          className
        )}>
          {segments.map((segment, index) => (
            <span
              key={index}
              className={cn(
                "font-semibold transition-colors",
                getColorClass(segment.type)
              )}
            >
              {segment.text}
            </span>
          ))}
        </div>
      </div>
      
      <Input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "relative bg-transparent font-mono",
          value ? "text-transparent caret-foreground" : "",
          className
        )}
        autoFocus={autoFocus}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  )
}

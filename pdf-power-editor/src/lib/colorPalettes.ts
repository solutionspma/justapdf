export interface DocumentColorPalette {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    background: string
    border: string
  }
  textColors?: {
    heading: string
    body: string
    caption: string
  }
  highlightColors?: {
    important: string
    warning: string
    info: string
    success: string
  }
  category: 'professional' | 'creative' | 'vibrant' | 'minimal' | 'custom'
}

export const DOCUMENT_COLOR_PALETTES: DocumentColorPalette[] = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional blue scheme for business documents',
    category: 'professional',
    colors: {
      primary: '#1E3A8A',
      secondary: '#3B82F6',
      accent: '#60A5FA',
      text: '#1F2937',
      background: '#FFFFFF',
      border: '#E5E7EB'
    },
    textColors: {
      heading: '#1E3A8A',
      body: '#374151',
      caption: '#6B7280'
    },
    highlightColors: {
      important: '#FEF3C7',
      warning: '#FED7AA',
      info: '#DBEAFE',
      success: '#D1FAE5'
    }
  },
  {
    id: 'executive-gray',
    name: 'Executive Gray',
    description: 'Sophisticated grayscale for formal documents',
    category: 'professional',
    colors: {
      primary: '#111827',
      secondary: '#4B5563',
      accent: '#9CA3AF',
      text: '#1F2937',
      background: '#FFFFFF',
      border: '#D1D5DB'
    },
    textColors: {
      heading: '#111827',
      body: '#374151',
      caption: '#6B7280'
    },
    highlightColors: {
      important: '#FEF3C7',
      warning: '#FED7AA',
      info: '#E5E7EB',
      success: '#D1FAE5'
    }
  },
  {
    id: 'legal-green',
    name: 'Legal Green',
    description: 'Traditional green palette for legal documents',
    category: 'professional',
    colors: {
      primary: '#065F46',
      secondary: '#059669',
      accent: '#34D399',
      text: '#1F2937',
      background: '#FFFFFF',
      border: '#D1D5DB'
    },
    textColors: {
      heading: '#065F46',
      body: '#374151',
      caption: '#6B7280'
    },
    highlightColors: {
      important: '#FEF3C7',
      warning: '#FED7AA',
      info: '#DBEAFE',
      success: '#D1FAE5'
    }
  },
  {
    id: 'financial-navy',
    name: 'Financial Navy',
    description: 'Conservative navy for financial reports',
    category: 'professional',
    colors: {
      primary: '#1E3A8A',
      secondary: '#1E40AF',
      accent: '#3B82F6',
      text: '#111827',
      background: '#F9FAFB',
      border: '#E5E7EB'
    },
    textColors: {
      heading: '#1E3A8A',
      body: '#1F2937',
      caption: '#6B7280'
    },
    highlightColors: {
      important: '#FEF3C7',
      warning: '#FED7AA',
      info: '#DBEAFE',
      success: '#D1FAE5'
    }
  },
  {
    id: 'creative-purple',
    name: 'Creative Purple',
    description: 'Bold purple scheme for creative projects',
    category: 'creative',
    colors: {
      primary: '#7C3AED',
      secondary: '#A78BFA',
      accent: '#C4B5FD',
      text: '#1F2937',
      background: '#FFFFFF',
      border: '#E5E7EB'
    },
    textColors: {
      heading: '#6D28D9',
      body: '#374151',
      caption: '#6B7280'
    },
    highlightColors: {
      important: '#FEF3C7',
      warning: '#FED7AA',
      info: '#EDE9FE',
      success: '#D1FAE5'
    }
  },
  {
    id: 'creative-teal',
    name: 'Creative Teal',
    description: 'Fresh teal palette for modern designs',
    category: 'creative',
    colors: {
      primary: '#0D9488',
      secondary: '#14B8A6',
      accent: '#5EEAD4',
      text: '#1F2937',
      background: '#FFFFFF',
      border: '#E5E7EB'
    },
    textColors: {
      heading: '#0F766E',
      body: '#374151',
      caption: '#6B7280'
    },
    highlightColors: {
      important: '#FEF3C7',
      warning: '#FED7AA',
      info: '#CCFBF1',
      success: '#D1FAE5'
    }
  },
  {
    id: 'vibrant-sunset',
    name: 'Vibrant Sunset',
    description: 'Warm sunset colors for eye-catching documents',
    category: 'vibrant',
    colors: {
      primary: '#DC2626',
      secondary: '#F59E0B',
      accent: '#FBBF24',
      text: '#1F2937',
      background: '#FFFFFF',
      border: '#E5E7EB'
    },
    textColors: {
      heading: '#DC2626',
      body: '#374151',
      caption: '#6B7280'
    },
    highlightColors: {
      important: '#FEF3C7',
      warning: '#FED7AA',
      info: '#DBEAFE',
      success: '#D1FAE5'
    }
  },
  {
    id: 'vibrant-electric',
    name: 'Vibrant Electric',
    description: 'High-energy colors for bold statements',
    category: 'vibrant',
    colors: {
      primary: '#DB2777',
      secondary: '#EC4899',
      accent: '#F472B6',
      text: '#1F2937',
      background: '#FFFFFF',
      border: '#E5E7EB'
    },
    textColors: {
      heading: '#BE185D',
      body: '#374151',
      caption: '#6B7280'
    },
    highlightColors: {
      important: '#FCE7F3',
      warning: '#FED7AA',
      info: '#DBEAFE',
      success: '#D1FAE5'
    }
  },
  {
    id: 'minimal-black',
    name: 'Minimal Black',
    description: 'Clean black and white minimalism',
    category: 'minimal',
    colors: {
      primary: '#000000',
      secondary: '#3F3F46',
      accent: '#71717A',
      text: '#18181B',
      background: '#FFFFFF',
      border: '#E4E4E7'
    },
    textColors: {
      heading: '#000000',
      body: '#3F3F46',
      caption: '#71717A'
    },
    highlightColors: {
      important: '#FAFAFA',
      warning: '#FEF3C7',
      info: '#F4F4F5',
      success: '#F0FDF4'
    }
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Soft neutrals for subtle elegance',
    category: 'minimal',
    colors: {
      primary: '#52525B',
      secondary: '#71717A',
      accent: '#A1A1AA',
      text: '#27272A',
      background: '#FAFAFA',
      border: '#E4E4E7'
    },
    textColors: {
      heading: '#3F3F46',
      body: '#52525B',
      caption: '#71717A'
    },
    highlightColors: {
      important: '#FEF9C3',
      warning: '#FED7AA',
      info: '#F4F4F5',
      success: '#D1FAE5'
    }
  },
  {
    id: 'academic-burgundy',
    name: 'Academic Burgundy',
    description: 'Classic burgundy for educational content',
    category: 'professional',
    colors: {
      primary: '#881337',
      secondary: '#BE123C',
      accent: '#E11D48',
      text: '#1F2937',
      background: '#FFFFFF',
      border: '#E5E7EB'
    },
    textColors: {
      heading: '#881337',
      body: '#374151',
      caption: '#6B7280'
    },
    highlightColors: {
      important: '#FEF3C7',
      warning: '#FED7AA',
      info: '#DBEAFE',
      success: '#D1FAE5'
    }
  },
  {
    id: 'tech-cyan',
    name: 'Tech Cyan',
    description: 'Modern cyan for technology documents',
    category: 'creative',
    colors: {
      primary: '#0891B2',
      secondary: '#06B6D4',
      accent: '#22D3EE',
      text: '#1F2937',
      background: '#FFFFFF',
      border: '#E5E7EB'
    },
    textColors: {
      heading: '#0E7490',
      body: '#374151',
      caption: '#6B7280'
    },
    highlightColors: {
      important: '#FEF3C7',
      warning: '#FED7AA',
      info: '#CFFAFE',
      success: '#D1FAE5'
    }
  }
]

export function getPaletteById(id: string): DocumentColorPalette | undefined {
  return DOCUMENT_COLOR_PALETTES.find(p => p.id === id)
}

export function getPalettesByCategory(category: DocumentColorPalette['category']): DocumentColorPalette[] {
  return DOCUMENT_COLOR_PALETTES.filter(p => p.category === category)
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

export function getContrastColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

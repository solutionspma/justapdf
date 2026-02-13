import type { PageTemplate, PDFElement } from './types'

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'blank-letter',
    name: 'Blank Letter',
    category: 'business',
    width: 612,
    height: 792,
    elements: [],
    description: 'Standard US Letter size (8.5" x 11")'
  },
  {
    id: 'blank-a4',
    name: 'Blank A4',
    category: 'business',
    width: 595,
    height: 842,
    elements: [],
    description: 'Standard A4 size (210mm x 297mm)'
  },
  {
    id: 'business-letterhead',
    name: 'Business Letterhead',
    category: 'business',
    width: 612,
    height: 792,
    elements: [
      {
        id: 'header-company',
        type: 'text',
        x: 50,
        y: 50,
        width: 512,
        height: 40,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'COMPANY NAME',
          fontSize: 24,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.45 0.15 250)',
          bold: true,
          italic: false
        }
      },
      {
        id: 'header-address',
        type: 'text',
        x: 50,
        y: 95,
        width: 512,
        height: 20,
        rotation: 0,
        zIndex: 1,
        data: {
          content: '123 Business Street • City, State 12345 • (555) 123-4567',
          fontSize: 10,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.50 0.01 250)',
          bold: false,
          italic: false
        }
      },
      {
        id: 'body-text',
        type: 'text',
        x: 50,
        y: 150,
        width: 512,
        height: 500,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'Dear Recipient,\n\nYour content here...',
          fontSize: 12,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.20 0.01 250)',
          bold: false,
          italic: false
        }
      }
    ],
    description: 'Professional business letterhead with company header'
  },
  {
    id: 'invoice',
    name: 'Invoice Template',
    category: 'business',
    width: 612,
    height: 792,
    elements: [
      {
        id: 'invoice-title',
        type: 'text',
        x: 50,
        y: 50,
        width: 200,
        height: 40,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'INVOICE',
          fontSize: 32,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.45 0.15 250)',
          bold: true,
          italic: false
        }
      },
      {
        id: 'invoice-number',
        type: 'text',
        x: 400,
        y: 60,
        width: 162,
        height: 20,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'Invoice #: 00001',
          fontSize: 12,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.20 0.01 250)',
          bold: false,
          italic: false
        }
      },
      {
        id: 'invoice-date',
        type: 'text',
        x: 400,
        y: 85,
        width: 162,
        height: 20,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'Date: MM/DD/YYYY',
          fontSize: 12,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.20 0.01 250)',
          bold: false,
          italic: false
        }
      },
      {
        id: 'bill-to',
        type: 'text',
        x: 50,
        y: 120,
        width: 250,
        height: 100,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'Bill To:\nClient Name\nAddress Line 1\nCity, State ZIP',
          fontSize: 12,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.20 0.01 250)',
          bold: false,
          italic: false
        }
      },
      {
        id: 'items-header',
        type: 'shape',
        x: 50,
        y: 240,
        width: 512,
        height: 30,
        rotation: 0,
        zIndex: 0,
        data: {
          shapeType: 'rectangle',
          color: 'oklch(0.45 0.15 250)',
          fillColor: 'oklch(0.45 0.15 250)',
          strokeWidth: 1,
          filled: true,
          opacity: 0.1
        }
      },
      {
        id: 'items-text',
        type: 'text',
        x: 55,
        y: 247,
        width: 502,
        height: 20,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'Description                                                    Qty        Rate        Amount',
          fontSize: 10,
          fontFamily: 'JetBrains Mono',
          color: 'oklch(0.20 0.01 250)',
          bold: true,
          italic: false
        }
      }
    ],
    description: 'Professional invoice template with structured layout'
  },
  {
    id: 'contract',
    name: 'Contract Template',
    category: 'legal',
    width: 612,
    height: 792,
    elements: [
      {
        id: 'contract-title',
        type: 'text',
        x: 50,
        y: 50,
        width: 512,
        height: 40,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'AGREEMENT',
          fontSize: 24,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.20 0.01 250)',
          bold: true,
          italic: false
        }
      },
      {
        id: 'contract-date',
        type: 'text',
        x: 50,
        y: 100,
        width: 512,
        height: 20,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'This Agreement is entered into on [DATE] between:',
          fontSize: 11,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.20 0.01 250)',
          bold: false,
          italic: false
        }
      },
      {
        id: 'party-1',
        type: 'text',
        x: 50,
        y: 130,
        width: 512,
        height: 40,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'Party 1: [NAME]\n[ADDRESS]',
          fontSize: 11,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.20 0.01 250)',
          bold: false,
          italic: false
        }
      },
      {
        id: 'party-2',
        type: 'text',
        x: 50,
        y: 180,
        width: 512,
        height: 40,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'Party 2: [NAME]\n[ADDRESS]',
          fontSize: 11,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.20 0.01 250)',
          bold: false,
          italic: false
        }
      },
      {
        id: 'signature-line-1',
        type: 'shape',
        x: 50,
        y: 700,
        width: 200,
        height: 1,
        rotation: 0,
        zIndex: 1,
        data: {
          shapeType: 'line',
          color: 'oklch(0.20 0.01 250)',
          strokeWidth: 1,
          filled: false,
          opacity: 1
        }
      },
      {
        id: 'signature-label-1',
        type: 'text',
        x: 50,
        y: 705,
        width: 200,
        height: 20,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'Party 1 Signature',
          fontSize: 9,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.50 0.01 250)',
          bold: false,
          italic: false
        }
      },
      {
        id: 'signature-line-2',
        type: 'shape',
        x: 362,
        y: 700,
        width: 200,
        height: 1,
        rotation: 0,
        zIndex: 1,
        data: {
          shapeType: 'line',
          color: 'oklch(0.20 0.01 250)',
          strokeWidth: 1,
          filled: false,
          opacity: 1
        }
      },
      {
        id: 'signature-label-2',
        type: 'text',
        x: 362,
        y: 705,
        width: 200,
        height: 20,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'Party 2 Signature',
          fontSize: 9,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.50 0.01 250)',
          bold: false,
          italic: false
        }
      }
    ],
    description: 'Legal contract template with signature lines'
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    category: 'business',
    width: 612,
    height: 792,
    elements: [
      {
        id: 'meeting-title',
        type: 'text',
        x: 50,
        y: 50,
        width: 512,
        height: 40,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'MEETING NOTES',
          fontSize: 24,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.45 0.15 250)',
          bold: true,
          italic: false
        }
      },
      {
        id: 'meeting-date',
        type: 'text',
        x: 50,
        y: 100,
        width: 250,
        height: 20,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'Date: _______________',
          fontSize: 12,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.20 0.01 250)',
          bold: false,
          italic: false
        }
      },
      {
        id: 'meeting-attendees',
        type: 'text',
        x: 50,
        y: 125,
        width: 512,
        height: 20,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'Attendees: _______________________________________________',
          fontSize: 12,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.20 0.01 250)',
          bold: false,
          italic: false
        }
      },
      {
        id: 'agenda',
        type: 'text',
        x: 50,
        y: 170,
        width: 512,
        height: 120,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'AGENDA\n\n1. Topic One\n2. Topic Two\n3. Topic Three',
          fontSize: 12,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.20 0.01 250)',
          bold: false,
          italic: false
        }
      },
      {
        id: 'notes',
        type: 'text',
        x: 50,
        y: 310,
        width: 512,
        height: 300,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'NOTES\n\n',
          fontSize: 12,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.20 0.01 250)',
          bold: false,
          italic: false
        }
      },
      {
        id: 'action-items',
        type: 'text',
        x: 50,
        y: 630,
        width: 512,
        height: 100,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'ACTION ITEMS\n\n☐ \n☐ \n☐ ',
          fontSize: 12,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.20 0.01 250)',
          bold: false,
          italic: false
        }
      }
    ],
    description: 'Structured meeting notes template with agenda and action items'
  },
  {
    id: 'resume',
    name: 'Resume Template',
    category: 'personal',
    width: 612,
    height: 792,
    elements: [
      {
        id: 'name',
        type: 'text',
        x: 50,
        y: 50,
        width: 512,
        height: 40,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'YOUR NAME',
          fontSize: 28,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.45 0.15 250)',
          bold: true,
          italic: false
        }
      },
      {
        id: 'contact',
        type: 'text',
        x: 50,
        y: 95,
        width: 512,
        height: 20,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'email@example.com • (555) 123-4567 • City, State',
          fontSize: 11,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.50 0.01 250)',
          bold: false,
          italic: false
        }
      },
      {
        id: 'experience-header',
        type: 'text',
        x: 50,
        y: 140,
        width: 512,
        height: 25,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'EXPERIENCE',
          fontSize: 16,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.45 0.15 250)',
          bold: true,
          italic: false
        }
      },
      {
        id: 'experience-divider',
        type: 'shape',
        x: 50,
        y: 168,
        width: 512,
        height: 2,
        rotation: 0,
        zIndex: 1,
        data: {
          shapeType: 'line',
          color: 'oklch(0.45 0.15 250)',
          strokeWidth: 2,
          filled: false,
          opacity: 1
        }
      },
      {
        id: 'education-header',
        type: 'text',
        x: 50,
        y: 400,
        width: 512,
        height: 25,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'EDUCATION',
          fontSize: 16,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.45 0.15 250)',
          bold: true,
          italic: false
        }
      },
      {
        id: 'education-divider',
        type: 'shape',
        x: 50,
        y: 428,
        width: 512,
        height: 2,
        rotation: 0,
        zIndex: 1,
        data: {
          shapeType: 'line',
          color: 'oklch(0.45 0.15 250)',
          strokeWidth: 2,
          filled: false,
          opacity: 1
        }
      },
      {
        id: 'skills-header',
        type: 'text',
        x: 50,
        y: 550,
        width: 512,
        height: 25,
        rotation: 0,
        zIndex: 1,
        data: {
          content: 'SKILLS',
          fontSize: 16,
          fontFamily: 'Space Grotesk',
          color: 'oklch(0.45 0.15 250)',
          bold: true,
          italic: false
        }
      },
      {
        id: 'skills-divider',
        type: 'shape',
        x: 50,
        y: 578,
        width: 512,
        height: 2,
        rotation: 0,
        zIndex: 1,
        data: {
          shapeType: 'line',
          color: 'oklch(0.45 0.15 250)',
          strokeWidth: 2,
          filled: false,
          opacity: 1
        }
      }
    ],
    description: 'Professional resume template with organized sections'
  }
]

export const TEMPLATE_CATEGORIES = [
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'legal', label: 'Legal', icon: '⚖️' },
  { id: 'personal', label: 'Personal', icon: '👤' },
  { id: 'custom', label: 'Custom', icon: '✨' }
] as const

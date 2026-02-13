export interface RegexPattern {
  id: string
  name: string
  pattern: string
  description: string
  category: 'common' | 'contact' | 'dates' | 'numbers' | 'web' | 'custom'
  examples: string[]
  isCustom?: boolean
}

export const REGEX_PATTERNS: RegexPattern[] = [
  {
    id: 'email',
    name: 'Email Address',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    description: 'Matches standard email addresses',
    category: 'contact',
    examples: ['user@example.com', 'john.doe@company.co.uk']
  },
  {
    id: 'phone-us',
    name: 'US Phone Number',
    pattern: '\\(?\\d{3}\\)?[-.]?\\s?\\d{3}[-.]?\\s?\\d{4}',
    description: 'Matches US phone numbers in various formats',
    category: 'contact',
    examples: ['(123) 456-7890', '123-456-7890', '1234567890']
  },
  {
    id: 'phone-intl',
    name: 'International Phone',
    pattern: '\\+?[1-9]\\d{1,14}',
    description: 'Matches international phone numbers (E.164 format)',
    category: 'contact',
    examples: ['+1234567890', '+44123456789']
  },
  {
    id: 'url',
    name: 'URL',
    pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
    description: 'Matches HTTP and HTTPS URLs',
    category: 'web',
    examples: ['https://example.com', 'http://www.site.com/page']
  },
  {
    id: 'domain',
    name: 'Domain Name',
    pattern: '[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*',
    description: 'Matches domain names',
    category: 'web',
    examples: ['example.com', 'sub.domain.co.uk']
  },
  {
    id: 'ipv4',
    name: 'IPv4 Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b',
    description: 'Matches IPv4 addresses',
    category: 'web',
    examples: ['192.168.1.1', '10.0.0.255']
  },
  {
    id: 'date-iso',
    name: 'ISO Date (YYYY-MM-DD)',
    pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])',
    description: 'Matches dates in ISO 8601 format',
    category: 'dates',
    examples: ['2024-01-15', '2023-12-31']
  },
  {
    id: 'date-us',
    name: 'US Date (MM/DD/YYYY)',
    pattern: '(?:0[1-9]|1[0-2])\\/(?:0[1-9]|[12]\\d|3[01])\\/\\d{4}',
    description: 'Matches US date format',
    category: 'dates',
    examples: ['01/15/2024', '12/31/2023']
  },
  {
    id: 'date-eu',
    name: 'EU Date (DD/MM/YYYY)',
    pattern: '(?:0[1-9]|[12]\\d|3[01])\\/(?:0[1-9]|1[0-2])\\/\\d{4}',
    description: 'Matches European date format',
    category: 'dates',
    examples: ['15/01/2024', '31/12/2023']
  },
  {
    id: 'time-24h',
    name: 'Time 24h (HH:MM)',
    pattern: '(?:[01]\\d|2[0-3]):[0-5]\\d',
    description: 'Matches 24-hour time format',
    category: 'dates',
    examples: ['14:30', '09:15', '23:59']
  },
  {
    id: 'time-12h',
    name: 'Time 12h (HH:MM AM/PM)',
    pattern: '(?:0?[1-9]|1[0-2]):[0-5]\\d\\s?(?:AM|PM|am|pm)',
    description: 'Matches 12-hour time format with AM/PM',
    category: 'dates',
    examples: ['2:30 PM', '09:15 AM', '11:45pm']
  },
  {
    id: 'ssn',
    name: 'Social Security Number',
    pattern: '\\d{3}-\\d{2}-\\d{4}',
    description: 'Matches US Social Security Numbers',
    category: 'numbers',
    examples: ['123-45-6789']
  },
  {
    id: 'credit-card',
    name: 'Credit Card Number',
    pattern: '\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}',
    description: 'Matches credit card numbers',
    category: 'numbers',
    examples: ['1234 5678 9012 3456', '1234-5678-9012-3456']
  },
  {
    id: 'zipcode-us',
    name: 'US ZIP Code',
    pattern: '\\d{5}(?:-\\d{4})?',
    description: 'Matches US ZIP codes (5 or 9 digits)',
    category: 'numbers',
    examples: ['12345', '12345-6789']
  },
  {
    id: 'currency-usd',
    name: 'US Currency',
    pattern: '\\$\\s?\\d{1,3}(?:,\\d{3})*(?:\\.\\d{2})?',
    description: 'Matches US dollar amounts',
    category: 'numbers',
    examples: ['$1,234.56', '$ 99.99', '$1000']
  },
  {
    id: 'percentage',
    name: 'Percentage',
    pattern: '\\d+(?:\\.\\d+)?\\s?%',
    description: 'Matches percentage values',
    category: 'numbers',
    examples: ['25%', '99.9%', '100 %']
  },
  {
    id: 'number-integer',
    name: 'Integer',
    pattern: '-?\\d+',
    description: 'Matches integer numbers',
    category: 'numbers',
    examples: ['123', '-456', '0']
  },
  {
    id: 'number-decimal',
    name: 'Decimal Number',
    pattern: '-?\\d+\\.\\d+',
    description: 'Matches decimal numbers',
    category: 'numbers',
    examples: ['123.45', '-67.89', '0.5']
  },
  {
    id: 'hex-color',
    name: 'Hex Color Code',
    pattern: '#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}',
    description: 'Matches hexadecimal color codes',
    category: 'common',
    examples: ['#FF5733', '#abc', '#123456']
  },
  {
    id: 'word',
    name: 'Word',
    pattern: '\\b\\w+\\b',
    description: 'Matches individual words',
    category: 'common',
    examples: ['hello', 'word123', 'test_case']
  },
  {
    id: 'whitespace',
    name: 'Whitespace',
    pattern: '\\s+',
    description: 'Matches one or more whitespace characters',
    category: 'common',
    examples: ['   ', '\t', '\n']
  },
  {
    id: 'hashtag',
    name: 'Hashtag',
    pattern: '#[a-zA-Z0-9_]+',
    description: 'Matches social media hashtags',
    category: 'common',
    examples: ['#trending', '#JavaScript', '#web_dev']
  },
  {
    id: 'mention',
    name: 'Username Mention',
    pattern: '@[a-zA-Z0-9_]+',
    description: 'Matches social media username mentions',
    category: 'common',
    examples: ['@username', '@John_Doe', '@user123']
  },
  {
    id: 'uuid',
    name: 'UUID',
    pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}',
    description: 'Matches UUID/GUID identifiers',
    category: 'common',
    examples: ['123e4567-e89b-12d3-a456-426614174000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890']
  },
  {
    id: 'mac-address',
    name: 'MAC Address',
    pattern: '(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})',
    description: 'Matches MAC addresses',
    category: 'web',
    examples: ['00:1B:44:11:3A:B7', '00-1B-44-11-3A-B7']
  },
  {
    id: 'ipv6',
    name: 'IPv6 Address',
    pattern: '(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}',
    description: 'Matches IPv6 addresses (simplified)',
    category: 'web',
    examples: ['2001:0db8:85a3:0000:0000:8a2e:0370:7334', 'fe80:0000:0000:0000:0204:61ff:fe9d:f156']
  },
  {
    id: 'port-number',
    name: 'Port Number',
    pattern: '\\b(?:[1-9]\\d{0,3}|[1-5]\\d{4}|6[0-4]\\d{3}|65[0-4]\\d{2}|655[0-2]\\d|6553[0-5])\\b',
    description: 'Matches valid port numbers (1-65535)',
    category: 'web',
    examples: ['80', '443', '8080', '3000']
  },
  {
    id: 'html-tag',
    name: 'HTML Tag',
    pattern: '<[^>]+>',
    description: 'Matches HTML tags',
    category: 'web',
    examples: ['<div>', '<p class="text">', '<img src="image.jpg" />']
  },
  {
    id: 'markdown-link',
    name: 'Markdown Link',
    pattern: '\\[([^\\]]+)\\]\\(([^\\)]+)\\)',
    description: 'Matches Markdown formatted links',
    category: 'web',
    examples: ['[GitHub](https://github.com)', '[Link Text](http://example.com)']
  },
  {
    id: 'date-month-name',
    name: 'Date with Month Name',
    pattern: '\\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+\\d{1,2},?\\s+\\d{4}',
    description: 'Matches dates with month names',
    category: 'dates',
    examples: ['January 15, 2024', 'Dec 31 2023', 'Apr 1, 2024']
  },
  {
    id: 'datetime-iso',
    name: 'ISO DateTime',
    pattern: '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?Z?',
    description: 'Matches ISO 8601 datetime format',
    category: 'dates',
    examples: ['2024-01-15T14:30:00', '2023-12-31T23:59:59.999Z']
  },
  {
    id: 'year',
    name: 'Year (YYYY)',
    pattern: '\\b(?:19|20)\\d{2}\\b',
    description: 'Matches 4-digit years (1900-2099)',
    category: 'dates',
    examples: ['2024', '1999', '2000']
  },
  {
    id: 'postal-code-uk',
    name: 'UK Postal Code',
    pattern: '[A-Z]{1,2}\\d{1,2}[A-Z]?\\s?\\d[A-Z]{2}',
    description: 'Matches UK postal codes',
    category: 'numbers',
    examples: ['SW1A 1AA', 'EC1A1BB', 'W1T 3NL']
  },
  {
    id: 'postal-code-canada',
    name: 'Canadian Postal Code',
    pattern: '[A-Z]\\d[A-Z]\\s?\\d[A-Z]\\d',
    description: 'Matches Canadian postal codes',
    category: 'numbers',
    examples: ['K1A 0B1', 'M5V3A8', 'V6B 1A1']
  },
  {
    id: 'iban',
    name: 'IBAN',
    pattern: '[A-Z]{2}\\d{2}[A-Z0-9]{1,30}',
    description: 'Matches International Bank Account Numbers',
    category: 'numbers',
    examples: ['GB82WEST12345698765432', 'DE89370400440532013000']
  },
  {
    id: 'invoice-number',
    name: 'Invoice Number',
    pattern: '(?:INV|inv)?[-#]?\\d{4,10}',
    description: 'Matches common invoice number formats',
    category: 'numbers',
    examples: ['INV-001234', 'inv#5678', '20240001']
  },
  {
    id: 'order-number',
    name: 'Order Number',
    pattern: '(?:ORD|ORDER)?[-#]?[A-Z0-9]{6,12}',
    description: 'Matches order tracking numbers',
    category: 'numbers',
    examples: ['ORD-ABC123456', 'ORDER#789012', 'XYZ987654']
  },
  {
    id: 'tracking-number',
    name: 'Tracking Number',
    pattern: '\\b[A-Z0-9]{10,30}\\b',
    description: 'Matches package tracking numbers',
    category: 'numbers',
    examples: ['1Z999AA10123456784', 'ABCD1234567890']
  },
  {
    id: 'currency-euro',
    name: 'Euro Currency',
    pattern: '€\\s?\\d{1,3}(?:[,.]\\d{3})*(?:[,.]\\d{2})?',
    description: 'Matches Euro amounts',
    category: 'numbers',
    examples: ['€1.234,56', '€ 99,99', '€1000']
  },
  {
    id: 'currency-gbp',
    name: 'British Pound',
    pattern: '£\\s?\\d{1,3}(?:,\\d{3})*(?:\\.\\d{2})?',
    description: 'Matches British Pound amounts',
    category: 'numbers',
    examples: ['£1,234.56', '£ 99.99', '£1000']
  },
  {
    id: 'scientific-notation',
    name: 'Scientific Notation',
    pattern: '-?\\d+\\.?\\d*[eE][+-]?\\d+',
    description: 'Matches numbers in scientific notation',
    category: 'numbers',
    examples: ['1.23e-4', '5.67E+10', '-3.14e8']
  },
  {
    id: 'version-semver',
    name: 'Semantic Version',
    pattern: '\\b\\d+\\.\\d+\\.\\d+(?:-[a-zA-Z0-9.]+)?(?:\\+[a-zA-Z0-9.]+)?\\b',
    description: 'Matches semantic version numbers',
    category: 'numbers',
    examples: ['1.0.0', '2.3.4-beta', '3.1.5+build.123']
  },
  {
    id: 'filename',
    name: 'Filename',
    pattern: '[^/\\\\]+\\.[a-zA-Z0-9]+',
    description: 'Matches filenames with extensions',
    category: 'common',
    examples: ['document.pdf', 'image.jpg', 'data.json']
  },
  {
    id: 'file-path',
    name: 'File Path',
    pattern: '(?:[A-Za-z]:)?[\\\\/][^\\s<>:"|?*]+',
    description: 'Matches file system paths',
    category: 'common',
    examples: ['/usr/local/bin', 'C:\\Program Files\\App', '/home/user/documents']
  },
  {
    id: 'github-username',
    name: 'GitHub Username',
    pattern: '@[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}',
    description: 'Matches GitHub usernames',
    category: 'contact',
    examples: ['@octocat', '@github', '@user-name']
  },
  {
    id: 'linkedin-url',
    name: 'LinkedIn URL',
    pattern: 'https?:\\/\\/(?:www\\.)?linkedin\\.com\\/in\\/[a-zA-Z0-9_-]+',
    description: 'Matches LinkedIn profile URLs',
    category: 'contact',
    examples: ['https://linkedin.com/in/johndoe', 'http://www.linkedin.com/in/jane-smith']
  },
  {
    id: 'twitter-handle',
    name: 'Twitter/X Handle',
    pattern: '@[a-zA-Z0-9_]{1,15}',
    description: 'Matches Twitter/X usernames',
    category: 'contact',
    examples: ['@twitter', '@user123', '@Company_Name']
  },
  {
    id: 'isbn',
    name: 'ISBN',
    pattern: '(?:ISBN(?:-1[03])?:?\\s?)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-\\s]){3})[-\\s0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-\\s]){4})[-\\s0-9]{17}$)(?:97[89][-\\s]?)?[0-9]{1,5}[-\\s]?[0-9]+[-\\s]?[0-9]+[-\\s]?[0-9X]',
    description: 'Matches ISBN book identifiers',
    category: 'numbers',
    examples: ['ISBN-13: 978-0-596-52068-7', 'ISBN-10: 0-596-52068-9']
  },
  {
    id: 'vin',
    name: 'Vehicle VIN',
    pattern: '[A-HJ-NPR-Z0-9]{17}',
    description: 'Matches Vehicle Identification Numbers',
    category: 'numbers',
    examples: ['1HGBH41JXMN109186', 'JH4KA7532PC008269']
  },
  {
    id: 'lat-long',
    name: 'Latitude/Longitude',
    pattern: '-?\\d{1,3}\\.\\d+,\\s*-?\\d{1,3}\\.\\d+',
    description: 'Matches coordinate pairs',
    category: 'numbers',
    examples: ['40.7128, -74.0060', '51.5074, -0.1278']
  },
  {
    id: 'bitcoin-address',
    name: 'Bitcoin Address',
    pattern: '\\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\\b',
    description: 'Matches Bitcoin wallet addresses',
    category: 'web',
    examples: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', '3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy']
  },
  {
    id: 'ethereum-address',
    name: 'Ethereum Address',
    pattern: '0x[a-fA-F0-9]{40}',
    description: 'Matches Ethereum wallet addresses',
    category: 'web',
    examples: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb']
  },
  {
    id: 'jwt-token',
    name: 'JWT Token',
    pattern: 'eyJ[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]*',
    description: 'Matches JSON Web Tokens',
    category: 'web',
    examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N']
  },
  {
    id: 'base64',
    name: 'Base64 String',
    pattern: '(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?',
    description: 'Matches Base64 encoded strings',
    category: 'common',
    examples: ['SGVsbG8gV29ybGQ=', 'dGVzdCBkYXRh']
  },
  {
    id: 'variable-name',
    name: 'Variable Name',
    pattern: '[a-zA-Z_$][a-zA-Z0-9_$]*',
    description: 'Matches programming variable names',
    category: 'common',
    examples: ['myVariable', '_privateVar', '$jqueryVar', 'camelCase']
  },
  {
    id: 'camel-case',
    name: 'camelCase',
    pattern: '[a-z]+(?:[A-Z][a-z]*)*',
    description: 'Matches camelCase identifiers',
    category: 'common',
    examples: ['camelCase', 'myVariableName', 'getUserData']
  },
  {
    id: 'pascal-case',
    name: 'PascalCase',
    pattern: '[A-Z][a-z]+(?:[A-Z][a-z]*)*',
    description: 'Matches PascalCase identifiers',
    category: 'common',
    examples: ['PascalCase', 'MyClassName', 'UserProfile']
  },
  {
    id: 'kebab-case',
    name: 'kebab-case',
    pattern: '[a-z]+(?:-[a-z]+)*',
    description: 'Matches kebab-case identifiers',
    category: 'common',
    examples: ['kebab-case', 'my-variable-name', 'user-profile']
  },
  {
    id: 'snake-case',
    name: 'snake_case',
    pattern: '[a-z]+(?:_[a-z]+)*',
    description: 'Matches snake_case identifiers',
    category: 'common',
    examples: ['snake_case', 'my_variable_name', 'user_profile']
  },
  {
    id: 'sql-keyword',
    name: 'SQL Keywords',
    pattern: '\\b(?:SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|IS|IN|LIKE|BETWEEN|ORDER BY|GROUP BY|HAVING|DISTINCT|COUNT|SUM|AVG|MAX|MIN)\\b',
    description: 'Matches common SQL keywords',
    category: 'common',
    examples: ['SELECT', 'FROM', 'WHERE', 'ORDER BY']
  },
  {
    id: 'quoted-string',
    name: 'Quoted String',
    pattern: '(["\'])(?:(?=(\\\\?))\\2.)*?\\1',
    description: 'Matches single or double quoted strings',
    category: 'common',
    examples: ['"hello world"', "'test string'", '"escaped \\" quote"']
  },
  {
    id: 'parenthetical',
    name: 'Text in Parentheses',
    pattern: '\\([^)]+\\)',
    description: 'Matches text enclosed in parentheses',
    category: 'common',
    examples: ['(example)', '(text here)', '(123)']
  },
  {
    id: 'bracketed',
    name: 'Text in Brackets',
    pattern: '\\[[^\\]]+\\]',
    description: 'Matches text enclosed in square brackets',
    category: 'common',
    examples: ['[example]', '[text here]', '[123]']
  },
  {
    id: 'duplicate-words',
    name: 'Duplicate Words',
    pattern: '\\b(\\w+)\\s+\\1\\b',
    description: 'Matches repeated consecutive words',
    category: 'common',
    examples: ['the the', 'is is', 'word word']
  },
  {
    id: 'leading-zeros',
    name: 'Leading Zeros',
    pattern: '\\b0+\\d+\\b',
    description: 'Matches numbers with leading zeros',
    category: 'numbers',
    examples: ['00123', '007', '0001']
  },
  {
    id: 'multiple-spaces',
    name: 'Multiple Spaces',
    pattern: '\\s{2,}',
    description: 'Matches two or more consecutive spaces',
    category: 'common',
    examples: ['  ', '    ', '\t\t']
  }
]

export function getPatternsByCategory(category: RegexPattern['category']): RegexPattern[] {
  return REGEX_PATTERNS.filter(p => p.category === category)
}

export function searchPatterns(query: string): RegexPattern[] {
  const lowerQuery = query.toLowerCase()
  return REGEX_PATTERNS.filter(
    p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.examples.some(ex => ex.toLowerCase().includes(lowerQuery))
  )
}

export const PATTERN_CATEGORIES = [
  { id: 'custom', label: 'My Patterns', icon: '⭐' },
  { id: 'common', label: 'Common', icon: '✨' },
  { id: 'contact', label: 'Contact Info', icon: '📧' },
  { id: 'dates', label: 'Dates & Times', icon: '📅' },
  { id: 'numbers', label: 'Numbers', icon: '#️⃣' },
  { id: 'web', label: 'Web & URLs', icon: '🌐' }
] as const

const PERFORMANCE_PATTERNS: RegExp[] = [
  /\bgrowth\s+strateg/i,
  /\bgrow\s+my\b/i,
  /\bhow\s+(can|do|should)\s+i\s+grow\b/i,
  /\bimprove\s+(my\s+)?performance\b/i,
  /\bperformance\s+improvement\b/i,
  /\bpost\s+performance\b/i,
  /\bmy\s+(past\s+)?posts?\b/i,
  /\bmy\s+analytics\b/i,
  /\bbetter\s+(engagement|results|performance)\b/i,
  /\bincrease\s+engagement\b/i,
  /\bwhat\s+should\s+i\s+(do|post|focus|prioritize)\b/i,
  /\bnext\s+actions?\b/i,
  /\bbased\s+on\s+(my\s+)?(analytics|data|performance)\b/i,
  /\buse\s+(my\s+)?(analytics|data|recommendations)\b/i,
  /\brecommendations?\b/i,
  /\banalytics\s+summary\b/i,
  /\bunderperform/i,
  /\bwhat(?:'s| is)\s+working\b/i,
  /\bcontent\s+strategy\b/i,
  /\bhow\s+are\s+my\s+posts\b/i,
  /\bgroei(?:strategie)?\b/i,
  /\bprestaties?\s+verbeter/i,
  /\bengagement\s+verbeter/i,
  /\bverbeter\s+.*\bprestaties?\b/i,
]

export function isPerformanceQuestion(message: string): boolean {
  const trimmed = message.trim()
  if (!trimmed) return false

  return PERFORMANCE_PATTERNS.some((pattern) => pattern.test(trimmed))
}

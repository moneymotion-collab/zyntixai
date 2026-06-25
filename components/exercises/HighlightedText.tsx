"use client"

import { useMemo } from "react"
import { parseExerciseSearchTerms } from "@/lib/exercise-library"

type HighlightRange = {
  start: number
  end: number
}

function mergeHighlightRanges(ranges: HighlightRange[]): HighlightRange[] {
  if (ranges.length === 0) return []

  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  const merged: HighlightRange[] = [sorted[0]]

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index]
    const last = merged[merged.length - 1]

    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end)
      continue
    }

    merged.push(current)
  }

  return merged
}

function getHighlightRanges(text: string, terms: string[]): HighlightRange[] {
  if (!text || terms.length === 0) return []

  const lowerText = text.toLowerCase()
  const ranges: HighlightRange[] = []

  for (const term of terms) {
    const lowerTerm = term.toLowerCase()
    if (!lowerTerm) continue

    let startIndex = 0
    while (startIndex < lowerText.length) {
      const matchIndex = lowerText.indexOf(lowerTerm, startIndex)
      if (matchIndex === -1) break

      ranges.push({
        start: matchIndex,
        end: matchIndex + lowerTerm.length,
      })
      startIndex = matchIndex + lowerTerm.length
    }
  }

  return mergeHighlightRanges(ranges)
}

type HighlightedTextProps = {
  text: string
  searchQuery?: string
  className?: string
  highlightClassName?: string
}

export default function HighlightedText({
  text,
  searchQuery = "",
  className,
  highlightClassName = "rounded-sm bg-indigo-500/25 px-0.5 font-medium text-indigo-100",
}: HighlightedTextProps) {
  const terms = useMemo(() => parseExerciseSearchTerms(searchQuery), [searchQuery])

  const segments = useMemo(() => {
    if (!text || terms.length === 0) {
      return [{ text, highlighted: false }]
    }

    const ranges = getHighlightRanges(text, terms)
    if (ranges.length === 0) {
      return [{ text, highlighted: false }]
    }

    const parts: { text: string; highlighted: boolean }[] = []
    let cursor = 0

    for (const range of ranges) {
      if (range.start > cursor) {
        parts.push({
          text: text.slice(cursor, range.start),
          highlighted: false,
        })
      }

      parts.push({
        text: text.slice(range.start, range.end),
        highlighted: true,
      })
      cursor = range.end
    }

    if (cursor < text.length) {
      parts.push({
        text: text.slice(cursor),
        highlighted: false,
      })
    }

    return parts
  }, [searchQuery, terms, text])

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <mark
            key={`${segment.text}-${index}`}
            className={highlightClassName}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ),
      )}
    </span>
  )
}

"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import { Clock, Loader2, Search, X } from "lucide-react"
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue"
import {
  addRecentExerciseSearch,
  clearRecentExerciseSearches,
  getRecentExerciseSearches,
} from "@/lib/recent-exercise-searches"

const SEARCH_DEBOUNCE_MS = 250

type ExerciseSearchBarProps = {
  value: string
  onChange: (value: string) => void
  isFiltering?: boolean
}

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

export default function ExerciseSearchBar({
  value,
  onChange,
  isFiltering = false,
}: ExerciseSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const [focused, setFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isMac, setIsMac] = useState(false)
  const debouncedValue = useDebouncedValue(value, SEARCH_DEBOUNCE_MS)
  const isTyping = value.trim() !== debouncedValue.trim()
  const showLoading = isTyping || isFiltering

  useEffect(() => {
    setIsMac(isMacPlatform())
  }, [])

  useEffect(() => {
    setRecentSearches(getRecentExerciseSearches())
  }, [])

  useEffect(() => {
    const trimmed = debouncedValue.trim()
    if (trimmed.length < 2) return

    const timer = window.setTimeout(() => {
      setRecentSearches(addRecentExerciseSearch(trimmed))
    }, 0)

    return () => window.clearTimeout(timer)
  }, [debouncedValue])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent | globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        inputRef.current?.focus()
        setFocused(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setFocused(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  const applyRecentSearch = useCallback(
    (query: string) => {
      onChange(query)
      inputRef.current?.focus()
      setFocused(false)
    },
    [onChange],
  )

  const handleClear = () => {
    onChange("")
    inputRef.current?.focus()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      onChange("")
      setFocused(false)
      inputRef.current?.blur()
    }
  }

  const showRecent =
    focused &&
    value.trim().length === 0 &&
    recentSearches.length > 0

  const shortcutLabel = isMac ? "⌘K" : "Ctrl+K"

  return (
    <div ref={containerRef} className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search exercises by name, muscle, equipment, or difficulty…"
        aria-label="Search exercises"
        aria-expanded={showRecent}
        aria-controls={showRecent ? listboxId : undefined}
        aria-autocomplete="list"
        role="combobox"
        className="premium-input pl-11 pr-28"
      />

      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-2">
        {showLoading ? (
          <Loader2
            className="h-4 w-4 animate-spin text-indigo-300"
            aria-hidden
          />
        ) : null}
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="pointer-events-auto rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <kbd className="hidden rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-400 sm:inline">
            {shortcutLabel}
          </kbd>
        )}
      </div>

      {showRecent ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Recent searches"
          className="absolute top-[calc(100%+0.5rem)] z-20 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b1224]/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Recent searches
            </p>
            <button
              type="button"
              onClick={() => {
                clearRecentExerciseSearches()
                setRecentSearches([])
              }}
              className="text-xs font-medium text-slate-400 transition hover:text-slate-200"
            >
              Clear
            </button>
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {recentSearches.map((query) => (
              <li key={query}>
                <button
                  type="button"
                  role="option"
                  onClick={() => applyRecentSearch(query)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-200 transition hover:bg-white/[0.05]"
                >
                  <Clock className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  <span className="truncate">{query}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export { SEARCH_DEBOUNCE_MS }

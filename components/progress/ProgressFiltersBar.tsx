"use client"

import {
  DATE_RANGE_OPTIONS,
  type DateRangeFilter,
} from "@/lib/progress/progress-filters"
import { METRIC_FILTER_OPTIONS, type MetricFilter } from "@/lib/progress/metrics"
import { premiumSelectClass } from "@/lib/ui/premium-input"

type MemberOption = {
  id: string
  full_name: string | null
}

type ProgressFiltersBarProps = {
  memberFilter: string
  onMemberFilterChange: (value: string) => void
  members: MemberOption[]
  memberFilterDisabled?: boolean
  showMemberFilter?: boolean
  metricFilter: MetricFilter
  onMetricFilterChange: (value: MetricFilter) => void
  dateRange: DateRangeFilter
  onDateRangeChange: (value: DateRangeFilter) => void
}

export default function ProgressFiltersBar({
  memberFilter,
  onMemberFilterChange,
  members,
  memberFilterDisabled = false,
  showMemberFilter = true,
  metricFilter,
  onMetricFilterChange,
  dateRange,
  onDateRangeChange,
}: ProgressFiltersBarProps) {
  return (
    <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {showMemberFilter ? (
        <FilterSelect
          label="Member"
          value={memberFilter}
          onChange={onMemberFilterChange}
          options={[
            { value: "all", label: "All members" },
            ...members.map((member) => ({
              value: member.id,
              label: member.full_name ?? "Member",
            })),
          ]}
          disabled={memberFilterDisabled}
        />
      ) : null}
      <FilterSelect
        label="Metric"
        value={metricFilter}
        onChange={(value) => onMetricFilterChange(value as MetricFilter)}
        options={METRIC_FILTER_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
      />
      <FilterSelect
        label="Date range"
        value={dateRange}
        onChange={(value) => onDateRangeChange(value as DateRangeFilter)}
        options={DATE_RANGE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
      />
    </section>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={premiumSelectClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0b1224]">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

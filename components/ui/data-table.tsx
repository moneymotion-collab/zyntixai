import type { ComponentProps, ReactNode } from "react"

import {
  saasTableClass,
  saasTableHeadClass,
  saasTableRowClass,
  saasTableTdClass,
  saasTableThClass,
} from "@/lib/ui/saas-tokens"
import { SAAS_PAGE_LIST_CARD } from "@/lib/ui/saas-page-layout"

type DataTableProps = {
  children: ReactNode
  className?: string
  caption?: string
  /** When true, wraps the table in the standard list card shell */
  framed?: boolean
}

export function DataTable({
  children,
  className = "",
  caption,
  framed = true,
}: DataTableProps) {
  const table = (
    <table className={`${saasTableClass} ${className}`.trim()}>
      {caption ? (
        <caption className="sr-only">
          {caption}
        </caption>
      ) : null}
      {children}
    </table>
  )

  if (!framed) {
    return <div className="overflow-x-auto">{table}</div>
  }

  return (
    <div className={`hidden overflow-x-auto md:block ${SAAS_PAGE_LIST_CARD}`}>
      {table}
    </div>
  )
}

export function DataTableHead({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <thead className={`${saasTableHeadClass} ${className}`.trim()}>
      {children}
    </thead>
  )
}

export function DataTableHeaderCell({
  children,
  className = "",
  scope = "col",
}: {
  children: ReactNode
  className?: string
  scope?: "col" | "row"
}) {
  return (
    <th scope={scope} className={`${saasTableThClass} ${className}`.trim()}>
      {children}
    </th>
  )
}

export function DataTableBody({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <tbody className={className}>{children}</tbody>
}

export function DataTableRow({
  children,
  className = "",
  ...props
}: ComponentProps<"tr">) {
  return (
    <tr className={`${saasTableRowClass} ${className}`.trim()} {...props}>
      {children}
    </tr>
  )
}

export function DataTableCell({
  children,
  className = "",
  ...props
}: ComponentProps<"td">) {
  return (
    <td className={`${saasTableTdClass} ${className}`.trim()} {...props}>
      {children}
    </td>
  )
}

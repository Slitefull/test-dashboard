import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { useDebouncedValue } from '~/lib/use-debounced-value'
import { AnimatePresence, motion } from 'motion/react'
import { FormattedMessage, useIntl } from 'react-intl'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  DEFAULT_LIST_PARAMS,
  ratedUsersQueryOptions,
  type RatedUserDTO,
  type SortDir,
  type SortField,
} from '~/lib/rated-users'

const PAGE_SIZES: readonly number[] = [10, 25, 50, 100]
const ease = [0.23, 1, 0.32, 1] as const

export function UsersTable() {
  const intl = useIntl()
  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(intl.locale, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }),
    [intl.locale],
  )
  const [page, setPage] = useState(DEFAULT_LIST_PARAMS.page)
  const [pageSize, setPageSize] = useState(DEFAULT_LIST_PARAMS.pageSize)
  const [sortBy, setSortBy] = useState<SortField>(DEFAULT_LIST_PARAMS.sortBy)
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_LIST_PARAMS.sortDir)
  const [searchInput, setSearchInput] = useState(DEFAULT_LIST_PARAMS.search)
  const search = useDebouncedValue(searchInput, 250)

  useEffect(() => {
    setPage(0)
  }, [search])

  const params = useMemo(
    () => ({ page, pageSize, sortBy, sortDir, search }),
    [page, pageSize, sortBy, sortDir, search],
  )

  const { data, isFetching, isPlaceholderData, isLoading } = useQuery({
    ...ratedUsersQueryOptions(params),
    placeholderData: keepPreviousData,
  })

  const showSkeleton = isLoading || (!data && isFetching)

  const rows: RatedUserDTO[] = data?.rows ?? []
  const total = data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const rangeStart = total === 0 ? 0 : page * pageSize + 1
  const rangeEnd = Math.min((page + 1) * pageSize, total)
  const isSearching = search.trim().length > 0
  const sig = useMemo(() => {
    if (!data) return 'empty'
    return `${data.page}:${data.pageSize}:${data.rows.map((r) => r.id).join(',')}`
  }, [data])

  const columns = useMemo<ColumnDef<RatedUserDTO>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: () => <FormattedMessage id="table.col.user" />,
        cell: ({ row }) => {
          const name = row.original.name
          const initials = name
            .split(/\s+/)
            .map((p) => p[0] ?? '')
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase()
          return (
            <div className="flex items-center gap-3">
              <div className="grid size-7 place-items-center rounded-full bg-[var(--color-surface-2)] text-[10px] font-semibold text-[var(--color-fg-muted)]">
                {initials || '·'}
              </div>
              <span className="text-sm text-[var(--color-fg)]">{name}</span>
            </div>
          )
        },
      },
      {
        id: 'rating',
        accessorKey: 'rating',
        header: () => <FormattedMessage id="table.col.rating" />,
        cell: ({ getValue }) => <RatingBar value={getValue<number>()} />,
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: () => <FormattedMessage id="table.col.added" />,
        cell: ({ getValue }) => (
          <span className="text-xs text-[var(--color-fg-muted)]">
            {dateFmt.format(new Date(getValue<string>()))}
          </span>
        ),
      },
    ],
    [dateFmt],
  )

  const table = useReactTable<RatedUserDTO>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount,
  })

  function toggleSort(field: SortField) {
    setPage(0)
    if (sortBy !== field) {
      setSortBy(field)
      setSortDir(field === 'name' ? 'asc' : 'desc')
      return
    }
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
  }

  function canPrev() {
    return page > 0
  }
  function canNext() {
    return page + 1 < pageCount
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-[var(--color-fg-subtle)]"
          >
            ⌕
          </span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={intl.formatMessage({ id: 'table.search.placeholder' })}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-9 text-sm placeholder:text-[var(--color-fg-subtle)] focus-ring transition focus:border-[var(--color-accent)]"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label={intl.formatMessage({ id: 'table.search.clear' })}
              className="absolute inset-y-0 right-2 my-auto h-6 rounded px-2 text-xs text-[var(--color-fg-subtle)] transition hover:text-[var(--color-fg)] focus-ring"
            >
              ×
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-3 text-xs tabular-nums text-[var(--color-fg-subtle)]">
          {isFetching ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1.5 text-[var(--color-fg-subtle)]"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-[var(--color-accent)]" />
              <FormattedMessage id="table.loading" />
            </motion.span>
          ) : null}
          <div>
            <FormattedMessage
              id="table.total"
              values={{
                n: <span className="text-[var(--color-fg)]">{total}</span>,
              }}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/40">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const id = h.column.id as SortField
                  const isSorted = sortBy === id
                  return (
                    <th
                      key={h.id}
                      scope="col"
                      className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-fg-subtle)]"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(id)}
                        className="inline-flex items-center gap-1.5 transition hover:text-[var(--color-fg)] focus-ring"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        <SortIndicator
                          active={isSorted}
                          dir={isSorted ? sortDir : null}
                        />
                      </button>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          {showSkeleton ? (
            <SkeletonBody rowCount={pageSize} colCount={columns.length} />
          ) : rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-5 py-16">
                  <EmptyState searching={isSearching} />
                </td>
              </tr>
            </tbody>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.tbody
                key={sig}
                initial={{ opacity: 0, y: 4 }}
                animate={{
                  opacity: isPlaceholderData ? 0.55 : 1,
                  y: 0,
                }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease }}
              >
                {table.getRowModel().rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={
                      'hover:bg-[var(--color-surface-2)]/60 ' +
                      (i === 0 ? '' : 'border-t border-[var(--color-border)]/60')
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </motion.tbody>
            </AnimatePresence>
          )}
        </table>
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        total={total}
        canPrev={canPrev()}
        canNext={canNext()}
        onPrev={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
        onFirst={() => setPage(0)}
        onLast={() => setPage(pageCount - 1)}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(0)
        }}
      />
    </div>
  )
}

interface PaginationProps {
  page: number
  pageCount: number
  pageSize: number
  rangeStart: number
  rangeEnd: number
  total: number
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  onFirst: () => void
  onLast: () => void
  onPageSizeChange: (size: number) => void
}

function Pagination({
  page,
  pageCount,
  pageSize,
  rangeStart,
  rangeEnd,
  total,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onFirst,
  onLast,
  onPageSizeChange,
}: PaginationProps) {
  const intl = useIntl()
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 text-[var(--color-fg-muted)]">
        <span>
          <FormattedMessage id="table.pagination.rowsPerPage" />
        </span>
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="appearance-none rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] py-1 pl-2 pr-7 text-xs text-[var(--color-fg)] focus-ring transition focus:border-[var(--color-accent)]"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-2 grid place-items-center text-[var(--color-fg-subtle)]"
          >
            ▾
          </span>
        </div>
      </div>

      <div className="tabular-nums text-[var(--color-fg-subtle)]">
        <FormattedMessage
          id="table.pagination.range"
          values={{
            from: (
              <span className="text-[var(--color-fg)]">{rangeStart}</span>
            ),
            to: <span className="text-[var(--color-fg)]">{rangeEnd}</span>,
            total: <span className="text-[var(--color-fg)]">{total}</span>,
          }}
        />
      </div>

      <div className="flex items-center gap-1">
        <PageButton
          onClick={onFirst}
          disabled={!canPrev}
          aria-label={intl.formatMessage({ id: 'table.pagination.first' })}
        >
          ⏮
        </PageButton>
        <PageButton
          onClick={onPrev}
          disabled={!canPrev}
          aria-label={intl.formatMessage({ id: 'table.pagination.previous' })}
        >
          ←
        </PageButton>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={page}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease }}
            className="min-w-[7rem] text-center tabular-nums text-[var(--color-fg-muted)]"
          >
            <FormattedMessage
              id="table.pagination.page"
              values={{
                page: (
                  <span className="text-[var(--color-fg)]">{page + 1}</span>
                ),
                total: (
                  <span className="text-[var(--color-fg)]">{pageCount}</span>
                ),
              }}
            />
          </motion.span>
        </AnimatePresence>
        <PageButton
          onClick={onNext}
          disabled={!canNext}
          aria-label={intl.formatMessage({ id: 'table.pagination.next' })}
        >
          →
        </PageButton>
        <PageButton
          onClick={onLast}
          disabled={!canNext}
          aria-label={intl.formatMessage({ id: 'table.pagination.last' })}
        >
          ⏭
        </PageButton>
      </div>
    </div>
  )
}

interface PageButtonProps {
  children: ReactNode
  onClick: () => void
  disabled: boolean
  'aria-label': string
}

function PageButton({
  children,
  onClick,
  disabled,
  'aria-label': ariaLabel,
}: PageButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={disabled ? undefined : { scale: 1.06 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      transition={{ duration: 0.12, ease }}
      className="grid size-7 place-items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[var(--color-fg-muted)] focus-ring"
    >
      {children}
    </motion.button>
  )
}

function SkeletonBody({
  rowCount,
  colCount,
}: {
  rowCount: number
  colCount: number
}) {
  const rows = Array.from({ length: rowCount }, (_, i) => i)
  return (
    <motion.tbody
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease }}
    >
      {rows.map((i) => (
        <tr
          key={i}
          className={
            i === 0 ? '' : 'border-t border-[var(--color-border)]/60'
          }
        >
          <td className="px-5 py-3 align-middle">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="size-7 rounded-full" delay={i} />
              <SkeletonBlock
                className="h-3.5 rounded"
                style={{ width: `${60 + ((i * 13) % 40)}%` }}
                delay={i}
              />
            </div>
          </td>
          <td className="px-5 py-3 align-middle">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-1.5 w-36 rounded-full" delay={i} />
              <SkeletonBlock className="h-3.5 w-8 rounded" delay={i} />
            </div>
          </td>
          <td className="px-5 py-3 align-middle">
            <SkeletonBlock className="h-3 w-20 rounded" delay={i} />
          </td>
          {Array.from({ length: Math.max(0, colCount - 3) }).map((_, j) => (
            <td key={j} className="px-5 py-3 align-middle">
              <SkeletonBlock className="h-3.5 w-16 rounded" delay={i} />
            </td>
          ))}
        </tr>
      ))}
    </motion.tbody>
  )
}

function SkeletonBlock({
  className,
  style,
  delay = 0,
}: {
  className: string
  style?: CSSProperties
  delay?: number
}) {
  return (
    <motion.span
      aria-hidden
      className={`block bg-[var(--color-surface-2)] ${className}`}
      style={style}
      animate={{ opacity: [0.45, 0.85, 0.45] }}
      transition={{
        duration: 1.4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: (delay % 6) * 0.08,
      }}
    />
  )
}

function EmptyState({ searching }: { searching: boolean }) {
  return (
    <div className="mx-auto max-w-xs text-center">
      <div
        className="mx-auto mb-4 grid size-10 place-items-center rounded-full border border-[var(--color-border)] text-[var(--color-fg-subtle)]"
        aria-hidden
      >
        {searching ? '⌕' : '·'}
      </div>
      <div className="text-sm font-medium text-[var(--color-fg)]">
        <FormattedMessage
          id={searching ? 'table.empty.search.title' : 'table.empty.title'}
        />
      </div>
      <div className="mt-1 text-xs text-[var(--color-fg-muted)]">
        <FormattedMessage
          id={searching ? 'table.empty.search.desc' : 'table.empty.desc'}
        />
      </div>
    </div>
  )
}

function SortIndicator({
  active,
  dir,
}: {
  active: boolean
  dir: SortDir | null
}) {
  if (!active || !dir) {
    return (
      <span className="text-[var(--color-fg-subtle)]" aria-hidden>
        ↕
      </span>
    )
  }
  return (
    <span className="text-[var(--color-fg)]" aria-hidden>
      {dir === 'asc' ? '↑' : '↓'}
    </span>
  )
}

function RatingBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  const tone =
    clamped >= 75
      ? 'var(--color-accent)'
      : clamped >= 40
        ? 'oklch(0.78 0.14 88)'
        : 'oklch(0.72 0.16 38)'
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1.5 w-36 overflow-hidden rounded-full bg-[var(--color-surface-2)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${clamped}%`, background: tone }}
        />
      </div>
      <span className="w-8 text-right tabular-nums text-sm text-[var(--color-fg)]">
        {value}
      </span>
    </div>
  )
}

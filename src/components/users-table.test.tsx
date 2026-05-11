import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ListResult, RatedUserDTO } from '~/lib/rated-users'
import type { ListParams } from '~/lib/rated-users-schema'

const listRatedUsersFn = vi.fn()

vi.mock('~/lib/rated-users', async () => {
  const schema =
    await import('~/lib/rated-users-schema')
  return {
    ...schema,
    listRatedUsersFn: (...args: unknown[]) => listRatedUsersFn(...args),
    ratedUsersQueryOptions: (params: ListParams) => ({
      queryKey: [
        'rated-users',
        params.page,
        params.pageSize,
        params.sortBy,
        params.sortDir,
        params.search,
      ],
      queryFn: () => listRatedUsersFn({ data: params }),
    }),
  }
})

import { UsersTable } from './users-table'
import { IntlTestProvider } from '~/test/providers'

function makeRows(start: number, end: number): RatedUserDTO[] {
  return Array.from({ length: end - start }, (_, i) => ({
    id: `id-${start + i}`,
    name: `User ${start + i}`,
    rating: 50 + i,
    createdAt: '2026-01-01T00:00:00.000Z',
  }))
}

function makeResult(
  rows: RatedUserDTO[],
  total: number,
  page = 0,
  pageSize = 10,
): ListResult {
  return { rows, total, page, pageSize }
}

function renderTable() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <IntlTestProvider>
      <QueryClientProvider client={client}>
        <UsersTable />
      </QueryClientProvider>
    </IntlTestProvider>,
  )
}

describe('UsersTable', () => {
  beforeEach(() => {
    listRatedUsersFn.mockReset()
  })

  it('renders rows from server fn', async () => {
    listRatedUsersFn.mockResolvedValue(makeResult(makeRows(0, 3), 3))
    renderTable()
    expect(await screen.findByText('User 0')).toBeInTheDocument()
    expect(screen.getByText('User 1')).toBeInTheDocument()
    expect(screen.getByText('User 2')).toBeInTheDocument()
  })

  it('calls server fn with default params on mount', async () => {
    listRatedUsersFn.mockResolvedValue(makeResult(makeRows(0, 3), 3))
    renderTable()
    await waitFor(() => expect(listRatedUsersFn).toHaveBeenCalled())
    expect(listRatedUsersFn).toHaveBeenLastCalledWith({
      data: {
        page: 0,
        pageSize: 10,
        sortBy: 'rating',
        sortDir: 'desc',
        search: '',
      },
    })
  })

  it('debounces search input then refetches with search', async () => {
    listRatedUsersFn.mockResolvedValue(makeResult(makeRows(0, 3), 3))
    renderTable()
    await waitFor(() => expect(listRatedUsersFn).toHaveBeenCalled())

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText('Search by name or rating')
    await user.type(input, 'ali')

    await waitFor(
      () => {
        const lastCall = listRatedUsersFn.mock.calls.at(-1)
        expect(lastCall?.[0]).toMatchObject({
          data: { search: 'ali', page: 0 },
        })
      },
      { timeout: 1500 },
    )
  })

  it('next/prev pagination buttons advance the page param', async () => {
    listRatedUsersFn.mockImplementation(
      async ({ data }: { data: { page: number } }) =>
        makeResult(makeRows(data.page * 10, data.page * 10 + 10), 50, data.page, 10),
    )
    renderTable()
    await screen.findByText('User 0')

    const user = userEvent.setup()
    const next = screen.getByLabelText('Next page')
    await user.click(next)
    await waitFor(() => {
      const last = listRatedUsersFn.mock.calls.at(-1)
      expect(last?.[0].data.page).toBe(1)
    })

    const prev = screen.getByLabelText('Previous page')
    await user.click(prev)
    await waitFor(() => {
      const last = listRatedUsersFn.mock.calls.at(-1)
      expect(last?.[0].data.page).toBe(0)
    })
  })

  it('first/last buttons jump to page 0 and last page', async () => {
    listRatedUsersFn.mockImplementation(
      async ({ data }: { data: { page: number; pageSize: number } }) =>
        makeResult(
          makeRows(data.page * data.pageSize, data.page * data.pageSize + data.pageSize),
          50,
          data.page,
          data.pageSize,
        ),
    )
    renderTable()
    await screen.findByText('User 0')
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Last page'))
    await waitFor(() => {
      const last = listRatedUsersFn.mock.calls.at(-1)
      expect(last?.[0].data.page).toBe(4)
    })

    await user.click(screen.getByLabelText('First page'))
    await waitFor(() => {
      const last = listRatedUsersFn.mock.calls.at(-1)
      expect(last?.[0].data.page).toBe(0)
    })
  })

  it('changing page size resets to page 0 and refetches', async () => {
    listRatedUsersFn.mockImplementation(
      async ({ data }: { data: { page: number; pageSize: number } }) =>
        makeResult(makeRows(0, data.pageSize), 50, data.page, data.pageSize),
    )
    renderTable()
    await screen.findByText('User 0')

    const user = userEvent.setup()
    const select = screen.getByDisplayValue('10')
    await user.selectOptions(select, '25')

    await waitFor(() => {
      const last = listRatedUsersFn.mock.calls.at(-1)
      expect(last?.[0].data.pageSize).toBe(25)
      expect(last?.[0].data.page).toBe(0)
    })
  })

  it('clicking sort header toggles sortDir on same field, switches field with default dir on change', async () => {
    listRatedUsersFn.mockResolvedValue(makeResult(makeRows(0, 3), 3))
    renderTable()
    await screen.findByText('User 0')

    const user = userEvent.setup()
    const ratingHeader = screen.getByRole('button', { name: /rating/i })
    await user.click(ratingHeader)
    await waitFor(() => {
      const last = listRatedUsersFn.mock.calls.at(-1)
      expect(last?.[0].data).toMatchObject({ sortBy: 'rating', sortDir: 'asc' })
    })

    const nameHeader = screen.getByRole('button', { name: /user/i })
    await user.click(nameHeader)
    await waitFor(() => {
      const last = listRatedUsersFn.mock.calls.at(-1)
      expect(last?.[0].data).toMatchObject({ sortBy: 'name', sortDir: 'asc' })
    })

    await user.click(nameHeader)
    await waitFor(() => {
      const last = listRatedUsersFn.mock.calls.at(-1)
      expect(last?.[0].data).toMatchObject({ sortBy: 'name', sortDir: 'desc' })
    })
  })

  it('shows empty state when search returns no rows', async () => {
    listRatedUsersFn.mockResolvedValue(makeResult([], 0))
    renderTable()
    await waitFor(() => {
      expect(screen.getByText('No users yet')).toBeInTheDocument()
    })
  })

  it('clear search button resets search', async () => {
    listRatedUsersFn.mockResolvedValue(makeResult(makeRows(0, 3), 3))
    renderTable()
    await waitFor(() => expect(listRatedUsersFn).toHaveBeenCalled())

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText('Search by name or rating')
    await user.type(input, 'ali')

    const clear = await screen.findByLabelText('Clear search')
    await user.click(clear)
    expect((input as HTMLInputElement).value).toBe('')
    await waitFor(
      () => {
        const last = listRatedUsersFn.mock.calls.at(-1)
        expect(last?.[0].data.search).toBe('')
      },
      { timeout: 1500 },
    )
  })

  it('displays total count from server', async () => {
    listRatedUsersFn.mockResolvedValue(makeResult(makeRows(0, 10), 50))
    renderTable()
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/1–10 of 50/)
    })
  })
})

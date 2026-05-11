import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'motion/react'
import { getCurrentUserFn } from '~/lib/auth'
import {
  DEFAULT_LIST_PARAMS,
  ratedUsersQueryOptions,
} from '~/lib/rated-users'
import { Header } from '~/components/header'
import { UsersTable } from '~/components/users-table'
import { AddUserModal } from '~/components/add-user-modal'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await getCurrentUserFn()
    if (!user) throw redirect({ to: '/login' })
    return { user }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      ratedUsersQueryOptions(DEFAULT_LIST_PARAMS),
    )
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = Route.useRouteContext()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <Header user={user} onAddUser={() => setModalOpen(true)} />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: [0.23, 1, 0.32, 1], delay: 0.05 }}
        className="mx-auto max-w-6xl px-6 py-10"
      >
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-fg-subtle)]">
              Overview
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Rated users
            </h1>
            <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
              Sortable, searchable list of users and their ratings.
            </p>
          </div>
        </div>

        <UsersTable />
      </motion.main>

      {user.role === 'ADMIN' ? (
        <AddUserModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </div>
  )
}

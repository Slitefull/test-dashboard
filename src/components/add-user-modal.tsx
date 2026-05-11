import { UserFormModal } from './user-form-modal'

interface AddUserModalProps {
  open: boolean
  onClose: () => void
}

export function AddUserModal({ open, onClose }: AddUserModalProps) {
  return <UserFormModal open={open} mode="add" onClose={onClose} />
}

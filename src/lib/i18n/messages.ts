export const SUPPORTED_LOCALES = ['en', 'uk'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  uk: 'УК',
}

export const LOCALE_FULL_LABELS: Record<Locale, string> = {
  en: 'English',
  uk: 'Українська',
}

const en = {
  // App
  'app.title': 'Dashboard',

  // Login
  'login.brand': 'Dashboard',
  'login.title': 'Sign in to continue',
  'login.subtitle': 'Use a seeded account below.',
  'login.email': 'Email',
  'login.password': 'Password',
  'login.submit': 'Sign in',
  'login.submitting': 'Signing in…',
  'login.seeded.title': 'Test accounts',
  'login.seeded.adminLabel': 'admin',
  'login.seeded.userLabel': 'user',
  'login.error.fallback': 'Login failed.',
  'toast.signedIn': 'Signed in',

  // Header
  'header.addUser': '+ Add user',
  'header.signOut': 'Sign out',
  'header.confirm.title': 'Sign out?',
  'header.confirm.desc.prefix': 'You will be signed out as ',
  'header.confirm.desc.suffix': '. Any unsaved work will be lost.',
  'toast.signedOut': 'Signed out',

  // Dashboard
  'dashboard.eyebrow': 'Overview',
  'dashboard.title': 'Rated users',
  'dashboard.subtitle': 'Sortable, searchable list of users and their ratings.',

  // Table
  'table.col.user': 'User',
  'table.col.rating': 'Rating',
  'table.col.added': 'Added',
  'table.search.placeholder': 'Search by name or rating',
  'table.search.clear': 'Clear search',
  'table.loading': 'Loading',
  'table.total': '{n} total',
  'table.empty.search.title': 'No matches',
  'table.empty.search.desc': 'Try a different name or rating.',
  'table.empty.title': 'No users yet',
  'table.empty.desc': 'An admin can add the first one.',
  'table.pagination.rowsPerPage': 'Rows per page',
  'table.pagination.page': 'Page {page} of {total}',
  'table.pagination.range': '{from}–{to} of {total}',
  'table.pagination.first': 'First page',
  'table.pagination.previous': 'Previous page',
  'table.pagination.next': 'Next page',
  'table.pagination.last': 'Last page',

  // Add user modal
  'addUser.title': 'Add user',
  'addUser.subtitle': 'Create a new rated user entry.',
  'addUser.field.name': 'User',
  'addUser.field.rating': 'Rating',
  'addUser.field.ratingHint': '(0–100)',
  'addUser.error.nameRequired': 'Name is required.',
  'addUser.error.ratingRange': 'Rating must be between 0 and 100.',
  'addUser.cancel': 'Cancel',
  'addUser.submit': 'Add user',
  'addUser.submitting': 'Adding…',
  'toast.userAdded': 'User added',

  // Edit user modal
  'editUser.title': 'Edit user',
  'editUser.subtitle': 'Update name or rating.',
  'editUser.submit': 'Save',
  'editUser.submitting': 'Saving…',
  'toast.userUpdated': 'User updated',

  // Delete user modal
  'deleteUser.title': 'Delete user?',
  'deleteUser.desc': 'This will permanently remove {name}. Cannot be undone.',
  'deleteUser.confirm': 'Delete',
  'deleteUser.deleting': 'Deleting…',
  'toast.userDeleted': 'User deleted',

  // Row actions
  'row.actions.label': 'Open row actions',
  'row.actions.edit': 'Edit',
  'row.actions.delete': 'Delete',

  // Toggles
  'toggle.theme.toLight': 'Switch to light theme',
  'toggle.theme.toDark': 'Switch to dark theme',
  'toggle.locale.next': 'Switch language',
} as const

export type MessageKey = keyof typeof en

const uk: Record<MessageKey, string> = {
  // App
  'app.title': 'Дашборд',

  // Login
  'login.brand': 'Дашборд',
  'login.title': 'Увійдіть, щоб продовжити',
  'login.subtitle': 'Скористайтеся тестовим обліковим записом нижче.',
  'login.email': 'Електронна пошта',
  'login.password': 'Пароль',
  'login.submit': 'Увійти',
  'login.submitting': 'Входимо…',
  'login.seeded.title': 'Тестові акаунти',
  'login.seeded.adminLabel': 'адмін',
  'login.seeded.userLabel': 'юзер',
  'login.error.fallback': 'Не вдалося увійти.',
  'toast.signedIn': 'Ви увійшли',

  // Header
  'header.addUser': '+ Додати юзера',
  'header.signOut': 'Вийти',
  'header.confirm.title': 'Вийти?',
  'header.confirm.desc.prefix': 'Ви вийдете як ',
  'header.confirm.desc.suffix': '. Незбережені зміни буде втрачено.',
  'toast.signedOut': 'Ви вийшли',

  // Dashboard
  'dashboard.eyebrow': 'Огляд',
  'dashboard.title': 'Юзери з оцінкою',
  'dashboard.subtitle': 'Список юзерів з їхніми оцінками: сортування й пошук.',

  // Table
  'table.col.user': 'Юзер',
  'table.col.rating': 'Оцінка',
  'table.col.added': 'Додано',
  'table.search.placeholder': 'Пошук за іменем або оцінкою',
  'table.search.clear': 'Очистити пошук',
  'table.loading': 'Завантаження',
  'table.total': '{n} всього',
  'table.empty.search.title': 'Нічого не знайдено',
  'table.empty.search.desc': 'Спробуйте інше імʼя чи оцінку.',
  'table.empty.title': 'Поки немає юзерів',
  'table.empty.desc': 'Адмін може додати першого.',
  'table.pagination.rowsPerPage': 'Рядків на сторінку',
  'table.pagination.page': 'Сторінка {page} з {total}',
  'table.pagination.range': '{from}–{to} з {total}',
  'table.pagination.first': 'Перша сторінка',
  'table.pagination.previous': 'Попередня сторінка',
  'table.pagination.next': 'Наступна сторінка',
  'table.pagination.last': 'Остання сторінка',

  // Add user modal
  'addUser.title': 'Додати юзера',
  'addUser.subtitle': 'Створити новий запис юзера з оцінкою.',
  'addUser.field.name': 'Юзер',
  'addUser.field.rating': 'Оцінка',
  'addUser.field.ratingHint': '(0–100)',
  'addUser.error.nameRequired': 'Імʼя обовʼязкове.',
  'addUser.error.ratingRange': 'Оцінка має бути від 0 до 100.',
  'addUser.cancel': 'Скасувати',
  'addUser.submit': 'Додати',
  'addUser.submitting': 'Додаємо…',
  'toast.userAdded': 'Юзера додано',

  // Edit user modal
  'editUser.title': 'Редагувати юзера',
  'editUser.subtitle': 'Оновіть імʼя або оцінку.',
  'editUser.submit': 'Зберегти',
  'editUser.submitting': 'Зберігаємо…',
  'toast.userUpdated': 'Юзера оновлено',

  // Delete user modal
  'deleteUser.title': 'Видалити юзера?',
  'deleteUser.desc': 'Це назавжди видалить {name}. Скасувати буде неможливо.',
  'deleteUser.confirm': 'Видалити',
  'deleteUser.deleting': 'Видаляємо…',
  'toast.userDeleted': 'Юзера видалено',

  // Row actions
  'row.actions.label': 'Відкрити дії рядка',
  'row.actions.edit': 'Редагувати',
  'row.actions.delete': 'Видалити',

  // Toggles
  'toggle.theme.toLight': 'Перейти на світлу тему',
  'toggle.theme.toDark': 'Перейти на темну тему',
  'toggle.locale.next': 'Змінити мову',
}

export const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  en,
  uk,
}

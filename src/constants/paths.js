import * as dashboardTabs from './dashboardTabs';

export const SIGN_UP = '/signup';
export const LOG_IN = '/login';
export const RECOVER_PASSWORD = '/recover';
export const DASHBOARD = '/dashboard';

export const SCHEDULED = '/dashboard/scheduled';
export const BLOCKED = '/dashboard/blocked';
export const NOW = '/dashboard/now';
export const BACKLOG = '/dashboard/backlog';
export const COMPLETED = '/dashboard/completed';
export const NEW_TASK = '/dashboard/new';
export const EDIT_TASK = '/dashboard/edit/:id';
export const CONNECTED_GOOGLE_CALENDARS = '/dashboard/google-calendar-list';

export const ACCOUNT_SETTINGS = '/account';

export const PATHS_TO_DASHBOARD_TABS = {
  [NOW]: dashboardTabs.NOW,
  [BACKLOG]: dashboardTabs.BACKLOG,
  [BLOCKED]: dashboardTabs.BLOCKED,
  [SCHEDULED]: dashboardTabs.SCHEDULED,
  [COMPLETED]: dashboardTabs.COMPLETED,
  [ACCOUNT_SETTINGS]: dashboardTabs.ACCOUNT_SETTINGS,
  [CONNECTED_GOOGLE_CALENDARS]: dashboardTabs.CONNECTED_GOOGLE_CALENDARS,
};

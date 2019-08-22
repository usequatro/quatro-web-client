import * as dashboardTabs from './dashboardTabs';

export const SIGN_UP = '/signup';
export const LOG_IN = '/login';
export const DASHBOARD = '/dashboard';

export const SCHEDULED = '/dashboard/scheduled';
export const BLOCKED = '/dashboard/blocked';
export const NOW = '/dashboard/now';
export const NEXT = '/dashboard/next';
export const COMPLETED = '/dashboard/completed';
export const NEW_TASK = '/dashboard/new';
export const EDIT_TASK = '/dashboard/edit/:id';

export const DASHBOARD_TABS_TO_PATHS = {
  [dashboardTabs.NOW]: NOW,
  [dashboardTabs.NEXT]: NEXT,
  [dashboardTabs.BLOCKED]: BLOCKED,
  [dashboardTabs.SCHEDULED]: SCHEDULED,
  [dashboardTabs.COMPLETED]: COMPLETED,
};

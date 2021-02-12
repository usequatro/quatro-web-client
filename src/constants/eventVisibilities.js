// Corresponds to the visibility property of Google Calendar event resources
// @link https://developers.google.com/calendar/v3/reference/events#resource

export const DEFAULT = 'default';
export const PUBLIC = 'public';
export const PRIVATE = 'private';
export const CONFIDENTIAL = 'confidential';

export const getEventVisibilityLabel = (visibility) =>
  ({
    [DEFAULT]: 'Default',
    [PUBLIC]: 'Public',
    [PRIVATE]: 'Private',
    [CONFIDENTIAL]: 'Confidential',
  }[visibility]);

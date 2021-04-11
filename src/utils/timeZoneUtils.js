/**
 * @returns {boolean|undefined}
 */
export const getBrowserDetectedTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    return undefined;
  }
};

/**
 *
 * @param {string} tz
 * @returns {boolean|undefined}
 */
export const isValidTimeZone = (tz) => {
  if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
    console.warn('No Intl time zone support'); // eslint-disable-line no-console
    return undefined;
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    return false;
  }
};

/**
 * @returns {bool}
 */
export function isMobileDeviceUserAgent() {
  return (
    'navigator' in window &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone+/i.test(
      window.navigator.userAgent,
    )
  );
}
/**
 * @returns {bool}
 */
export function isMacPlaform() {
  return 'navigator' in window && typeof window.navigator.platform === 'string'
    ? window.navigator.platform.toUpperCase().indexOf('MAC') >= 0
    : false;
}
/**
 * @returns {bool}
 */
export function isTouchEnabledScreen() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
/**
 * @todo remove window.quatro.desktopClientVersion
 * @returns {bool} - true if using from the Quatro desktop client
 */
export function isDesktopClient() {
  return window.quatro.desktopClientVersion !== undefined || window.todesktop !== undefined;
}
/**
 * @todo remove window.quatro.desktopClientVersion
 * @see https://docs.todesktop.com/javascript-api/info
 * @returns {string|undefined} - string with version if using from the Quatro desktop client
 */
export function getDesktopClientVersion() {
  return window.quatro.desktopClientVersion || (window.todesktop && window.todesktop.version);
}
/**
 * @see https://docs.todesktop.com/javascript-api/window
 * @returns {Promise}
 */
export function toggleMaximizeWindow() {
  return window.todesktop.window
    .isMaximized()
    .then((maximized) =>
      maximized ? window.todesktop.window.unmaximize() : window.todesktop.window.maximize(),
    );
}
/**
 * @link {https://docs.todesktop.com/javascript-api/app-icon-badging-bouncing-and-progress-bar}
 * @returns {Promise}
 */
export function removeDockBadge() {
  return window.todesktop.app.setBadgeCount(0);
}

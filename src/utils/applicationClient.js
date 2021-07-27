/**
 * @todo remove window.quatro.desktopClientVersion
 * @returns {bool} - true if using from a web browser
 */
export function isClientWeb() {
  return window.quatro.desktopClientVersion === undefined && window.todesktop === undefined;
}
/**
 * @todo remove window.quatro.desktopClientVersion
 * @returns {bool} - true if using from the Quatro desktop client
 */
export function isClientDesktop() {
  return window.quatro.desktopClientVersion !== undefined || window.todesktop !== undefined;
}
/**
 * @todo remove window.quatro.desktopClientVersion
 * @see https://docs.todesktop.com/javascript-api/info
 * @returns {string|undefined} - string with version if using from the Quatro desktop client
 */
export function getClientDesktopVersion() {
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

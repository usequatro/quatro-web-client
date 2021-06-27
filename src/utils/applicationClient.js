/**
 * @returns {bool} - true if using from a web browser
 */
export function isClientWeb() {
  return window.quatro.desktopClientVersion === undefined;
}
/**
 * @returns {bool} - true if using from the Quatro desktop client
 */
export function isClientDesktop() {
  return window.quatro.desktopClientVersion !== undefined;
}
/**
 * @returns {string|undefined} - string with version if using from the Quatro desktop client
 */
export function getClientDesktopVersion() {
  return window.quatro.desktopClientVersion;
}

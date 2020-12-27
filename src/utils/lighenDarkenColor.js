/* eslint-disable no-bitwise */

/**
 * @see https://css-tricks.com/snippets/javascript/lighten-darken-color/
 * @param {string} col
 * @param {number} amt - eg: 10, -10
 */
export default function lighenDarkenColor(col, amt) {
  const usePound = col[0] === '#';
  const colorValue = usePound ? col.slice(1) : col;

  const num = parseInt(colorValue, 16);

  let r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  let b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  let g = (num & 0x0000ff) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
}

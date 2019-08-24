/**
 * Example:
 * ${(props) => keyboardOnlyOutline(props.theme.colors.appForeground)};
 *
 * @param color
 */
const keyboardOnlyOutline = (color: string) => `
  outline-width: 0;
  &:focus-visible {
    outline-width: 3px;
    outline-color: ${color};
  }
`;

export default keyboardOnlyOutline;

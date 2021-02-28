import useMediaQuery from '@material-ui/core/useMediaQuery';

export default function useMobileViewportSize() {
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'), { noSsr: true });
  return !mdUp;
}

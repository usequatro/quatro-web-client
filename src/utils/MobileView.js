import { useEffect, useState } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';

const MobileView = () => {
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setIsMobile(mobile);
  }, [mobile]);

  return isMobile;
};

export default MobileView;

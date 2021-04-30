import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { ReactComponent as Icon } from './svg/app-logo-full.svg';

const AppLogoPlain = ({ ...props }) => (
  <SvgIcon viewBox="0 0 76.87 68.04" component={Icon} {...props} />
);

export default AppLogoPlain;

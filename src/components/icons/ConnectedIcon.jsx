import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { ReactComponent as Icon } from './svg/connected.svg';

const ConnectedIcon = ({ ...props }) => (
  <SvgIcon component={Icon} viewBox="0 0 512 512" {...props} />
);

export default ConnectedIcon;

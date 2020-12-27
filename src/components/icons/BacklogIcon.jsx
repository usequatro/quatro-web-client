import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { ReactComponent as Icon } from './svg/backlog.svg';

const BacklogIcon = ({ ...props }) => (
  <SvgIcon component={Icon} viewBox="0 0 438.9 438.9" {...props} />
);

export default BacklogIcon;

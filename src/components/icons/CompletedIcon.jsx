import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { ReactComponent as Icon } from './svg/completed.svg';

const CompletedIcon = ({ ...props }) => (
  <SvgIcon component={Icon} viewBox="0 0 512 512" {...props} />
);

export default CompletedIcon;

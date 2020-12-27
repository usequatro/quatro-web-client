import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { ReactComponent as Icon } from './svg/blocked.svg';

const BlockedIcon = ({ ...props }) => <SvgIcon component={Icon} viewBox="0 0 64 64" {...props} />;

export default BlockedIcon;

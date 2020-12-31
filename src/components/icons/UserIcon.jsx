import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { ReactComponent as Icon } from './svg/user-icon.svg';

const UserIcon = ({ ...props }) => <SvgIcon component={Icon} viewBox="0 0 478 478" {...props} />;

export default UserIcon;

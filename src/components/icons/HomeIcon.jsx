import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { ReactComponent as Icon } from './svg/home.svg';

const HomeIcon = ({ ...props }) => <SvgIcon component={Icon} viewBox="0 0 511 511" {...props} />;

export default HomeIcon;

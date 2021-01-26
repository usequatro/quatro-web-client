import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { ReactComponent as Icon } from './svg/beach.svg';

const BeachIcon = ({ ...props }) => <SvgIcon component={Icon} viewBox="0 0 288 288" {...props} />;

export default BeachIcon;

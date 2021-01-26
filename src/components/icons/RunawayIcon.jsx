import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { ReactComponent as Icon } from './svg/runaway.svg';

const RunawayIcon = ({ ...props }) => <SvgIcon component={Icon} viewBox="0 0 288 288" {...props} />;

export default RunawayIcon;

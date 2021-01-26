import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { ReactComponent as Icon } from './svg/balance.svg';

const BalanceIcon = ({ ...props }) => <SvgIcon component={Icon} viewBox="0 0 480 480" {...props} />;

export default BalanceIcon;

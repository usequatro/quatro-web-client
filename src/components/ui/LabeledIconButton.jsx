import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

const INHERIT = 'inherit';

const useStyles = makeStyles((theme) => ({
  root: ({ edge }) => ({
    paddingTop: `${theme.spacing(0.75)}px`,
    paddingBottom: `${theme.spacing(0.75)}px`,
    paddingLeft: `${edge !== 'start' ? theme.spacing(1) : 0}px`,
    paddingRight: `${edge !== 'end' ? theme.spacing(1) : 0}px`,
    minWidth: theme.spacing(6),
    [theme.breakpoints.up('sm')]: {
      minWidth: theme.spacing(8),
    },
  }),
  label: ({ color }) => ({
    flexDirection: 'column',
    color: color !== INHERIT ? get(theme.palette, color) : INHERIT,
    fontSize: '0.65rem',
    fontWeight: 'normal',
    borderBottom: `solid 1px transparent`,
  }),
  labelActive: ({ color }) => ({
    flexDirection: 'column',
    color: color !== INHERIT ? get(theme.palette, color) : INHERIT,
    fontSize: '0.65rem',
    borderBottom: `solid 1px ${get(theme.palette, color)}`,
  }),
  startIcon: ({ color }) => ({
    margin: 0,
    color: color !== INHERIT ? get(theme.palette, color) : INHERIT,
  }),
  disabled: {
    opacity: 0.26, // weird number, but saw it on MUI's styles
  },
}));

const LabeledIconButton = forwardRef(
  ({ icon, label, color, active = false, edge, ...props }, ref) => {
    const colorWithVariation = color.includes('.') || color === INHERIT ? color : `${color}.main`;
    const classes = useStyles({ color: colorWithVariation, edge });
    return (
      <Button
        ref={ref}
        variant="text"
        classes={{
          root: classes.root,
          label: active ? classes.labelActive : classes.label,
          disabled: classes.disabled,
          startIcon: classes.startIcon,
        }}
        startIcon={icon}
        {...props}
      >
        {label}
      </Button>
    );
  },
);

LabeledIconButton.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.string,
  active: PropTypes.bool,
  edge: PropTypes.oneOf(['start', 'end']),
};

LabeledIconButton.defaultProps = {
  color: 'primary',
  active: false,
  edge: undefined,
};

export default LabeledIconButton;

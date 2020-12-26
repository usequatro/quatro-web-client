import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  tickLabel: {
    color: theme.palette.text.hint,
    display: 'block',
    backgroundColor: theme.palette.background.paper,
    width: theme.spacing(9),
    textAlign: 'right',
    paddingRight: theme.spacing(1),
    whiteSpace: 'nowrap',
  },
}));

const TickLabel = ({ children, className }) => {
  const classes = useStyles();

  return (
    <span className={[classes.tickLabel, className].filter(Boolean).join(' ')}>{children}</span>
  );
};

TickLabel.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

TickLabel.defaultProps = {
  className: '',
};

export default TickLabel;
